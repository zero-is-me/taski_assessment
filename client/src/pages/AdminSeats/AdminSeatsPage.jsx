import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAdminSeats } from "../../api/admin";
import { fetchEvent } from "../../api/events";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import SeatLegend from "../../components/SeatLegend";

const AdminSeatsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [{ data: eventData }, { data: seatsData }] = await Promise.all([fetchEvent(id), fetchAdminSeats(id)]);
        setEvent(eventData.data.event);
        setSeats(seatsData.data.seats);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return <LoadingBlock label="Loading admin seat map..." />;
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>{event?.title}</h1>
        <p>{event?.venue}</p>
        <SeatLegend />
      </div>
      <ErrorBanner message={error} />
      <div className="seat-grid">
        {seats.map((seat) => (
          <div key={seat._id} className={`seat ${seat.status}`}>
            <div>{seat.seatNumber}</div>
            <small>{seat.status}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSeatsPage;
