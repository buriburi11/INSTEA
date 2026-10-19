import { useState } from 'react';
import instealogo from '../assets/instea-logo.svg';
import { Bell, ShoppingBag, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router';
import './Header.css';

function Header() {
    /*will later be replaced with users <initials></initials*/
    const userInitials = "CV";

    const [menuOpen, setMenuOpen] = useState(false);                                                                        // State variable to track whether the menu is open or closed. Initially set to false (closed).
    const closeMenu = () => setMenuOpen(false);                                                                             // Function to close the menu by setting menuOpen to false.

    return (
        <header className="header">

            <NavLink to="/">
                <img src={instealogo} alt="Instea Logo" className="logo" />
            </NavLink>

            <nav className="header-nav">
                <NavLink to="/menu">Menu</NavLink>
                <NavLink to="/rewards">Rewards</NavLink>
                <NavLink to="/community">Community</NavLink>
                <NavLink to="/events">Events</NavLink>
                <NavLink to="/locations">Locations</NavLink>
                <NavLink to="/about">About</NavLink>
            </nav>

            <div className="header-icons">
                <NavLink to="/notifications" aria-label="Notifications">
                    <Bell className="header-side-icons" color="#1F3B2E" size={26} />
                </NavLink>

                <NavLink to="/cart" aria-label="Cart">
                    <ShoppingBag className="header-side-icons" color="#1F3B2E" size={26} />
                </NavLink>

                <NavLink to="/profile" className="user-initials-icon" aria-label="Profile"> {userInitials}
                </NavLink>

                <NavLink to="/menu" 
                    className="order-button">Order Now
                </NavLink>

            </div>

        <button                                                                                                             // Button to toggle the mobile menu open or closed.
            type="button"
            className="mobile-menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
        >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <nav                                                                                                                // Mobile navigation menu that appears when the menu is open.
            id="mobile-navigation"
            className="mobile-nav"                                                                                          // Apply the "open" class if menuOpen is true, otherwise no additional class.
            aria-label="Mobile navigation"
            hidden={!menuOpen}                                                                                              // Set hidden to true when the menu is closed, and false when it's open.
        >
            <NavLink to="/menu" onClick={closeMenu}>Menu</NavLink>
            <NavLink to="/rewards" onClick={closeMenu}>Rewards</NavLink>
            <NavLink to="/community" onClick={closeMenu}>Community</NavLink>
            <NavLink to="/events" onClick={closeMenu}>Events</NavLink>
            <NavLink to="/locations" onClick={closeMenu}>Locations</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/menu" className="mobile-order-button" onClick={closeMenu}>Order Now</NavLink>
        </nav>

        </header>
    );
}

export default Header;