import { useState } from 'react'
import { Check, Copy, Flame, Gift, Lock, QrCode, Ticket } from 'lucide-react'
import useAuth from '../../auth/useAuth.js'
import './RewardsPage.css'

// Rewards page (/rewards). Logged-in customers only; see the ProtectedRoute in App.jsx.
// The tab row switches between views. Everything above the tabs stays on screen for every tab.

// ============
//   MOCK DATA
// ============

// TODO: Replace mock rewards data with backend rewards data.
const NEXT_MILESTONE = 1200

// TODO(points balance): placeholder. Replace with the customer's real Tea Leaves balance
// once the balance is implemented. Everything on this page that shows the balance
// reads from `leaves`, so only this needs to change.
const PLACEHOLDER_LEAVES_BALANCE = 1125
const PROMO_CODE = 'HARVEST15'

// Tabs not in `readyTabs` are shown but ignore clicks, so nobody lands on an empty view.
// Add a tab's name here once its view is built.
const walletTabs = ['Rewards wallet', 'Leaves history', 'Stamp cards', 'Check-ins & streaks']
const readyTabs = new Set(['Rewards wallet'])

const streakWeeks = [
  { label: 'Wk 1', date: 'Nov 3', status: 'done' },
  { label: 'Wk 2', date: 'Nov 11', status: 'done' },
  { label: 'Wk 3', date: 'Nov 16', status: 'done' },
  { label: 'Wk 4', date: 'Nov 22', status: 'current' },
  { label: 'Wk 5', date: 'Free treat', status: 'treat' },
]

// `cost` is in Tea Leaves. A reward is locked while it costs more than the balance.
const redeemOptions = [
  { cost: 100, name: 'Plant Milk Upgrade', description: 'Oat or almond milk on any drink.' },
  { cost: 300, name: 'Hojicha Butter Madeleine', description: 'Baked fresh daily in our atelier kitchen.' },
  { cost: 600, name: 'Any Handcrafted Drink', description: 'Any size, any drink on the menu.' },
  { cost: 1000, name: 'Reserve Tasting Flight', description: 'Curated three-pour flight with tea sommelier notes.' },
  { cost: 2000, name: 'Ceremonial Kyusu Teapot', description: 'Hand-thrown clay teapot for brewing at home.' },
]

const pastRewards = [
  { name: 'Complimentary Drink Voucher', status: 'Redeemed Nov 18', expired: false },
  { name: 'Summer Fruit Tea Upgrade', status: 'Expired Sep 30', expired: true },
]

// =============
//   COMPONENT
// =============

