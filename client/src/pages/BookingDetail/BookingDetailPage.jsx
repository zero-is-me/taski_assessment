import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBookings } from "../../api/bookings";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import StatusBadge from "../../components/StatusBadge";

const money = (value) => `Rs. ${(value / 100).toFixed(2)}`;

const BookingDetailPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        // TODO: switch this to a dedicated booking detail endpoint if the API grows.
        const { data } = await fetchBookings();
        const found = data.data.bookings.find((item) => item._id === id);
        setBooking(found || null);
        if (!found) {
          setError("Booking not found");
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return <LoadingBlock label="Loading booking..." />;
  }

  return (
    <div className="grid">
      <ErrorBanner message={error} />
      {booking && (
        <div className="card">
          <div className="row space-between">
            <h1>{booking.eventId?.title}</h1>
            <StatusBadge status={booking.status} />
          </div>
          <p>{booking.eventId?.venue}</p>
          <p>{new Date(booking.eventId?.date).toLocaleString()}</p>
          <p>Seats: {booking.seatIds.map((seat) => seat.seatNumber).join(", ")}</p>
          <p>Amount paid: {money(booking.totalAmountInPaise)}</p>
          <p>Booked at: {new Date(booking.createdAt).toLocaleString()}</p>
          <Link className="btn" to="/bookings">
            Back to bookings
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookingDetailPage;
