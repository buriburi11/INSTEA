/**
 * Mock customer review submissions for the admin Review moderation section.
 *
 * Reviews that were already approved live in ./communityReviews.js (the public
 * Community page reads those). This file adds the submissions that are still
 * awaiting moderation, plus one rejected review. reviewService.js merges both
 * lists into a single list.
 *
 * Ids start with "sub-" so they cannot collide with the published reviews.
 * Products come from ./products.js and members from ./customers.js; `authorId`
 * is null for guests. `history` holds moderation actions taken before the
 * mock was loaded (timestamps are fixed fixture values).
 *
 * All text is fictional. Treat comments as untrusted user content when
 * displaying them: render them as plain text only.
 */

export const reviewSubmissions = [
  {
    id: 'sub-1001',
    authorId: 'cust-alex-rivera',
    name: 'Alex R.',
    product: 'Brown Sugar Milk Tea',
    rating: 3,
    comment: 'The brown sugar flavor was perfect but the wait was 25 minutes.',
    date: '2026-11-13',
    status: 'pending',
  },
  {
    id: 'sub-1002',
    authorId: null,
    name: 'Guest',
    product: 'Taro Milk Tea',
    rating: 5,
    comment: 'Check out my page for free stuff!!! Visit free-boba-giveaway.example and claim a drink today.',
    date: '2026-11-13',
    status: 'pending',
    flagged: true,
    flagReason: 'Contains a promotional link and repeated punctuation.',
  },
  {
    id: 'sub-1003',
    authorId: 'cust-jordan-kim',
    name: 'Jordan K.',
    product: 'Earl Grey Espresso Latte',
    rating: 4,
    comment: 'I love the bergamot note and the espresso is smooth, but the drink was far too sweet at the default level and the oat milk swap took a long time. The staff were kind and the pickup shelf was well organized, so I would order again and just ask for less sugar next time.',
    date: '2026-11-12',
    status: 'pending',
  },
  {
    id: 'sub-1004',
    authorId: null,
    name: 'Guest',
    product: 'Hibiscus Rose Tisane',
    rating: 2,
    comment: 'Too sour for me, and it arrived lukewarm.',
    date: '2026-11-11',
    status: 'pending',
  },
  {
    id: 'sub-1005',
    authorId: 'cust-sam-patel',
    name: 'Sam W.',
    product: 'Jasmine Green Tea',
    rating: 5,
    comment: 'Light, floral, and exactly as fragrant as I remembered.',
    date: '2026-11-10',
    status: 'pending',
  },
  {
    id: 'sub-1006',
    authorId: 'cust-taylor-brooks',
    name: 'Taylor B.',
    product: 'Vanilla Latte',
    rating: 2,
    comment: 'The music was far too loud today and the line barely moved.',
    date: '2026-11-09',
    status: 'rejected',
    history: [{ status: 'rejected', at: '2026-11-10T16:20:00.000Z', by: 'Staff Member' }],
  },
]
