
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import './Register.css';

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

// Password strength calculator
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'var(--red)', pct: 20 };
  if (score <= 2) return { score, label: 'Fair', color: 'var(--orange, #f97316)', pct: 45 };
  if (score <= 3) return { score, label: 'Good', color: 'var(--yellow)', pct: 68 };
  return { score, label: 'Strong', color: 'var(--green)', pct: 100 };
};

export default function Register() {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [terms, setTerms] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(form.password);
  const passMatch = form.confirmPassword && form.password === form.confirmPassword;
  const passMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (!terms) { setError('You must agree to the Terms of Service and Privacy Policy.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await register({ firstName:form.firstName, lastName:form.lastName, email:form.email, phone:form.phone, password:form.password });
      if (result.success) navigate('/');
      else setError(result.message || 'Registration failed. Please try again.');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Registration error:', err);
    } finally { setLoading(false); }
  };

  // Determine step
  const step1Done = form.firstName && form.lastName;
  const step2Done = step1Done && form.email;
  const step3Done = step2Done && form.password && passMatch;

  return (
    <div className="rp">
      <style>{S}</style>

      {/* ── LEFT PANEL ── */}
      <div className="rp-left">
        <div className="rp-left-inner">
          <div>
            <Link to="/" className="rp-brand">
              <div className="rp-brand-icon">
                <MaterialIcon name="build" size={32} />
              </div>
              <div>
                <span className="rp-brand-name">ABE<span>GARAGE</span></span>
                <span className="rp-brand-tag">Certified Excellence</span>
              </div>
            </Link>

            <div className="rp-eyebrow">
              <MaterialIcon name="person_add" size={14} /> New Member
            </div>
            <h1 className="rp-title">
              Start Your<br /><em>Journey</em><br />With Us
            </h1>
            <p className="rp-desc">
              Create your free account and unlock full access to online booking, service history, vehicle tracking, and exclusive member benefits.
            </p>

            <div className="rp-perks">
              {[
                { n:'01', icon:'event', title:'Book in Seconds', desc:'Schedule any service online, 24/7' },
                { n:'02', icon:'visibility', title:'Full Transparency', desc:'Track your vehicle in real-time' },
                { n:'03', icon:'card_giftcard', title:'Loyalty Rewards', desc:'Earn points on every service visit' },
                { n:'04', icon:'folder', title:'Digital Records', desc:'All your history, always accessible' },
              ].map(p => (
                <div key={p.n} className="rp-perk">
                  <div className="rp-perk-num">{p.n}</div>
                  <div className="rp-perk-text">
                    <MaterialIcon name={p.icon} size={16} style={{ marginRight: "4px" }} />
                    <strong>{p.title}</strong>
                    <span>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rp-trust">
            {[
              ['verified', 'ASE Certified'],
              ['star', '4.9 Rating'],
              ['security', 'Secure & Private'],
              ['card_giftcard', 'Free to Join']
            ].map(([icon, lbl]) => (
              <div key={lbl} className="rp-trust-item">
                <span className="rp-trust-icon">
                  <MaterialIcon name={icon} size={20} />
                </span>
                <span className="rp-trust-lbl">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="rp-right">
        <div className="rp-form-wrap">

          <div className="rp-form-header">
            <div className="rp-form-header-icon">
              <MaterialIcon name="rocket_launch" size={32} />
            </div>
            <div className="rp-form-title">Create Account</div>
            <div className="rp-form-subtitle">Join Abe Garage — it's free and takes under a minute</div>
          </div>

          {/* Step indicator */}
          <div className="rp-steps">
            <div className="rp-step">
              <div className={`rp-step-dot${step1Done?' done':' active'}`}>
                {step1Done ? <MaterialIcon name="check" size={14} /> : '1'}
              </div>
              <span className={`rp-step-lbl${step1Done?' done':' active'}`}>
                <MaterialIcon name="badge" size={12} /> Identity
              </span>
            </div>
            <div className={`rp-step-line${step1Done?' done':''}`}></div>
            <div className="rp-step">
              <div className={`rp-step-dot${step2Done?' done':step1Done?' active':''}`}>
                {step2Done ? <MaterialIcon name="check" size={14} /> : '2'}
              </div>
              <span className={`rp-step-lbl${step2Done?' done':step1Done?' active':''}`}>
                <MaterialIcon name="contact_mail" size={12} /> Contact
              </span>
            </div>
            <div className={`rp-step-line${step2Done?' done':''}`}></div>
            <div className="rp-step">
              <div className={`rp-step-dot${step3Done?' done':step2Done?' active':''}`}>
                {step3Done ? <MaterialIcon name="check" size={14} /> : '3'}
              </div>
              <span className={`rp-step-lbl${step3Done?' done':step2Done?' active':''}`}>
                <MaterialIcon name="lock" size={12} /> Security
              </span>
            </div>
          </div>

          {error && (
            <div className="rp-alert error">
              <MaterialIcon name="error" size={16} style={{ marginRight: "8px" }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* Step 1: Name */}
            <div className="rp-form-section-label">
              <MaterialIcon name="badge" size={16} /> Personal Info
            </div>
            <div className="rp-grid2">
              <div className="rp-field">
                <label className="rp-label req">
                  <MaterialIcon name="person" size={14} /> First Name
                </label>
                <div className="rp-input-group">
                  <div className="rp-input-prefix">
                    <MaterialIcon name="person" size={18} style={{ color: "var(--muted)" }} />
                  </div>
                  <input name="firstName" className="rp-input" placeholder="John" value={form.firstName} onChange={handleChange} required autoComplete="given-name" />
                </div>
              </div>
              <div className="rp-field">
                <label className="rp-label req">
                  <MaterialIcon name="person" size={14} /> Last Name
                </label>
                <div className="rp-input-group">
                  <div className="rp-input-prefix">
                    <MaterialIcon name="person" size={18} style={{ color: "var(--muted)" }} />
                  </div>
                  <input name="lastName" className="rp-input" placeholder="Doe" value={form.lastName} onChange={handleChange} required autoComplete="family-name" />
                </div>
              </div>
            </div>

            {/* Step 2: Contact */}
            <div className="rp-form-section-label" style={{ marginTop:'8px' }}>
              <MaterialIcon name="contact_mail" size={16} /> Contact Details
            </div>
            <div className="rp-field">
              <label className="rp-label req">
                <MaterialIcon name="email" size={14} /> Email Address
              </label>
              <div className="rp-input-group">
                <div className="rp-input-prefix">
                  <MaterialIcon name="email" size={18} style={{ color: "var(--muted)" }} />
                </div>
                <input name="email" type="email" className="rp-input" placeholder="john.doe@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
              </div>
            </div>
            <div className="rp-field">
              <label className="rp-label">
                <MaterialIcon name="phone" size={14} /> Phone Number <span style={{ color:'var(--muted)', fontWeight:400, textTransform:'none', fontSize:'11px', letterSpacing:0 }}>(optional)</span>
              </label>
              <div className="rp-input-group">
                <div className="rp-input-prefix">
                  <MaterialIcon name="phone" size={18} style={{ color: "var(--muted)" }} />
                </div>
                <input name="phone" type="tel" className="rp-input" placeholder="(123) 456-7890" value={form.phone} onChange={handleChange} autoComplete="tel" />
              </div>
            </div>

            {/* Step 3: Security */}
            <div className="rp-form-section-label" style={{ marginTop:'8px' }}>
              <MaterialIcon name="security" size={16} /> Security
            </div>
            <div className="rp-grid2">
              <div className="rp-field" style={{ marginBottom:0 }}>
                <label className="rp-label req">
                  <MaterialIcon name="lock" size={14} /> Password
                </label>
                <div className="rp-input-group">
                  <div className="rp-input-prefix">
                    <MaterialIcon name="lock" size={18} style={{ color: "var(--muted)" }} />
                  </div>
                  <div className="rp-pass-wrap">
                    <input
                      name="password" type={showPass ? 'text' : 'password'}
                      className="rp-pass-input" placeholder="Min. 6 chars"
                      value={form.password} onChange={handleChange}
                      required autoComplete="new-password"
                    />
                    <button type="button" className="rp-pass-toggle" onClick={() => setShowPass(p=>!p)} tabIndex={-1}>
                      {showPass ? <MaterialIcon name="visibility_off" size={18} /> : <MaterialIcon name="visibility" size={18} />}
                    </button>
                  </div>
                </div>
                {form.password && (
                  <div className="rp-strength">
                    <div className="rp-strength-bar">
                      <div className="rp-strength-fill" style={{ width:`${strength.pct}%`, background:strength.color }}></div>
                    </div>
                    <span className="rp-strength-txt" style={{ color:strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div className="rp-field" style={{ marginBottom:0 }}>
                <label className="rp-label req">
                  <MaterialIcon name="lock" size={14} /> Confirm Password
                </label>
                <div className="rp-input-group">
                  <div className="rp-input-prefix">
                    {passMismatch ? (
                      <MaterialIcon name="error" size={18} style={{ color: "var(--red)" }} />
                    ) : passMatch ? (
                      <MaterialIcon name="check_circle" size={18} style={{ color: "var(--green)" }} />
                    ) : (
                      <MaterialIcon name="lock" size={18} style={{ color: "var(--muted)" }} />
                    )}
                  </div>
                  <div className="rp-pass-wrap">
                    <input
                      name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                      className={`rp-pass-input${passMismatch ? ' has-error' : passMatch ? ' has-success' : ''}`}
                      style={{ borderLeft:'none' }}
                      placeholder="Repeat password"
                      value={form.confirmPassword} onChange={handleChange}
                      required autoComplete="new-password"
                    />
                    <button type="button" className="rp-pass-toggle" onClick={() => setShowConfirm(p=>!p)} tabIndex={-1}>
                      {showConfirm ? <MaterialIcon name="visibility_off" size={18} /> : <MaterialIcon name="visibility" size={18} />}
                    </button>
                  </div>
                </div>
                {passMismatch && (
                  <div style={{ fontSize:'11px', color:'var(--red)', marginTop:'6px', fontFamily:'var(--fd)', textTransform:'uppercase', letterSpacing:'1px' }}>
                    <MaterialIcon name="error" size={12} style={{ marginRight: "4px" }} /> Passwords don't match
                  </div>
                )}
                {passMatch && (
                  <div style={{ fontSize:'11px', color:'var(--green)', marginTop:'6px', fontFamily:'var(--fd)', textTransform:'uppercase', letterSpacing:'1px' }}>
                    <MaterialIcon name="check_circle" size={12} style={{ marginRight: "4px" }} /> Passwords match
                  </div>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="rp-terms" style={{ marginTop:'16px' }}>
              <input type="checkbox" className="rp-checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} />
              <label htmlFor="terms" className="rp-terms-txt">
                <MaterialIcon name="privacy_tip" size={14} style={{ marginRight: "4px" }} />
                I agree to Abe Garage's{' '}
                <Link to="/terms">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
                Your data is stored securely and never sold.
              </label>
            </div>

            <button type="submit" className="rp-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="rp-spinner"></div> Creating Account...
                </>
              ) : (
                <>
                  <MaterialIcon name="arrow_forward" size={18} /> Create My Account
                </>
              )}
            </button>
          </form>

          <div className="rp-divider">
            <div className="rp-divider-line"></div>
            <span className="rp-divider-txt">
              <MaterialIcon name="circle" size={4} /> or <MaterialIcon name="circle" size={4} />
            </span>
            <div className="rp-divider-line"></div>
          </div>

          <div className="rp-login">
            <MaterialIcon name="login" size={14} style={{ marginRight: "4px" }} />
            Already have an account?{' '}
            <Link to="/login">Sign in here</Link>
          </div>

        </div>
      </div>
    </div>
  );
}