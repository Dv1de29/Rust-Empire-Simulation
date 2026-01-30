import { useState } from 'react';
import '../styles/NavBar.css'

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="logo">
                MapSim
            </div>

            {/* Hamburger Icon for Mobile */}
            <div className="hamburger" onClick={toggleMenu}>
                {isOpen ? '✕' : '☰'}
            </div>

            {/* Navigation Links */}
            <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                <a href="#map" onClick={() => setIsOpen(false)}>Map</a>
                <a href="#settings" onClick={() => setIsOpen(false)}>Settings</a>
                <a href="#profile" onClick={() => setIsOpen(false)}>Profile</a>
            </div>
        </nav>
    );
}

export default NavBar;