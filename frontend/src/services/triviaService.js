import { mockTriviaQuestions } from "../data/communityTrivia";
//======================//
// Daily Trivia Service //
//======================//

// Local storage keys
const TRIVIA_QUESTIONS_KEY = "instea-trivia-questions";
const TRIVIA_COUNT_KEY = "instea-trivia-question-count";
const DAILY_TRIVIA_KEY = "instea-daily-trivia";

//======================//
// Get Trivia Questions //
//======================//
export const getTriviaQuestions = () => {
    // Check if the admin has saved any questions
    const savedQuestions = localStorage.getItem(TRIVIA_QUESTIONS_KEY);

    // Use saved questions if available, otherwise use mock questions
    return savedQuestions
        ? JSON.parse(savedQuestions)
        : mockTriviaQuestions;
};

//=========================//
// Get Daily Question Count//
//=========================//
export const getDailyQuestionCount = () => {
    // Read the admin's saved setting
    const savedCount = localStorage.getItem(TRIVIA_COUNT_KEY);

    // Default to 3 questions if no setting exists
    if (savedCount === null) {
        return 3;
    }

    // Convert the saved value from a string to a number
    const count = Number(savedCount);

    // Make sure the count stays between 1 and 5
    if (!Number.isInteger(count)) {
        return 3;
    }
    // needs to be changed it client wants more questions
    return Math.min(5, Math.max(1, count));
};

//=========================//
// Select Random Questions //
//=========================//
export const selectRandomQuestions = (questions, count) => {
    // Make a copy so we don't change the original Question Bank
    const shuffledQuestions = [...questions];

    // Shuffle questions using the Fisher-Yates algorithm
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap the current question with a random question
        [shuffledQuestions[i], shuffledQuestions[randomIndex]] =
            [shuffledQuestions[randomIndex], shuffledQuestions[i]];
    }

    // Return only the number of questions requested
    return shuffledQuestions.slice(0, count);
};

//=================//
// Get Days Trivia //
//=================//
export const getDailyTrivia = () => {
    // Get today's date (local time)
    const today = new Date();
    const dateKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    // Check if daily trivia was already selected
    const savedTrivia = localStorage.getItem(DAILY_TRIVIA_KEY);

    if (savedTrivia) {
        const dailyTrivia = JSON.parse(savedTrivia);

        // If it's still the same day, reuse the saved questions
        if (dailyTrivia.date === dateKey) {
            return dailyTrivia.questions;
        }
    }

    // A new day: select questions from the Question Bank
    const questions = getTriviaQuestions();
    const count = getDailyQuestionCount();

    const selectedQuestions = selectRandomQuestions(questions, count);

    // Save today's selection so it won't change during the day
    const dailyTrivia = {
        date: dateKey,
        questions: selectedQuestions
    };

    localStorage.setItem(
        DAILY_TRIVIA_KEY,
        JSON.stringify(dailyTrivia)
    );

    return selectedQuestions;
};
