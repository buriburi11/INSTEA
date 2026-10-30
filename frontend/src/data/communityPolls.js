/*mock data for poll within the community page*/

export const mockPolls = [
    {
        id: 1,
        label: "Winter seasonal vote",
        title: "Which blend should join the winter menu?",
        description: "Vote on our tea masters’ next single-batch creation. The winning blend launches at every counter on Dec 15.",
        status: "active",
        endsAt: "2026-12-10T23:59:59",
        options: [
            {
                id: 1,
                name: "Spiced Vanilla Cardamom",
                description: "Ceylon base with Madagascar vanilla bean",
                image: "/images/products/placeholder.svg"
            },
            {
                id: 2,
                name: "Yuzu Blossom White Tea",
                description: "Silver Needle with sun-ripened Kochi yuzu",
                image: "/images/products/placeholder.svg"
            },
            {
                id: 3,
                name: "Roasted Chestnut Hojicha",
                description: "Kyoto bancha with candied chestnuts",
                image: "/images/products/placeholder.svg"
            }
        ]
    },
    {
        id: 2,
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