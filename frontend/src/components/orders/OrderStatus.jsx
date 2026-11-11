// ===========
//   IMPORTS
// ===========

import './OrderStatus.css';

// ===========================
//    ORDER STATUS DISPLAY
// ===========================

const ORDER_STEPS = [
    { status: 'new', label: 'Received' },
    { status: 'preparing', label: 'Preparing' },
    { status: 'ready', label: 'Ready' },
    { status: 'completed', label: 'Completed' },
];

const STATUS_LABELS = {
    new: 'Received',
    placed: 'Received',
    preparing: 'Preparing',
    ready: 'Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
};

// ------- STATUS DISPLAY -------

function OrderStatus({ status = 'new', isDemo = false }) {

    const normalizedStatus = typeof status === 'string'
        ? status.toLowerCase().trim()
        : '';

    const currentStatus = normalizedStatus === 'placed'
        ? 'new'
        : normalizedStatus;

    const statusLabel = STATUS_LABELS[currentStatus] || 'Status unavailable';

    const currentStepIndex = ORDER_STEPS.findIndex(
        (step) => step.status === currentStatus
    );

    const isTerminalStatus = ['cancelled', 'refunded'].includes(currentStatus);
    const isUnknownStatus = !Object.hasOwn(STATUS_LABELS, currentStatus);

    // ------- STATUS MESSAGE -------

    const statusMessages = {
        new: isDemo
            ? 'This demo order is not being prepared by the store.'
            : 'Your order has been received.',
        preparing: 'Your order is being prepared.',
        ready: 'Your order is ready for pickup.',
        completed: 'Your order has been completed.',
        cancelled: 'This order has been cancelled.',
        refunded: 'This order has been refunded.',
    };

    const statusMessage = isUnknownStatus
        ? 'The current order status is unavailable.'
        : statusMessages[currentStatus];

    return (
        <section
            className={`checkout-confirmation-status ${isTerminalStatus ? 'order-status-terminal' : ''}`}
            aria-label="Order status"
        >

            <span className="checkout-confirmation-eyebrow">
                Current status
            </span>

            <h2>{statusLabel}</h2>

            <div className="checkout-confirmation-steps">

                {ORDER_STEPS.map((step, index) => (

                    <div
                        className={`checkout-confirmation-step ${
                            !isTerminalStatus && index <= currentStepIndex ? 'active' : ''
                        }`}
                        key={step.status}
                    >
                        <span className="checkout-confirmation-step-line" />
                        <span>{step.label}</span>
                    </div>

                ))}

            </div>

            <p role="status">{statusMessage}</p>

        </section>
    );

}

export default OrderStatus;