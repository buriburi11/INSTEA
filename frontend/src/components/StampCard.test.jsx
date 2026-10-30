import { render, screen } from '@testing-library/react'
import StampCard from './StampCard.jsx'
import { stampCards } from '../data/stampCards.js'

const [milkTea, , summerFruit, pastry] = stampCards

describe('StampCard', () => {
  it('shows the total stamps and which are earned', () => {
    const { container } = render(<StampCard card={milkTea} />)
    expect(screen.getByText('7/10')).toBeInTheDocument()
    expect(screen.getByLabelText('7 of 10 stamps earned')).toBeInTheDocument()
    expect(container.querySelectorAll('.stamp')).toHaveLength(10)
    expect(container.querySelectorAll('.stamp.earned')).toHaveLength(7)
    expect(screen.getByText('3 to go')).toBeInTheDocument()
  })

  it('shows a completed card', () => {
    const { container } = render(<StampCard card={summerFruit} />)
    expect(container.querySelectorAll('.stamp.empty')).toHaveLength(0)
    expect(screen.getByText('Reward earned')).toBeInTheDocument()
    expect(screen.getByText('Completed Aug 14')).toBeInTheDocument()
  })

  it('shows an expired card without a stamps-to-go count', () => {
    render(<StampCard card={pastry} />)
    expect(screen.getByText('Expired Sep 30')).toBeInTheDocument()
    expect(screen.queryByText(/to go/)).not.toBeInTheDocument()
  })

  it('shows a card with no stamps yet', () => {
    const { container } = render(<StampCard card={{ ...milkTea, stampsEarned: 0 }} />)
    expect(container.querySelectorAll('.stamp.earned')).toHaveLength(0)
    expect(screen.getByText('10 to go')).toBeInTheDocument()
  })
})
