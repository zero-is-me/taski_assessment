import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBookings } from "../../api/bookings";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import StatusBadge from "../../components/StatusBadge";

const money = (value) => `Rs. ${(value / 100).toFixed(2)}`;

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchBookings();
        setBookings(data.data.bookings);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <LoadingBlock label="Loading your bookings..." />;
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>Your bookings</h1>
        <p className="subtle">See every booking you have confirmed so far.</p>
      </div>
      <ErrorBanner message={error} />
      <div className="grid">
        {bookings.map((booking) => (
          <div key={booking._id} className="card">
            <div className="row space-between">
              <h2>{booking.eventId?.title}</h2>
              <StatusBadge status={booking.status} />
            </div>
            <p>{new Date(booking.createdAt).toLocaleString()}</p>
            <p>Seats: {booking.seatIds.map((seat) => seat.seatNumber).join(", ")}</p>
            <p>Amount: {money(booking.totalAmountInPaise)}</p>
            <Link className="btn" to={`/booking/${booking._id}`}>
              View details
            </Link>
          </div>
        ))}
        {!bookings.length && <div className="card">No bookings yet.</div>}
      </div>
    </div>
  );
};

export default BookingsPage;
