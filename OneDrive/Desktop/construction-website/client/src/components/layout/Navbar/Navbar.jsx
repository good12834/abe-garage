import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHardHat, FaBell } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const handleNavLinkClick = () => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
            document.querySelector('.navbar-toggler').click();
        }
    };


    const handleNotificationClick = () => {
        setHasNotification(false);
        // Logic to show notifications dropdown
    };

    return (
        <nav className={`navbar navbar-expand-lg navbar-light shadow-sm sticky-top ${scrolled ? 'scrolled' : ''}`}>
            <div className="container-fluid px-lg-5">
                {/* Brand Logo */}
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/" onClick={handleNavLinkClick}>
                    <div className="logo-container">
                        <div className="logo-icon">
                            <FaHardHat className="text-primary-custom" size={32} />
                        </div>
                        <div>
                            Build<span>Master</span>
                            <small className="d-block text-muted" style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>
                                Construction Experts
                            </small>
                        </div>
                    </div>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Navigation Links */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/"
                                end
                                onClick={handleNavLinkClick}
                            >
                                Home
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/services"
                                onClick={handleNavLinkClick}
                            >
                                Services
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/projects"
                                onClick={handleNavLinkClick}
                            >
                                Projects
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/about"
                                onClick={handleNavLinkClick}
                            >
                                About Us
                            </NavLink>
                        </li>

                        {/* Optional Notification Bell */}
                        <li className="nav-item d-lg-none d-xl-block ms-3">
                            <button
                                className="btn btn-link text-dark position-relative p-0"
                                onClick={handleNotificationClick}
                                style={{ fontSize: '1.2rem' }}
                            >
                                <FaBell />
                                {hasNotification && <span className="notification-badge">3</span>}
                            </button>
                        </li>

                        {/* Contact Button */}
                        <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                            <Link
                                className="btn btn-primary-custom"
                                to="/contact"
                                onClick={handleNavLinkClick}
                            >
                                <i className="fas fa-phone-alt me-2"></i>
                                Contact Us
                            </Link>
                        </li>



                        {/* Search Bar */}
                        {/* Search Bar - Visible only on XL screens */}
                        <li className="nav-item ms-2 d-none d-xl-block">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control rounded-pill"
                                    placeholder="Search..."
                                    style={{ borderColor: 'rgba(255, 179, 0, 0.3)', paddingRight: '40px' }}
                                />
                                <button className="btn btn-link position-absolute end-0 text-primary-custom" type="button" style={{ zIndex: 5 }}>
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </li>

                        {/* Language Selector */}
                        {/* Language Selector */}
                        <li className="nav-item dropdown ms-1">
                            <button
                                className="btn btn-link text-dark dropdown-toggle p-0 text-decoration-none"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-globe me-1 text-primary-custom"></i>
                                EN
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm">
                                <li><button className="dropdown-item">English</button></li>
                                <li><button className="dropdown-item">Español</button></li>
                                <li><button className="dropdown-item">Français</button></li>
                            </ul>
                        </li>

                        {/* Account Dropdown */}
                        {/* Account Dropdown */}
                        {/* Account Dropdown - Only visible when logged in */}
                        {user ? (
                            <li className="nav-item dropdown ms-1">
                                <button
                                    className="btn btn-link text-dark dropdown-toggle p-0 d-flex align-items-center text-decoration-none"
                                    data-bs-toggle="dropdown"
                                >
                                    <div className="avatar-sm bg-primary-custom rounded-circle d-flex align-items-center justify-content-center me-2 text-white" style={{ width: '32px', height: '32px' }}>
                                        <i className="fas fa-user" style={{ fontSize: '14px' }}></i>
                                    </div>
                                    <span className="d-none d-xl-inline">{user.username || 'Account'}</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-sm">
                                    <li><Link className="dropdown-item" to="/admin/dashboard">Dashboard</Link></li>
                                    <li><button className="dropdown-item">Profile</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </li>
                        ) : (
                            <li className="nav-item ms-2">
                                <Link className="btn btn-outline-primary-custom btn-sm rounded-pill px-3" to="/admin/login">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
