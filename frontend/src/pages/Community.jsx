import background_Banner from "../assets/Green_Banner.svg";
import { mockPolls } from "../data/communityPolls";
import "./Community.css";
import { Clock, Leaf } from 'lucide-react';
import { Link } from "react-router";
import useAuth from "../auth/useAuth.js";
import { useState } from "react";

function Community() {
    const { isAuthenticated } = useAuth();
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    const poll = mockPolls[0];
    const now = new Date();
    const endDate = new Date(poll.endsAt);

    const daysRemaining = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24)
    );

    const isPollOpen = poll.status === "active" && endDate > now;

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
        </main>
    );
}

export default Community;