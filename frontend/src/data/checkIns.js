
export const mockCheckIns = [
  { id: 1, date: '2026-11-03' },
  { id: 2, date: '2026-11-05' },
  { id: 3, date: '2026-11-11' },
  { id: 4, date: '2026-11-14' },
  { id: 5, date: '2026-11-18' },
  { id: 6, date: '2026-11-22' },
  { id: 7, date: '2026-11-24' },
]

// Mock missed dates shown in the Figma design.
export const mockMissedDates = [
  '2026-11-07',
  '2026-11-08',
  '2026-11-09',
  '2026-11-10',
]


//Mock data of streak summary 
export const mockStreakSummary = {
  currentStreak: 4,
  longestStreak: 9,
  nextMilestone: 5,
  milestoneReward: 'Free pastry or snack',
}


export const mockMissedWeekSummary = {
  startDate: '2026-11-07',
  endDate: '2026-11-10',
  previousStreak: 9,
  restartedDate: '2026-11-11',
}
