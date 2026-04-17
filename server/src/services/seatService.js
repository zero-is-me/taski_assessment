import Seat from "../models/Seat.js";
import Event from "../models/Event.js";

export const releaseExpiredReservations = async (eventId = null, session = null) => {
  const now = new Date();
  const filter = {
    status: "reserved",
    reservationExpiresAt: { $lt: now },
  };

  if (eventId) {
    filter.eventId = eventId;
  }

  const expiredSeats = await Seat.find(filter).select("_id eventId").session(session);

  if (!expiredSeats.length) {
    return 0;
  }

  await Seat.updateMany(
    { _id: { $in: expiredSeats.map((seat) => seat._id) } },
    {
      $set: {
        status: "available",
        reservedBy: null,
        reservedAt: null,
        reservationExpiresAt: null,
      },
    },
    { session }
  );

  const grouped = expiredSeats.reduce((acc, seat) => {
    const key = String(seat.eventId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  await Promise.all(
    Object.entries(grouped).map(([id, count]) =>
      Event.findByIdAndUpdate(id, { $inc: { availableSeats: count } }, { session })
    )
  );

  return expiredSeats.length;
};
