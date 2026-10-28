// =============
//    IMPORTS
// =============

import './Locations.css';

// ==================
//    LOCATION LIST
// ==================

// ------- PLACEHOLDER STORE DATA -------
// Replace these values when the client provides verified locations.

const locations = [
    {
        id: 1,
        name: 'Location 1 — Coming Soon',
        address: 'Address to be announced',
        hours: 'Hours to be confirmed',
        phone: 'Contact number coming soon',
        features: ['Pickup', 'Dine-in']
    },
    {
        id: 2,
        name: 'Location 2 — Coming Soon',
        address: 'Address to be announced',
        hours: 'Hours to be confirmed',
        phone: 'Contact number coming soon',
        features: ['Pickup', 'Dine-in']
    },
    {
        id: 3,
        name: 'Location 3 — Coming Soon',
        address: 'Address to be announced',
        hours: 'Hours to be confirmed',
        phone: 'Contact number coming soon',
        features: ['Pickup']
    }
];

// ==========================
//    LOCATION PAGE CONTENT
// ==========================

function Locations() {
    return (
        <main className="locations-page">

            <div className="locations-container">
                <div className="locations-heading">                                                                                             {/* ------- PAGE HEADING ------- */}
                    <h1>Our tea <em>houses</em></h1>
                    <p>Store information and locations coming soon.</p>
                </div>

                <div className="locations-layout">                                                                                              {/* ------- LOCATIONS LAYOUT ------- */}

                    <div className="locations-list">                                                                                            {/* Left: Store cards */}
                        {locations.map((location) => (
                            <article
                                className="location-card"
                                key={location.id}
                            >
                                <div className="location-card-heading">
                                    <h2>{location.name}</h2>
                                    <span>Details TBD</span>
                                </div>

                                <p className="location-address">
                                    {location.address}
                                </p>

                                <div className="location-information">
                                    <p>
                                        <strong>Business hours:</strong>{' '}
                                        {location.hours}
                                    </p>

                                    <p>
                                        <strong>Contact:</strong>{' '}
                                        {location.phone}
                                    </p>
                                </div>

                                <div className="location-features">
                                    {location.features.map((feature) => (
                                        <span key={feature}>
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <div className="location-card-actions">
                                    <button type="button" disabled>
                                        Order here
                                    </button>

                                    <button type="button" disabled>
                                        Directions
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="locations-map">                                                                                             {/* Right: Map placeholder */}
                        <div className="locations-map-content">
                            <span className="locations-map-icon">⌖</span>
                            <h2>Store map coming soon</h2>
                            <p>
                                Locations will appear here once
                                store addresses are confirmed.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default Locations;
