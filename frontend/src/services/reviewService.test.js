import { communityReviews } from '../data/communityReviews.js'
import { customers } from '../data/customers.js'
import { products } from '../data/products.js'
import { reviewSubmissions } from '../data/reviewSubmissions.js'
import { REVIEW_MODERATION_STORAGE_KEY, REVIEW_STATUSES, getReviewSubmissions, setReviewStatus } from './reviewService.js'

// The mock client is replaced so the tests do not wait for the simulated network delay
// and can switch the service to its non-mock branch.
const client = vi.hoisted(() => ({ useMock: true, apiGet: vi.fn() }))
vi.mock('./apiClient.js', () => ({
  get USE_MOCK() { return client.useMock },
  mockResponse: (data) => Promise.resolve(structuredClone(data)),
  apiGet: (...args) => client.apiGet(...args),
}))

function byId(reviews, id) {
  return reviews.find((review) => review.id === id)
}

beforeEach(() => {
  localStorage.clear()
  client.useMock = true
  client.apiGet.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('review list', () => {
  it('returns the published reviews and the submissions as one list with a consistent shape', async () => {
    const reviews = await getReviewSubmissions()
    expect(reviews).toHaveLength(communityReviews.length + reviewSubmissions.length)
    for (const review of reviews) {
      expect(review).toEqual({
        id: expect.any(String),
        authorId: expect.toSatisfy((value) => value === null || typeof value === 'string'),
        name: expect.any(String),
        product: expect.any(String),
        rating: expect.toSatisfy((value) => Number.isInteger(value) && value >= 1 && value <= 5),
        comment: expect.any(String),
        date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        status: expect.toSatisfy((value) => REVIEW_STATUSES.includes(value)),
        flagged: expect.any(Boolean),
        flagReason: expect.any(String),
        history: expect.any(Array),
      })
    }
  })

  it('gives every review a unique id, so submissions never collide with published reviews', async () => {
    const ids = (await getReviewSubmissions()).map((review) => review.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const published of communityReviews) {
      expect(reviewSubmissions.map((review) => String(review.id))).not.toContain(String(published.id))
    }
  })

  it('includes published, pending, flagged, rejected, member, and guest reviews', async () => {
    const reviews = await getReviewSubmissions()
    expect(reviews.filter((review) => review.status === 'published')).toHaveLength(communityReviews.length)
    expect(reviews.filter((review) => review.status === 'pending').length).toBeGreaterThanOrEqual(3)
    expect(reviews.filter((review) => review.status === 'rejected')).toHaveLength(1)
    const flagged = reviews.filter((review) => review.flagged)
    expect(flagged.length).toBeGreaterThanOrEqual(1)
    for (const review of flagged) expect(review.flagReason).not.toBe('')
    const submissions = reviews.filter((review) => reviewSubmissions.some((item) => item.id === review.id))
    expect(submissions.some((review) => review.authorId === null)).toBe(true)
    expect(submissions.some((review) => review.authorId !== null)).toBe(true)
  })

  it('uses products and customers that exist in the other mock data', () => {
    const productNames = products.map((product) => product.name)
    const customerIds = customers.map((customer) => customer.id)
    for (const submission of reviewSubmissions) {
      expect(productNames).toContain(submission.product)
      if (submission.authorId) expect(customerIds).toContain(submission.authorId)
    }
  })

  it('returns copies, so callers cannot change the mock data', async () => {
    const first = await getReviewSubmissions()
    first[0].status = 'rejected'
    first[0].history.push({ status: 'rejected', at: '2026-11-14T10:00:00.000Z', by: 'Someone' })
    const second = await getReviewSubmissions()
    expect(second[0].status).not.toBe('rejected')
    expect(second[0].history).toEqual(communityReviews[0].history ?? [])
  })
})

describe('changing a review status', () => {
  it('returns the updated review, records who and when, and persists the change', async () => {
    const updated = await setReviewStatus('sub-1001', 'published')
    expect(updated).toMatchObject({ id: 'sub-1001', status: 'published' })
    expect(updated.history).toEqual([{ status: 'published', by: 'Staff Member', at: expect.any(String) }])
    expect(Number.isNaN(Date.parse(updated.history[0].at))).toBe(false)

    const stored = JSON.parse(localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY))
    expect(stored.version).toBe(1)
    expect(stored.reviews['sub-1001'].status).toBe('published')

    // A later read, such as after a page reload, sees the saved status.
    expect(byId(await getReviewSubmissions(), 'sub-1001')).toMatchObject({ status: 'published', history: updated.history })
  })

  it('keeps a history of every change, oldest first, after any seeded history', async () => {
    await setReviewStatus('sub-1001', 'published')
    await setReviewStatus('sub-1001', 'pending')
    await setReviewStatus('sub-1001', 'rejected')
    expect(byId(await getReviewSubmissions(), 'sub-1001').history.map((entry) => entry.status)).toEqual(['published', 'pending', 'rejected'])

    await setReviewStatus('sub-1006', 'pending')
    expect(byId(await getReviewSubmissions(), 'sub-1006').history.map((entry) => entry.status)).toEqual(['rejected', 'pending'])
  })

  it('can change reviews that were already published, and accepts a numeric id', async () => {
    const updated = await setReviewStatus(communityReviews[0].id, 'rejected')
    expect(updated).toMatchObject({ id: String(communityReviews[0].id), status: 'rejected' })
    expect(byId(await getReviewSubmissions(), String(communityReviews[0].id)).status).toBe('rejected')
  })

  it('does nothing when the review already has the requested status', async () => {
    const unchanged = await setReviewStatus('sub-1001', 'pending')
    expect(unchanged).toMatchObject({ id: 'sub-1001', status: 'pending', history: [] })
    expect(localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY)).toBeNull()
  })

  it('rejects an unknown status or review without saving anything', async () => {
    await expect(setReviewStatus('sub-1001', 'archived')).rejects.toThrow('Invalid review status')
    await expect(setReviewStatus('sub-1001', undefined)).rejects.toThrow('Invalid review status')
    await expect(setReviewStatus('no-such-review', 'published')).rejects.toThrow('Review not found')
    expect(localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY)).toBeNull()
  })

  it('reports a storage failure instead of pretending the change was saved', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    await expect(setReviewStatus('sub-1001', 'published')).rejects.toThrow('could not be saved')
    vi.restoreAllMocks()
    expect(byId(await getReviewSubmissions(), 'sub-1001').status).toBe('pending')
  })
})

