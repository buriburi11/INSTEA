import background_Banner from "../assets/Green_Banner.svg";
import { mockPolls, mockPollHistory } from "../data/communityPolls";
import "./Community.css";
import { Clock, Leaf, ThumbsUp, ThumbsDown } from "lucide-react";
import { Link } from "react-router";
import useAuth from "../auth/useAuth.js";
import { useState } from "react";


function Community() {
    const { isAuthenticated } = useAuth();
    const [selectedOptionId, setSelectedOptionId] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

    const [keepRetireChoice, setKeepRetireChoice] = useState(null);
    const [hasVotedKeepRetire, setHasVotedKeepRetire] = useState(false);

    const poll = mockPolls[0];
    const keepOrRetirePoll = mockPolls[1];
    const now = new Date();
    const endDate = new Date(poll.endsAt);

    const daysRemaining = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24)
    );

    const isPollOpen =
        poll.status === "active" &&
        endDate > now;

    const isKeepRetireOpen =
        keepOrRetirePoll.status === "active" &&
        new Date(keepOrRetirePoll.endsAt) > now;
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
        </main>
    );
}

export default Community;