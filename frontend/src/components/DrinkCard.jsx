// =========================
//    DRINK CARD COMPONENT
// =========================

function DrinkCard({ name, description, image, featured = false, badge }) {
    return (
        <article className={`drink-card ${featured ? 'drink-card-featured' : ''}`}>

            <div className="drink-card-image">
                {!featured && (
                    <span className="drink-card-favorite" aria-hidden="true">
                        ♡
                    </span>
                )}

                {!featured && badge && (
                    <span className="drink-card-small-badge">
                        {badge}
                    </span>
                )}

                {image ? (
                    <img src={image} alt={name} />
                ) : (
                    <span>Image coming soon</span>
                )}
            </div>

            <div className="drink-card-content">

                {featured && (
                    <span className="drink-card-badge">
                        Seasonal
                    </span>
                )}

                <h3>{name}</h3>
                <p>{description}</p>

                {!featured && (
                    <div className="drink-card-footer">
                        <span className="drink-card-price">
                            Price TBD
                        </span>

                        <button type="button" disabled>
                            + Add
                        </button>
                    </div>
                )}

                {featured && (
                    <button
                        className="drink-card-featured-action"
                        type="button"
                        disabled
                    >
                        Order for pickup <span aria-hidden="true">→</span>
                    </button>
                )}

            </div>

        </article>
    );
}

export default DrinkCard;