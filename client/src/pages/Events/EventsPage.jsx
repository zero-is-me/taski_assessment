import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../../api/events";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";

const money = (value) => `Rs. ${(value / 100).toFixed(2)}`;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchEvents();
        setEvents(data.data.events);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <LoadingBlock label="Loading events..." />;
  }

  return (
    <div className="grid">
      <section className="hero-card">
        <h1>Pick your next event</h1>
        <p className="subtle">Browse events, reserve seats for five minutes, and pay from your wallet.</p>
      </section>
      <ErrorBanner message={error} />
      <section className="event-grid">
        {events.map((event) => (
          <article key={event._id} className="card">
            <h2>{event.title}</h2>
            <p className="subtle">{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.venue}</p>
            <p>{money(event.priceInPaise)}</p>
            <p>{event.availableSeats} seats left</p>
            <Link className="btn" to={`/events/${event._id}/seats`}>
              View seats
            </Link>
          </article>
        ))}
        {!events.length && <div className="card">No events yet. Ask an admin to create one.</div>}
      </section>
    </div>
  );
};

export default EventsPage;
