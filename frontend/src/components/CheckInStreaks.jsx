
import { Flame } from 'lucide-react'
import {
  mockCheckIns,
  mockStreakSummary,
  mockMissedWeekSummary,
} from '../data/checkIns.js'

/** @param {{ currentStreak: number, onViewRewards?: () => void }} props */
export default function CheckInStreaks({ currentStreak, onViewRewards }) {
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
          <strong>{currentStreak} {currentStreak === 1 ? 'week' : 'weeks'}</strong>
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

      <p className="rewards-muted">
        {currentStreak === 0 ? 'No current streak. ' : ''}
        Your current streak counts consecutive calendar weeks with a qualifying purchase or check-in.
      </p>

      {/* Next milestone */}
      <div className="checkin-milestone">
        <h3>
          <Flame size={20} aria-hidden="true" />
          Next milestone: {mockStreakSummary.nextMilestone} weeks
        </h3>
        <p>
          Check in each week to work toward your next milestone reward.
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
          streak ended here.
          {currentStreak > 0 && (
            <> Your current streak started {formatDate(mockMissedWeekSummary.restartedDate)}.</>
          )}
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
