import api from "./axios";

export const createEvent = (payload) => api.post("/admin/events", payload);
export const updateEvent = (id, payload) => api.put(`/admin/events/${id}`, payload);
export const deleteEvent = (id) => api.delete(`/admin/events/${id}`);
export const bulkCreateSeats = (id, payload) => api.post(`/admin/events/${id}/seats/bulk`, payload);
export const fetchAdminBookings = (params = {}) => api.get("/admin/bookings", { params });
export const fetchAdminTransactions = () => api.get("/admin/transactions");
export const cancelBooking = (id) => api.post(`/admin/bookings/${id}/cancel`);
export const fetchAdminSeats = (id) => api.get(`/admin/events/${id}/seats`);