export default function RewardsPage() {
  const { customer } = useAuth()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('Rewards wallet')
  const leaves = PLACEHOLDER_LEAVES_BALANCE
  const progress = Math.min(100, Math.round((leaves / NEXT_MILESTONE) * 100))
  const leavesToGo = Math.max(0, NEXT_MILESTONE - leaves)
  const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ')
  const tier = customer.membershipTier
    ? customer.membershipTier[0].toUpperCase() + customer.membershipTier.slice(1)
    : 'Regular'

  // Clipboard access can be refused (non-HTTPS, browser permissions), so failure just leaves the label as "Copy".
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(PROMO_CODE)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="rewards-page">
      <div className="rewards-container">
        <p className="rewards-eyebrow">My rewards</p>
        <h1>{fullName}</h1>
        <p className="rewards-member">
          Member {customer.memberNumber} · {tier} member
        </p>

        <div className="rewards-hero">
          <section className="rewards-pass" aria-label="INSTEA Rewards Pass">
            <div className="rewards-pass-top">
              <span>INSTEA Rewards Pass</span>
              <span className="rewards-tier-badge">{tier}</span>
            </div>
            <p className="rewards-balance">
              {leaves.toLocaleString()} <span>Tea Leaves</span>
            </p>
            <p className="rewards-pass-note">
              {leavesToGo > 0
                ? `${leavesToGo.toLocaleString()} leaves away from your next complimentary drink`
                : 'You have reached your next complimentary drink'}
            </p>
            <div
              className="rewards-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Progress to next milestone"
            >
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="rewards-progress-labels">
              <span>Milestone {NEXT_MILESTONE.toLocaleString()} leaves</span>
              <span>{progress}% complete</span>
            </div>
            <button type="button" className="rewards-qr-button">
              <QrCode size={16} aria-hidden="true" /> Show Member QR Code
            </button>
          </section>

          <section className="rewards-card rewards-streak" aria-labelledby="streak-heading">
            <div className="rewards-streak-top">
              <h2 id="streak-heading">Weekly Tea Streak</h2>
              <span className="rewards-streak-badge">
                <Flame size={14} aria-hidden="true" /> 4-week streak
              </span>
            </div>
            <p className="rewards-muted">Visit or order once a week to keep your ritual going.</p>
            <ol className="rewards-weeks">
              {streakWeeks.map((week) => (
                <li key={week.label} className={`rewards-week ${week.status}`}>
                  <span className="rewards-week-label">{week.label}</span>
                  <span className="rewards-week-icon" aria-hidden="true">
                    {week.status === 'treat' ? <Gift size={14} /> : <Check size={14} />}
                  </span>
                  <span className="rewards-week-date">{week.date}</span>
                </li>
              ))}
            </ol>
            <p className="rewards-muted rewards-small">
              Week 4 complete · Next week's order earns a free treat
            </p>
          </section>
        </div>

        <nav className="rewards-tabs" aria-label="Rewards sections">
          {walletTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={tab === activeTab ? 'active' : ''}
              aria-pressed={tab === activeTab}
              onClick={() => readyTabs.has(tab) && setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === 'Rewards wallet' && (
        <>
        {/* ------- READY TO USE ------- */}
        {/* TODO: "Apply at checkout" has no handler yet; it should attach the voucher to the cart. */}
        <section className="rewards-section" aria-labelledby="ready-heading">
          <h2 id="ready-heading">Ready to use</h2>
          <div className="rewards-ready">
            <article className="rewards-card rewards-offer">
              <p className="rewards-eyebrow">Reward milestone</p>
              <h3>Complimentary Drink Voucher</h3>
              <p className="rewards-muted">
                Valid for any size Botanical Cold Brew, Cloud Matcha, or Classic Milk Tea.
              </p>
              <button type="button" className="rewards-dark-button">
                <Ticket size={16} aria-hidden="true" /> Apply at checkout
              </button>
              <p className="rewards-small">Expires Dec 31</p>
            </article>

            <article className="rewards-card rewards-offer">
              <p className="rewards-eyebrow">Member privilege</p>
              <h3>
                15% off <em>whole</em> leaf tins
              </h3>
              <p className="rewards-muted">Valid on all first-flush tins in-store and online.</p>
              <div className="rewards-code">
                <span>{PROMO_CODE}</span>
                <button type="button" onClick={copyCode}>
                  <Copy size={14} aria-hidden="true" /> {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="rewards-small">Expires Dec 15</p>
            </article>
          </div>
        </section>

        {/* ------- REDEEM TEA LEAVES ------- */}
        {/* TODO: Redeem buttons have no handler yet; redeeming needs a backend call that deducts leaves. */}
        <section className="rewards-section" aria-labelledby="redeem-heading">
          <div className="rewards-section-top">
            <h2 id="redeem-heading">Redeem Tea Leaves</h2>
            <span className="rewards-small">
              Balance <strong>{leaves.toLocaleString()}</strong>
            </span>
          </div>
          <ul className="rewards-card rewards-redeem-list">
            {redeemOptions.map((option) => {
              const locked = option.cost > leaves

              return (
                <li key={option.name} className="rewards-redeem-item">
                  <span className="rewards-cost">{option.cost.toLocaleString()}</span>
                  <div>
                    <p className="rewards-redeem-name">{option.name}</p>
                    <p className="rewards-muted rewards-small">
                      {locked
                        ? `${(option.cost - leaves).toLocaleString()} more leaves to unlock`
                        : option.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={locked ? 'rewards-redeem-locked' : 'rewards-dark-button'}
                    disabled={locked}
                    aria-label={`Redeem ${option.name}`}
                  >
                    {locked && <Lock size={13} aria-hidden="true" />} Redeem
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ------- REDEEMED & EXPIRED ------- */}
        <section className="rewards-section" aria-labelledby="past-heading">
          <h2 id="past-heading">Redeemed &amp; expired</h2>
          <div className="rewards-ready">
            {pastRewards.map((reward) => (
              <div key={reward.name} className="rewards-card rewards-past">
                <span>{reward.name}</span>
                <span className={reward.expired ? 'rewards-expired' : ''}>{reward.status}</span>
              </div>
            ))}
          </div>
        </section>
        </>
        )}
      </div>
    </main>
  )
}
