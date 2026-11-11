/*mock data for poll within the community page*/

export const mockPolls = [
    {
        id: 1,
        type: "general",
        label: "Winter seasonal vote",
        title: "Which blend should join the winter menu?",
        description: "Vote on our tea masters’ next single-batch creation. The winning blend launches at every counter on Dec 15.",
        status: "active",
        endsAt: "2026-12-10T23:59:59",

        options: [
            {
                id: 1,
                productId: "prod-jasmine-green-tea"
            },
            {
                id: 2,
                productId: "prod-hibiscus-rose-tisane"
            },
            {
                id: 3,
                productId: "prod-brown-sugar-milk-tea"
            }
        ]
    },
    {
        id: 2,
        type: "keep-retire",
        label: "Keep or Retire?",
        title: "Golden Phoenix Oolong",
        description: "Our autumn specialty. Keep it on the menu year-round?",
        image: "/images/products/placeholder.svg",
        status: "active",
        endsAt: "2026-12-15T23:59:59",

        options: [
            {
                id: 1,
                name: "Keep it"
            },
            {
                id: 2,
                name: "Retire"
            }
        ]
    }
];


export const mockPollHistory = [
    {
        id: 1,
        label: "Autumn ratified blend",
        winner: "Spiced Honey Osmanthus Oolong",
        percentage: 54,
        totalVotes: 2104
    },
    {
        id: 2,
        label: "Summer fruit tea",
        winner: "White Peach Oolong",
        percentage: 61,
        totalVotes: 1876
    }
];