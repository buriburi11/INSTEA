// =============
//    IMPORTS
// =============

import React from "react";
import aboutImage from "../assets/INSTEA HOME PLACEHOLDER.jpg";
import "./About.css";

// ========================
//    ABOUT PAGE CONTENT
// ========================

function About() {
    return (
        <main className="about-page">
            <section className="about-main">                                                                                      {/* ------- ABOUT MAIN SECTION ------- */}
                <div className="about-main-content">

                    <div className="about-main-text">                                                                             {/* Left: About text */}
                        <p className="about-label">Our story</p>

                        <h1>
                            <em>Inspiration</em> of tea.
                        </h1>

                        <p className="about-description">
                            INSTEA began in 2019 as a six-seat counter in SoHo with
                            one belief: a well-made cup of tea is a small daily ceremony.
                            Our droplet-and-leaf mark is that idea — a single drop
                            holding the whole plant.
                        </p>

                        <button type="button" disabled>
                            Taste the menu
                        </button>
                    </div>

                    <div className="about-main-image">                                                                            {/* Right: About image */}
                        <img
                            src={aboutImage}
                            alt="INSTEA placeholder image"
                        />
                    </div>

                </div>
            </section>                                                                                                            {/* ------- ABOUT MAIN SECTION END ------- */}

            <section className="about-values">                                                                                    {/* ------- ABOUT VALUES ------- */}
                <div className="about-values-content">

                    <div className="about-value">
                        <h2>Whole leaves only</h2>
                        <p>
                            Sourced directly from family estates in Uji, Fujian,
                            Assam and Alishan.
                        </p>
                    </div>

                    <div className="about-value">
                        <h2>Real ingredients</h2>
                        <p>
                            Fresh milk, cut fruit, wild honey — never powders or
                            artificial flavorings.
                        </p>
                    </div>

                    <div className="about-value">
                        <h2>Made slowly</h2>
                        <p>
                            Pearls simmered for two hours. Oolongs cold-
                            steeped overnight.
                        </p>
                    </div>

                </div>
            </section>                                                                                                            {/* ------- ABOUT VALUES END ------- */}

            <section className="about-gallery">                                                                                   {/* ------- ABOUT GALLERY ------- */}
                <div className="about-gallery-content">
                    <img
                        src={aboutImage}
                        alt="INSTEA tea experience placeholder"
                    />
                </div>
            </section>                                                                                                            {/* ------- ABOUT GALLERY END ------- */}

        </main>
    );
}

export default About;
