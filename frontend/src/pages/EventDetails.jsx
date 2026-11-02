
import { Link, useParams } from 'react-router';
import { events } from '../data/events.js';
import './EventDetails.css';
import useAuth from '../auth/useAuth.js';

import { Clock3, MapPin, Users, Ticket } from 'lucide-react';

export default function EventDetails() {
    const { eventId } = useParams();

    // member and non
    const { isAuthenticated } = useAuth();

    const event = events.find(
        (item) => item.id === Number(eventId)
    );

    if (!event) {
        return (
            <main>
                <h1>Event not found</h1>
                <Link to="/events">Back to Events</Link>
            </main>
        );
    }

    return (
        <main className="event-details-page">
            <Link to="/events">← All Events</Link>

            <img
                src={event.image}
                alt={event.title}
            />

            <div className="event-details-layout">

                <div className="event-details-info">
                    <span className="event-details-category">
                        {event.category}
                    </span>

                    <h1>{event.title}</h1>

                    <div className="event-details-meta">
                        <div>
                            <Clock3 size={18} />
                            <span>
                                {new Date(`${event.date}T12:00:00`).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                                {' · '}
                                {event.startTime && event.endTime
                                    ? `${event.startTime.replace(' PM', '').replace(' AM', '')} – ${event.endTime}`
                                    : event.time}
                            </span>
                        </div>

                        <div>
                            <MapPin size={18} />
                            <span>{event.location}</span>
                        </div>

                        {event.capacity != null && event.spotsRemaining != null && (
                            <div>
                                <Users size={18} />
                                <span>
                                    {event.capacity - event.spotsRemaining} of {event.capacity} registered
                                </span>
                            </div>
                        )}

                        {event.priceLabel && (
                            <div>
                                <Ticket size={18} />
                                <span>{event.priceLabel}</span>
                            </div>
                        )}
                    </div>

                    <p className="event-details-description">
                        {event.description}
                    </p>
                </div>


                <aside className="event-rsvp-card">
                    <h2>Reserve your seat</h2>

                    {/*creates the process bar for num of reservations*/}

                    {event.capacity > 0 && typeof event.spotsRemaining === 'number' && (
                        <div className="event-availability">
                            <p>{event.spotsRemaining} spots remaining</p>

                            <div
                                className="event-availability-track"
                                role="progressbar"
                                aria-label="Event capacity filled"
                                aria-valuemin={0}
                                aria-valuemax={event.capacity}
                                aria-valuenow={event.capacity - event.spotsRemaining}
                            >
                                <div
                                    className="event-availability-fill"
                                    style={{
                                        width: `${Math.max(0, Math.min(100,
                                            ((event.capacity - event.spotsRemaining) / event.capacity) * 100
                                        ))}%`
                                    }}
                                />
                            </div>
                        </div>
                    )}



                    {isAuthenticated ? (
                        <form
                            className="event-rsvp-form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('RSVP preview only — no reservation has been saved.');
                            }}
                        >
                            <label htmlFor="rsvp-guests">Guests</label>
                            <input
                                id="rsvp-guests"
                                type="number"
                                min="1"
                                max={event.spotsRemaining}
                                defaultValue="1"
                                required
                            />

                            <label htmlFor="rsvp-notes">
                                Dietary needs or notes
                            </label>
                            <textarea
                                id="rsvp-notes"
                                rows="3"
                                maxLength={250}
                                placeholder="Optional (250 characters max)"
                            />

                            <button type="submit">RSVP</button>
                        </form>
                    ) : (

                        <>
                            <p>Join INSTEA Rewards to reserve your spot at this event.</p>

                            <Link to="/login" className="event-join-button">
                                Join INSTEA Rewards to RSVP
                            </Link>
                        </>
                    )}
                </aside>
            </div>
        </main>
    );
}
