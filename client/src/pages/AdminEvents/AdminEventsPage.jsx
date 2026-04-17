import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createEvent, deleteEvent, updateEvent, bulkCreateSeats } from "../../api/admin";
import { fetchEvents } from "../../api/events";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import SuccessBanner from "../../components/SuccessBanner";

const emptyForm = {
  title: "",
  description: "",
  date: "",
  venue: "",
  priceInPaise: 0,
};

const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [seatCount, setSeatCount] = useState({});
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await fetchEvents();
      setEvents(data.data.events);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateEvent(editingId, { ...form, priceInPaise: Number(form.priceInPaise) });
        setMessage("Event updated");
      } else {
        await createEvent({ ...form, priceInPaise: Number(form.priceInPaise) });
        setMessage("Event created");
      }

      setForm(emptyForm);
      setEditingId("");
      load();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");
    try {
      await deleteEvent(id);
      setMessage("Event deleted");
      load();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleSeatCreate = async (eventId, priceInPaise) => {
    setError("");
    setMessage("");
    try {
      await bulkCreateSeats(eventId, {
        count: Number(seatCount[eventId] || 0),
        priceInPaise: Number(priceInPaise),
      });
      setMessage("Seats created");
      setSeatCount((current) => ({ ...current, [eventId]: "" }));
      load();
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  if (loading) {
    return <LoadingBlock label="Loading admin events..." />;
  }

  return (
    <div className="grid">
      <section className="split">
        <form className="card" onSubmit={handleSubmit}>
          <h1>{editingId ? "Edit event" : "Create event"}</h1>
          <ErrorBanner message={error} />
          <SuccessBanner message={message} />
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Venue</label>
            <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required />
          </div>
          <div className="field">
            <label>Price in paise</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.priceInPaise}
              onChange={(e) => setForm({ ...form, priceInPaise: e.target.value })}
              required
            />
          </div>
          <div className="row">
            <button className="btn" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update event" : "Create event"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <h2>Quick notes</h2>
          <p className="subtle">Create the event first, then bulk create seats for it from the table below.</p>
          <p className="subtle">Bulk seat creation also updates the event price, matching the backend route shape.</p>
        </div>
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Seats</th>
              <th>Create Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{new Date(event.date).toLocaleString()}</td>
                <td>{event.venue}</td>
                <td>
                  {event.availableSeats}/{event.totalSeats}
                </td>
                <td>
                  <div className="row">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={seatCount[event._id] || ""}
                      onChange={(e) => setSeatCount((current) => ({ ...current, [event._id]: e.target.value }))}
                      placeholder="count"
                    />
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => handleSeatCreate(event._id, event.priceInPaise)}
                    >
                      Add
                    </button>
                  </div>
                </td>
                <td>
                  <div className="row">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => {
                        setEditingId(event._id);
                        setForm({
                          title: event.title,
                          description: event.description,
                          date: new Date(event.date).toISOString().slice(0, 16),
                          venue: event.venue,
                          priceInPaise: event.priceInPaise,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <Link className="btn secondary" to={`/admin/events/${event._id}/seats`}>
                      Seats
                    </Link>
                    <button type="button" className="btn danger" onClick={() => handleDelete(event._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!events.length && (
              <tr>
                <td colSpan="6">No events yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminEventsPage;
