import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";
import "./Navbar.css";

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// ─── Styles ───────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Click outside
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Notifications + socket
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const mock = [
      { id: "welcome", title: "Welcome to Abe Garage", message: "Thank you for choosing our premium automotive services.", time: "Just now", read: false, icon: "home" },
      { id: "maintenance", title: "Maintenance Reminder", message: "Your vehicle is due for scheduled maintenance.", time: "1 day ago", read: false, icon: "build" },
    ];
    setNotifications(mock);
    setUnreadCount(mock.filter(n => !n.read).length);
    const handleNew = (n) => { setNotifications(p => [n, ...p]); setUnreadCount(p => p + 1); };
    socketService.onNotification(handleNew);
    return () => socketService.off("notification", handleNew);
  }, [isAuthenticated, user]);

  const markRead = (id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(p => Math.max(0, p - 1));
  };
  const markAllRead = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const initials = user?.first_name ? user.first_name[0].toUpperCase() : "U";

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];
  const customerLinks = [
    { to: "/book-appointment", label: "Book Service" },
    { to: "/customer/dashboard", label: "Dashboard" },
    { to: "/customer/vehicles", label: "My Vehicles" },
    { to: "/service-packages", label: "Packages" },
    { to: "/referrals", label: "Referrals" },
  ];
  const adminLinks = [
    { to: "/admin/dashboard", label: "Admin Panel" },
    { to: "/vehicles", label: "Vehicles" },
    { to: "/admin/analytics", label: "Analytics" },
  ];

  const userMenuItems = [
    { to: "/profile", icon: "person", label: "Profile Settings" },
    { to: "/change-password", icon: "lock", label: "Change Password" },
    {
      to: user?.role === "admin" ? "/admin/dashboard" : "/customer/dashboard",
      icon: "dashboard",
      label: "Dashboard",
    },
  ];

  return (
    <>
      <style>{S}</style>

      {/* ── DESKTOP NAV ── */}
      <nav className={`gnav${scrolled ? " scrolled" : ""}`}>
        <div className="gnav-inner">

          {/* Brand */}
          <Link to="/" className="gnav-brand">
            <div className="gnav-brand-icon">
              <MaterialIcon name="build" size={32} />
            </div>
            <div>
              <span className="gnav-brand-name">ABE<span>GARAGE</span></span>
              <span className="gnav-brand-tag">Certified Excellence</span>
            </div>
          </Link>

          {/* Desktop links */}
          <ul className="gnav-links">
            {publicLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={`gnav-link${isActive(l.to) ? " is-active" : ""}`}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/emergency-service" className="gnav-link is-emergency">
                <MaterialIcon name="warning" size={16} style={{ marginRight: "4px" }} /> Emergency
              </Link>
            </li>
            {!isAuthenticated && (
              <li>
                <Link to="/book-appointment" className={`gnav-link${isActive("/book-appointment") ? " is-active" : ""}`}>
                  Book Service
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === "customer" && (
              <>
                <li><div className="gnav-sep" /></li>
                {customerLinks.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className={`gnav-link${isActive(l.to) ? " is-active" : ""}`}>{l.label}</Link>
                  </li>
                ))}
              </>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <>
                <li><div className="gnav-sep" /></li>
                {adminLinks.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className={`gnav-link${isActive(l.to) ? " is-active" : ""}`}>{l.label}</Link>
                  </li>
                ))}
              </>
            )}
          </ul>

          {/* Right actions */}
          <div className="gnav-right">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="gnav-login">
                  <MaterialIcon name="login" size={16} style={{ marginRight: "4px" }} /> Sign In
                </Link>
                <Link to="/register" className="gnav-register">
                  <MaterialIcon name="person_add" size={16} style={{ marginRight: "4px" }} /> Register
                </Link>
                <Link to="/book-appointment" className="gnav-book">
                  <MaterialIcon name="calendar_month" size={16} style={{ marginRight: "4px" }} /> Book Now
                </Link>
              </>
            ) : (
              <>
                <Link to="/book-appointment" className="gnav-book">
                  <MaterialIcon name="calendar_month" size={16} style={{ marginRight: "4px" }} /> Book
                </Link>

                {/* Notifications */}
                <div className="gnav-notif-wrap" ref={notifRef}>
                  <button
                    type="button"
                    className={`gnav-notif-btn${notifOpen ? " is-open" : ""}${unreadCount > 0 ? " has-unread" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setNotifOpen(p => !p); setUserMenuOpen(false); }}
                  >
                    <MaterialIcon name="notifications" size={20} />
                    {unreadCount > 0 && <span className="gnav-notif-count">{unreadCount}</span>}
                  </button>

                  {notifOpen && (
                    <div className="gnav-notif-dd">
                      <div className="gnav-dd-head">
                        <span className="gnav-dd-head-title">
                          <MaterialIcon name="notifications_active" size={16} style={{ marginRight: "4px" }} />
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button className="gnav-dd-markall" onClick={markAllRead}>
                            <MaterialIcon name="done_all" size={14} style={{ marginRight: "4px" }} />
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="gnav-notif-empty">
                          <div className="gnav-notif-empty-icon">
                            <MaterialIcon name="notifications_off" size={48} style={{ opacity: "0.5" }} />
                          </div>
                          <div className="gnav-notif-empty-txt">No notifications yet</div>
                        </div>
                      ) : (
                        <div className="gnav-notif-list">
                          {notifications.map(n => (
                            <div
                              key={n.id}
                              className={`gnav-notif-item${n.read ? "" : " is-unread"}`}
                              onClick={() => !n.read && markRead(n.id)}
                            >
                              <span className="gnav-notif-icon">
                                <MaterialIcon name={n.icon} size={20} />
                              </span>
                              <div>
                                <div className="gnav-notif-title">{n.title}</div>
                                <div className="gnav-notif-msg">{n.message}</div>
                                <div className="gnav-notif-time">{n.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="gnav-dd-foot">
                        <button className="gnav-dd-foot-btn">
                          <MaterialIcon name="visibility" size={14} style={{ marginRight: "4px" }} />
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="gnav-user-wrap" ref={userRef}>
                  <button
                    type="button"
                    className={`gnav-user-btn${userMenuOpen ? " is-open" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(p => !p); setNotifOpen(false); }}
                  >
                    <div className="gnav-user-avatar">{initials}</div>
                    <span className="gnav-user-name">{user?.first_name}</span>
                    <span className="gnav-user-caret">
                      <MaterialIcon name={userMenuOpen ? "expand_less" : "expand_more"} size={16} />
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="gnav-user-dd">
                      <div className="gnav-user-dd-header">
                        <div className="gnav-user-dd-name">{user?.first_name} {user?.last_name}</div>
                        <div className="gnav-user-dd-role">
                          <MaterialIcon name={user?.role === "admin" ? "admin_panel_settings" : "person"} size={12} style={{ marginRight: "4px" }} />
                          {user?.role}
                        </div>
                      </div>
                      {userMenuItems.map(item => (
                        <Link key={item.to} to={item.to} className="gnav-user-dd-item" onClick={() => setUserMenuOpen(false)}>
                          <span className="gnav-user-dd-icon">
                            <MaterialIcon name={item.icon} size={18} />
                          </span>
                          {item.label}
                        </Link>
                      ))}
                      <div className="gnav-user-dd-divider" />
                      <button className="gnav-user-dd-item is-danger" onClick={handleLogout}>
                        <span className="gnav-user-dd-icon">
                          <MaterialIcon name="logout" size={18} />
                        </span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className={`gnav-ham${mobileOpen ? " is-open" : ""}`}
            onClick={() => setMobileOpen(p => !p)}
            aria-label="Toggle navigation"
          >
            <div className="gnav-ham-line" />
            <div className="gnav-ham-line" />
            <div className="gnav-ham-line" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      <div className={`gnav-mobile${mobileOpen ? " is-open" : ""}`}>
        <div className="gnav-mobile-inner">
          {isAuthenticated && user && (
            <div className="gnav-mob-user">
              <div className="gnav-mob-avatar">{initials}</div>
              <div>
                <div className="gnav-mob-uname">{user.first_name} {user.last_name}</div>
                <div className="gnav-mob-urole">
                  <MaterialIcon name={user?.role === "admin" ? "admin_panel_settings" : "person"} size={12} style={{ marginRight: "4px" }} />
                  {user.role}
                </div>
              </div>
            </div>
          )}

          <div className="gnav-mob-section">
            <MaterialIcon name="navigation" size={14} style={{ marginRight: "4px" }} /> Navigation
          </div>
          {publicLinks.map(l => (
            <Link key={l.to} to={l.to} className={`gnav-mob-link${isActive(l.to) ? " is-active" : ""}`}>
              {l.label}
            </Link>
          ))}
          <Link to="/emergency-service" className="gnav-mob-link is-emergency">
            <MaterialIcon name="warning" size={16} style={{ marginRight: "4px" }} /> Emergency
          </Link>

          {isAuthenticated && user?.role === "customer" && (
            <>
              <div className="gnav-mob-section" style={{ marginTop: "16px" }}>
                <MaterialIcon name="account_circle" size={14} style={{ marginRight: "4px" }} /> My Account
              </div>
              {customerLinks.map(l => (
                <Link key={l.to} to={l.to} className={`gnav-mob-link${isActive(l.to) ? " is-active" : ""}`}>
                  {l.label}
                </Link>
              ))}
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <>
              <div className="gnav-mob-section" style={{ marginTop: "16px" }}>
                <MaterialIcon name="admin_panel_settings" size={14} style={{ marginRight: "4px" }} /> Admin
              </div>
              {adminLinks.map(l => (
                <Link key={l.to} to={l.to} className={`gnav-mob-link${isActive(l.to) ? " is-active" : ""}`}>
                  {l.label}
                </Link>
              ))}
            </>
          )}

          <div className="gnav-mob-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/book-appointment" className="gnav-mob-btn primary">
                  <MaterialIcon name="calendar_month" size={16} style={{ marginRight: "4px" }} /> Book Service Now
                </Link>
                <Link to="/login" className="gnav-mob-btn outline">
                  <MaterialIcon name="login" size={16} style={{ marginRight: "4px" }} /> Sign In
                </Link>
                <Link to="/register" className="gnav-mob-btn outline">
                  <MaterialIcon name="person_add" size={16} style={{ marginRight: "4px" }} /> Create Account
                </Link>
              </>
            ) : (
              <>
                <Link to="/book-appointment" className="gnav-mob-btn primary">
                  <MaterialIcon name="calendar_month" size={16} style={{ marginRight: "4px" }} /> Book Service
                </Link>
                <Link to="/profile" className="gnav-mob-btn outline">
                  <MaterialIcon name="person" size={16} style={{ marginRight: "4px" }} /> Profile Settings
                </Link>
                <button className="gnav-mob-btn danger" style={{ cursor: "pointer" }} onClick={handleLogout}>
                  <MaterialIcon name="logout" size={16} style={{ marginRight: "4px" }} /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page offset spacer */}
      <span className="gnav-spacer" />
    </>
  );
};

export default Navbar;