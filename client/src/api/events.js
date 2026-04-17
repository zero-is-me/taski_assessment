import api from "./axios";

export const fetchEvents = () => api.get("/events");
export const fetchEvent = (id) => api.get(`/events/${id}`);
export const fetchSeats = (id) => api.get(`/events/${id}/seats`);
