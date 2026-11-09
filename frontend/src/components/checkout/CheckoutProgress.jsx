import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { loadCheckoutData } from '../../utils/checkoutStorage';

// ===========================
//    CHECKOUT PROGRESS BAR
// ===========================

const CHECKOUT_STEPS = [
    { label: 'Pickup', path: '/checkout' },
    { label: 'Contact', path: '/checkout/contact' },
    { label: 'Payment', path: '/checkout/payment' },
    { label: 'Review', path: '/checkout/review' },
];

// ===========================
//    PROGRESS COMPONENT
// ===========================

function CheckoutProgress({ currentStep }) {

    // ===========================
    //    CHECKOUT NAVIGATION
    // ===========================

    const navigate = useNavigate();                                                     // Navigate between checkout pages.
    const checkoutData = loadCheckoutData();                                            // Retrieve previously saved checkout selections.

    const currentStepIndex = CHECKOUT_STEPS.findIndex(
        step => step.label === currentStep
    );                                                                                  // Identify the customer's current checkout step.

    // ------- VALIDATE COMPLETED STEPS -------

    const hasPickupSelection = Boolean(
        checkoutData.pickupLocationId &&
        checkoutData.pickupDate &&
        checkoutData.pickupTime
    );                                                                                  // Check whether pickup details have been saved.

    const hasContactInformation = Boolean(
        checkoutData.contact?.firstName &&
        checkoutData.contact?.lastName &&
        checkoutData.contact?.email &&
        checkoutData.contact?.phone
    );                                                                                  // Check whether contact details have been saved.

    // ===========================
    //    STEP NAVIGATION
    // ===========================

    function canNavigateToStep(stepIndex) {

        if (stepIndex === 0) return true;                                               // Pickup is always accessible.

        if (stepIndex === 1) return hasPickupSelection;                                 // Contact requires pickup information.

        if (stepIndex === 2) return hasPickupSelection && hasContactInformation;        // Payment requires pickup and contact information.

        return false;                                                                   // Review remains unavailable until Payment is implemented.
    }

    function handleStepClick(stepIndex) {

        if (!canNavigateToStep(stepIndex)) return;                                      // Prevent skipping required steps.

        navigate(CHECKOUT_STEPS[stepIndex].path);                                       // Open the selected checkout page.
    }

    // ===========================
    //    PROGRESS BAR DISPLAY
    // ===========================

    return (
        <nav className="checkout-progress" aria-label="Checkout progress">

            {CHECKOUT_STEPS.map((step, index) => {

                const isCompleted = index < currentStepIndex;                           // Steps before the current step display checkmarks.
                const isActive = index === currentStepIndex;                            // Highlight the current step in gold.
                const isAccessible = canNavigateToStep(index);                          // Determine whether navigation is allowed.

                return (
                    <div
                        key={step.label}
                        className={[
                            'checkout-progress-step',
                            isActive ? 'checkout-progress-active' : '',
                            isCompleted ? 'checkout-progress-completed' : '',
                        ].filter(Boolean).join(' ')}
                        aria-current={isActive ? 'step' : undefined}
                    >
                        {/* ------- CLICKABLE STEP ------- */}

                        <button
                            type="button"
                            className="checkout-progress-step-button"
                            disabled={!isAccessible || isActive}
                            onClick={() => handleStepClick(index)}
                            aria-label={`Go to ${step.label}`}
                        >

                            {/* ------- STEP NUMBER / CHECKMARK ------- */}

                            <span className="checkout-step-number">
                                {isCompleted ? <Check size={15} aria-hidden="true" /> : index + 1}
                            </span>

                            {/* ------- STEP LABEL ------- */}

                            <span className="checkout-step-label">
                                {step.label}
                            </span>

                        </button>
                    </div>
                );
            })}

        </nav>
    );
}

export default CheckoutProgress;