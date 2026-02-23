import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './Footer.css';
// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// FontAwesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";

const S = `
  /* Material Icons font import */
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  
  .material-icons {
    font-size: 24px;
    vertical-align: middle;
  }
  
  .material-icons.md-18 { font-size: 18px; }
  .material-icons.md-24 { font-size: 24px; }
  .material-icons.md-36 { font-size: 36px; }
  .material-icons.md-48 { font-size: 48px; }
`;

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "", style = {} }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px`, ...style }}>
      {name}
    </span>
  );
}

const QUICK_LINKS = [
  { to: "/", icon: "home", label: "Home" },
  { to: "/about", icon: "info", label: "About Us" },
  { to: "/contact", icon: "email", label: "Contact" },
  { to: "/book-appointment", icon: "calendar_month", label: "Book Service" },
];

const SERVICES = [
  { icon: "oil_barrel", label: "Oil Change" },
  { icon: "build", label: "Brake Service" },
  { icon: "electrical_services", label: "Engine Diagnostics" },
  { icon: "ac_unit", label: "AC Service" },
  { icon: "battery_charging_full", label: "Battery Replacement" },
];

const SOCIALS = [
  { icon: faFacebook, title: "Facebook" },
  { icon: faTwitter, title: "Twitter" },
  { icon: faInstagram, title: "Instagram" },
  { icon: faLinkedin, title: "LinkedIn" },
];

const CUSTOMER_PORTAL = [
  { to: "/customer/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/customer/appointments", icon: "event", label: "My Appointments" },
  { to: "/customer/invoices", icon: "receipt", label: "Invoices" },
];

const ADMIN_PORTAL = [
  { to: "/admin/dashboard", icon: "admin_panel_settings", label: "Admin Panel" },
  { to: "/admin/appointments", icon: "event", label: "Manage Appointments" },
  { to: "/admin/services", icon: "build", label: "Manage Services" },
  { to: "/admin/mechanics", icon: "groups", label: "Manage Mechanics" },
];

export default function Footer() {
  const { isAuthenticated, user } = useAuth();
  const year = new Date().getFullYear();

  const portalLinks = user?.role === "admin" ? ADMIN_PORTAL : CUSTOMER_PORTAL;

  return (
    <footer className="gfoot">
      <style>{S}</style>

      {/* ── EMERGENCY STRIP ── */}
      <div className="gfoot-emergency">
        <div className="gfoot-emergency-inner">
          <div className="gfoot-emerg-left">
            <div className="gfoot-emerg-icon">
              <MaterialIcon name="warning" size={24} style={{ color: "var(--yellow)" }} />
            </div>
            <div>
              <span className="gfoot-emerg-title">24/7 Emergency Service</span>
              <div className="gfoot-emerg-sub">For urgent automotive issues outside business hours</div>
            </div>
          </div>
          <a href="tel:+1234567891" className="gfoot-emerg-phone">
            <MaterialIcon name="phone" size={16} /> (123) 456-7891
          </a>
          <a href="tel:+1234567891" className="gfoot-emerg-btn">
            <MaterialIcon name="bolt" size={16} /> Call Now
          </a>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="gfoot-main">

        {/* Brand column */}
        <div>
          <Link to="/" className="gfoot-brand">
            <div className="gfoot-brand-icon">
              <MaterialIcon name="build" size={32} />
            </div>
            <div>
              <span className="gfoot-brand-name">ABE<span>GARAGE</span></span>
              <span className="gfoot-brand-tag">Certified Excellence</span>
            </div>
          </Link>
          <p className="gfoot-about">
            Professional automotive service management providing quality maintenance and repair. Book appointments online, track your vehicle's service history, and drive with confidence.
          </p>
          <div className="gfoot-socials">
            {SOCIALS.map((s, i) => (
              <a key={i} href="#" className="gfoot-social" title={s.title} onClick={e => e.preventDefault()}>
                <FontAwesomeIcon icon={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <div className="gfoot-col-label">
            <MaterialIcon name="link" size={16} style={{ marginRight: "4px" }} /> Quick Links
          </div>
          <ul className="gfoot-links">
            {QUICK_LINKS.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="gfoot-link">
                  <span className="gfoot-link-icon">
                    <MaterialIcon name={l.icon} size={18} />
                  </span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <div className="gfoot-col-label">
            <MaterialIcon name="handyman" size={16} style={{ marginRight: "4px" }} /> Our Services
          </div>
          <ul className="gfoot-links">
            {SERVICES.map((s, i) => (
              <li key={i}>
                <a href="#" className="gfoot-link" onClick={e => e.preventDefault()}>
                  <span className="gfoot-link-icon">
                    <MaterialIcon name={s.icon} size={18} />
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="gfoot-col-label">
            <MaterialIcon name="contact_mail" size={16} style={{ marginRight: "4px" }} /> Contact Info
          </div>
          <div className="gfoot-contact-items">
            <div className="gfoot-contact-item">
              <div className="gfoot-contact-icon">
                <MaterialIcon name="location_on" size={20} />
              </div>
              <div>
                <span className="gfoot-contact-lbl">Location</span>
                <div className="gfoot-contact-val">123 Main Street<br />City, State 12345</div>
              </div>
            </div>
            <div className="gfoot-contact-item">
              <div className="gfoot-contact-icon">
                <MaterialIcon name="phone" size={20} />
              </div>
              <div>
                <span className="gfoot-contact-lbl">Phone</span>
                <div className="gfoot-contact-val"><a href="tel:+1234567890">(123) 456-7890</a></div>
              </div>
            </div>
            <div className="gfoot-contact-item">
              <div className="gfoot-contact-icon">
                <MaterialIcon name="email" size={20} />
              </div>
              <div>
                <span className="gfoot-contact-lbl">Email</span>
                <div className="gfoot-contact-val"><a href="mailto:info@abegarage.com">info@abegarage.com</a></div>
              </div>
            </div>
            <div className="gfoot-contact-item">
              <div className="gfoot-contact-icon">
                <MaterialIcon name="schedule" size={20} />
              </div>
              <div>
                <span className="gfoot-contact-lbl">Hours</span>
                <div className="gfoot-contact-val">
                  Mon – Fri: 8:00 AM – 6:00 PM<br />
                  Saturday: 8:00 AM – 4:00 PM<br />
                  <span style={{ color: "var(--muted)" }}>Sunday: Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PORTAL LINKS ── */}
      {isAuthenticated && (
        <div className="gfoot-portal">
          <div className="gfoot-portal-inner">
            <div className="gfoot-portal-label">
              {user?.role === "admin" ? (
                <>
                  <MaterialIcon name="admin_panel_settings" size={18} style={{ marginRight: "4px" }} /> Admin Portal
                </>
              ) : (
                <>
                  <MaterialIcon name="person" size={18} style={{ marginRight: "4px" }} /> Customer Portal
                </>
              )}
            </div>
            <div className="gfoot-portal-links">
              {portalLinks.map(l => (
                <Link key={l.to} to={l.to} className="gfoot-portal-link">
                  <MaterialIcon name={l.icon} size={16} />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM BAR ── */}
      <div className="gfoot-bottom">
        <div className="gfoot-bottom-inner">
          <p className="gfoot-copy">
            <MaterialIcon name="copyright" size={14} /> {year} <strong>Abe Garage</strong>. All rights reserved. Professional automotive service management.
          </p>
          <div className="gfoot-legal">
            <a href="#" className="gfoot-legal-link">
              <MaterialIcon name="privacy_tip" size={14} style={{ marginRight: "4px" }} /> Privacy Policy
            </a>
            <a href="#" className="gfoot-legal-link">
              <MaterialIcon name="gavel" size={14} style={{ marginRight: "4px" }} /> Terms of Service
            </a>
            <a href="#" className="gfoot-legal-link">
              <MaterialIcon name="email" size={14} style={{ marginRight: "4px" }} /> Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}