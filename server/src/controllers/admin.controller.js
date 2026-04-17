import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { cancelBooking as cancelBookingService } from "../services/bookingService.js";
import { releaseExpiredReservations } from "../services/seatService.js";

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, venue, priceInPaise } = req.body;

  const event = await Event.create({
    title,
    description,
    date,
    venue,
    priceInPaise,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse({ event }, "Event created"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Not Found", "Event not found");
  }

  const fields = ["title", "description", "date", "venue", "priceInPaise"];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      event[field] = req.body[field];
    }
  });

  await event.save();

  res.status(200).json(new ApiResponse({ event }, "Event updated"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Not Found", "Event not found");
  }

  const activeBookings = await Booking.countDocuments({
    eventId: req.params.id,
    status: { $ne: "cancelled" },
  });

  if (activeBookings > 0) {
    throw new ApiError(400, "Bad Request", "Cannot delete an event with active bookings");
  }

  await Seat.deleteMany({ eventId: req.params.id });
  await Booking.deleteMany({ eventId: req.params.id });
  await event.deleteOne();

  res.status(200).json(new ApiResponse({}, "Event deleted"));
});

export const bulkCreateSeats = asyncHandler(async (req, res) => {
  const { count, priceInPaise } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Not Found", "Event not found");
  }

  if (!Number.isInteger(count) || count <= 0) {
    throw new ApiError(400, "Bad Request", "count must be a positive integer");
  }

  if (!Number.isInteger(priceInPaise) || priceInPaise < 0) {
    throw new ApiError(400, "Bad Request", "priceInPaise must be a non-negative integer");
  }

  const existingCount = await Seat.countDocuments({ eventId: event._id });
  const seats = Array.from({ length: count }, (_, index) => ({
    eventId: event._id,
    seatNumber: `S${String(existingCount + index + 1).padStart(3, "0")}`,
  }));

  await Seat.insertMany(seats);

  event.totalSeats += count;
  event.availableSeats += count;
  event.priceInPaise = priceInPaise;
  await event.save();

  res.status(201).json(new ApiResponse({ created: count }, "Seats created"));
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.eventId) filter.eventId = req.query.eventId;
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter)
    .populate("userId", "name email")
    .populate("eventId", "title date venue")
    .populate("seatIds", "seatNumber")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse({ bookings }, "All bookings fetched"));
});

export const getAllTransactions = asyncHandler(async (_req, res) => {
  const transactions = await Transaction.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse({ transactions }, "All transactions fetched"));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await cancelBookingService(req.params.id);
  res.status(200).json(new ApiResponse({ booking }, "Booking cancelled and refunded"));
});

export const getAdminSeats = asyncHandler(async (req, res) => {
  await releaseExpiredReservations(req.params.id);
  const seats = await Seat.find({ eventId: req.params.id }).sort({ seatNumber: 1 });
  res.status(200).json(new ApiResponse({ seats }, "Seats fetched"));
});
