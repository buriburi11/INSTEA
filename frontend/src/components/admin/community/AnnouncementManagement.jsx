import { useState } from "react";
import "./AnnouncementManagement.css";
import { communityAnnouncements } from "../../../data/communityAnnouncements";
import { Trash2 } from "lucide-react";

export default function AnnouncementManagement() {

    // =========================
    // Announcement Form States
    // =========================

    // Stores the announcement title entered by the admin
    const [title, setTitle] = useState("");

    // Stores the announcement description
    const [description, setDescription] = useState("");

    // Stores the announcement expiration date
    const [endAt, setEndAt] = useState("");

    // Controls whether the announcement creation form is visible
    const [showForm, setShowForm] = useState(false);

    { /local storage*/ }
    // Load saved announcements or use the original mock data
    const [announcements, setAnnouncements] = useState(() => {
        const saved = localStorage.getItem("instea-announcements");

        return saved ? JSON.parse(saved) : communityAnnouncements;
    });

    {/*====================*/ }
    {/*Publish Announcement*/ }
    {/*====================*/ }

    const handlePublishAnnouncement = (e) => {
        e.preventDefault();

        // Validate the required fields
        if (!title.trim() || !description.trim() || !endAt) {
            alert("Please complete all fields before publishing.");
            return;
        }

        // Set the expiration time to the end of the selected day
        const expirationDate = new Date(`${endAt}T23:59:59`);

        // Make sure the expiration date is in the future
        if (expirationDate <= new Date()) {
            alert("Please select a future expiration date.");
            return;
        }

        // Create the new announcement
        const newAnnouncement = {
            id: `announcement-${Date.now()}`,
            title: title.trim(),
            description: description.trim(),
            date: new Date().toISOString(),
            endAt: expirationDate.toISOString(),
            status: "active",
        };

        // Find active announcements that have not expired
        const activeAnnouncements = announcements
            .filter(
                (item) =>
                    ["active", "published"].includes(item.status) &&
                    new Date(item.endAt) > new Date()
            )
            .sort(
                (a, b) =>
                    new Date(a.date) - new Date(b.date)
            );

        // If 2 announcements are active, replace the oldest
        const oldestId =
            activeAnnouncements.length >= 2
                ? activeAnnouncements[0].id
                : null;

        // Update the announcement list
        const updatedAnnouncements = announcements.map((item) =>
            item.id === oldestId
                ? { ...item, status: "replaced" }
                : item
        );

        updatedAnnouncements.push(newAnnouncement);

        // Save announcements in React state and localStorage
        setAnnouncements(updatedAnnouncements);

        localStorage.setItem(
            "instea-announcements",
            JSON.stringify(updatedAnnouncements)
        );

        // Clear the form after publishing
        setTitle("");
        setDescription("");
        setEndAt("");
        setShowForm(false);
    };

    const handleDeleteAnnouncement = (announcementId) => {

        // Ask the admin to confirm deletion
        const confirmed = window.confirm(
            "Are you sure you want to delete this announcement?"
        );

        // Stop if the admin cancels
        if (!confirmed) {
            return;
        }

        // Mark the selected announcement as deleted
        const updatedAnnouncements = announcements.map((item) =>
            item.id === announcementId
                ? { ...item, status: "deleted" }
                : item
        );

        // Update React state
        setAnnouncements(updatedAnnouncements);

        // Save changes to localStorage
        localStorage.setItem(
            "instea-announcements",
            JSON.stringify(updatedAnnouncements)
        );
    };

    return (
        <section className="announcement-management">

            {/*===================*/}
            {/*Announcement Card*/}
            {/*===================*/}
            <div className="announcement-create-card">

                {/*==============================*/}
                {/*Announcement Management Header*/}
                {/*==============================*/}
                <div className="announcement-create-header">
                    <h2>Create an Announcement</h2>

                    {/* Only show Create button when form is closed */}
                    {!showForm && (
                        <button
                            type="button"
                            className="announcement-create-button"
                            onClick={() => setShowForm(true)}
                        >
                            Create Announcement
                        </button>
                    )}
                </div>

                {/*==========================*/}
                {/*Announcement Creation Form*/}
                {/*==========================*/}
                {showForm && (
                    <form
                        className="announcement-form"
                        onSubmit={handlePublishAnnouncement}
                    >

                        {/* Announcement Title Input */}
                        <label htmlFor="announcement-title">
                            Announcement Title
                        </label>

                        <input
                            id="announcement-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter announcement title"
                            maxLength={50}
                        />
                        {/*Title Counter*/}
                        <span className="announcement-character-counter">
                            {title.length} / 50 characters
                        </span>

                        {/* Announcement Description Input */}
                        <label htmlFor="announcement-description">
                            Description
                        </label>

                        <textarea
                            id="announcement-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter announcement description"
                            maxLength={150}
                            rows={4}
                        />

                        {/*Desciption counter*/}
                        <span className="announcement-character-counter">
                            {description.length} / 150 characters
                        </span>

                        {/* Announcement Expiration Date Input */}
                        <label htmlFor="announcement-end">
                            Expiration Date
                        </label>

                        <input
                            id="announcement-end"
                            type="date"
                            value={endAt}
                            onChange={(e) => setEndAt(e.target.value)}
                        />

                        {/*===================*/}
                        {/*Form Action Buttons*/}
                        {/*===================*/}
                        <div className="announcement-form-actions">

                            {/* Cancel Button */}
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            {/* Publish Button */}
                            <button type="submit">
                                Publish Announcement
                            </button>

                        </div>

                    </form>
                )}
            </div>

            {/*===================*/}
            {/*Announcements List */}
            {/*===================*/}
            <div className="announcement-published-list">
                <h2>Announcements</h2>

                {announcements
                    .filter((item) => item.status !== "deleted")
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((item) => {

                        // Check whether the announcement has expired
                        const isExpired = new Date(item.endAt) <= new Date();

                        // Determine the status displayed to the admin
                        const displayStatus =
                            item.status === "replaced"
                                ? "Replaced"
                                : isExpired
                                    ? "Expired"
                                    : item.status === "active" || item.status === "published"
                                        ? "Active"
                                        : "Unpublished";

                        return (
                            <div
                                key={item.id}
                                className="announcement-published-item"
                            >
                                {/*===================*/}
                                {/*Announcement Details*/}
                                {/*===================*/}
                                <div className="announcement-published-info">
                                    <h3>{item.title}</h3>
                                    <p>
                                        Published: {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>

                                {/*===================*/}
                                {/*Announcement Status*/}
                                {/*===================*/}
                                <span
                                    className={`announcement-published-status ${displayStatus.toLowerCase()}`}
                                >
                                    {displayStatus}
                                </span>

                                {/*===================*/}
                                {/*Delete Announcement*/}
                                {/*===================*/}
                                <button
                                    type="button"
                                    className="announcement-delete-button"
                                    onClick={() => handleDeleteAnnouncement(item.id)}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        );
                    })}
            </div>

        </section>
    );
}