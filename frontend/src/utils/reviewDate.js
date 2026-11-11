// Calculates how long ago a review was submitted (to be shown in the review comment list; used in community.jsx)
export const getReviewDate = (date) => {
    const today = new Date();
    const reviewDate = new Date(date);

    const difference = today - reviewDate;
    const days = Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24)));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;

    const weeks = Math.floor(days / 7);

    if (weeks === 1) return "1 week ago";
    if (weeks < 4) return `${weeks} weeks ago`;

    const months = Math.floor(days / 30);

    if (months === 1) return "1 month ago";
    if (months < 12) return `${months} months ago`;

    const years = Math.floor(days / 365);

    return years === 1 ? "1 year ago" : `${years} years ago`;
};