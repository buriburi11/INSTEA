
import { Flame } from 'lucide-react'
import {
  mockCheckIns,
  mockStreakSummary,
  mockMissedWeekSummary,
} from '../data/checkIns.js'

export default function CheckInStreaks({ onViewRewards }) {
  {/*for the mock missed week info*/ }
  const formatDate = (date) => {
    const [year, month, day] = date.split('-').map(Number)

    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }


  return (
    <aside className="checkin-streaks">
      {/* Streak statistics */}
      <div className="checkin-stats">
        <div className="checkin-stat">
          <span>Current</span>
          <strong>{mockStreakSummary.currentStreak} wk</strong>
        </div>

        <div className="checkin-stat">
          <span>Longest</span>
          <strong>{mockStreakSummary.longestStreak} wk</strong>
        </div>

        <div className="checkin-stat">
          <span>Check-ins</span>
          <strong>{new Set(mockCheckIns.map((checkIn) => checkIn.date)).size}</strong>
        </div>
      </div>

      {/* Next milestone */}
      <div className="checkin-milestone">
        <h3>
          <Flame size={20} aria-hidden="true" />
          Next milestone: {mockStreakSummary.nextMilestone} weeks
        </h3>
        <p>
          Check in any day next week to unlock a free pastry or snack.
        </p>

        {/* button that send to reward data*/}
        <button type="button" onClick={onViewRewards}>
          Preview milestone reward
        </button>
      </div>

      {/* Missed week */}
      <div className="checkin-missed-week">
        <h3>
          Missed week · {formatDate(mockMissedWeekSummary.startDate)}
          {'–'}
          {formatDate(mockMissedWeekSummary.endDate)}
        </h3>

        <p>
          Your previous {mockMissedWeekSummary.previousStreak}-week
          streak ended here. Your current streak started{' '}
          {formatDate(mockMissedWeekSummary.restartedDate)}.
        </p>
      </div>

      {/* Streak rules */}
      <div className="checkin-rules">
        <h3>Streak rules</h3>
        <ul>
          <li>Any purchase of $5 or more counts as a check-in.</li>
          <li>Check in at least once per calendar week (Mon–Sun) to keep your streak.</li>
          <li>Reach 5 weeks in a row for a free treat, 10 weeks for a free drink.</li>
          <li>One missed week resets your current streak — your longest is kept forever.</li>
        </ul>
      </div>
    </aside>
  )
}
