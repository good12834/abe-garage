import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './Login.css';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

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

const DEMO_CREDS = {
  admin: { email: 'admin@abegarage.com', password: 'admin123' },
  customer: { email: 'customer@email.com', password: 'password123' },
};

export default function Login() {
  const [form, setForm] = useState({ email: 'customer@email.com', password: 'password123' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(form.email, form.password);
      if (result.success) {
        // If admin and no "from" page, go to admin dashboard
        const target =
          from === "/" && result.user.role === "admin"
            ? "/admin/dashboard"
            : from;
        navigate(target, { replace: true });
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => setForm({ ...DEMO_CREDS[role] });

  return (
    <div className="lp">
      <style>{S}</style>

      {/* ── LEFT PANEL ── */}
      <div className="lp-left">
        <div className="lp-left-top">
          <Link to="/" className="lp-brand">
            <div className="lp-brand-icon">
              <MaterialIcon name="build" size={32} />
            </div>
            <div>
              <span className="lp-brand-name">ABE<span>GARAGE</span></span>
              <span className="lp-brand-tag">Certified Excellence</span>
            </div>
          </Link>

          <div className="lp-headline">
            <div className="lp-eyebrow">
              <MaterialIcon name="person" size={14} /> Customer Portal
            </div>
            <h1 className="lp-big-title">
              Your Car<br />In <em>Expert</em><br />Hands
            </h1>
            <p className="lp-desc">
              Sign in to manage your vehicles, book service appointments, and track your complete automotive history — all in one place.
            </p>
          </div>

          <div className="lp-features">
            {[
              { icon: 'calendar_month', title: 'Online Booking', desc: 'Book appointments 24/7 from anywhere' },
              { icon: 'search', title: 'Service Tracking', desc: 'Real-time updates on your vehicle status' },
              { icon: 'history', title: 'Full History', desc: 'Complete record of all maintenance and repairs' },
            ].map(f => (
              <div key={f.title} className="lp-feature">
                <div className="lp-feature-icon">
                  <MaterialIcon name={f.icon} size={28} />
                </div>
                <div className="lp-feature-text">
                  <strong>{f.title}</strong> {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="lp-stats">
            <div className="lp-stat">
              <span className="lp-stat-num">15+</span>
              <span className="lp-stat-lbl">
                <MaterialIcon name="schedule" size={12} /> Years
              </span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">50K</span>
              <span className="lp-stat-lbl">
                <MaterialIcon name="people" size={12} /> Customers
              </span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">4.9★</span>
              <span className="lp-stat-lbl">
                <MaterialIcon name="star" size={12} /> Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="lp-right">
        <div className="lp-form-wrap">

          <div className="lp-form-header">
            <div className="lp-form-header-icon">
              <MaterialIcon name="vpn_key" size={32} />
            </div>
            <div className="lp-form-title">Welcome Back</div>
            <div className="lp-form-subtitle">Sign in to your Abe Garage account</div>
          </div>

          {error && (
            <div className="lp-error">
              <MaterialIcon name="error" size={16} style={{ marginRight: "8px", color: "var(--red)" }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="lp-field">
              <label className="lp-label">
                <MaterialIcon name="email" size={14} /> Email Address
              </label>
              <div className="lp-input-group">
                <div className="lp-input-prefix">
                  <MaterialIcon name="email" size={18} style={{ color: "var(--muted)" }} />
                </div>
                <input
                  className="lp-input2"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field" style={{ marginBottom: '8px', position: 'relative' }}>
              <label className="lp-label">
                <MaterialIcon name="lock" size={14} /> Password
              </label>
              <div className="lp-input-group">
                <div className="lp-input-prefix">
                  <MaterialIcon name="lock" size={18} style={{ color: "var(--muted)" }} />
                </div>
                <input
                  className="lp-input2"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
              </div>
              <button
                type="button"
                className="lp-input-toggle"
                style={{ top: '28px' }}
                onClick={() => setShowPass(p => !p)}
                tabIndex={-1}
              >
                {showPass ? (
                  <MaterialIcon name="visibility_off" size={20} />
                ) : (
                  <MaterialIcon name="visibility" size={20} />
                )}
              </button>
            </div>

            <div className="lp-row">
              <Link to="/forgot-password" className="lp-forgot">
                <MaterialIcon name="help" size={14} /> Forgot password?
              </Link>
            </div>

            <button type="submit" className="lp-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="lp-spinner"></div> Signing In...
                </>
              ) : (
                <>
                  <MaterialIcon name="arrow_forward" size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="lp-divider">
            <div className="lp-divider-line"></div>
            <span className="lp-divider-txt">
              <MaterialIcon name="circle" size={4} /> or <MaterialIcon name="circle" size={4} />
            </span>
            <div className="lp-divider-line"></div>
          </div>

          <div className="lp-register">
            <MaterialIcon name="person_add" size={14} style={{ marginRight: "4px" }} />
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>

          {/* Demo credentials */}
          <div className="lp-demo">
            <div className="lp-demo-head">
              <MaterialIcon name="science" size={16} style={{ marginRight: "6px" }} />
              Demo Credentials
            </div>
            <div className="lp-demo-body">
              <div className="lp-demo-col">
                <span className="lp-demo-role">
                  <MaterialIcon name="admin_panel_settings" size={14} /> Admin
                </span>
                <div className="lp-demo-cred">
                  <strong>admin@abegarage.com</strong><br />
                  admin123
                </div>
                <button className="lp-demo-btn" type="button" onClick={() => fillDemo('admin')}>
                  <MaterialIcon name="login" size={14} /> Use Admin
                </button>
              </div>
              <div className="lp-demo-col">
                <span className="lp-demo-role">
                  <MaterialIcon name="person" size={14} /> Customer
                </span>
                <div className="lp-demo-cred">
                  <strong>customer@email.com</strong><br />
                  password123
                </div>
                <button className="lp-demo-btn" type="button" onClick={() => fillDemo('customer')}>
                  <MaterialIcon name="login" size={14} /> Use Customer
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}