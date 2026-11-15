import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getReviewSubmissions, setReviewStatus } from '../../../services/reviewService.js'
import ReviewManagement from './ReviewManagement.jsx'

vi.mock('../../../services/reviewService.js', () => ({ getReviewSubmissions: vi.fn(), setReviewStatus: vi.fn() }))

const longComment = 'I love the bergamot note and the espresso is smooth, but the drink was far too sweet at the default level and the oat milk swap took a long time. The staff were kind, so I would order again.'

// Deliberately not in display order, to check that pending reviews are listed first.
const reviews = [
  { id: 'r-pub', authorId: 'cust-jordan-kim', name: 'Jordan K.', product: 'Ceremonial Cloud Matcha', rating: 5, comment: 'Smooth and balanced.', date: '2026-11-06', status: 'published', flagged: false, flagReason: '', history: [] },
  { id: 'r-rej', authorId: 'cust-taylor-brooks', name: 'Taylor B.', product: 'Vanilla Latte', rating: 2, comment: 'The music was far too loud.', date: '2026-11-09', status: 'rejected', flagged: false, flagReason: '', history: [{ status: 'rejected', at: '2026-11-10T16:20:00.000Z', by: 'Staff Member' }] },
  { id: 'r-new', authorId: 'cust-alex-rivera', name: 'Alex R.', product: 'Brown Sugar Milk Tea', rating: 3, comment: 'Perfect brown sugar flavor but the wait was 25 minutes.', date: '2026-11-12', status: 'pending', flagged: false, flagReason: '', history: [] },
  { id: 'r-ghost', authorId: 'cust-missing', name: 'Casey L.', product: 'Jasmine Green Tea', rating: 4, comment: 'Fragrant and light.', date: '2026-11-02', status: 'published', flagged: false, flagReason: '', history: [] },
  { id: 'r-long', authorId: 'cust-sam-patel', name: 'Sam W.', product: 'Earl Grey Espresso Latte', rating: 4, comment: longComment, date: '2026-11-11', status: 'pending', flagged: false, flagReason: '', history: [] },
  { id: 'r-spam', authorId: null, name: 'Guest', product: 'Taro Milk Tea', rating: 5, comment: 'Check out my page for free stuff!!!', date: '2026-11-13', status: 'pending', flagged: true, flagReason: 'Contains a promotional link.', history: [] },
]

const cardNames = {
  spam: 'Review by Guest of Taro Milk Tea',
  alex: 'Review by Alex R. of Brown Sugar Milk Tea',
  sam: 'Review by Sam W. of Earl Grey Espresso Latte',
  jordan: 'Review by Jordan K. of Ceremonial Cloud Matcha',
  casey: 'Review by Casey L. of Jasmine Green Tea',
  taylor: 'Review by Taylor B. of Vanilla Latte',
}

async function renderLoaded() {
  const user = userEvent.setup()
  render(<ReviewManagement />)
  await screen.findByRole('list', { name: 'All reviews' })
  return user
}

function card(name) {
  return screen.getByRole('article', { name })
}

function listedNames() {
  return within(screen.getByRole('list')).getAllByRole('article').map((article) => article.getAttribute('aria-label'))
}

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  // Behaves like the real service: the saved status and history are returned on later changes too.
  const saved = new Map(reviews.map((review) => [review.id, structuredClone(review)]))
  getReviewSubmissions.mockResolvedValue(structuredClone(reviews))
  setReviewStatus.mockImplementation(async (id, status) => {
    const review = saved.get(id)
    const updated = { ...review, status, history: [...review.history, { status, at: '2026-11-14T12:00:00.000Z', by: 'Staff Member' }] }
    saved.set(id, updated)
    return structuredClone(updated)
  })
})

