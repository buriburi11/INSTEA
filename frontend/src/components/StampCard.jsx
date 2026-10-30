import { Check, Leaf } from 'lucide-react'

/** @typedef {import('../types/models').StampCard} StampCardData */

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

function formatDate(iso) {
  return dateFormat.format(new Date(iso))
}

/**
 * One stamp card: earned vs empty stamps plus its active, completed or expired footer.
 * Styles live in RewardsPage.css.
 *
 * @param {{ card: StampCardData }} props
 */
export default function StampCard({ card }) {
  // Clamped in case the backend over-counts, so we never draw more stamps than slots.
  const earned = Math.min(card.stampsEarned, card.stampsRequired)
  const toGo = card.stampsRequired - earned

  return (
    <article className={`rewards-card stamp-card ${card.status}`} aria-labelledby={`${card.id}-name`}>
      <div className="stamp-card-top">
        <div>
          <h3 id={`${card.id}-name`}>{card.name}</h3>
          <p className="rewards-muted rewards-small">Reward: {card.reward}</p>
        </div>
        <span className="stamp-card-count" aria-hidden="true">
          {earned}/{card.stampsRequired}
        </span>
      </div>

      {/* ------- STAMP GRID -------
          One circle per required stamp; the first `earned` are filled. The circles are decorative
          (aria-hidden), and the list's aria-label gives screen readers the count instead. */}
      <ol className="stamp-grid" aria-label={`${earned} of ${card.stampsRequired} stamps earned`}>
        {Array.from({ length: card.stampsRequired }, (_, i) => (
          <li key={i} className={`stamp ${i < earned ? 'earned' : 'empty'}`} aria-hidden="true">
            <Leaf size={14} />
          </li>
        ))}
      </ol>

      {/* ------- FOOTER (changes by status) ------- */}
      <div className="stamp-card-footer rewards-small">
        {card.status === 'completed' && (
          <>
            {/* Falls back to expiresAt if the backend leaves completedAt out. */}
            <span>Completed {formatDate(card.completedAt ?? card.expiresAt)}</span>
            <strong className="stamp-card-earned">
              <Check size={14} aria-hidden="true" /> Reward earned
            </strong>
          </>
        )}
        {card.status === 'expired' && (
          <span className="rewards-expired">Expired {formatDate(card.expiresAt)}</span>
        )}
        {card.status === 'active' && (
          <>
            <span>Expires {formatDate(card.expiresAt)}</span>
            <strong>{toGo} to go</strong>
          </>
        )}
      </div>
    </article>
  )
}
