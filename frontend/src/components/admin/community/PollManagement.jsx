import { useState, useEffect } from "react";
import "./PollManagement.css";
import { products } from "../../../data/products";
import { mockPolls } from "../../../data/communityPolls";
import { Trash2 } from "lucide-react";

export default function PollManagement() {
    // Controls which part of the poll creation interface is visible
    const [pollView, setPollView] = useState("closed");
    // Tracks the character counter
    const [pollDescription, setPollDescription] = useState("");
    const [pollTitle, setPollTitle] = useState("");
    const [pollQuestion, setPollQuestion] = useState("");
    // Stores the General Poll voting options
    const [pollOptions, setPollOptions] = useState(["", ""]);
    // Stores the date when voting will close
    const [pollEndDate, setPollEndDate] = useState("");
    // Stores a message when the admin tries to publish an invalid poll
    const [pollError, setPollError] = useState("");
    // Stores the polls displayed in the Published Polls section
    // Load saved polls, or use mock polls if nothing has been saved
    const [publishedPolls, setPublishedPolls] = useState(() => {
        const savedPolls = localStorage.getItem("instea-polls");

        return savedPolls ? JSON.parse(savedPolls) : mockPolls;
    });

    // Save poll changes so the public Community page can read them
    useEffect(() => {
        localStorage.setItem(
            "instea-polls",
            JSON.stringify(publishedPolls)
        );
    }, [publishedPolls]);

    // Keep or Retire poll form information
    const [keepRetireProduct, setKeepRetireProduct] = useState("");
    const [keepRetireDescription, setKeepRetireDescription] = useState("");
    const [keepRetireEndDate, setKeepRetireEndDate] = useState("");
    const [keepRetireError, setKeepRetireError] = useState("");

    // Checks that all required General Poll fields are completed
    const validateGeneralPoll = () => {
        if (
            !pollTitle.trim() ||
            !pollQuestion.trim() ||
            !pollDescription.trim()
        ) {
            setPollError("Please complete all poll information fields.");
            return false;
        }

        // At least two products must be selected
        if (!pollOptions[0] || !pollOptions[1]) {
            setPollError("Please select at least two voting options.");
            return false;
        }

        // Make sure the admin selects an expiration date
        if (!pollEndDate) {
            setPollError("Please select a poll expiration date.");
            return false;
        }

        // Prevent publishing a poll with an expiration date in the past
        const today = new Date().toLocaleDateString("en-CA");

        if (pollEndDate < today) {
            setPollError("Poll expiration date cannot be in the past.");
            return false;
        }

        // Clear the error if everything is valid
        setPollError("");
        return true;
    };

    // Checks that all required Keep or Retire fields are completed
    const validateKeepRetirePoll = () => {

        // Make sure a product is selected
        if (!keepRetireProduct) {
            setKeepRetireError("Please select a product.");
            return false;
        }

        // Make sure a description is entered
        if (!keepRetireDescription.trim()) {
            setKeepRetireError("Please enter a poll description.");
            return false;
        }

        // Make sure an expiration date is selected
        if (!keepRetireEndDate) {
            setKeepRetireError("Please select a poll expiration date.");
            return false;
        }

        // Prevent expiration dates in the past
        const today = [
            new Date().getFullYear(),
            String(new Date().getMonth() + 1).padStart(2, "0"),
            String(new Date().getDate()).padStart(2, "0")
        ].join("-");

        if (keepRetireEndDate < today) {
            setKeepRetireError("Poll expiration date cannot be in the past.");
            return false;
        }

        // Clear previous errors
        setKeepRetireError("");
        return true;
    };

    // Publishes a General Poll to the temporary mock list
    const publishGeneralPoll = () => {
        // Stop if any required fields are missing
        if (!validateGeneralPoll()) {
            return;
        }

        // Create a new poll using the admin's form information
        const newPoll = {
            id: crypto.randomUUID(),
            type: "general",
            label: "General Poll",
            title: pollTitle.trim(),
            question: pollQuestion.trim(),
            description: pollDescription.trim(),
            status: "active",
            endsAt: `${pollEndDate}T23:59:59`,

            // Only include selected products
            options: pollOptions
                .filter((productId) => productId !== "")
                .map((productId, index) => ({
                    id: index + 1,
                    productId: productId
                }))
        };

        // Replace the previous active General Poll
        // and add the newly published poll
        setPublishedPolls((previousPolls) => {
            const updatedPolls = previousPolls.map((poll) => {
                if (
                    poll.type === "general" &&
                    poll.status === "active"
                ) {
                    return {
                        ...poll,
                        status: "replaced"
                    };
                }

                return poll;
            });

            return [...updatedPolls, newPoll];
        });

        // Clear General Poll form after publishing
        setPollTitle("");
        setPollQuestion("");
        setPollDescription("");
        setPollOptions(["", ""]);
        setPollEndDate("");
        setPollError("");
        // Return to the initial Create Poll screen
        setPollView("closed");
    };

    // Publishes a Keep or Retire poll
    const publishKeepRetirePoll = () => {
        // Stop if required fields are missing
        if (!validateKeepRetirePoll()) {
            return;
        }

        // Create the new Keep or Retire poll
        const newPoll = {
            id: crypto.randomUUID(),
            type: "keep-retire",
            label: "Keep or Retire",
            title: "Keep or Retire?",
            productId: keepRetireProduct,
            description: keepRetireDescription.trim(),
            status: "active",
            endsAt: `${keepRetireEndDate}T23:59:59`,

            // Voting options are always the same
            options: [
                { id: 1, name: "Keep it" },
                { id: 2, name: "Retire" }
            ]
        };

        // Replace the previous active Keep or Retire poll
        setPublishedPolls((previousPolls) => {
            const updatedPolls = previousPolls.map((poll) => {
                if (
                    poll.type === "keep-retire" &&
                    poll.status === "active"
                ) {
                    return {
                        ...poll,
                        status: "replaced"
                    };
                }

                return poll;
            });

            return [...updatedPolls, newPoll];
        });

        // Clear Keep or Retire form after publishing
        setKeepRetireProduct("");
        setKeepRetireDescription("");
        setKeepRetireEndDate("");
        setKeepRetireError("");
        // Return to Create Poll screen
        setPollView("closed");
    };

    const deletePoll = (pollId) => {
        setPublishedPolls((previousPolls) =>
            previousPolls.map((poll) =>
                poll.id === pollId
                    ? { ...poll, status: "deleted" }
                    : poll
            )
        );
    };


    return (
        <section className="poll-management">

            {/* Initial view: Create Poll button */}
            {pollView === "closed" && (
                <div className="poll-management-create">
                    <h2>Create a Poll</h2>

                    <button
                        type="button"
                        onClick={() => setPollView("choose")}
                    >
                        Create Poll
                    </button>
                </div>
            )}

            {/* Choose which type of poll to create */}
            {pollView === "choose" && (
                <div className="poll-type-selection">
                    <h2>Choose a Poll Type</h2>

                    <div className="poll-type-options">
                        <button
                            type="button"
                            onClick={() => setPollView("general")}
                        >
                            General Poll
                            <span>Up to three voting options</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPollView("keep-retire")}
                        >
                            Keep or Retire
                            <span>Vote to keep or retire a menu item</span>
                        </button>
                    </div>

                    {/* Close the selection screen */}
                    <button
                        type="button"
                        onClick={() => {
                            // Clear the General Poll form when canceled
                            setPollTitle("");
                            setPollQuestion("");
                            setPollDescription("");
                            setPollOptions(["", ""]);
                            setPollEndDate("");
                            setPollError("");

                            // Return to Create Poll screen
                            setPollView("closed");
                        }}
                    >
                        Cancel
                    </button>


                </div>
            )}
            {/* General Poll creation form */}
            {pollView === "general" && (
                <div className="poll-create-form">
                    <h2>Create General Poll</h2>

                    <p>
                        Create a poll with up to three voting options.
                    </p>

                    {/* Poll title */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-title">Title</label>

                        <input
                            id="poll-title"
                            type="text"
                            placeholder="Enter poll title"
                            maxLength={60}
                            value={pollTitle}
                            onChange={(e) => setPollTitle(e.target.value)}
                        />

                        <span className="poll-character-counter">
                            {pollTitle.length} / 60 characters
                        </span>
                    </div>

                    {/* Poll question */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-question">Question</label>

                        <input
                            id="poll-question"
                            type="text"
                            placeholder="Enter poll question"
                            maxLength={120}
                            value={pollQuestion}
                            onChange={(e) => setPollQuestion(e.target.value)}
                        />

                        {/* Live character counter */}
                        <span className="poll-character-counter">
                            {pollQuestion.length} / 120 characters
                        </span>
                    </div>

                    {/* Poll description */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-description">Description</label>

                        <textarea
                            id="poll-description"
                            placeholder="Enter poll description"
                            maxLength={200}
                            rows={4}
                            value={pollDescription}
                            onChange={(e) => setPollDescription(e.target.value)}
                        />

                        {/* Live character counter */}
                        <span className="poll-character-counter">
                            {pollDescription.length} / 200 characters
                        </span>
                    </div>

                    {/* General Poll voting options */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-option-1">Voting Option 1</label>

                        <select
                            id="poll-option-1"
                            value={pollOptions[0]}
                            onChange={(e) => {
                                const updatedOptions = [...pollOptions];
                                updatedOptions[0] = e.target.value;
                                setPollOptions(updatedOptions);
                            }}
                        >
                            <option value="">Select a menu product</option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={
                                        product.id === pollOptions[1] ||
                                        product.id === pollOptions[2]
                                    }
                                >
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* General Poll voting option 2 */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-option-2">Voting Option 2</label>

                        <select
                            id="poll-option-2"
                            value={pollOptions[1]}
                            onChange={(e) => {
                                const updatedOptions = [...pollOptions];
                                updatedOptions[1] = e.target.value;
                                setPollOptions(updatedOptions);
                            }}
                        >
                            <option value="">Select a menu product</option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={
                                        product.id === pollOptions[0] ||
                                        product.id === pollOptions[2]
                                    }
                                >
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* General Poll voting option 3 (optional) */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-option-3">
                            Voting Option 3 (Optional)
                        </label>

                        <select
                            id="poll-option-3"
                            value={pollOptions[2] || ""}
                            onChange={(e) => {
                                const updatedOptions = [...pollOptions];
                                updatedOptions[2] = e.target.value;
                                setPollOptions(updatedOptions);
                            }}
                        >
                            <option value="">Select a menu product</option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={
                                        product.id === pollOptions[0] ||
                                        product.id === pollOptions[1]
                                    }
                                >
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Poll expiration date */}
                    <div className="poll-form-field">
                        <label htmlFor="poll-end-date">Poll Expiration Date</label>

                        <input
                            id="poll-end-date"
                            type="date"
                            value={pollEndDate}
                            min={new Date().toLocaleDateString("en-CA")}
                            onChange={(e) => setPollEndDate(e.target.value)}
                        />
                    </div>

                    {/* Display validation errors */}
                    {pollError && (
                        <p className="poll-error-message" role="alert">
                            {pollError}
                        </p>
                    )}


                    {/* General Poll form actions */}
                    <div className="poll-form-actions">

                        {/* Return to poll type selection */}
                        <button
                            type="button"
                            onClick={() => setPollView("choose")}
                        >
                            Back
                        </button>

                        {/* Close poll creation */}
                        <button
                            type="button"
                            onClick={() => {
                                // Clear Keep or Retire form when canceled
                                setKeepRetireProduct("");
                                setKeepRetireDescription("");
                                setKeepRetireEndDate("");
                                setKeepRetireError("");

                                // Return to Create Poll screen
                                setPollView("closed");
                            }}
                        >
                            Cancel
                        </button>

                        {/* Publish the General Poll */}
                        <button
                            type="button"
                            onClick={publishGeneralPoll}
                        >
                            Publish Poll
                        </button>

                    </div>

                </div>
            )}

            {/* Keep or Retire Poll Form */}
            {pollView === "keep-retire" && (
                <div className="poll-create-form">
                    <h2>Keep or Retire?</h2>

                    {/* Select the product members will vote on */}
                    <div className="poll-form-field">
                        <label htmlFor="keep-retire-product">
                            Select Product
                        </label>

                        <select
                            id="keep-retire-product"
                            value={keepRetireProduct}
                            onChange={(e) => setKeepRetireProduct(e.target.value)}
                        >
                            <option value="">Select a menu product</option>

                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Keep or Retire poll description */}
                    <div className="poll-form-field">
                        <label htmlFor="keep-retire-description">
                            Description
                        </label>

                        <textarea
                            id="keep-retire-description"
                            placeholder="Explain why members should keep or retire this product"
                            maxLength={200}
                            rows={4}
                            value={keepRetireDescription}
                            onChange={(e) => setKeepRetireDescription(e.target.value)}
                        />

                        {/* Live character counter */}
                        <span className="poll-character-counter">
                            {keepRetireDescription.length} / 200 characters
                        </span>
                    </div>

                    {/* Keep or Retire expiration date */}
                    <div className="poll-form-field">
                        <label htmlFor="keep-retire-end-date">
                            Poll Expiration Date
                        </label>

                        <input
                            id="keep-retire-end-date"
                            type="date"
                            value={keepRetireEndDate}
                            min={new Date().toLocaleDateString("en-CA")}
                            onChange={(e) => setKeepRetireEndDate(e.target.value)}
                        />
                    </div>

                    {/* Display Keep or Retire validation errors */}
                    {keepRetireError && (
                        <p className="poll-error-message" role="alert">
                            {keepRetireError}
                        </p>
                    )}

                    {/* Keep or Retire form actions */}
                    <div className="poll-form-actions">

                        {/* Return to poll type selection */}
                        <button
                            type="button"
                            onClick={() => setPollView("choose")}
                        >
                            Back
                        </button>

                        {/* Close poll creation */}
                        <button
                            type="button"
                            onClick={() => setPollView("closed")}
                        >
                            Cancel
                        </button>

                        {/* Publish the Keep or Retire Poll */}
                        <button
                            type="button"
                            onClick={publishKeepRetirePoll}
                        >
                            Publish Poll
                        </button>

                    </div>
                </div>
            )}

            {/* Published Polls section */}
            <div className="poll-published-list">
                <h2>Polls</h2>

                {[...publishedPolls]
                    .filter((poll) => poll.status !== "deleted")
                    .reverse()
                    .slice(0, 5)
                    .map((poll) => (
                        <div className="poll-published-item" key={poll.id}>
                            <div className="poll-published-info">
                                {/* Main heading: product name for Keep or Retire */}
                                <h3>
                                    {poll.type === "keep-retire"
                                        ? products.find((product) => product.id === poll.productId)?.name || poll.title
                                        : poll.question || poll.title}
                                </h3>

                                {/* Subtitle: poll type */}
                                <p>
                                    {poll.type === "keep-retire"
                                        ? "Keep or Retire?"
                                        : poll.question
                                            ? poll.title
                                            : poll.label}
                                </p>
                            </div>

                            {/* Determine whether the poll has expired */}
                            <span
                                className={`poll-published-status ${poll.status === "replaced"
                                        ? "replaced"
                                        : new Date(poll.endsAt) <= new Date()
                                            ? "expired"
                                            : "active"
                                    }`}
                            >
                                {poll.status === "replaced"
                                    ? "Replaced"
                                    : new Date(poll.endsAt) <= new Date()
                                        ? "Expired"
                                        : "Active"}
                            </span>

                            <button
                                type="button"
                                className="poll-delete-button"
                                onClick={() => {
                                    const confirmed = window.confirm(
                                        "Are you sure you want to delete this poll?"
                                    );

                                    if (confirmed) {
                                        deletePoll(poll.id);
                                    }
                                }}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    ))}
            </div>

        </section>
    );
}

