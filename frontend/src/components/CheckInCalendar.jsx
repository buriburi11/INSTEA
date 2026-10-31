/*makes the calendar from react not hardcoded*/
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './CheckInCalendar.css'
import { mockCheckIns, mockMissedDates } from '../data/checkIns.js'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CheckInCalendar() {
  const checkInDates = new Set(mockCheckIns.map((checkIn) => checkIn.date))
  const missedDates = new Set(mockMissedDates)

  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const monthTitle = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  const changeMonth = (amount) => {
    setCurrentMonth((previousMonth) => {
      return new Date(
        previousMonth.getFullYear(),
        previousMonth.getMonth() + amount,
        1
      )
    })
  }

  return (
    <section className="checkin-calendar">
      <div className="checkin-calendar-header">
        <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>

        <h2>{monthTitle}</h2>

        <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>


      <div className="checkin-weekdays">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="checkin-calendar-grid">
        {calendarDays.map((day, index) => {
          const date = day === null
            ? null
            : `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          const isCheckIn = date !== null && checkInDates.has(date)
          const isMissed = date !== null && missedDates.has(date)

          return (
            <div
              key={day === null ? `empty-${index}` : day}
              className={`checkin-day ${isCheckIn ? 'checked-in' : ''} ${isMissed ? 'missed' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>
      {/*The little squares inform customer of what they mean*/}
      <div className="checkin-legend">
        <div className="checkin-legend-item">
          <span className="checkin-legend-color checked-in"></span>
          <span>Check-in</span>
        </div>

        <div className="checkin-legend-item">
          <span className="checkin-legend-color missed"></span>
          <span>Missed week</span>
        </div>
      </div>
    </section>
  )
}