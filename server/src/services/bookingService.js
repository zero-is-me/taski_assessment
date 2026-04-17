import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";
import { releaseExpiredReservations } from "./seatService.js";
import { debitWalletBalance, refundWallet } from "./walletService.js";

const reservationMs = 5 * 60 * 1000;

const validateSeatIds = (seatIds) => {
  if (!Array.isArray(seatIds) || !seatIds.length) {
    throw new ApiError(400, "Bad Request", "seatIds must be a non-empty array");
  }
};

const loadEventOrThrow = async (eventId, session = null) => {
  const event = await Event.findById(eventId).session(session);
  if (!event) {
    throw new ApiError(404, "Not Found", "Event not found");
  }
  return event;
};

const claimSeatForCheckout = async ({ seatId, eventId, userId, now, reservationExpiresAt, session }) => {
  const reservedBySameUser = await Seat.findOne({
    _id: seatId,
    eventId,
    status: "reserved",
    reservedBy: userId,
    reservationExpiresAt: { $gt: now },
  }).session(session);

  if (reservedBySameUser) {
    return { seat: reservedBySameUser, wasAlreadyReserved: true };
  }

  const newlyReservedSeat = await Seat.findOneAndUpdate(
    { _id: seatId, eventId, status: "available" },
    {
      $set: {
        status: "reserved",
        reservedBy: userId,
        reservedAt: now,
        reservationExpiresAt,
      },
    },
    { new: true, session }
  );

  if (!newlyReservedSeat) {
    throw new ApiError(409, "Conflict", "One or more seats are no longer available");
  }

  return { seat: newlyReservedSeat, wasAlreadyReserved: false };
};

export const reserveSeatsForUser = async ({ eventId, seatIds, userId }) => {
  validateSeatIds(seatIds);

  const session = await mongoose.startSession();

  try {
    let reservationExpiresAt;

    await session.withTransaction(async () => {
      await loadEventOrThrow(eventId, session);
      await releaseExpiredReservations(eventId, session);

      const now = new Date();
      reservationExpiresAt = new Date(now.getTime() + reservationMs);
      let newlyReservedCount = 0;

      for (const seatId of seatIds) {
        const alreadyMine = await Seat.findOne({
          _id: seatId,
          eventId,
          status: "reserved",
          reservedBy: userId,
          reservationExpiresAt: { $gt: now },
        }).session(session);

        if (alreadyMine) {
          alreadyMine.reservedAt = now;
          alreadyMine.reservationExpiresAt = reservationExpiresAt;
          await alreadyMine.save({ session });
          continue;
        }

        const seat = await Seat.findOneAndUpdate(
          { _id: seatId, eventId, status: "available" },
          {
            $set: {
              status: "reserved",
              reservedBy: userId,
              reservedAt: now,
              reservationExpiresAt,
            },
          },
          { new: true, session }
        );

        if (!seat) {
          throw new ApiError(409, "Conflict", "One or more seats are no longer available");
        }

        newlyReservedCount += 1;
      }

      if (newlyReservedCount > 0) {
        await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: -newlyReservedCount } }, { session });
      }
    });

    return { reservationExpiresAt };
  } finally {
    session.endSession();
  }
};

export const confirmBookingForUser = async ({ eventId, seatIds, userId, idempotencyKey }) => {
  // atomic: seat claim + wallet debit + booking must all succeed together
  validateSeatIds(seatIds);

  if (!idempotencyKey?.trim()) {
    throw new ApiError(400, "Bad Request", "idempotencyKey is required");
  }

  const existing = await Booking.findOne({ idempotencyKey })
    .populate("eventId", "title date venue priceInPaise")
    .populate("seatIds", "seatNumber status");

  if (existing) {
    if (String(existing.userId) !== String(userId)) {
      throw new ApiError(409, "Conflict", "idempotencyKey already used by another booking");
    }
    return { booking: existing, reused: true };
  }

  const session = await mongoose.startSession();

  try {
    let createdBooking;

    await session.withTransaction(async () => {
      const event = await loadEventOrThrow(eventId, session);
      await releaseExpiredReservations(eventId, session);

      const seats = [];
      const now = new Date();
      const reservationExpiresAt = new Date(now.getTime() + reservationMs);
      let newlyReservedCount = 0;

      for (const seatId of seatIds) {
        const { seat, wasAlreadyReserved } = await claimSeatForCheckout({
          seatId,
          eventId,
          userId,
          now,
          reservationExpiresAt,
          session,
        });
        seats.push(seat);
        if (!wasAlreadyReserved) {
          newlyReservedCount += 1;
        }
      }

      const totalAmountInPaise = event.priceInPaise * seats.length;

      await debitWalletBalance({ userId, amountInPaise: totalAmountInPaise }, session);

      createdBooking = await Booking.create(
        [
          {
            userId,
            eventId,
            seatIds,
            totalAmountInPaise,
            status: "confirmed",
            idempotencyKey,
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      await Seat.updateMany(
        { _id: { $in: seatIds }, eventId, reservedBy: userId },
        {
          $set: {
            status: "booked",
            bookedBy: userId,
            reservationExpiresAt: null,
            reservedAt: null,
          },
        },
        { session }
      );

      if (newlyReservedCount > 0) {
        await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: -newlyReservedCount } }, { session });
      }

      await Transaction.create(
        [
          {
            userId,
            type: "debit",
            amountInPaise: totalAmountInPaise,
            description: `Booking for ${event.title}`,
            bookingId: createdBooking._id,
          },
        ],
        { session }
      );
    });

    const booking = await Booking.findById(createdBooking._id)
      .populate("eventId", "title date venue priceInPaise")
      .populate("seatIds", "seatNumber status");

    return { booking, reused: false };
  } catch (error) {
    if (error?.code === 11000) {
      const booking = await Booking.findOne({ idempotencyKey })
        .populate("eventId", "title date venue priceInPaise")
        .populate("seatIds", "seatNumber status");

      if (booking && String(booking.userId) !== String(userId)) {
        throw new ApiError(409, "Conflict", "idempotencyKey already used by another booking");
      }

      return { booking, reused: true };
    }

    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelBooking = async (bookingId) => {
  const session = await mongoose.startSession();

  try {
    let cancelledBooking;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new ApiError(404, "Not Found", "Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new ApiError(400, "Bad Request", "Booking is already cancelled");
      }

      const event = await loadEventOrThrow(booking.eventId, session);

      booking.status = "cancelled";
      await booking.save({ session });

      await Seat.updateMany(
        { _id: { $in: booking.seatIds } },
        {
          $set: {
            status: "available",
            bookedBy: null,
            reservedBy: null,
            reservedAt: null,
            reservationExpiresAt: null,
          },
        },
        { session }
      );

      await Event.findByIdAndUpdate(booking.eventId, { $inc: { availableSeats: booking.seatIds.length } }, { session });

      await refundWallet(
        {
          userId: booking.userId,
          amountInPaise: booking.totalAmountInPaise,
          description: `Refund for cancelled booking - ${event.title}`,
          bookingId: booking._id,
        },
        session
      );

      cancelledBooking = booking;
    });

    return cancelledBooking;
  } finally {
    session.endSession();
  }
};
