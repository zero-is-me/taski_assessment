import api from "./axios";

export const reserveSeats = (payload) => api.post("/bookings/reserve", payload);
export const confirmBooking = (payload) => api.post("/bookings/confirm", payload);
export const fetchBookings = () => api.get("/bookings");
