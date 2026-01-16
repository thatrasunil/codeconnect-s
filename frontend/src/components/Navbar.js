import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSignOutAlt, FaCode, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Hide Navbar in Editor to allow full screen layout
    if (location.pathname.startsWith('/room/')) {
        return null; // Editor has its own toolbar
    }

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand" onClick={closeMenu}>
                <FaCode size={28} />
                <span>CodeConnect</span>
            </Link>

            <button className="mobile-menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Desktop & Mobile Menu Logic Combined for simplicity or split */}
            <div className={`navbar-links ${isMenuOpen ? 'mobile-menu' : ''}`}>
                {/* Mobile-only header duplicates could go here if needed, or just standard links */}

                {user && (
                    <>
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>Dashboard</Link>
                        <Link to="/problems" className={`nav-link ${isActive('/problems')}`} onClick={closeMenu}>Problems</Link>
                        <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`} onClick={closeMenu}>Leaderboard</Link>

                        <div className="nav-divider"></div>

                        <Link to="/debugging" className={`nav-link ${isActive('/debugging')}`} onClick={closeMenu}>Debugging</Link>
                        <Link to="/testing" className={`nav-link ${isActive('/testing')}`} onClick={closeMenu}>Testing</Link>
                        <Link to="/codegen" className={`nav-link ${isActive('/codegen')}`} onClick={closeMenu}>Code Gen</Link>
                    </>
                )}

                <div className="navbar-auth">
                    {user ? (
                        <>
                            <Link to="/profile" className="user-profile-link" onClick={closeMenu}>
                                <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
                                    alt="Avatar"
                                    className="user-avatar"
                                />
                                <span>{user.username}</span>
                            </Link>
                            <button onClick={() => { logout(); closeMenu(); }} className="btn-logout">
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login" onClick={closeMenu}>Login</Link>
                            <Link to="/signup" className="btn-signup" onClick={closeMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
