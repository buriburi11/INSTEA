import { fireEvent, render, screen } from '@testing-library/react'
import LeavesHistory from './LeavesHistory.jsx'
import { leavesTransactions } from '../data/leavesTransactions.js'

describe('LeavesHistory', () => {
  it('shows date, amount and type for each entry', () => {
    render(<LeavesHistory transactions={leavesTransactions} available={820} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(leavesTransactions.length)
    expect(screen.getByText('Oct 21, 2026')).toBeInTheDocument()
    expect(screen.getByText('Cloud Matcha Voucher')).toBeInTheDocument()
  })

  it('marks positive and negative amounts differently', () => {
    render(<LeavesHistory transactions={leavesTransactions} available={820} />)
    expect(screen.getByText('−400', { exact: false })).toHaveClass('negative')
    expect(screen.getByText('+89', { exact: false })).toHaveClass('positive')
  })

  it('filters by type', () => {
    render(<LeavesHistory transactions={leavesTransactions} available={820} />)
    fireEvent.click(screen.getByRole('button', { name: 'Redeemed' }))
    expect(screen.getByText('Cloud Matcha Voucher')).toBeInTheDocument()
    expect(screen.queryByText('SoHo Tea House')).not.toBeInTheDocument()
  })

  it('shows an empty state with no history', () => {
    render(<LeavesHistory transactions={[]} available={0} />)
    expect(screen.getByText('No leaves activity yet')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
