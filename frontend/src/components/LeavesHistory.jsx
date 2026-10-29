import { useState } from 'react'

/** @typedef {import('../types/models').LeavesTransaction} LeavesTransaction */

const filters = ['all', 'earned', 'redeemed', 'adjusted', 'expired']

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1)
}

function formatAmount(amount) {
  return `${amount > 0 ? '+' : '−'}${Math.abs(amount).toLocaleString()}`
}

/**
 * Tea Leaves balance summary and filterable transaction list.
 * Styles live in RewardsPage.css.
 *
 * @param {{
 *   transactions: LeavesTransaction[],
 *   available: number,
 *   expiring?: { amount: number, date: string },
 * }} props
 */
export default function LeavesHistory({ transactions, available, expiring }) {
  const [filter, setFilter] = useState('all')

  const thisYear = new Date().getFullYear()
  const pending = transactions
    .filter((t) => t.pending)
    .reduce((sum, t) => sum + t.amount, 0)
  const redeemedThisYear = transactions
    .filter((t) => t.type === 'redeemed' && new Date(t.createdAt).getFullYear() === thisYear)
    .reduce((sum, t) => sum - t.amount, 0)
  const shown = transactions.filter((t) => filter === 'all' || t.type === filter)

  return (
    <section className="rewards-section" aria-label="Leaves history">
      <dl className="rewards-card rewards-stats">
        <div>
          <dt>Available</dt>
          <dd className="rewards-stat-main">{available.toLocaleString()}</dd>
        </div>
        <div>
          <dt>Pending</dt>
          <dd>{pending ? formatAmount(pending) : 0}</dd>
        </div>
        <div>
          <dt>Redeemed this year</dt>
          <dd>{redeemedThisYear.toLocaleString()}</dd>
        </div>
        {expiring && (
          <div>
            <dt>Expiring {expiring.date}</dt>
            <dd>{expiring.amount.toLocaleString()}</dd>
          </div>
        )}
      </dl>

      <div className="rewards-chips" role="group" aria-label="Filter leaves history">
        {filters.map((option) => (
          <button
            key={option}
            type="button"
            className={option === filter ? 'active' : ''}
            aria-pressed={option === filter}
            onClick={() => setFilter(option)}
          >
            {capitalize(option)}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rewards-card rewards-ledger-empty">
          <p className="rewards-redeem-name">
            {filter === 'all' ? 'No leaves activity yet' : `No ${filter} leaves yet`}
          </p>
          <p className="rewards-muted rewards-small">
            Every order and weekly visit earns Tea Leaves. They'll show up here.
          </p>
        </div>
      ) : (
        <ul className="rewards-card rewards-ledger">
          {shown.map((t) => (
            <li key={t.id} className="rewards-ledger-item">
              <div>
                <p className="rewards-redeem-name">
                  {t.reason}
                  <span className={`rewards-type-tag ${t.type}`}>{capitalize(t.type)}</span>
                  {t.pending && <span className="rewards-pending-badge">Pending</span>}
                </p>
                <p className="rewards-muted rewards-small">
                  <time dateTime={t.createdAt}>{dateFormat.format(new Date(t.createdAt))}</time>
                  {t.detail && ` · ${t.detail}`}
                </p>
              </div>
              <span className={`rewards-ledger-amount ${t.amount < 0 ? 'negative' : 'positive'}`}>
                {formatAmount(t.amount)}
                <span className="rewards-sr-only">{t.amount < 0 ? ' leaves removed' : ' leaves added'}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="rewards-small">
        Pending leaves post 24 hours after pickup. Leaves expire 12 months after they're earned.
      </p>
    </section>
  )
}
