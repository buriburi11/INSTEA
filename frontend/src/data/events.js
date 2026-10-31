import eventImage from '../assets/INSTEA HOME PLACEHOLDER.jpg';

// =============
//  EVENT LIST
// =============

// ------- MOCK EVENT DATA -------
// Replace with real events when confirmed by the client.

export const events = [
    {
        id: 1,
        title: 'Tea Tasting — Example Event',
        category: 'Drink tasting',
        date: '2026-12-06',

        time: '6:30 PM – 8:00 PM',

        location: 'Location to be announced',
        description: 'Example tea tasting event. Details coming soon.',
        image: eventImage,


        capacity: 20,
        spotsRemaining: 4,
        priceLabel: 'Free for members',
    },
    {
        id: 2,
        title: 'Tea Book Club — Example Event',
        category: 'Book club',
        date: '2026-12-10',
        time: 'Time to be announced',
        location: 'Location to be announced',
        description: 'Example community book club. Details coming soon.',
        image: eventImage
    },
    {
        id: 3,
        title: 'Game Night — Example Event',
        category: 'Game night',
        date: '2026-12-12',
        time: 'Time to be announced',
        location: 'Location to be announced',
        description: 'Example community game night. Details coming soon.',
        image: eventImage
    },
    {
        id: 4,
        title: 'Seasonal Menu — Example Event',
        category: 'Seasonal event',
        date: '2026-12-15',
        time: 'Time to be announced',
        location: 'Location to be announced',
        description: 'Example seasonal offering announcement. Details coming soon.',
        image: eventImage
    }
];