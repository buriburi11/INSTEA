// =============
//    IMPORTS
// =============

import { useState } from 'react';
import './Events.css';
import { events } from '../data/events.js';

import { Link } from 'react-router';


// =============
//  CATEGORIES
// =============

const categories = [
    'All',
    'Drink tasting',
    'Book club',
    'Game night',
    'Seasonal event'
];

// =======================
//  REUSABLE EVENT CARD
// =======================


function EventCard({ event, featured = false }) {
    return (
        <Link
            to={`/events/${event.id}`}
            className="event-card-link"
        >
            <article className={`event-card ${featured ? 'event-card-featured' : ''}`}>
                <img src={event.image} alt={event.title} />

                <div className="event-card-content">
                    <span className="event-category">
                        {event.category} · Example
                    </span>

                    <h2>{event.title}</h2>

                    <p className="event-date">
                        Date: {event.date} · {event.time}
                    </p>

                    <p className="event-description">
                        {event.description}
                    </p>

                    <div className="event-card-footer">
                        <span>⌖ {event.location}</span>
                        <span>View event details</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}


// ===============
//  CALENDAR VIEW
// ===============

function EventCalendar({ filteredEvents }) {
    const year = 2026;
    const month = 11; // December (0-indexed)

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return (
        <section className="events-calendar">
            <h2>December 2026</h2>

            <div className="events-calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div className="events-calendar-weekday" key={day}>
                        {day}
                    </div>
                ))}

                {cells.map((day, index) => {
                    const dayEvents = filteredEvents.filter(event =>
                        day && Number(event.date.split('-')[2]) === day
                    );

                    return (
                        <div className="events-calendar-day" key={index}>
                            {day && <span className="events-day-number">{day}</span>}

                            {dayEvents.map(event => (
                                <div className="events-calendar-event" key={event.id}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// =============
//  EVENTS PAGE
// =============

function Events() {
    const [view, setView] = useState('list');
    const [category, setCategory] = useState('All');

    const filteredEvents = events.filter(event =>
        category === 'All' || event.category === category
    );

    return (
        <main className="events-page">
            <div className="events-container">
                <div className="events-heading">                                                                                {/* ------- PAGE HEADING ------- */}
                    <div>
                        <h1>Events &amp; <em>gatherings</em></h1>
                        <p>
                            Discover upcoming gatherings and seasonal offerings.
                            Example events shown for layout preview.
                        </p>
                    </div>

                    <div className="events-view-toggle">
                        <button
                            type="button"
                            className={view === 'list' ? 'active' : ''}
                            onClick={() => setView('list')}
                        >
                            ☰ List
                        </button>

                        <button
                            type="button"
                            className={view === 'calendar' ? 'active' : ''}
                            onClick={() => setView('calendar')}
                        >
                            ▦ Calendar
                        </button>
                    </div>
                </div>

                <div className="events-filters">                                                                                {/* ------- CATEGORY FILTERS ------- */}
                    {categories.map(item => (
                        <button
                            key={item}
                            type="button"
                            className={category === item ? 'active' : ''}
                            onClick={() => setCategory(item)}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                                                                                                                                {/* ------- LIST OR CALENDAR ------- */}
                {view === 'list' ? (
                    <div className="events-list">
                        {filteredEvents.map((event, index) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                featured={category === 'All' && index === 0}
                            />
                        ))}
                    </div>
                ) : (
                    <EventCalendar filteredEvents={filteredEvents} />
                )}

            </div>
        </main>
    );
}

export default Events;
