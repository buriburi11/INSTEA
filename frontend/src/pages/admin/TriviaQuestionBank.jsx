import './TriviaQuestionBank.css';
import { mockTriviaQuestions } from "../../data/communityTrivia";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export default function TriviaQuestionBank() {

    // Track which trivia question is expanded
    const [expandedQuestionId, setExpandedQuestionId] = useState(null);

    // Search questions
    const [searchQuery, setSearchQuery] = useState("");

    // Show or hide the Create Question form
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Correct answer for new trivia question
    const [correctAnswer, setCorrectAnswer] = useState("");

    //==================//
    //New Question Data //
    //==================//
    const [newQuestion, setNewQuestion] = useState("");
    const [answerA, setAnswerA] = useState("");
    const [answerB, setAnswerB] = useState("");
    const [answerC, setAnswerC] = useState("");

    //Question Bank Data //
    const [questions, setQuestions] = useState(() => {
        const savedQuestions = localStorage.getItem("instea-trivia-questions");

        return savedQuestions
            ? JSON.parse(savedQuestions)
            : mockTriviaQuestions;
    });

    //==================//
    // Search and Sort  //
    //==================//
    const sortedQuestions = [...questions]
        .filter((trivia) =>
            trivia.question
                .toLowerCase()
                .includes(searchQuery.trim().toLowerCase())
        )
        .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

    //Delete Question //
    const handleDeleteQuestion = (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this trivia question?"
        );

        if (!confirmed) return;

        const updatedQuestions = questions.filter(
            (question) => question.id !== id
        );

        setQuestions(updatedQuestions);

        localStorage.setItem(
            "instea-trivia-questions",
            JSON.stringify(updatedQuestions)
        );

        // Close the dropdown if this question was expanded
        if (expandedQuestionId === id) {
            setExpandedQuestionId(null);
        }
    };

    //===================//
    //Save New Question  //
    //===================//
    const handleSaveQuestion = () => {

        // Make sure every field is completed
        if (
            !newQuestion.trim() ||
            !answerA.trim() ||
            !answerB.trim() ||
            !answerC.trim() ||
            !correctAnswer
        ) {
            window.alert("Please complete all fields and select the correct answer.");
            return;
        }

        // Create the new question
        const createdQuestion = {
            id: crypto.randomUUID(),
            question: newQuestion.trim(),
            options: [
                { id: "A", text: answerA.trim() },
                { id: "B", text: answerB.trim() },
                { id: "C", text: answerC.trim() }
            ],
            correctAnswer: correctAnswer,
            createdAt: new Date().toISOString()
        };

        // Add the new question to the bank
        const updatedQuestions = [createdQuestion, ...questions];

        setQuestions(updatedQuestions);

        // Save to localStorage
        localStorage.setItem(
            "instea-trivia-questions",
            JSON.stringify(updatedQuestions)
        );

        // Clear the form
        setNewQuestion("");
        setAnswerA("");
        setAnswerB("");
        setAnswerC("");
        setCorrectAnswer("");

        // Close the form
        setShowCreateForm(false);
    };


    return (
        <section className="trivia-question-bank">
            <div className="trivia-bank-header">
                {/*==============*/}
                {/*Question Bank */}
                {/*==============*/}
                <h2>Question Bank</h2>


                <Link to="/admin/community" className="trivia-bank-back">
                    ← Back to Community
                </Link>
            </div>
            {/*===================*/}
            {/*Question Bank Card */}
            {/*===================*/}
            <div className="trivia-bank-card">

                {/*==================*/}
                {/*Search and Create */}
                {/*==================*/}
                <div className="trivia-bank-toolbar">
                    <input
                        type="search"
                        placeholder="Search questions..."
                        className="trivia-bank-search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <button
                        type="button"
                        className="trivia-add-button"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "Cancel" : "Create a Question"}
                    </button>
                </div>

                {/*====================*/}
                {/*Create Question Form*/}
                {/*====================*/}
                {showCreateForm && (
                    <div className="trivia-create-form">
                        <h3>Create a New Question</h3>
                        {/*===============*/}
                        {/*Question Input */}
                        {/*===============*/}
                        <div className="trivia-form-field">
                            <label htmlFor="trivia-new-question">
                                Question
                            </label>

                            <textarea
                                id="trivia-new-question"
                                placeholder="Enter your trivia question..."
                                maxLength={150}
                                rows={2}
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                            />

                            <span className="trivia-char-count">
                                {newQuestion.length}/150
                            </span>
                        </div>

                        {/*==============*/}
                        {/*Answer Options*/}
                        {/*==============*/}
                        <div className="trivia-form-field">
                            <label htmlFor="trivia-answer-a">Option A</label>

                            <input
                                id="trivia-answer-a"
                                type="text"
                                placeholder="Enter answer A..."
                                maxLength={75}
                                value={answerA}
                                onChange={(e) => setAnswerA(e.target.value)}
                            />
                            <span className="trivia-char-count">{answerA.length}/75</span>
                        </div>

                        <div className="trivia-form-field">
                            <label htmlFor="trivia-answer-b">Option B</label>
                            <input
                                id="trivia-answer-b"
                                type="text"
                                placeholder="Enter answer B..."
                                maxLength={75}
                                value={answerB}
                                onChange={(e) => setAnswerB(e.target.value)}
                            />
                            <span className="trivia-char-count">{answerB.length}/75</span>
                        </div>

                        <div className="trivia-form-field">
                            <label htmlFor="trivia-answer-c">Option C</label>
                            <input
                                id="trivia-answer-c"
                                type="text"
                                placeholder="Enter answer C..."
                                maxLength={75}
                                value={answerC}
                                onChange={(e) => setAnswerC(e.target.value)}
                            />
                            <span className="trivia-char-count">{answerC.length}/75</span>
                        </div>

                        {/*===============*/}
                        {/*Correct Answer */}
                        {/*===============*/}
                        <div className="trivia-form-bottom">
                            <div className="trivia-form-field">
                                <label>Select the Correct Answer</label>

                                <div className="trivia-correct-options">
                                    {["A", "B", "C"].map((option) => (
                                        <label key={option} className="trivia-correct-option">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                value={option}
                                                checked={correctAnswer === option}
                                                onChange={() => setCorrectAnswer(option)}
                                            />
                                            Option {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/*==============*/}
                            {/*Save Question */}
                            {/*==============*/}
                            <div className="trivia-form-actions">
                                <button
                                    type="button"
                                    className="trivia-save-button"
                                    onClick={handleSaveQuestion}
                                >
                                    Save Question
                                </button>
                            </div>
                        </div>
                    </div>
                )
                }

                {/*===============*/}
                {/*Questions List */}
                {/*===============*/}
                <div className="trivia-bank-list">
                    {/*when no questions found*/}
                    {sortedQuestions.length === 0 && (
                        <p className="trivia-bank-empty">
                            No questions found.
                        </p>
                    )}
                    {sortedQuestions.map((trivia) => (
                        <div key={trivia.id} className="trivia-bank-item">

                            <button
                                type="button"
                                className="trivia-bank-question"
                                aria-expanded={expandedQuestionId === trivia.id}
                                onClick={() =>
                                    setExpandedQuestionId(
                                        expandedQuestionId === trivia.id ? null : trivia.id
                                    )
                                }
                            >
                                <ChevronDown
                                    className="trivia-bank-arrow"
                                    size={20}
                                    style={{
                                        transform:
                                            expandedQuestionId === trivia.id
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)"
                                    }}
                                />

                                <span>{trivia.question}</span>
                            </button>

                            <button
                                type="button"
                                className="trivia-bank-delete"
                                onClick={() => handleDeleteQuestion(trivia.id)}
                            >
                                Delete
                            </button>

                            {/*=================*/}
                            {/*Question Answers */}
                            {/*=================*/}
                            {expandedQuestionId === trivia.id && (
                                <div className="trivia-bank-answers">
                                    {trivia.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className={
                                                option.id === trivia.correctAnswer
                                                    ? "trivia-bank-answer correct"
                                                    : "trivia-bank-answer"
                                            }
                                        >
                                            <span>
                                                {option.id}. {option.text}
                                            </span>

                                            {option.id === trivia.correctAnswer && (
                                                <span>✓ Correct Answer</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ))}
                </div>

            </div >

        </section >
    );
}