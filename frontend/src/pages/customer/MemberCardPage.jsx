import { useState } from 'react'
import {
  Check,
  Gift,
  Info,
  Maximize2,
  QrCode,
  Sun,
  WalletCards,
  X,
} from 'lucide-react'
import useAuth from '../../auth/useAuth.js'
import CheckInCalendar from '../../components/CheckInCalendar.jsx'
import { mockStreakSummary } from '../../data/checkIns.js'
import './MemberCardPage.css'

export default function MemberCardPage() {
  const { customer } = useAuth()

  const [isEnlarged, setIsEnlarged] = useState(false)
  const [isBright, setIsBright] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [walletFeedback, setWalletFeedback] = useState('')

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(' ')

  const tier = customer.membershipTier
    ? customer.membershipTier[0].toUpperCase() +
      customer.membershipTier.slice(1)
    : 'Regular'

  function handleWallet() {
    setWalletFeedback(
      'Digital wallet support will be connected when the production membership system is available.',
    )
  }

  return (
    <main className="member-card-page">
      <div className="member-card-page-grid">
        <section className="member-card-column">
          <DigitalMemberCard
            customer={customer}
            fullName={fullName}
            tier={tier}
            isBright={isBright}
          />

          <div
            className="member-card-controls"
            aria-label="Member card controls"
          >
            <button
              type="button"
              onClick={() => setIsEnlarged(true)}
            >
              <Maximize2 size={20} aria-hidden="true" />
              Enlarge
            </button>

            <button
              type="button"
              className={isBright ? 'active' : ''}
              aria-pressed={isBright}
              onClick={() => setIsBright((current) => !current)}
            >
              <Sun size={20} aria-hidden="true" />
              Brighten
            </button>

            <button
              type="button"
              className={showDetails ? 'active' : ''}
              aria-pressed={showDetails}
              onClick={() =>
                setShowDetails((current) => !current)
              }
            >
              <Info size={20} aria-hidden="true" />
              Details
            </button>

            <button type="button" onClick={handleWallet}>
              <WalletCards size={20} aria-hidden="true" />
              Wallet
            </button>
          </div>

          {showDetails && (
            <section className="member-card-details">
              <h2>Membership details</h2>

              <dl>
                <div>
                  <dt>Member</dt>
                  <dd>{fullName}</dd>
                </div>

                <div>
                  <dt>Member ID</dt>
                  <dd>{customer.memberNumber}</dd>
                </div>

                <div>
                  <dt>Membership tier</dt>
                  <dd>{tier}</dd>
                </div>

                <div>
                  <dt>Tea Leaves</dt>
                  <dd>
                    {Number(customer.rewardLeaves).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          {walletFeedback && (
            <div className="member-wallet-feedback" role="status">
              {walletFeedback}

              <button
                type="button"
                aria-label="Dismiss wallet message"
                onClick={() => setWalletFeedback('')}
              >
                <X size={17} />
              </button>
            </div>
          )}
        </section>

        <div className="member-card-column">
          <WeeklyRitual />

          <section className="member-card-calendar">
            <div className="member-card-calendar-heading">
              <div>
                <p>Visit history</p>
                <h2>Your check-ins</h2>
              </div>

              <strong>7 check-ins</strong>
            </div>

            <CheckInCalendar />
          </section>
        </div>
      </div>

      {isEnlarged && (
        <div
          className="member-card-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged member card"
          onClick={() => setIsEnlarged(false)}
        >
          <div
            className="member-card-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="member-card-modal-close"
              aria-label="Close enlarged member card"
              onClick={() => setIsEnlarged(false)}
            >
              <X size={24} />
            </button>

            <DigitalMemberCard
              customer={customer}
              fullName={fullName}
              tier={tier}
              isBright={isBright}
              enlarged
            />
          </div>
        </div>
      )}
    </main>
  )
}

function DigitalMemberCard({
  customer,
  fullName,
  tier,
  isBright,
  enlarged = false,
}) {
  return (
    <article
      className={`digital-member-card ${
        isBright ? 'bright' : ''
      } ${enlarged ? 'enlarged' : ''}`}
    >
      <div className="digital-member-card-header">
        <div className="digital-member-brand">
          <span className="digital-member-brand-mark">I</span>
          <span>INSTEA</span>
        </div>

        <span className="digital-member-tier">{tier}</span>
      </div>

      <div className="digital-member-identity">
        <div>
          <h2>{fullName}</h2>
          <p>Member #{customer.memberNumber}</p>
        </div>

        <div className="digital-member-leaves">
          <strong>
            {Number(customer.rewardLeaves).toLocaleString()}
          </strong>
          <span>Tea Leaves</span>
        </div>
      </div>

      <div
        className="digital-member-qr"
        role="img"
        aria-label={`Temporary membership QR code for ${customer.memberNumber}`}
      >
        <QrCode size={enlarged ? 210 : 155} strokeWidth={1.4} />
      </div>

      <p className="digital-member-instruction">
        Scan at the counter to earn and redeem rewards
      </p>
    </article>
  )
}

function WeeklyRitual() {
  const currentStreak = mockStreakSummary.currentStreak
  const totalWeeks = mockStreakSummary.nextMilestone

  return (
    <section className="member-ritual-overview">
      <div className="member-ritual-heading">
        <h2>This week’s ritual</h2>
        <span>{currentStreak}-week streak</span>
      </div>

      <ol className="member-ritual-weeks">
        {Array.from({ length: totalWeeks }, (_, index) => {
          const week = index + 1
          const isCompleted = week < currentStreak
          const isCurrent = week === currentStreak

          return (
            <li key={week}>
              <span
                className={`member-ritual-week-icon ${
                  isCurrent ? 'current' : ''
                }`}
              >
                {isCompleted && <Check size={20} />}
                {isCurrent && '🍃'}
                {!isCompleted && !isCurrent && (
                  <Gift size={19} />
                )}
              </span>

              <small>Wk {week}</small>
            </li>
          )
        })}
      </ol>

      <p>
        <strong>{currentStreak}-week streak</strong> · Longest{' '}
        {mockStreakSummary.longestStreak} weeks
      </p>
    </section>
  )
}