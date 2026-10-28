// =============
//    IMPORTS
// =============

import { locations } from '../data/locations';
import './Locations.css';

// ==================
//    LOCATION LIST
// ==================



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
                                    <span>{location.isOpen ? 'Open' : 'Closed'}</span>
                                </div>

                                <p className="location-address">
                                    {location.address}
                                </p>

                                <div className="location-information">
                                    <p>
                                        <strong>Business hours:</strong>{' '}
                                        {location.hours ?? 'Hours to be confirmed'}
                                    </p>

                                    <p>
                                        <strong>Contact:</strong>{' '}
                                        {location.phone ?? 'Contact number coming soon'}
                                    </p>
                                </div>

                                <div className="location-features">
                                    <span>
                                        Estimated pickup: {location.estimatedPickupTime ?? 'TBD'}
                                    </span>

                                    {(location.features ?? []).map((feature) => (
                                        <span key={feature}>{feature}</span>
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