describe('review list', () => {
  it('has a section heading and explains that moderation is a prototype', async () => {
    await renderLoaded()
    expect(screen.getByRole('heading', { level: 2, name: 'Review moderation' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Review moderation' })).toBeInTheDocument()
    expect(screen.getByText(/Moderation is a prototype: changes are saved in this browser only and are not yet connected to the backend\./)).toBeInTheDocument()
    expect(getReviewSubmissions).toHaveBeenCalledOnce()
  })

  it('lists pending reviews first, newest first, then published and rejected reviews', async () => {
    await renderLoaded()
    expect(listedNames()).toEqual([
      cardNames.spam, cardNames.alex, cardNames.sam, cardNames.jordan, cardNames.casey, cardNames.taylor,
    ])
  })

  it('shows the customer, product, rating, date, comment, and status of each review', async () => {
    await renderLoaded()
    const alex = within(card(cardNames.alex))
    expect(alex.getByRole('heading', { level: 3, name: 'Alex R. · Brown Sugar Milk Tea · 3/5 stars' })).toBeInTheDocument()
    expect(alex.getByText('Nov 12, 2026')).toHaveAttribute('datetime', '2026-11-12')
    expect(alex.getByText('Perfect brown sugar flavor but the wait was 25 minutes.')).toBeInTheDocument()
    expect(alex.getByText('Pending')).toBeInTheDocument()

    expect(within(card(cardNames.spam)).getByRole('heading', { level: 3 })).toHaveTextContent('Guest · Taro Milk Tea · 5/5 stars')
    expect(within(card(cardNames.jordan)).getByText('Published')).toBeInTheDocument()
    expect(within(card(cardNames.taylor)).getByText('Rejected')).toBeInTheDocument()
    expect(within(card(cardNames.taylor)).getByText('Nov 9, 2026')).toBeInTheDocument()
  })

  it('marks flagged reviews with a note and a flagged card style', async () => {
    await renderLoaded()
    const spam = card(cardNames.spam)
    expect(within(spam).getByText('Flagged as possible spam')).toBeInTheDocument()
    expect(spam).toHaveClass('review-management-card--flagged')
    expect(getComputedStyle(spam).backgroundColor).not.toBe(getComputedStyle(card(cardNames.alex)).backgroundColor)

    expect(within(card(cardNames.alex)).queryByText('Flagged as possible spam')).not.toBeInTheDocument()
    expect(card(cardNames.alex)).not.toHaveClass('review-management-card--flagged')
    expect(screen.getAllByText('Flagged as possible spam')).toHaveLength(1)
  })

  it('shortens long comments in the list and shows them in full in the details', async () => {
    const user = await renderLoaded()
    const preview = within(card(cardNames.sam)).getByText(/^I love the bergamot note/)
    expect(preview.textContent.endsWith('…')).toBe(true)
    expect(preview.textContent.length).toBeLessThan(longComment.length)
    expect(screen.queryByText(longComment)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View review by Sam W. of Earl Grey Espresso Latte' }))
    expect(within(screen.getByRole('region', { name: 'Review by Sam W.' })).getByText(longComment)).toBeInTheDocument()
  })

  it('shows comments as plain text', async () => {
    const hostile = '<img src="x" onerror="alert(1)"> <b>bold</b>'
    getReviewSubmissions.mockResolvedValue([{ ...reviews[2], comment: hostile }])
    const user = userEvent.setup()
    const { container } = render(<ReviewManagement />)
    expect(await screen.findByText(hostile)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^View review/ }))
    expect(within(screen.getByRole('region', { name: /^Review by/ })).getByText(hostile)).toBeInTheDocument()
    expect(container.querySelector('img, b')).toBeNull()
  })

  it('shows missing or invalid data safely', async () => {
    getReviewSubmissions.mockResolvedValue([{ id: 'odd', authorId: null, status: 'odd', rating: 9, date: '2026-02-31', comment: '' }])
    const user = userEvent.setup()
    render(<ReviewManagement />)
    const odd = await screen.findByRole('article', { name: 'Review by Guest of Unknown product' })
    expect(within(odd).getByRole('heading', { level: 3 })).toHaveTextContent('Guest · Unknown product · Rating unavailable')
    expect(within(odd).getByText('Date unavailable')).toBeInTheDocument()
    expect(within(odd).getByText('No comment provided.')).toBeInTheDocument()
    expect(within(odd).getByText('Status unavailable')).toBeInTheDocument()
    await user.click(within(odd).getByRole('button', { name: /^View review/ }))
    expect(within(screen.getByRole('region', { name: /^Review by/ })).getByText('No comment provided.')).toBeInTheDocument()
  })
})

describe('status filter', () => {
  it('shows a count for each status', async () => {
    await renderLoaded()
    const group = screen.getByRole('group', { name: 'Filter reviews by status' })
    for (const name of ['All 6', 'Pending 3', 'Published 2', 'Rejected 1']) {
      expect(within(group).getByRole('radio', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('radio', { name: 'All 6' })).toBeChecked()
  })

  it('filters the list by status and can show everything again', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Pending 3' }))
    expect(screen.getByRole('radio', { name: 'Pending 3' })).toBeChecked()
    expect(screen.getByRole('list', { name: 'Pending reviews' })).toBeInTheDocument()
    expect(listedNames()).toEqual([cardNames.spam, cardNames.alex, cardNames.sam])

    await user.click(screen.getByRole('radio', { name: 'Published 2' }))
    expect(listedNames()).toEqual([cardNames.jordan, cardNames.casey])

    await user.click(screen.getByRole('radio', { name: 'Rejected 1' }))
    expect(listedNames()).toEqual([cardNames.taylor])

    await user.click(screen.getByRole('radio', { name: 'All 6' }))
    expect(listedNames()).toHaveLength(6)
  })

  it('can be changed with the keyboard', async () => {
    const user = await renderLoaded()
    screen.getByRole('radio', { name: 'All 6' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Pending 3' })).toBeChecked()
    expect(listedNames()).toHaveLength(3)
  })

  it('says so when no review has the chosen status', async () => {
    getReviewSubmissions.mockResolvedValue(reviews.filter((review) => review.status !== 'rejected'))
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Rejected 0' }))
    expect(screen.getByText('No rejected reviews.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('updates the counts and the filtered list when a review changes status', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Pending 3' }))
    await user.click(screen.getByRole('button', { name: `Approve review by Alex R. of Brown Sugar Milk Tea` }))
    expect(await screen.findByRole('radio', { name: 'Pending 2' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Published 3' })).toBeInTheDocument()
    expect(listedNames()).toEqual([cardNames.spam, cardNames.sam])
  })
})

describe('opening a review', () => {
  it('shows the full details of a member review, with the account name and email', async () => {
    const user = await renderLoaded()
    const opener = screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' })
    expect(opener).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region', { name: 'Review by Alex R.' })).not.toBeInTheDocument()

    await user.click(opener)
    const region = screen.getByRole('region', { name: 'Review by Alex R.' })
    expect(region).toHaveFocus()
    expect(opener).toHaveAttribute('aria-expanded', 'true')
    expect(opener).toHaveAttribute('aria-controls', region.id)
    expect(within(card(cardNames.alex)).getByRole('heading', { level: 3 })).toBeInTheDocument()

    const detail = within(region)
    const field = (term) => detail.getByText(term, { selector: 'dt' }).nextElementSibling
    expect(field('Customer')).toHaveTextContent('Alex R.')
    expect(field('Account type')).toHaveTextContent('Member')
    expect(field('Member name')).toHaveTextContent('Alex Rivera')
    expect(field('Member email')).toHaveTextContent('alex.rivera@example.com')
    expect(field('Product')).toHaveTextContent('Brown Sugar Milk Tea')
    expect(field('Rating')).toHaveTextContent('3/5 stars')
    expect(field('Submitted')).toHaveTextContent('Nov 12, 2026')
    expect(field('Status')).toHaveTextContent('Pending')
    expect(detail.getByText('Perfect brown sugar flavor but the wait was 25 minutes.')).toBeInTheDocument()
    expect(detail.getByRole('heading', { level: 4, name: 'Moderation history' })).toBeInTheDocument()
    expect(detail.getByText('No moderation actions yet.')).toBeInTheDocument()
    expect(detail.queryByText('Flag reason', { selector: 'dt' })).not.toBeInTheDocument()
  })

  it('shows a guest review without any account details and explains why it was flagged', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Guest of Taro Milk Tea' }))
    const detail = within(screen.getByRole('region', { name: 'Review by Guest' }))
    expect(detail.getByText('Account type', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Guest (no account)')
    expect(detail.queryByText('Member name')).not.toBeInTheDocument()
    expect(detail.queryByText('Member email')).not.toBeInTheDocument()
    expect(detail.getByText('Flagged as possible spam')).toBeInTheDocument()
    expect(detail.getByText('Flag reason', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Contains a promotional link.')
  })

  it('says when a member account cannot be found', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Casey L. of Jasmine Green Tea' }))
    const detail = within(screen.getByRole('region', { name: 'Review by Casey L.' }))
    expect(detail.getByText('Account type', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Member')
    expect(detail.getByText('Account details unavailable')).toBeInTheDocument()
  })

  it('shows the moderation history, latest first', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Taylor B. of Vanilla Latte' }))
    const detail = within(screen.getByRole('region', { name: 'Review by Taylor B.' }))
    const entries = detail.getAllByRole('listitem')
    expect(entries).toHaveLength(1)
    expect(entries[0]).toHaveTextContent(/^Rejected by Staff Member · \w{3} \d{1,2}, 2026/)
    expect(entries[0].querySelector('time')).toHaveAttribute('datetime', '2026-11-10T16:20:00.000Z')
    expect(detail.queryByText('No moderation actions yet.')).not.toBeInTheDocument()
  })

  it('moves focus to the details and back to the button that opened them', async () => {
    const user = await renderLoaded()
    const opener = screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' })
    await user.click(opener)
    const region = screen.getByRole('region', { name: 'Review by Alex R.' })
    expect(region).toHaveFocus()

    await user.click(within(region).getByRole('button', { name: 'Close review details' }))
    expect(screen.queryByRole('region', { name: 'Review by Alex R.' })).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(opener).toHaveAttribute('aria-expanded', 'false')
  })

  it('can be opened and closed with the keyboard', async () => {
    const user = await renderLoaded()
    const opener = screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' })
    opener.focus()
    await user.keyboard('{Enter}')
    const region = screen.getByRole('region', { name: 'Review by Alex R.' })
    expect(region).toHaveFocus()
    await user.tab()
    expect(within(region).getByRole('button', { name: 'Close review details' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(opener).toHaveFocus()
  })

  it('shows one review at a time and closes it when its button is used again', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' }))
    await user.click(screen.getByRole('button', { name: 'View review by Sam W. of Earl Grey Espresso Latte' }))
    expect(screen.getAllByRole('region', { name: /^Review by/ })).toHaveLength(1)
    expect(screen.getByRole('region', { name: 'Review by Sam W.' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' })).toHaveAttribute('aria-expanded', 'false')

    await user.click(screen.getByRole('button', { name: 'View review by Sam W. of Earl Grey Espresso Latte' }))
    expect(screen.queryByRole('region', { name: /^Review by/ })).not.toBeInTheDocument()
  })

  it('returns focus to the selected filter when the opening button is no longer listed', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' }))
    await user.click(screen.getByRole('radio', { name: 'Published 2' }))
    await user.click(within(screen.getByRole('region', { name: 'Review by Alex R.' })).getByRole('button', { name: 'Close review details' }))
    expect(screen.getByRole('radio', { name: 'Published 2' })).toHaveFocus()
  })
})

describe('moderating from the list', () => {
  it('approves a review, updates the list, announces it, and saves it through the service', async () => {
    const user = await renderLoaded()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()

    await user.click(screen.getByRole('button', { name: 'Approve review by Alex R. of Brown Sugar Milk Tea' }))
    expect(setReviewStatus).toHaveBeenCalledExactlyOnceWith('r-new', 'published')
    expect(await screen.findByRole('status')).toHaveTextContent('Approved the review by Alex R. of Brown Sugar Milk Tea. It is now published.')

    expect(within(card(cardNames.alex)).getByText('Published')).toBeInTheDocument()
    // Approving leaves Reject, and the card moves below the reviews still waiting.
    expect(within(card(cardNames.alex)).queryByRole('button', { name: /^Approve/ })).not.toBeInTheDocument()
    expect(within(card(cardNames.alex)).getByRole('button', { name: /^Reject/ })).toBeInTheDocument()
    expect(listedNames().slice(0, 2)).toEqual([cardNames.spam, cardNames.sam])
    expect(screen.getByRole('radio', { name: 'Pending 2' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Published 3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' })).toHaveFocus()
  })

  it('rejects a review, updates the list, announces it, and saves it through the service', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'Reject review by Guest of Taro Milk Tea' }))
    expect(setReviewStatus).toHaveBeenCalledExactlyOnceWith('r-spam', 'rejected')
    expect(await screen.findByRole('status')).toHaveTextContent('Rejected the review by Guest of Taro Milk Tea.')
    expect(within(card(cardNames.spam)).getByText('Rejected')).toBeInTheDocument()
    expect(within(card(cardNames.spam)).getByRole('button', { name: /^Approve/ })).toBeInTheDocument()
    expect(within(card(cardNames.spam)).queryByRole('button', { name: /^Reject/ })).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Rejected 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View review by Guest of Taro Milk Tea' })).toHaveFocus()
  })

  it('only offers the actions that would change something', async () => {
    await renderLoaded()
    const buttons = (name) => within(card(name)).getAllByRole('button').map((button) => button.textContent.trim())
    expect(buttons(cardNames.alex)).toEqual(['Approve', 'Reject', 'View'])
    expect(buttons(cardNames.jordan)).toEqual(['Reject', 'View'])
    expect(buttons(cardNames.taylor)).toEqual(['Approve', 'View'])
    expect(screen.queryByRole('button', { name: /Move back to pending/ })).not.toBeInTheDocument()
  })

  it('keeps focus on a filter option when the moderated review leaves the filtered list', async () => {
    const user = await renderLoaded()
    await user.click(screen.getByRole('radio', { name: 'Pending 3' }))
    await user.click(screen.getByRole('button', { name: 'Reject review by Alex R. of Brown Sugar Milk Tea' }))
    await screen.findByRole('radio', { name: 'Pending 2' })
    expect(screen.getByRole('radio', { name: 'Pending 2' })).toHaveFocus()
  })

  it('keeps the review as it was and says so when saving fails', async () => {
    setReviewStatus.mockRejectedValueOnce(new Error('Storage full'))
    const user = await renderLoaded()
    const approve = screen.getByRole('button', { name: 'Approve review by Alex R. of Brown Sugar Milk Tea' })
    await user.click(approve)

    const message = await screen.findByText('We couldn’t update the review by Alex R. of Brown Sugar Milk Tea. Please try again.')
    expect(message).toHaveAttribute('role', 'status')
    expect(message).toHaveClass('review-management-live--error')
    expect(within(card(cardNames.alex)).getByText('Pending')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Pending 3' })).toBeInTheDocument()
    expect(approve).toHaveFocus()
    expect(approve).not.toHaveAttribute('aria-disabled')

    // The administrator can try again.
    await user.click(approve)
    expect(await screen.findByText(/^Approved the review by Alex R./)).toBeInTheDocument()
    expect(setReviewStatus).toHaveBeenCalledTimes(2)
  })

  it('ignores repeated clicks while a review is being saved', async () => {
    let finish
    setReviewStatus.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    const user = await renderLoaded()
    const approve = screen.getByRole('button', { name: 'Approve review by Alex R. of Brown Sugar Milk Tea' })
    await user.click(approve)
    expect(approve).toHaveAttribute('aria-disabled', 'true')
    await user.click(approve)
    await user.click(screen.getByRole('button', { name: 'Reject review by Alex R. of Brown Sugar Milk Tea' }))
    expect(setReviewStatus).toHaveBeenCalledOnce()

    finish({ ...reviews[2], status: 'published' })
    expect(await screen.findByRole('radio', { name: 'Published 3' })).toBeInTheDocument()
  })
})

describe('moderating from the details', () => {
  async function openAlex() {
    const user = await renderLoaded()
    await user.click(screen.getByRole('button', { name: 'View review by Alex R. of Brown Sugar Milk Tea' }))
    return { user, region: screen.getByRole('region', { name: 'Review by Alex R.' }) }
  }

  it('approves, rejects, and moves a review back to pending, announcing each change', async () => {
    const { user, region } = await openAlex()
    const detail = within(region)
    expect(detail.queryByRole('button', { name: 'Move back to pending' })).not.toBeInTheDocument()

    await user.click(detail.getByRole('button', { name: 'Approve' }))
    expect(setReviewStatus).toHaveBeenLastCalledWith('r-new', 'published')
    expect(await screen.findByRole('status')).toHaveTextContent('Approved the review by Alex R. of Brown Sugar Milk Tea. It is now published.')
    expect(detail.getByText('Status', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Published')
    expect(detail.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    // The new action is listed in the history, and the open details keep focus.
    expect(detail.getAllByRole('listitem')[0]).toHaveTextContent(/^Published by Staff Member · /)
    expect(region).toHaveFocus()

    await user.click(detail.getByRole('button', { name: 'Reject' }))
    expect(setReviewStatus).toHaveBeenLastCalledWith('r-new', 'rejected')
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Rejected the review by Alex R. of Brown Sugar Milk Tea.'))
    expect(detail.getByText('Status', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Rejected')
    expect(detail.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    expect(detail.getAllByRole('listitem')).toHaveLength(2)

    await user.click(detail.getByRole('button', { name: 'Move back to pending' }))
    expect(setReviewStatus).toHaveBeenLastCalledWith('r-new', 'pending')
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Moved the review by Alex R. of Brown Sugar Milk Tea back to pending.'))
    expect(detail.getByText('Status', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Pending')
    expect(detail.queryByRole('button', { name: 'Move back to pending' })).not.toBeInTheDocument()
    expect(within(card(cardNames.alex)).getByText('Pending')).toBeInTheDocument()
    expect(setReviewStatus).toHaveBeenCalledTimes(3)
  })

  it('keeps the details open when the changed review no longer matches the filter', async () => {
    const { user } = await openAlex()
    await user.click(screen.getByRole('radio', { name: 'Pending 3' }))
    await user.click(within(screen.getByRole('region', { name: 'Review by Alex R.' })).getByRole('button', { name: 'Approve' }))
    await screen.findByRole('radio', { name: 'Pending 2' })
    const region = screen.getByRole('region', { name: 'Review by Alex R.' })
    expect(region).toHaveFocus()
    expect(screen.queryByRole('article', { name: cardNames.alex })).not.toBeInTheDocument()

    // The opening button is gone from the filtered list, so closing falls back to the filter.
    await user.click(within(region).getByRole('button', { name: 'Close review details' }))
    expect(screen.getByRole('radio', { name: 'Pending 2' })).toHaveFocus()
  })

  it('shows an error in the details when saving fails', async () => {
    setReviewStatus.mockRejectedValueOnce(new Error('Storage full'))
    const { user, region } = await openAlex()
    await user.click(within(region).getByRole('button', { name: 'Reject' }))
    expect(await screen.findByRole('status')).toHaveTextContent('We couldn’t update the review by Alex R. of Brown Sugar Milk Tea.')
    expect(within(region).getByText('Status', { selector: 'dt' }).nextElementSibling).toHaveTextContent('Pending')
  })
})

describe('request states', () => {
  it('shows a loading message while reviews are pending, without the list', () => {
    getReviewSubmissions.mockReturnValue(new Promise(() => {}))
    render(<ReviewManagement />)
    expect(screen.getAllByRole('status').some((element) => element.textContent === 'Loading reviews…')).toBe(true)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('recovers from a failed request with a retry', async () => {
    getReviewSubmissions.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    render(<ReviewManagement />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load reviews. Please try again.')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('list', { name: 'All reviews' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(getReviewSubmissions).toHaveBeenCalledTimes(2)
  })

  it('shows an error for a response that is not a list', async () => {
    getReviewSubmissions.mockResolvedValue({ unexpected: true })
    render(<ReviewManagement />)
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t load reviews.')
  })

  it.each([[[]], [null]])('shows an empty state when there are no reviews (%j)', async (data) => {
    getReviewSubmissions.mockResolvedValue(data)
    render(<ReviewManagement />)
    expect(await screen.findByText('No reviews have been submitted yet.')).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })
})
