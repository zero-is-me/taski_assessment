import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { confirmBooking, reserveSeats } from "../../api/bookings";
import { getErrorMessage } from "../../api/axios";
import { fetchEvent, fetchSeats } from "../../api/events";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import SeatLegend from "../../components/SeatLegend";
import SuccessBanner from "../../components/SuccessBanner";

const money = (value) => `Rs. ${(value / 100).toFixed(2)}`;

const SeatsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reservationExpiresAt, setReservationExpiresAt] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [tick, setTick] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [{ data: eventData }, { data: seatData }] = await Promise.all([fetchEvent(id), fetchSeats(id)]);
      setEvent(eventData.data.event);
      setSeats(seatData.data.seats);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [id]);

  const selectedSeats = useMemo(() => seats.filter((seat) => selectedIds.includes(seat._id)), [seats, selectedIds]);
  const total = (event?.priceInPaise || 0) * selectedSeats.length;

  const countdown = useMemo(() => {
    if (!reservationExpiresAt) return "";
    const diff = new Date(reservationExpiresAt).getTime() - tick;
    if (diff <= 0) return "Reservation expired";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, "0")} left`;
  }, [reservationExpiresAt, tick]);

  useEffect(() => {
    if (!reservationExpiresAt) return;
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [reservationExpiresAt]);

  useEffect(() => {
    if (!selectedIds.length) {
      setIdempotencyKey("");
      return;
    }

    setIdempotencyKey(`book-${id}-${selectedIds.join("-")}-${Date.now()}`);
  }, [id, selectedIds]);

  const toggleSeat = (seat) => {
    if (seat.status !== "available") return;
    setSelectedIds((current) =>
      current.includes(seat._id) ? current.filter((item) => item !== seat._id) : [...current, seat._id]
    );
  };

  const handleReserve = async () => {
    setReserving(true);
    setError("");
    setMessage("");

    try {
      const { data } = await reserveSeats({ eventId: id, seatIds: selectedIds });
      setReservationExpiresAt(data.data.reservationExpiresAt);
      setMessage("Seats reserved for five minutes");
      await load();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setReserving(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setError("");
    setMessage("");

    try {
      const { data } = await confirmBooking({ eventId: id, seatIds: selectedIds, idempotencyKey });
      navigate(`/booking/${data.data.booking._id}`);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading event seats..." />;
  }

  return (
    <div className="split">
      <section className="grid">
        <div className="card">
          <h1>{event?.title}</h1>
          <p className="subtle">{event?.venue}</p>
          <p>{new Date(event?.date).toLocaleString()}</p>
          <SeatLegend />
        </div>
        <ErrorBanner message={error} />
        <SuccessBanner message={message} />
        <div className="seat-grid">
          {seats.map((seat) => (
            <button
              type="button"
              key={seat._id}
              className={`seat ${seat.status} ${selectedIds.includes(seat._id) ? "selected" : ""}`}
              onClick={() => toggleSeat(seat)}
            >
              <div>{seat.seatNumber}</div>
              <small>{seat.status}</small>
            </button>
          ))}
        </div>
      </section>

      <aside className="card">
        <h2>Your selection</h2>
        <p>{selectedSeats.map((seat) => seat.seatNumber).join(", ") || "No seats picked yet"}</p>
        <p>Total: {money(total)}</p>
        <p className="subtle">{countdown}</p>
        <div className="grid">
          <button className="btn" disabled={!selectedIds.length || reserving} onClick={handleReserve}>
            {reserving ? "Reserving..." : "Reserve"}
          </button>
          <button className="btn secondary" disabled={!selectedIds.length || paying} onClick={handlePay}>
            {paying ? "Paying..." : "Confirm & Pay"}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SeatsPage;
