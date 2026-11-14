import {
  Award,
  CalendarDays,
  Check,
  Gift,
  QrCode,
  RotateCcw,
  Vote,
} from 'lucide-react'
import { Link } from 'react-router'
import useAuth from '../../auth/useAuth.js'
import {
  products,
  PRODUCT_IMAGE_PLACEHOLDER,
} from '../../data/products.js'
import { orders } from '../../data/orders.js'
import { stampCards } from '../../data/stampCards.js'
import { mockStreakSummary } from '../../data/checkIns.js'
import { mockPolls } from '../../data/communityPolls.js'
import { events } from '../../data/events.js'
import './MemberDashboardPage.css'

const NEXT_REWARD_MILESTONE = 1200

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function MemberDashboardPage() {
  const { customer } = useAuth()

  const memberOrders = orders.filter(
    (order) => order.customerId === customer.id,
  )

  const usualOrder = memberOrders[0]
  const usualOrderItem = usualOrder?.items[0]

  const usualProduct = products.find(
    (product) => product.id === usualOrderItem?.productId,
  )

  const activeStampCard = stampCards.find(
    (card) =>
      card.customerId === customer.id &&
      card.status === 'active',
  )

  const activePoll = mockPolls.find(
    (poll) => poll.status === 'active',
  )

  const upcomingEvent = events[0]

  const leaves = Number(customer.rewardLeaves) || 0
  const progress = Math.min(
    100,
    Math.round((leaves / NEXT_REWARD_MILESTONE) * 100),
  )
  const leavesRemaining = Math.max(
    0,
    NEXT_REWARD_MILESTONE - leaves,
  )

  const tier = customer.membershipTier
    ? customer.membershipTier[0].toUpperCase() +
      customer.membershipTier.slice(1)
    : 'Regular'

  const recommendations = products
    .filter((product) => product.available && !product.soldOut)
    .filter((product) => product.id !== usualProduct?.id)
    .slice(0, 3)

  return (
    <main className="member-dashboard-page">
      <div className="member-dashboard-grid">
        <div className="member-dashboard-column">
          <section
            className="member-loyalty-card"
            aria-label="Loyalty overview"
          >
            <div className="member-loyalty-card-top">
              <span>INSTEA Rewards Pass</span>
              <span className="member-tier-badge">{tier}</span>
            </div>

            <p className="member-leaves-balance">
              {leaves.toLocaleString()}
              <span>Tea Leaves</span>
            </p>

            <p className="member-loyalty-message">
              {leavesRemaining > 0
                ? `${leavesRemaining.toLocaleString()} leaves away from your next complimentary drink`
                : 'Your complimentary drink reward is ready'}
            </p>

            <div
              className="member-loyalty-progress"
              role="progressbar"
              aria-label="Progress toward next reward"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={progress}
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="member-loyalty-progress-label">
              <span>
                Milestone: {NEXT_REWARD_MILESTONE.toLocaleString()} leaves
              </span>
              <strong>{progress}% complete</strong>
            </div>

            <Link
              to="/member-card"
              className="member-gold-button"
            >
              <QrCode size={19} aria-hidden="true" />
              Show Member QR Code
            </Link>
          </section>

          <WeeklyStreak />

          {activeStampCard && (
            <section className="dashboard-card member-ritual-card">
              <div className="dashboard-section-heading">
                <h2>{activeStampCard.name}</h2>
                <strong>
                  {activeStampCard.stampsEarned} of{' '}
                  {activeStampCard.stampsRequired}
                </strong>
              </div>

              <div
                className="member-ritual-stamps"
                aria-label={`${activeStampCard.stampsEarned} of ${activeStampCard.stampsRequired} stamps earned`}
              >
                {Array.from(
                  { length: activeStampCard.stampsRequired },
                  (_, index) => (
                    <span
                      key={index}
                      className={
                        index < activeStampCard.stampsEarned
                          ? 'earned'
                          : ''
                      }
                    />
                  ),
                )}
              </div>

              <p>
                <strong>
                  {activeStampCard.stampsRequired -
                    activeStampCard.stampsEarned}{' '}
                  more
                </strong>{' '}
                for a {activeStampCard.reward}
              </p>

              <Link
                to="/rewards"
                className="member-text-link"
              >
                View stamp cards →
              </Link>
            </section>
          )}
        </div>

        <div className="member-dashboard-column">
          {usualOrderItem && (
            <section className="dashboard-card member-usual-order">
              <ProductImage
                product={usualProduct}
                className="member-usual-order-image"
              />

              <div>
                <p className="dashboard-eyebrow">Your usual</p>
                <h2>{usualOrderItem.productName}</h2>

                <p className="member-usual-options">
                  {usualOrderItem.selectedOptions
                    ?.slice(0, 3)
                    .map((option) => option.value)
                    .join(' · ')}
                </p>

                <Link
                  to={`/menu/${usualOrderItem.productId}`}
                  className="member-dark-button"
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Reorder · {currency.format(usualOrderItem.unitPrice)}
                </Link>
              </div>
            </section>
          )}

          <section className="member-dashboard-section">
            <div className="dashboard-section-heading">
              <h2>Ready to use</h2>

              <Link to="/rewards" className="member-text-link">
                Wallet
              </Link>
            </div>

            <div className="member-reward-widgets">
              <article className="member-reward-widget">
                <span className="member-widget-label">
                  <Gift size={17} aria-hidden="true" />
                  Reward milestone
                </span>

                <h3>Complimentary Drink Voucher</h3>
                <p>Expires Dec 31</p>
              </article>

              <article className="member-reward-widget">
                <span className="member-widget-label">
                  <Award size={17} aria-hidden="true" />
                  Member privilege
                </span>

                <h3>15% off whole leaf tins</h3>
                <p>Expires Dec 15</p>
              </article>
            </div>
          </section>

          <section
            className="member-community-widgets"
            aria-label="Community activities"
          >
            {activePoll && (
              <Link
                to="/community"
                className="dashboard-card member-community-widget"
              >
                <Vote size={23} aria-hidden="true" />
                <strong>{activePoll.title}</strong>
                <span>View community poll →</span>
              </Link>
            )}

            {upcomingEvent && (
              <Link
                to={`/events/${upcomingEvent.id}`}
                className="dashboard-card member-community-widget"
              >
                <CalendarDays size={23} aria-hidden="true" />
                <strong>{upcomingEvent.title}</strong>
                <span>
                  {upcomingEvent.date} · {upcomingEvent.location}
                </span>
              </Link>
            )}
          </section>

          <section className="member-dashboard-section">
            <h2>Picked for you</h2>

            <div className="dashboard-card member-recommendations">
              {recommendations.map((product) => (
                <Link
                  key={product.id}
                  to={`/menu/${product.id}`}
                  className="member-recommendation"
                >
                  <ProductImage
                    product={product}
                    className="member-recommendation-image"
                  />

                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.description}</small>
                  </span>

                  <strong>{currency.format(product.price)}</strong>
                </Link>
              ))}
            </div>
          </section>

          <section className="member-dashboard-section">
            <div className="dashboard-section-heading">
              <h2>Recent orders</h2>

              <Link to="/orders" className="member-text-link">
                All →
              </Link>
            </div>

            <div className="member-recent-orders">
              {memberOrders.slice(0, 2).map((order) => (
                <article
                  key={order.id}
                  className="dashboard-card member-recent-order"
                >
                  <span>
                    <strong>
                      #{order.id.replace('ord-', '')} ·{' '}
                      {order.items[0]?.productName}
                    </strong>

                    <small>
                      {order.pickupDate} · {order.pickupTime}
                    </small>
                  </span>

                  <strong>{currency.format(order.total)}</strong>
                </article>
              ))}

              {memberOrders.length === 0 && (
                <div className="dashboard-card member-empty-orders">
                  <p>You have not placed an order yet.</p>
                  <Link to="/menu">Browse the menu</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function WeeklyStreak() {
  const currentStreak = mockStreakSummary.currentStreak
  const totalWeeks = mockStreakSummary.nextMilestone

  return (
    <section className="dashboard-card member-weekly-streak">
      <div className="dashboard-section-heading">
        <div>
          <h2>Weekly Tea Streak</h2>
          <p>Visit or order once a week to keep your ritual going.</p>
        </div>

        <span className="member-streak-badge">
          {currentStreak}-week streak
        </span>
      </div>

      <ol className="member-streak-weeks">
        {Array.from({ length: totalWeeks }, (_, index) => {
          const weekNumber = index + 1
          const isCompleted = weekNumber < currentStreak
          const isCurrent = weekNumber === currentStreak

          return (
            <li
              key={weekNumber}
              className={isCurrent ? 'current' : ''}
            >
              <span>Wk {weekNumber}</span>

              <span className="member-streak-icon">
                {isCompleted && <Check size={17} />}
                {isCurrent && '🍃'}
                {!isCompleted && !isCurrent && (
                  <Gift size={17} />
                )}
              </span>

              <small>
                {isCompleted
                  ? 'Complete'
                  : isCurrent
                    ? 'Current'
                    : 'Free treat'}
              </small>
            </li>
          )
        })}
      </ol>

      <p className="member-streak-footer">
        Week {currentStreak} complete · Next week’s order earns a free treat
      </p>
    </section>
  )
}

function ProductImage({ product, className }) {
  return (
    <img
      src={product?.imageUrl || PRODUCT_IMAGE_PLACEHOLDER}
      alt={product?.name || 'INSTEA product'}
      className={className}
      onError={(event) => {
        event.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER
      }}
    />
  )
}