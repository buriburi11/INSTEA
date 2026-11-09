
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import CheckoutOrderSummary from '../../components/checkout/CheckoutOrderSummary';
import { locations } from '../../data/locations';
import { getPickupDates, getPickupTimes, getLocationStatus } from '../../utils/pickupScheduling';
import { loadCheckoutData, saveCheckoutData } from '../../utils/checkoutStorage';
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
            const savedCart = JSON.parse(localStorage.getItem('instea-cart') || '[]');                                                  // Load the existing Shopping Cart.
            return Array.isArray(savedCart) ? savedCart : [];                                                                           // Ensure the cart contains an array.
        } catch {
            return [];                                                                                                                  // Prevent invalid saved data from crashing checkout.
        }
    });


    
    // ===========================
    //    PICKUP SELECTION STATE
    // ===========================

    const pickupDates = getPickupDates();                                                                                               // Generate the available pickup dates.
    const [savedCheckout] = useState(() => loadCheckoutData());                                                                         // Load existing checkout selections once.

    // ------- SELECTED LOCATION -------

    const [selectedLocation, setSelectedLocation] = useState(() => {
        const savedLocation = locations.find(
            location => location.id === savedCheckout.pickupLocationId
        );                                                                                                                              // Check whether the saved location still exists.
        return savedLocation?.id ?? locations[0]?.id ?? '';                                                                             // Restore a valid location or use the first location.
    });

    // ------- SELECTED DATE -------

    const [selectedDate, setSelectedDate] = useState(() => {
        const savedDate = pickupDates.find(
            date => date.value === savedCheckout.pickupDate
        );                                                                                                                              // Check whether the saved date is still available.
        return savedDate?.value ?? pickupDates[0]?.value ?? '';                                                                         // Restore a valid date or default to today.
    });

    // ------- SELECTED TIME -------

    const [selectedTime, setSelectedTime] = useState(
        () => savedCheckout.pickupTime ?? ''
    );                                                                                                                                  // Restore the saved pickup time if one exists.

    // ------- SELECTED STORE -------

    const selectedStore = locations.find(location => location.id === selectedLocation);                                                 // Find the store selected by the customer.

    // ------- AVAILABLE PICKUP TIMES ------- 

    const pickupTimes = getPickupTimes(selectedDate, selectedStore?.pickupHours)                                                        // Generate pickup times using the selected store's hours.
        .filter(time => !time.disabled)                                                                                                 // Remove past times and slots without enough preparation time.
        .slice(0, 6);                                                                                                                   // Display only the next six available pickup times.

    // ------- VALIDATE PICKUP SELECTION -------

    const selectedTimeIsValid = pickupTimes.some(time =>
        time.value === selectedTime && !time.disabled
    );                                                                                                                                  // Confirm the selected time is still available.


    // ===========================
    //    SAVE PICKUP SELECTION
    // ===========================

    useEffect(() => {

        saveCheckoutData({
            pickupLocationId: selectedLocation,                                              // Store the selected location ID.
            pickupDate: selectedDate,                                                        // Store the selected calendar date.
            pickupTime: selectedTimeIsValid ? selectedTime : '',                             // Never persist an expired or unavailable time.
        });

    }, [selectedLocation, selectedDate, selectedTime, selectedTimeIsValid]);                  // Save whenever a pickup selection changes.


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
                                    className={`checkout-location-card ${selectedLocation === location.id ? 'checkout-selected' : ''}`}
                                    aria-pressed={selectedLocation === location.id}
                                    onClick={() => {
                                        setSelectedLocation(location.id);                                                               // Save the selected pickup location.
                                        setSelectedTime('');                                                                            // Clear the time because store hours may differ.
                                    }}
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

                                        
                                        {/* ------- LIVE LOCATION STATUS ------- */}

                                        {(() => {
                                            const status = getLocationStatus(location.pickupHours);                                     // Calculate whether this location is currently open.

                                            return (
                                                <span
                                                    className={`checkout-location-hours ${status.isOpen ? 'checkout-location-open' : 'checkout-location-closed'}`}
                                                >
                                                    {status.label}
                                                </span>
                                            );
                                        })()}


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
                                    key={date.value}
                                    type="button"
                                    className={`checkout-date-card ${selectedDate === date.value ? 'checkout-selected' : ''}`}
                                    onClick={() => {
                                        setSelectedDate(date.value);                                                                    // Update the selected pickup date.
                                        setSelectedTime('');                                                                            // Clear the previous time selection when the date changes.
                                    }}
                                    aria-pressed={selectedDate === date.value}
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
                                    onClick={() => setSelectedTime(time.value)}                                                         // Save the customer's selected pickup time.
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
                        disabled={!selectedLocation || !selectedDate || !selectedTimeIsValid}
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