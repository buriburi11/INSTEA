import instealogo from '../assets/instea-logo.svg';
import { Mail, Phone } from 'lucide-react';
import facebookLogo from '../assets/Facebook_Logo.png';
import instagramLogo from '../assets/Instagram_logo.png';
import './Footer.css';
import { NavLink } from 'react-router';
import { env } from '../config/env';

function Footer() {
    return (
        <footer className="footer">

            <div className="footer-logo">
                <NavLink to="/">
                    <img src={instealogo} alt="Instea Logo" className="logo" />
                </NavLink>

                <p>Premium tea and coffee, slow-steeped with botanical ingredients in Sacramento since 2027.</p>

                <div className="footer-socials">
                    <a href="https://www.instagram.com/instea_official/" target='_blank' rel="noopener noreferrer" >
                        <img src={instagramLogo} alt="Instagram" />
                    </a>
                    <a href="https://www.facebook.com/insteacoffeebar/" target='_blank' rel="noopener noreferrer" >
                        <img src={facebookLogo} alt="Facebook" />
                    </a>
                </div>
            </div>

            <div className="footer-visit">
                <h4>Visit</h4>

                <NavLink to="/menu">Menu</NavLink>
                <NavLink to="/locations">Locations</NavLink>
                <NavLink to="/events">Events</NavLink>
                <NavLink to="/about">Our Story</NavLink>

            </div>

            <div className="footer-members">
                <h4>Members</h4>

                <NavLink to="/instea_rewards">INSTEA Rewards</NavLink>
                <NavLink to="/community">Community</NavLink>
                <NavLink to="/profile">My Account</NavLink>
                <NavLink to="/staff_portal">Staff Portal</NavLink>

            </div>

            <div className="footer-policies">
                <h4>Policies</h4>

                <NavLink to="/privacy_policy">Privacy Policy</NavLink>
                <NavLink to="/terms_of_service">Terms of Service</NavLink>
                <NavLink to="/reward_terms">Reward Terms</NavLink>
                <NavLink to="/accessibility">Accessibility</NavLink>

            </div>

            <div className="footer-contact">
                <h4>Hours & Contact</h4>

                <div className="footer-hours">
                    <span>Mon - Fri </span>
                    <span>8 AM - 9 PM</span>
                </div>

                <div className="footer-hours">
                    <span>Sat - Sun </span>
                    <span>9 AM - 9 PM</span>
                </div>

                {/*displays text and allows to call and email if on supported devices*/}
                <a href="tel:2125550142">
                    <Phone size={18} color="#C2A066" strokeWidth={2.5}/> (212) 555-0142</a>
                <a href="mailto:instea.us@gmail.com">
                    <Mail size={18} color="#C2A066" strokeWidth={2.5}/> instea.us@gmail.com</a>
            </div>

            <div className="footer-bottom">
                <p>© 2026 {env.appName}. All rights reserved.</p>
                <p> Payments securely processed by Square.</p>
            </div>

        </footer>
        
    );
}

export default Footer;
