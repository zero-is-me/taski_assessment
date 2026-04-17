import { useEffect, useState } from "react";
import { cancelBooking, fetchAdminBookings } from "../../api/admin";
import { fetchEvents } from "../../api/events";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import StatusBadge from "../../components/StatusBadge";
import SuccessBanner from "../../components/SuccessBanner";

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ userId: "", eventId: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async (nextFilters = filters) => {
    try {
      const [{ data: bookingData }, { data: eventsData }] = await Promise.all([
        fetchAdminBookings(nextFilters),
        fetchEvents(),
      ]);
      setBookings(bookingData.data.bookings);
      setEvents(eventsData.data.events);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    setError("");
    setMessage("");
    try {
      await cancelBooking(id);
      setMessage("Booking cancelled and wallet refunded");
      load();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading admin bookings..." />;
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>All bookings</h1>
        <div className="grid grid-3">
          <div className="field">
            <label>User ID</label>
            <input
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              placeholder="Optional user id"
            />
          </div>
          <div className="field">
            <label>Event</label>
            <select value={filters.eventId} onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}>
              <option value="">All events</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>
        <button type="button" className="btn" onClick={() => load(filters)}>
          Apply filters
        </button>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Event</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>
                  {booking.userId?.name}
                  <br />
                  {booking.userId?.email}
                </td>
                <td>{booking.eventId?.title}</td>
                <td>{booking.seatIds.map((seat) => seat.seatNumber).join(", ")}</td>
                <td>
                  <StatusBadge status={booking.status} />
                </td>
                <td>Rs. {(booking.totalAmountInPaise / 100).toFixed(2)}</td>
                <td>
                  <button
                    type="button"
                    className="btn danger"
                    disabled={booking.status === "cancelled"}
                    onClick={() => handleCancel(booking._id)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
            {!bookings.length && (
              <tr>
                <td colSpan="6">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
