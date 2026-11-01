export const mockTriviaQuestions = [
    {
        id: 1,
        question: "Which Japanese region produces ceremonial matcha traditionally shade-grown under straw mats?",
        options: [
            { id: "A", text: "Uji, Kyoto Prefecture" },
            { id: "B", text: "Shizuoka Basin" },
            { id: "C", text: "Kagoshima Highlands" }
        ],
        correctAnswer: "A"
    },
    {
        id: 2,
        question: "Which country is traditionally known as the birthplace of tea?",
        options: [
            { id: "A", text: "Japan" },
            { id: "B", text: "China" },
            { id: "C", text: "India" }
        ],
        correctAnswer: "B"
    },
    {
        id: 3,
        question: "Why is green tea usually brewed at a lower temperature than black tea?",
        options: [
            { id: "A", text: "To prevent bitterness and preserve delicate flavors" },
            { id: "B", text: "To increase the caffeine content" },
            { id: "C", text: "To make the tea darker" }
        ],
        correctAnswer: "A"
    }
];

export const TRIVIA_POINTS_PER_CORRECT_ANSWER = 2;

export const mockTriviaLeaderboard = [
    {
        id: 1,
        name: "Ava L.",
        points: 2840
    },
    {
        id: 2,
        name: "Marcus T.",
        points: 2615
    },
    {
        id: 3,
        name: "Alex R.",
        points: 2390,
        isCurrentUser: true
    },
    {
        id: 4,
        name: "Priya S.",
        points: 2210
    }
];