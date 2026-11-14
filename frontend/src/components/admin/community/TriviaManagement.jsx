import "./TriviaManagement.css";
import { useState } from "react";
import { Link } from "react-router";

export default function TriviaManagement() {

    const [questionCount, setQuestionCount] = useState(() => {
        const savedCount = localStorage.getItem("instea-trivia-question-count");

        return savedCount ? Number(savedCount) : 3;
    });

    return (
        <section className="trivia-management">

            {/*===================*/}
            {/*Daily Trivia Card  */}
            {/*===================*/}
            <div className="trivia-create-card">

                {/*===================*/}
                {/*Daily Trivia Header*/}
                {/*===================*/}
                <div className="trivia-create-header">
                    <h2>Daily Trivia</h2>

                    <Link
                        to="/admin/community/triviaquestions"
                        className="trivia-manage-button"
                    >
                        Manage Question Bank
                    </Link>
                </div>

                {/*=====================*/}
                {/*Daily Trivia Settings*/}
                {/*=====================*/}
                <div className="trivia-settings">
                    <label htmlFor="trivia-question-count">
                        Questions per day
                    </label>

                    <select
                        id="trivia-question-count"
                        value={questionCount}
                        onChange={(e) => {
                            const newCount = Number(e.target.value);

                            setQuestionCount(newCount);
                            localStorage.setItem(
                                "instea-trivia-question-count",
                                String(newCount)
                            );
                        }}
                    >
                        {/*limits the number of possible questions*/}
                        {Array.from({ length: 5 }, (_, i) => i + 1).map((number) => (
                            <option key={number} value={number}>
                                {number}
                            </option>
                        ))}
                    </select>

                    <p>Changes will take effect the following day.</p>
                </div>

            </div>
        </section>
    );
}