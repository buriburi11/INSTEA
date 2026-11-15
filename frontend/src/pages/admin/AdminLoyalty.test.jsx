import { fireEvent, render, screen, within } from '@testing-library/react'
import { vi } from 'vitest'
import AdminLoyalty from './AdminLoyalty.jsx'
import { getRewards } from '../../services/rewardService.js'

// INST-81: rewards management on the admin Loyalty page.
vi.mock('../../services/rewardService.js', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getRewards: vi.fn(actual.getRewards) }
})

const activeTable = () => screen.getByRole('table', { name: 'Active rewards' })
const deactivatedTable = () => screen.getByRole('table', { name: 'Deactivated rewards' })
const rowNames = (table) =>
  within(table).queryAllByRole('row').slice(1).map((row) => within(row).queryAllByRole('cell')[0]?.textContent)

async function renderLoaded() {
  render(<AdminLoyalty />)
  await screen.findByText('Plant Milk Upgrade')
}

describe('AdminLoyalty', () => {
  it('lists active rewards, lowest leaves first, with leaves and value', async () => {
    await renderLoaded()
    expect(rowNames(activeTable())).toEqual([
      'Plant Milk Upgrade',
      'Hojicha Butter Madeleine',
      'Any Handcrafted Drink',
      'Reserve Tasting Flight',
      'Ceremonial Kyusu Teapot',
    ])
    const teapotRow = within(activeTable()).getByText('Ceremonial Kyusu Teapot').closest('tr')
    expect(within(teapotRow).getByText('2,000')).toBeInTheDocument()
    expect(within(teapotRow).getByText('$48.00')).toBeInTheDocument()
  })

  it('lists deactivated rewards separately', async () => {
    await renderLoaded()
    expect(rowNames(deactivatedTable())).toEqual(['Summer Fruit Tea Upgrade'])
  })

  it('shows reward details', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'View Hojicha Butter Madeleine details' }))
    const details = screen.getByRole('region', { name: 'Hojicha Butter Madeleine' })
    expect(within(details).getByText('Baked fresh daily in our atelier kitchen.')).toBeInTheDocument()
    expect(within(details).getByText('300 leaves')).toBeInTheDocument()
    expect(within(details).getByText('$4.25')).toBeInTheDocument()
    expect(within(details).getByText('Active')).toBeInTheDocument()
  })

  it('creates a reward with a leaves requirement and value', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Add reward' }))
    fireEvent.change(screen.getByLabelText(/Reward name/), { target: { value: 'Matcha Cookie' } })
    fireEvent.change(screen.getByLabelText(/Leaves required/), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText(/Value \(USD\)/), { target: { value: '3.5' } })
    fireEvent.click(within(screen.getByRole('region', { name: 'New reward' })).getByRole('button', { name: 'Add reward' }))

    expect(screen.getByRole('status')).toHaveTextContent('Matcha Cookie added in this preview.')
    expect(rowNames(activeTable())[1]).toBe('Matcha Cookie')
    const row = within(activeTable()).getByText('Matcha Cookie').closest('tr')
    expect(within(row).getByText('$3.50')).toBeInTheDocument()
  })

  it('validates the reward form', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Add reward' }))
    fireEvent.change(screen.getByLabelText(/Leaves required/), { target: { value: '2.5' } })
    fireEvent.click(within(screen.getByRole('region', { name: 'New reward' })).getByRole('button', { name: 'Add reward' }))

    expect(screen.getByText('Enter a reward name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a whole number of leaves, 1 or more.')).toBeInTheDocument()
    expect(screen.getByText('Enter a non-negative dollar value with up to two decimal places.')).toBeInTheDocument()
  })

  it('edits a reward', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Any Handcrafted Drink' }))
    const leaves = screen.getByLabelText(/Leaves required/)
    expect(leaves).toHaveValue(600)
    fireEvent.change(leaves, { target: { value: '650' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    const row = within(activeTable()).getByText('Any Handcrafted Drink').closest('tr')
    expect(within(row).getByText('650')).toBeInTheDocument()
  })

  it('deactivates a reward after confirming', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Plant Milk Upgrade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deactivation' }))

    expect(rowNames(activeTable())).not.toContain('Plant Milk Upgrade')
    expect(rowNames(deactivatedTable())).toContain('Plant Milk Upgrade')
  })

  it('keeps the reward if deactivation is cancelled', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Plant Milk Upgrade' }))
    fireEvent.click(screen.getByRole('button', { name: 'Keep reward' }))
    expect(rowNames(activeTable())).toContain('Plant Milk Upgrade')
  })

  it('reactivates a deactivated reward', async () => {
    await renderLoaded()
    fireEvent.click(screen.getByRole('button', { name: 'Reactivate Summer Fruit Tea Upgrade' }))
    expect(rowNames(activeTable())).toContain('Summer Fruit Tea Upgrade')
  })

  it('shows an empty state when there are no rewards', async () => {
    getRewards.mockResolvedValueOnce([])
    render(<AdminLoyalty />)
    expect(await screen.findByRole('heading', { name: 'No rewards yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create your first reward' })).toBeInTheDocument()
  })
})
