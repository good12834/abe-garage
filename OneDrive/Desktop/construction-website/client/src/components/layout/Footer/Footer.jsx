
import { useState, useEffect } from 'react';
import {
    FaFacebook,
    FaTwitter,
    FaInstagram,
    FaLinkedin,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaHardHat,
    FaArrowRight,
    FaChevronUp,
    FaHome,
    FaTools,
    FaBuilding,
    FaClipboardCheck,
    FaShieldAlt,
    FaPaperPlane,
    FaRegCopyright
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';
const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Here you would typically make an API call
            console.log('Subscribing email:', email);
            setSubscribed(true);
            setEmail('');

            // Reset subscription status after 3 seconds
            setTimeout(() => {
                setSubscribed(false);
            }, 3000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer pt-5 pb-4">
                <div className="container">
                    <div className="footer-content">
                        <div className="row g-4">
                            {/* Company Info */}
                            <div className="col-lg-4 col-md-6">
                                <Link to="/" className="footer-logo">
                                    <div className="logo-icon-wrapper">
                                        <FaHardHat className="logo-icon text-primary-custom" />
                                    </div>
                                    <div className="logo-text">
                                        <h4>Build<span className="text-primary-custom">Master</span></h4>
                                        <span className="logo-tagline">CONSTRUCTION EXPERTS</span>
                                    </div>
                                </Link>

                                <p className="footer-description">
                                    Building dreams into reality with over 20 years of excellence in residential
                                    and commercial construction. Quality craftsmanship, innovative solutions, and
                                    unwavering commitment to client satisfaction.
                                </p>

                                <div className="social-links">
                                    <a href="#" className="social-link" aria-label="Facebook">
                                        <FaFacebook />
                                    </a>
                                    <a href="#" className="social-link" aria-label="Twitter">
                                        <FaTwitter />
                                    </a>
                                    <a href="#" className="social-link" aria-label="Instagram">
                                        <FaInstagram />
                                    </a>
                                    <a href="#" className="social-link" aria-label="LinkedIn">
                                        <FaLinkedin />
                                    </a>
                                </div>

                                {/* Newsletter */}
                                <div className="newsletter-box">
                                    <h6 className="newsletter-title">Stay Updated</h6>
                                    <form onSubmit={handleSubscribe} className="newsletter-form">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email address"
                                            className="newsletter-input"
                                            required
                                        />
                                        <button type="submit" className="newsletter-btn">
                                            <FaPaperPlane />
                                        </button>
                                    </form>
                                    {subscribed && (
                                        <p className="text-success small mb-2">Thank you for subscribing!</p>
                                    )}
                                    <p className="newsletter-note">
                                        Subscribe to our newsletter for updates and offers.
                                    </p>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="col-lg-2 col-md-6">
                                <h5 className="footer-section-title">Quick Links</h5>
                                <ul className="footer-links">
                                    <li>
                                        <Link to="/">
                                            <FaHome className="link-icon" />
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services">
                                            <FaTools className="link-icon" />
                                            Services
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/projects">
                                            <FaBuilding className="link-icon" />
                                            Projects
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/about">
                                            <FaClipboardCheck className="link-icon" />
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/contact">
                                            <FaPhone className="link-icon" />
                                            Contact
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/admin/login" className="text-warning">
                                            <FaShieldAlt className="link-icon" />
                                            Admin Login
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Services */}
                            <div className="col-lg-3 col-md-6">
                                <h5 className="footer-section-title">Our Services</h5>
                                <ul className="footer-links">
                                    <li>
                                        <Link to="/services#residential">
                                            <FaArrowRight className="link-icon" />
                                            Residential Construction
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services#commercial">
                                            <FaArrowRight className="link-icon" />
                                            Commercial Building
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services#renovation">
                                            <FaArrowRight className="link-icon" />
                                            Renovation & Remodeling
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services#management">
                                            <FaArrowRight className="link-icon" />
                                            Project Management
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services#consultation">
                                            <FaArrowRight className="link-icon" />
                                            Free Consultation
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/services#maintenance">
                                            <FaArrowRight className="link-icon" />
                                            Maintenance Services
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div className="col-lg-3 col-md-6">
                                <h5 className="footer-section-title">Contact Info</h5>
                                <ul className="contact-info">
                                    <li>
                                        <div className="contact-icon">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div className="contact-text">
                                            <strong>Main Office</strong><br />
                                            123 Construction Boulevard<br />
                                            Building City, ST 12345
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-icon">
                                            <FaPhone />
                                        </div>
                                        <div className="contact-text">
                                            <a href="tel:+15551234567">+1 (555) 123-4567</a><br />
                                            <small>Mon-Fri: 8AM-6PM</small>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="contact-icon">
                                            <FaEnvelope />
                                        </div>
                                        <div className="contact-text">
                                            <a href="mailto:info@buildmaster.com">info@buildmaster.com</a><br />
                                            <a href="mailto:quotes@buildmaster.com">quotes@buildmaster.com</a>
                                        </div>
                                    </li>
                                </ul>

                                {/* Payment Methods */}
                                <div className="payment-methods">
                                    <div className="payment-method">VISA</div>
                                    <div className="payment-method">MC</div>
                                    <div className="payment-method">AMEX</div>
                                    <div className="payment-method">PP</div>
                                </div>
                            </div>

                            {/* Location (New Section) */}
                            <div className="col-lg-3 col-md-6">
                                <h5 className="footer-section-title">Our Location</h5>
                                <div className="map-container" style={{ height: '200px', borderRadius: '10px', overflow: 'hidden' }}>
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.177858804527!2d-73.98784468459418!3d40.70555177933207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a315cdf4c9b%3A0x8b934de5cae6f7a!2sConstruction%20Company!5e0!3m2!1sen!2sus!4v1623456789012!5m2!1sen!2sus"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        title="Company Location"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Business Hours (New Section) */}
                            <div className="col-lg-3 col-md-6">
                                <h5 className="footer-section-title">Business Hours</h5>
                                <ul className="business-hours">
                                    <li className="d-flex justify-content-between">
                                        <span>Monday - Friday</span>
                                        <span>8:00 AM - 6:00 PM</span>
                                    </li>
                                    <li className="d-flex justify-content-between">
                                        <span>Saturday</span>
                                        <span>9:00 AM - 4:00 PM</span>
                                    </li>
                                    <li className="d-flex justify-content-between">
                                        <span>Sunday</span>
                                        <span>Emergency Only</span>
                                    </li>
                                    <li className="d-flex justify-content-between">
                                        <span>24/7 Emergency</span>
                                        <span className="text-primary-custom">(555) 123-EMER</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Certifications (New Section) */}
                            <div className="col-lg-4 col-md-12">
                                <h5 className="footer-section-title">Certifications</h5>
                                <div className="certifications">
                                    <div className="cert-badge">
                                        <span className="badge-icon">🏆</span>
                                        <span className="badge-text">OSHA Certified</span>
                                    </div>
                                    <div className="cert-badge">
                                        <span className="badge-icon">⭐</span>
                                        <span className="badge-text">A+ BBB Rating</span>
                                    </div>
                                    <div className="cert-badge">
                                        <span className="badge-icon">🏗️</span>
                                        <span className="badge-text">Licensed & Insured</span>
                                    </div>
                                    <div className="cert-badge">
                                        <span className="badge-icon">✅</span>
                                        <span className="badge-text">Green Building Certified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="footer-divider"></div>

                        {/* Bottom Bar */}
                        <div className="footer-bottom">
                            <div className="copyright">
                                <FaRegCopyright className="me-1" />
                                {currentYear} BuildMaster Construction. All rights reserved.
                            </div>
                            <div className="footer-bottom-links">
                                <Link to="/privacy">Privacy Policy</Link>
                                <Link to="/terms">Terms of Service</Link>
                                <Link to="/sitemap">Sitemap</Link>
                                <Link to="/careers">Careers</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <a
                href="#top"
                className={`back-to-top ${showBackToTop ? 'show' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <FaChevronUp />
            </a>
        </>
    );
};

export default Footer;