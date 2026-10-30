import background_Banner from "../assets/Green_Banner.svg";
import { mockPolls } from "../data/communityPolls";
import "./Community.css";
import { Clock } from 'lucide-react';
import { Link } from "react-router";

function Community() {
    const poll = mockPolls[0];
    const now = new Date();
    const endDate = new Date(poll.endsAt);

    const daysRemaining = Math.ceil(
        (endDate - now) / (1000 * 60 * 60 * 24)
    );
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
                        Closes in {daysRemaining} days
                    </p>
                </div>

                <h2 className="poll-title">{poll.title}</h2>

                <p className="poll-description">{poll.description}</p>


                <div className="poll-options">
                    {poll.options.map((option) => (
                        <div className="poll-option-card" key={option.id}>
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
                        </div>
                    ))}
                </div>
                <Link to="/login" className="poll-login-button">
                                    Join INSTEA Rewards to Vote
                                </Link>
            </section>
        </main>
    );
}

export default Community;