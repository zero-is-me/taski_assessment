import Booking from "../models/Booking.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { confirmBookingForUser, reserveSeatsForUser } from "../services/bookingService.js";

export const reserveSeats = asyncHandler(async (req, res) => {
  const { eventId, seatIds } = req.body;
  const data = await reserveSeatsForUser({ eventId, seatIds, userId: req.user._id });

  res.status(200).json(new ApiResponse(data, "Seats reserved"));
});

export const confirmBooking = asyncHandler(async (req, res) => {
  const { eventId, seatIds, idempotencyKey } = req.body;
  const { booking, reused } = await confirmBookingForUser({
    eventId,
    seatIds,
    userId: req.user._id,
    idempotencyKey,
  });

  res.status(200).json(
    new ApiResponse(
      { booking, idempotentReplay: reused },
      reused ? "Existing booking returned" : "Booking confirmed"
    )
  );
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate("eventId", "title date venue")
    .populate("seatIds", "seatNumber")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse({ bookings }, "Bookings fetched"));
});
