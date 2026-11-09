
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary';
import { locations } from '../../data/locations';
import './CheckoutPickup.css';

// ===========================
//    CHECKOUT PICKUP PAGE
// ===========================

function CheckoutPickup() {

    // ===========================
    //    SHOPPING CART DATA
    // ===========================

    const [cartItems] = useState(() => {
        try {
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]');       // Load the existing Shopping Cart.
            return Array.isArray(savedCart) ? savedCart : [];                              // Ensure the cart contains an array.
        } catch {
            return [];                                                                     // Prevent invalid saved data from crashing checkout.
        }
    });

    // ===========================
    //    PICKUP SELECTION STATE
    // ===========================

    const [selectedLocation, setSelectedLocation] = useState(locations[0]?.id ?? 0);       // Default to the first available INSTEA location.
    const [selectedDate, setSelectedDate] = useState(0);                                   // Store the selected date's offset from today.
    const [selectedTime, setSelectedTime] = useState('ASAP');                              // Default to the earliest pickup option.

    // ------- PICKUP DATES -------

    const pickupDates = Array.from({ length: 3 }, (_, index) => {
        const date = new Date();                                                           // Start with today's local date.
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + index);                                              // Generate today and the next two days.

        return {
            offset: index,
            label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date),
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    });

    // ------- PLACEHOLDER PICKUP TIMES -------

    const pickupTimes = [
        { value: 'ASAP', label: 'ASAP', description: '10–15 min' },
        { value: '10:30 AM', label: '10:30 AM' },
        { value: '10:45 AM', label: '10:45 AM' },
        { value: '11:00 AM', label: '11:00 AM', disabled: true },
        { value: '11:15 AM', label: '11:15 AM' },
        { value: '11:30 AM', label: '11:30 AM' },
    ];                                                                                     // Temporary Figma examples; real availability belongs to INST-63.

    // ===========================
    //    EMPTY CART PROTECTION
    // ===========================

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-empty">
                    <h1>Your cart is empty</h1>
                    <p>Add something to your cart before continuing to checkout.</p>
                    <a href="/menu" className="checkout-primary-button">Browse menu</a>
                </div>
            </main>
        );
    }

    // ===========================
    //    CHECKOUT PAGE DISPLAY
    // ===========================

    return (
        <main className="checkout-page">

            {/* ------- CHECKOUT HEADING ------- */}

            <h1 className="checkout-heading">Checkout</h1>

            {/* ------- CHECKOUT PROGRESS ------- */}

            <nav className="checkout-progress" aria-label="Checkout progress">

                {['Pickup', 'Contact', 'Payment', 'Review'].map((step, index) => (

                    <div
                        key={step}
                        className={`checkout-progress-step ${index === 0 ? 'checkout-progress-active' : ''}`}
                        aria-current={index === 0 ? 'step' : undefined}
                    >
                        <span className="checkout-step-number">{index + 1}</span>
                        <span className="checkout-step-label">{step}</span>
                    </div>

                ))}

            </nav>

            {/* =========================== */}
            {/*    TWO-COLUMN LAYOUT        */}
            {/* =========================== */}

            <div className="checkout-layout">

                {/* =========================== */}
                {/*    PICKUP INFORMATION       */}
                {/* =========================== */}

                <div className="checkout-main-content">

                    {/* ------- PICKUP LOCATION ------- */}

                    <section className="checkout-pickup-section">
                        <h2><MapPin size={22} /> Pickup location</h2>
                        <p className="checkout-section-description">Choose where you'd like to pick up your order.</p>

                        <div className="checkout-location-list">
                            {locations.map((location, index) => (
                                <button
                                    key={location.id ?? index}
                                    type="button"
                                    className={`checkout-location-card ${selectedLocation === (location.id ?? index) ? 'checkout-selected' : ''}`}
                                    onClick={() => setSelectedLocation(location.id ?? index)}
                                    aria-pressed={selectedLocation === (location.id ?? index)}
                                >
                                    {/* ------- LOCATION ICON ------- */}

                                    <MapPin
                                        size={17}
                                        className="checkout-location-icon"
                                        aria-hidden="true"
                                    />

                                    {/* ------- LOCATION INFORMATION ------- */}

                                    <span className="checkout-location-information">

                                        <strong>{location.name}</strong>

                                        <span>{location.address}</span>

                                        {/* ------- LOCATION HOURS ------- */}

                                        {location.hours && (
                                            <span className="checkout-location-hours">
                                                {typeof location.hours === 'string'
                                                    ? location.hours
                                                    : 'View store hours'}
                                            </span>
                                        )}

                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    
                    {/* =========================== */}
                    {/*    PICKUP DATE & TIME      */}
                    {/* =========================== */}

                    <section className="checkout-pickup-section">

                        {/* ------- SECTION HEADING ------- */}

                        <h2>Pickup date &amp; time</h2>

                        {/* ------- PICKUP DATE OPTIONS ------- */}

                        <div className="checkout-date-list">

                            {pickupDates.map(date => (
                                <button
                                    key={date.offset}
                                    type="button"
                                    className={`checkout-date-card ${selectedDate === date.offset ? 'checkout-selected' : ''}`}
                                    onClick={() => {
                                        setSelectedDate(date.offset);                                          // Update the selected pickup date.
                                        setSelectedTime('');                                                   // Clear the previous time selection when the date changes.
                                    }}
                                    aria-pressed={selectedDate === date.offset}
                                >
                                    <strong>{date.label}</strong>
                                    <span>{date.date}</span>
                                </button>
                            ))}

                        </div>

                        {/* ------- PICKUP TIME OPTIONS ------- */}

                        <div className="checkout-time-list">

                            {pickupTimes.map(time => (
                                <button
                                    key={time.value}
                                    type="button"
                                    disabled={time.disabled}
                                    className={`checkout-time-card ${selectedTime === time.value ? 'checkout-selected' : ''}`}
                                    onClick={() => setSelectedTime(time.value)}                              // Save the customer's selected pickup time.
                                    aria-pressed={selectedTime === time.value}
                                >
                                    <strong>{time.label}</strong>
                                    {time.description && <span>{time.description}</span>}
                                </button>
                            ))}

                        </div>

                    </section>


                    {/* ------- CONTINUE TO CONTACT ------- */}

                    <button
                        type="button"
                        className="checkout-continue-button"
                        disabled={!selectedTime}
                    >
                        Continue to contact
                    </button>

                </div>

                {/* =========================== */}
                {/*    SHARED ORDER SUMMARY     */}
                {/* =========================== */}

                <CheckoutOrderSummary cartItems={cartItems} />

            </div>

        </main>
    );
}

export default CheckoutPickup;