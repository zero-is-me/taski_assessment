import Event from "../models/Event.js";
import Seat from "../models/Seat.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { releaseExpiredReservations } from "../services/seatService.js";

export const getEvents = asyncHandler(async (_req, res) => {
  const events = await Event.find().sort({ date: 1 });
  res.status(200).json(new ApiResponse({ events }, "Events fetched"));
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, "Not Found", "Event not found");
  }

  res.status(200).json(new ApiResponse({ event }, "Event fetched"));
});

export const getSeatsByEvent = asyncHandler(async (req, res) => {
  await releaseExpiredReservations(req.params.id);
  const seats = await Seat.find({ eventId: req.params.id }).sort({ seatNumber: 1 });

  res.status(200).json(new ApiResponse({ seats }, "Seats fetched"));
});
