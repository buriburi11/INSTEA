import { useState, useEffect } from "react";
import "./Community.css";
import { Clock, Leaf, ThumbsUp, ThumbsDown, Megaphone } from "lucide-react";
import background_Banner from "../assets/Green_Banner.svg";
//Authentication and routing
import useAuth from "../auth/useAuth.js";
import { Link } from "react-router";
//Mock data
import { mockPolls, mockPollHistory } from "../data/communityPolls";
import {
    mockTriviaQuestions,
    mockTriviaLeaderboard,
    TRIVIA_POINTS_PER_CORRECT_ANSWER
} from "../data/communityTrivia";
import { communityAnnouncements } from "../data/communityAnnouncements";
import { events } from "../data/events";

function Community() {
    const { isAuthenticated } = useAuth();

    {/*===================*/ }
    {/*Seasonal Poll Part */ }
    {/*===================*/ }
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    {/*===================*/ }
    {/*Keep or Retire Part*/ }
    {/*===================*/ }
    const [keepRetireChoice, setKeepRetireChoice] = useState(null);
    const [hasVotedKeepRetire, setHasVotedKeepRetire] = useState(false);

    {/*==============*/ }
    {/*  Triva Part  */ }
    {/*==============*/ }
    const [timeLeft, setTimeLeft] = useState(30);
    const [hasFinishedTrivia, setHasFinishedTrivia] = useState(false);
    const [hasStartedTrivia, setHasStartedTrivia] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState(null);
    const [triviaScore, setTriviaScore] = useState(0);
    const currentTriviaQuestion = mockTriviaQuestions[currentQuestionIndex];
    const [hasSubmittedTriviaAnswer, setHasSubmittedTriviaAnswer] = useState(false);

    {/*======================*/ }
    {/*Poll Data and Deadline */ }
    {/*======================*/ }
    const poll = mockPolls[0];
    const keepOrRetirePoll = mockPolls[1];

    //gets the current date and the poll deadline
    const now = new Date();
    const endDate = new Date(poll.endsAt);
    // how many day left
    const daysRemaining = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24)
    );

    //checks if the poll is active (seasonal)
    const isPollOpen =
        poll.status === "active" &&
        endDate > now;
    //checks if the poll is active (keep or retire)
    const isKeepRetireOpen =
        keepOrRetirePoll.status === "active" &&
        new Date(keepOrRetirePoll.endsAt) > now;

    {/*============*/ }
    {/*Trivia Timer */ }
    {/*============*/ }
    useEffect(() => {
        if (!hasStartedTrivia || hasSubmittedTriviaAnswer || hasFinishedTrivia) {
            return;
        }

        if (timeLeft === 0) {
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((previousTime) => previousTime - 1);
            if (timeLeft === 1) {
                setHasSubmittedTriviaAnswer(true);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [hasStartedTrivia, hasSubmittedTriviaAnswer, hasFinishedTrivia, timeLeft]);

    {/*===================*/ }
    {/*Announcements Part */ }
    {/*===================*/ }
    {/*checks if active and can only have max of two announcements*/ }
    const activeAnnouncements = communityAnnouncements
        .filter((announcement) => {
            return (
                announcement.status === "published" &&
                new Date(announcement.endAt).getTime() > Date.now()
            );
        })
        .slice(0, 2);

    {/*====================*/ }
    {/*Social Calendar Part*/ }
    {/*====================*/ }
    {/*gets todays date and filters to get the next two upcoming events*/ }
    const today = new Date().toLocaleDateString("en-CA");
    const upcomingEvents = events
        .filter((event) => event.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 2);


    return (
        <main className="community-page">
            <div className="community-banner">
                <img
                    src={background_Banner}
                    alt=""
                    className="community-banner-image"
                />
                <p className="community-subtitle">
                    The Tea Society · Season 4
                </p>
                <h1 className="community-title">
                    Community
                </h1>
                <p className="community-description">
                    Cast seasonal ballots, prove your tea mastery daily, and unlock collective privileges with members across every tea house.
                </p>
            </div>

            {/*===================*/}
            {/*Seasonal Poll Part */}
            {/*===================*/}

            <section className="community-poll">
                <div className="poll-header">
                    <p className="poll-label">{poll.label}</p>

                    <p className="poll-deadline">
                        <Clock size={16} />
                        {isPollOpen ? `Closes in ${daysRemaining} days` : "Poll Expired"}
                    </p>
                </div>

                <h2 className="poll-title">{poll.title}</h2>

                <p className="poll-description">{poll.description}</p>


                <div className="poll-options">
                    {poll.options.map((option) => (
                        <button
                            type="button"
                            key={option.id}
                            className={`poll-option-card ${selectedOptionId === option.id ? "selected" : ""}`}
                            onClick={() => setSelectedOptionId(option.id)}
                            disabled={!isAuthenticated || hasVoted || !isPollOpen}
                            aria-pressed={selectedOptionId === option.id}
                        >
                            <img
                                src={option.image}
                                alt={option.name}
                                className="poll-option-image"
                            />

                            <div className="poll-option-content">
                                <h3 className="poll-option-name">
                                    {option.name}
                                </h3>

                                <p className="poll-option-description">
                                    {option.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>


                {/*===================================*/}
                {/*Non-members disabled button "Join.."*/}
                {/*===================================*/}
                {isAuthenticated ? (
                    <button type="button" className="poll-login-button"
                        disabled={selectedOptionId === null || hasVoted || !isPollOpen}
                        onClick={() => setHasVoted(true)}>
                        <Leaf size={16} />
                        Cast ballot · + 15 leaves
                    </button>
                ) : (
                    <Link to="/login" className="poll-login-button">
                        Join INSTEA Rewards to Vote
                    </Link>
                )}

                {hasVoted && (
                    <p className="poll-confirmation">
                        Your ballot has been submitted!
                    </p>
                )}
            </section>

            {/*========================*/}
            {/*Keep or Retire Poll Part*/}
            {/*========================*/}
            <div className="community-secondary-polls">
                <section className="keep-retire-poll">
                    <img
                        src={keepOrRetirePoll.image}
                        alt="Golden Phoenix Oolong tea"
                        className="keep-retire-image"
                    />

                    <div className="keep-retire-content">
                        <p className="keep-retire-label">
                            {keepOrRetirePoll.label}
                        </p>

                        <h2 className="keep-retire-title">
                            {keepOrRetirePoll.title}
                        </h2>

                        <p className="keep-retire-description">
                            {keepOrRetirePoll.description}
                        </p>

                        {!isKeepRetireOpen && (
                            <p className="keep-retire-expired">
                                Poll Expired
                            </p>
                        )}

                        <div className="keep-retire-options">
                            {keepOrRetirePoll.options.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`keep-retire-button ${keepRetireChoice === option.id ? "selected" : ""
                                        }`}
                                    onClick={() => {
                                        if (keepRetireChoice === option.id) {
                                            setHasVotedKeepRetire(true);
                                        } else {
                                            setKeepRetireChoice(option.id);
                                        }
                                    }}

                                    disabled={!isAuthenticated || hasVotedKeepRetire || !isKeepRetireOpen}
                                    aria-pressed={keepRetireChoice === option.id}
                                >
                                    {option.name === "Keep it" ? (
                                        <ThumbsUp size={18} />
                                    ) : (
                                        <ThumbsDown size={18} />
                                    )}

                                    {option.name}
                                </button>
                            ))}
                        </div>

                        {hasVotedKeepRetire ? (
                            <p className="poll-confirmation">
                                Your vote has been submitted!
                            </p>
                        ) : keepRetireChoice !== null ? (
                            <p className="keep-retire-hint">
                                Click your selected answer again to confirm your vote.
                            </p>
                        ) : null}
                    </div>
                </section>

                {/*========================*/}
                {/*Past Poll Results Part  */}
                {/*========================*/}
                <aside className="poll-history">
                    <h2 className="poll-history-title">Past results</h2>

                    {mockPollHistory.map((result) => (
                        <div className="poll-history-item" key={result.id}>
                            <p className="poll-history-label">
                                {result.label}
                            </p>

                            <h3 className="poll-history-winner">
                                {result.winner}
                            </h3>

                            <p className="poll-history-stats">
                                Won with {result.percentage}% · {result.totalVotes.toLocaleString()} votes
                            </p>
                        </div>
                    ))}
                </aside>
            </div>

            {/*========================*/}
            {/*Trivia Game Part*/}
            {/*========================*/}
            <section className="community-trivia">
                <div className="trivia-game">
                    <div className="trivia-header">
                        <p className="trivia-label">Daily mastery trivia</p>

                        {hasStartedTrivia && !hasFinishedTrivia && (
                            <span className="trivia-timer">
                                <Clock size={18} />
                                0:{String(timeLeft).padStart(2, "0")}
                            </span>
                        )}
                    </div>
                    {hasStartedTrivia && (
                        <div className="trivia-progress">
                            {mockTriviaQuestions.map((question, index) => (
                                <div
                                    key={question.id}
                                    className={`trivia-progress-line ${index <= currentQuestionIndex ? "active" : ""
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {hasFinishedTrivia ? (
                        <div className="trivia-results">
                            <h2 className="trivia-title">Trivia Complete!</h2>

                            <p className="trivia-description">
                                You've completed today's tea mastery challenge!
                            </p>

                            <div className="trivia-results-stats">
                                <div className="trivia-result-stat">
                                    <span className="trivia-result-number">
                                        {triviaScore} / {mockTriviaQuestions.length}
                                    </span>
                                    <span className="trivia-result-label">
                                        Correct answers
                                    </span>
                                </div>

                                <div className="trivia-result-stat">
                                    <span className="trivia-result-number">
                                        {triviaScore * TRIVIA_POINTS_PER_CORRECT_ANSWER}
                                    </span>
                                    <span className="trivia-result-label">
                                        Leaves earned
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>


                            <h2 className="trivia-title">
                                {hasStartedTrivia
                                    ? currentTriviaQuestion.question
                                    : "Test your tea knowledge"}

                            </h2>

                            {hasStartedTrivia && (
                                <div className="trivia-options">
                                    {currentTriviaQuestion.options.map((option) => (
                                        <button
                                            key={option.id}
                                            type="button"
                                            className={`trivia-option ${selectedTriviaAnswer === option.id ? "selected" : ""
                                                }`}
                                            onClick={() => setSelectedTriviaAnswer(option.id)}
                                            disabled={hasSubmittedTriviaAnswer}
                                        >
                                            <span className="trivia-option-letter">
                                                {option.id}
                                            </span>

                                            <span className="trivia-option-text">
                                                {option.text}
                                            </span>
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className="trivia-start-button"
                                        disabled={
                                            selectedTriviaAnswer === null ||
                                            hasSubmittedTriviaAnswer ||
                                            timeLeft === 0
                                        }
                                        onClick={() => {
                                            if (selectedTriviaAnswer === currentTriviaQuestion.correctAnswer) {
                                                setTriviaScore((previousScore) => previousScore + 1);
                                            }

                                            setHasSubmittedTriviaAnswer(true);
                                        }}
                                    >
                                        Submit Answer
                                    </button>

                                    {hasSubmittedTriviaAnswer && (
                                        <p className="trivia-feedback">
                                            {timeLeft === 0
                                                ? "Time's up!"
                                                : selectedTriviaAnswer === currentTriviaQuestion.correctAnswer
                                                    ? "Correct! You earned 2 leaves!"
                                                    : "Not quite! Better luck on the next question."}
                                        </p>
                                    )}


                                    {/* Next Question — Questions 1 and 28*/}
                                    {hasSubmittedTriviaAnswer &&
                                        currentQuestionIndex < mockTriviaQuestions.length - 1 && (
                                            <button
                                                type="button"
                                                className="trivia-start-button"
                                                onClick={() => {
                                                    setCurrentQuestionIndex((previousIndex) => previousIndex + 1);
                                                    setSelectedTriviaAnswer(null);
                                                    setHasSubmittedTriviaAnswer(false);
                                                    setTimeLeft(30);
                                                }}
                                            >
                                                Next Question
                                            </button>
                                        )}

                                    {/* ADD THIS PART — Finish Trivia on Question 3 */}
                                    {hasSubmittedTriviaAnswer &&
                                        currentQuestionIndex === mockTriviaQuestions.length - 1 && (
                                            <button
                                                type="button"
                                                className="trivia-start-button"
                                                onClick={() => setHasFinishedTrivia(true)}
                                            >
                                                Finish Trivia
                                            </button>
                                        )}
                                </div>

                            )}

                            {!hasStartedTrivia && (
                                <>
                                    <p className="trivia-description">
                                        Answer three questions and discover how much
                                        you know about tea.
                                    </p>

                                    {isAuthenticated ? (
                                        <button
                                            type="button"
                                            className="trivia-start-button"
                                            onClick={() => setHasStartedTrivia(true)}
                                        >
                                            Start Trivia
                                        </button>
                                    ) : (
                                        <Link to="/login" className="trivia-start-button">
                                            Join INSTEA Rewards to Play
                                        </Link>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>

                {/*========================*/}
                {/*Trivia Leaderboard Part */}
                {/*========================*/}
                <aside className="trivia-leaderboard">
                    <h2 className="trivia-leaderboard-title">
                        This month's leaderboard
                    </h2>

                    {mockTriviaLeaderboard.map((player, index) => (
                        <div
                            key={player.id}
                            className={`trivia-leaderboard-row ${isAuthenticated && player.isCurrentUser ? "current-user" : ""
                                }`}
                        >
                            <span className="trivia-rank">{index + 1}</span>

                            <span className="trivia-player-name">
                                {player.name}
                                {isAuthenticated && player.isCurrentUser && " (you)"}
                            </span>

                            <span className="trivia-player-points">
                                {player.points.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </aside>
            </section>

            {/*=======================================*/}
            {/*Announcements and Social Calender Part */}
            {/*=======================================*/}
            <div className="community-announcements-calendar">

                {/*========================*/}
                {/*Announcements Part      */}
                {/*========================*/}
                <section className="community-announcements">
                    <h2 className="announcements-heading">Announcements</h2>

                    <div className="announcements-list">
                        {activeAnnouncements.length === 0 ? (
                            <div className="announcement-card">
                                <Megaphone className="announcement-icon" size={28} color="#8A6A35" />

                                <p className="announcement-empty">
                                    No announcements at the moment. Check back soon!
                                </p>
                            </div>
                        ) : (
                            activeAnnouncements.map((announcement) => (
                                <article
                                    key={announcement.id}
                                    className="announcement-card"
                                >
                                    <Megaphone className="announcement-icon" size={28} color="#8A6A35" />

                                    {/* Announcement content */}
                                    <div className="announcement-content">
                                        <h3 className="announcement-title">
                                            {announcement.title}
                                        </h3>

                                        <p className="announcement-description">
                                            {announcement.description}
                                        </p>
                                    </div>
                                </article>
                            )))}
                    </div>
                </section>

                {/*========================*/}
                {/*Social Calendar Part    */}
                {/*========================*/}
                <section className="Social-calendar">
                    <div className="social-calendar-header">
                        <h2 className="social-calendar-heading">Social Calendar</h2>

                        <Link to="/events" className="social-calendar-link">
                            All Events
                        </Link>
                    </div>

                    {/*two upcoming events*/}
                    <div className="social-calendar-list">
                        {upcomingEvents.length === 0 ? (
                            <div className="social-calendar-card">
                                <p className="social-calendar-empty">
                                    No upcoming events at the moment. Check back soon!
                                </p>
                            </div>
                        ) : (
                            upcomingEvents.map((event) => (
                                <article
                                    key={event.id} className="social-calendar-card" >

                                    {/* Event date need to break it from the data*/}
                                    <div className="social-calendar-date">
                                        <span className="social-calendar-month">
                                            {new Date(
                                                Number(event.date.split("-")[0]),
                                                Number(event.date.split("-")[1]) - 1,
                                                Number(event.date.split("-")[2])
                                            ).toLocaleDateString("en-US", { month: "short" })}
                                        </span>

                                        <span className="social-calendar-day">
                                            {Number(event.date.split("-")[2])}
                                        </span>
                                    </div>

                                    {/* Event details */}
                                    <div className="social-calendar-content">
                                        <h3 className="social-calendar-title">
                                            {event.title}
                                        </h3>

                                        <p className="social-calendar-details">
                                            {event.time} · {event.location}
                                        </p>
                                    </div>

                                </article>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Community;
