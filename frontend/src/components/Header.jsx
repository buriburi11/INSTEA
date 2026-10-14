import instealogo from '../assets/instea-logo.svg';
import { Bell, ShoppingBag } from 'lucide-react';
import './Header.css';
import { NavLink } from 'react-router';

function Header() {
    /*will later be replaced with users <initials></initials*/
    const userInitials = "CV";


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

        </header>
    );
}

export default Header;