describe('saved moderation data', () => {
  it.each([
    ['invalid JSON', '{bad json'],
    ['null', 'null'],
    ['an array', '[]'],
    ['another version', JSON.stringify({ version: 2, reviews: { 'sub-1001': { status: 'published' } } })],
    ['a missing version', JSON.stringify({ reviews: { 'sub-1001': { status: 'published' } } })],
    ['reviews that are not an object', JSON.stringify({ version: 1, reviews: ['sub-1001'] })],
    ['an entry that is not an object', JSON.stringify({ version: 1, reviews: { 'sub-1001': 'published' } })],
  ])('ignores %s and uses the mock data', async (_description, stored) => {
    const baseline = await getReviewSubmissions()
    localStorage.setItem(REVIEW_MODERATION_STORAGE_KEY, stored)
    expect(await getReviewSubmissions()).toEqual(baseline)
  })

  it('ignores unknown statuses, unknown review ids, and malformed history entries', async () => {
    localStorage.setItem(REVIEW_MODERATION_STORAGE_KEY, JSON.stringify({
      version: 1,
      reviews: {
        'sub-1001': { status: 'archived' },
        'sub-1002': {
          status: 'rejected',
          history: [
            { status: 'rejected', at: 'not a date', by: 'Staff Member' },
            { status: 'archived', at: '2026-11-14T10:00:00.000Z', by: 'Staff Member' },
            'rejected',
            { status: 'rejected', at: '2026-11-14T10:00:00.000Z' },
          ],
        },
        'no-such-review': { status: 'published' },
      },
    }))
    const reviews = await getReviewSubmissions()
    expect(byId(reviews, 'sub-1001').status).toBe('pending')
    expect(byId(reviews, 'sub-1002')).toMatchObject({
      status: 'rejected',
      history: [{ status: 'rejected', at: '2026-11-14T10:00:00.000Z', by: 'Staff Member' }],
    })
    expect(reviews).toHaveLength(communityReviews.length + reviewSubmissions.length)
  })

  it('uses the mock data when browser storage cannot be read', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    const reviews = await getReviewSubmissions()
    expect(byId(reviews, 'sub-1001').status).toBe('pending')
  })

  it('replaces corrupt saved data with valid data the next time a status is saved', async () => {
    localStorage.setItem(REVIEW_MODERATION_STORAGE_KEY, '{bad json')
    await setReviewStatus('sub-1001', 'rejected')
    expect(JSON.parse(localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY)).version).toBe(1)
    expect(byId(await getReviewSubmissions(), 'sub-1001').status).toBe('rejected')
  })
})

describe('when the mock is turned off', () => {
  beforeEach(() => { client.useMock = false })

  it('loads reviews from the API and normalizes them', async () => {
    client.apiGet.mockResolvedValue([{ id: 7, authorId: null, name: 'Pat', product: 'Vanilla Latte', rating: 4, comment: 'Nice.', date: '2026-11-01', status: 'unknown' }])
    expect(await getReviewSubmissions()).toEqual([{
      id: '7', authorId: null, name: 'Pat', product: 'Vanilla Latte', rating: 4, comment: 'Nice.', date: '2026-11-01',
      status: 'pending', flagged: false, flagReason: '', history: [],
    }])
    expect(client.apiGet).toHaveBeenCalledWith('/reviews')
  })

  it.each([null, { reviews: [] }])('rejects a response that is not a list (%j)', async (response) => {
    client.apiGet.mockResolvedValue(response)
    await expect(getReviewSubmissions()).rejects.toThrow('Invalid reviews response')
  })

  it('sends the new status to the API and returns the updated review', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'a/b', name: 'Pat', status: 'published' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const updated = await setReviewStatus('a/b', 'published')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/reviews\/a%2Fb\/status$/),
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) },
    )
    expect(updated).toMatchObject({ id: 'a/b', status: 'published' })
    expect(localStorage.getItem(REVIEW_MODERATION_STORAGE_KEY)).toBeNull()
  })

  it('rejects when the API refuses the change, and does not call it for an invalid status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)
    await expect(setReviewStatus('sub-1001', 'published')).rejects.toThrow('failed with status 500')
    await expect(setReviewStatus('sub-1001', 'archived')).rejects.toThrow('Invalid review status')
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
