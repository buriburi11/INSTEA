// =============
//    IMPORTS
// =============

import './Home.css';
import DrinkCard from './DrinkCard';
import placeholderImg from '../assets/INSTEA HOME PLACEHOLDER.jpg';


// ======================
//    HOME PAGE CONTENT
// ======================

function Home() {
    return (
        <div className="home">
            <section className="home-main">                                                                                                          {/* ------------ MAIN CONTENT ------------ */}
                <div className="home-main-content">

                    <h1>Tea, steeped
                        <span>with intention.</span>
                    </h1>

                    <p>
                        Ceremonial matcha, slow-steeped botanicals,
                        small pearls and single-estate oolongs -
                        handcrafted to order and ready for pickup in minutes.
                    </p>

                    <div className="home-main-actions">
                        <button type="button" disabled>
                            Order Now →
                        </button>

                        <button type="button" disabled>
                            Join INSTEA Rewards
                        </button>

                    </div>

                    <div className="home-main-location">                                                                                            {/* ------------- MAIN LOCATION PLACEHOLDER --------------*/}
                        <span className="home-main-location-pin">⌖</span>
                        <span>Store location coming soon</span>
                        <span className="home-main-location-dot">·</span>
                        <span>Hours to be announced</span>

                    </div>

                </div>

                <div className="home-main-image">
                    <img src={placeholderImg} alt="PLACEHOLDER for HOMEPAGE IMAGE" />
                </div>

            </section>                                                                                                                               {/* ------------ MAIN CONTENT END ------------ */}

            <section className="home-signature">                                                                                                     {/* ------------ SIGNATURE & SEASONAL CONTENT ------------ */}

                <div className="home-signature-heading">
                    <div className="home-signature-heading-text">
                        <h2>Signature &amp; Seasonal</h2>

                        <p>
                            Handcrafted fresh with botanical ingredients.
                        </p>
                    </div>

                    <button className="home-signature-menu" type="button" disabled>                                                                 {/* BUTTON NEEDS TO BE ENABLED WHEN FULL MENU IS READY */}
                        Full Menu <span aria-hidden="true">→</span>
                    </button>

                </div>

                <div className="home-signature-products">

                    <DrinkCard
                        name="Drink 1 — Coming Soon"
                        description="Product details coming soon."
                        image={placeholderImg}
                        featured
                    />

                    <DrinkCard
                        name="Drink 2 — Coming Soon"
                        description="Product details coming soon."
                        image={placeholderImg}
                        badge="Coming Soon"
                    />

                    <DrinkCard
                        name="Drink 3 — Coming Soon"
                        description="Product details coming soon."
                        image={placeholderImg}
                        badge="Coming Soon"
                    />

                    <DrinkCard
                        name="Drink 4 — Coming Soon"
                        description="Product details coming soon."
                        image={placeholderImg}
                        badge="Coming Soon"
                    />

                </div>

            </section>                                                                                                                               {/* ------------ SIGNATURE & SEASONAL CONTENT END ------------ */}

            <section className="home-rewards">                                                                                                       {/* ------- INSTEA REWARDS SECTION ------- */}

                <div className="home-rewards-content">

                    <div className="home-rewards-left">                                                                                              {/* ------- LEFT COLUMN ------- */}

                        <p className="home-rewards-label">
                            INSTEA Rewards
                        </p>

                        <h2>
                            A <em>ritual</em> that <em>rewards</em>
                            <span>every return.</span>
                        </h2>

                        <p className="home-rewards-description">
                            Join free and receive 100 welcome leaves — enough for
                            your first plant milk upgrade.
                        </p>

                        <div className="home-rewards-actions">
                            <button
                                className="home-rewards-join"
                                type="button"
                                disabled
                            >
                                Join INSTEA Rewards
                            </button>

                            <button
                                className="home-rewards-signin"
                                type="button"
                                disabled
                            >
                                Sign in
                            </button>
                        </div>

                    </div>

                    <div className="home-rewards-right">                                                                                             {/* ------- RIGHT COLUMN ------- */}

                        <div className="home-rewards-benefits">
                            <div className="home-rewards-benefit">
                                <span className="home-rewards-number">1</span>

                                <div className="home-rewards-benefit-text">
                                    <h3>Earn leaves</h3>
                                    <p>10 Tea Leaves for every dollar, online or in-store.</p>
                                </div>
                            </div>

                            <div className="home-rewards-benefit">
                                <span className="home-rewards-number">2</span>

                                <div className="home-rewards-benefit-text">
                                    <h3>Collect stamps &amp; streaks</h3>
                                    <p>Weekly visits build streaks and fill digital stamp cards.</p>
                                </div>
                            </div>

                            <div className="home-rewards-benefit">
                                <span className="home-rewards-number">3</span>

                                <div className="home-rewards-benefit-text">
                                    <h3>Redeem privileges</h3>
                                    <p>Free drinks, pastry pairings, tasting flights and teaware.</p>
                                </div>

                            </div>

                        </div>

                        <div className="home-rewards-tiers">                                                                                         {/* ------- REWARDS MEMBERSHIP TIERS ------- */}                 
                            <div className="home-rewards-tier">
                                <strong>Silver</strong>
                                <span>0 leaves</span>
                            </div>

                            <div className="home-rewards-tier">
                                <strong>Gold</strong>
                                <span>1,000 leaves</span>
                            </div>

                            <div className="home-rewards-tier">
                                <strong>Jade</strong>
                                <span>3,000 leaves</span>
                            </div>

                        </div>

                    </div>

                </div>

            </section>                                                                                                                               {/* ------- INSTEA REWARDS SECTION END ------- */}

            <section className="home-offers-events">                                                                                                 {/* ------- CURRENT OFFERS & UPCOMING GATHERINGS ------- */}
                <div className="home-offers-events-content">

                    <div className="home-offers">                                                                                                    {/* Left Column: Offers */}
                        <h2>Current offers</h2>

                        <div className="home-offer-card">
                            <h3>Offer coming soon</h3>
                            <p>Details about upcoming offers will appear here.</p>
                            <span className="home-placeholder-link">
                                Learn more →
                            </span>
                        </div>

                        <div className="home-offer-card">
                            <h3>More offers coming soon</h3>
                            <p>Check back for future promotions and rewards.</p>
                            <span className="home-placeholder-link">
                                View offers →
                            </span>
                        </div>
                    </div>

                    <div className="home-events">                                                                                                    {/* Right Column: Events */}                  
                        <div className="home-events-heading">
                            <h2>Upcoming gatherings</h2>
                            <span>All events</span>
                        </div>

                        <div className="home-event">
                            <div className="home-event-date">
                                <small>TBD</small>
                                <strong>—</strong>
                            </div>

                            <div className="home-event-details">
                                <p>Event details coming soon</p>
                                <h3>Upcoming gathering</h3>
                                <span>Location to be announced</span>
                            </div>

                            <span className="home-event-status">Coming soon</span>
                        </div>

                        <div className="home-event">
                            <div className="home-event-date">
                                <small>TBD</small>
                                <strong>—</strong>
                            </div>

                            <div className="home-event-details">
                                <p>Event details coming soon</p>
                                <h3>Future community event</h3>
                                <span>Location to be announced</span>
                            </div>

                            <span className="home-event-status">Coming soon</span>
                        </div>

                        <div className="home-event">
                            <div className="home-event-date">
                                <small>TBD</small>
                                <strong>—</strong>
                            </div>

                            <div className="home-event-details">
                                <p>Event details coming soon</p>
                                <h3>More gatherings ahead</h3>
                                <span>Location to be announced</span>
                            </div>

                            <span className="home-event-status">Coming soon</span>
                        </div>
                    </div>

                </div>
            </section>                                                                                                                               {/* ------- CURRENT OFFERS & UPCOMING GATHERINGS END------- */}

            <section className="home-reviews">                                                                                                       {/* ------- CUSTOMER REVIEWS ------- */}
                <div className="home-reviews-content">

                    <div className="home-reviews-featured">                                                                                          {/* Left: Featured Review */}
                        <div className="home-review-stars">★★★★★</div>

                        <h2>
                            Customer reviews will appear here
                            once they become available.
                        </h2>

                        <p>
                            <strong>Coming soon</strong> · Featured customer review
                        </p>
                    </div>

                    <div className="home-reviews-secondary">                                                                                         {/* Right: Additional Reviews */}

                        <div className="home-review-small">
                            <div className="home-review-stars">★★★★★</div>

                            <p>
                                Additional customer feedback will be
                                displayed here in the future.
                            </p>

                            <span>Coming soon · Customer review</span>
                        </div>

                        <div className="home-review-small">
                            <div className="home-review-stars">★★★★★</div>

                            <p>
                                More customer experiences will be
                                shared here once available.
                            </p>

                            <span>Coming soon · Customer review</span>
                        </div>

                        <p className="home-reviews-summary">
                            Customer ratings and reviews coming soon
                        </p>

                    </div>
                </div>
            </section>                                                                                                                               {/* ------- CUSTOMER REVIEWS END ------- */}

            <section className="home-location">                                                                                                      {/* ------- STORE LOCATION ------- */}
                <div className="home-location-content">

                    <div className="home-location-image">
                        <img
                            src={placeholderImg}
                            alt="Store location placeholder"
                        />
                    </div>

                    <div className="home-location-info">
                        <p className="home-section-label">Nearest tea house</p>

                        <h2>Store location coming soon</h2>

                        <p className="home-location-address">
                            Store address to be announced
                        </p>

                        <p className="home-location-hours">
                            <strong>Hours:</strong> To be announced
                        </p>

                        <div className="home-location-actions">
                            <button type="button" className="home-location-directions" disabled>
                                Directions
                            </button>

                            <button type="button" className="home-location-call" disabled>
                                Call store
                            </button>

                            <button type="button" className="home-location-all" disabled>
                                All locations
                            </button>
                        </div>
                    </div>

                </div>
            </section>                                                                                                                               {/* ------- STORE LOCATION END------- */}

            <section className="home-story-newsletter">                                                                                              {/* ------- OUR STORY & NEWSLETTER ------- */}
                <div className="home-story-newsletter-content">

                    <div className="home-story">                                                                                                     {/* Left: Our Story */}
                        <p className="home-section-label">Our story</p>

                        <h2>
                            Inspired by the quiet ceremony of a<br />
                            well-made cup.
                        </h2>

                        <p className="home-story-description">
                            INSTEA began as a six-seat counter in SoHo, brewing tea the slow way:
                            whole leaves, real milk, fresh fruit, and no artificial flavorings. Today our tea
                            masters source directly from family estates in Uji, Fujian and Assam — and
                            still hand-cook every batch of pearls.
                        </p>

                        <a href="/about" className="home-story-link">
                            Read the full story
                        </a>
                    </div>

                    <div className="home-newsletter">                                                                                                {/* Right: Newsletter */}
                        <h3>The seasonal letter</h3>

                        <p>
                            Updates, new blends, and upcoming announcements.
                            Newsletter subscriptions coming soon.
                        </p>

                        <label htmlFor="home-newsletter-email">
                            Email address
                        </label>

                        <div className="home-newsletter-form">
                            <input
                                id="home-newsletter-email"
                                type="email"
                                placeholder="you@email.com"
                                disabled
                            />

                            <button type="button" disabled>
                                Subscribe
                            </button>
                        </div>
                    </div>

                </div>
            </section>                                                                                                                               {/* ------- OUR STORY & NEWSLETTER END------- */}

        </div>
    );
}

export default Home;