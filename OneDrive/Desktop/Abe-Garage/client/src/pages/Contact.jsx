import { useState, useEffect } from "react";
import './Contact.css';

// FontAwesome imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter, faLinkedin, faYoutube } from "@fortawesome/free-brands-svg-icons";


// Material Icons font import
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const FAQS = [
  { q: "What are your business hours?", a: "Monday through Friday 8:00 AM – 6:00 PM, Saturday 8:00 AM – 4:00 PM. Closed Sundays. Emergency service is available 24/7." },
  { q: "Do I need an appointment for service?", a: "Walk-ins are welcome, but we recommend scheduling an appointment to ensure prompt service. Same-day appointments are often available for urgent repairs." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, cash, and most automotive financing plans. Financing options are available for larger repairs." },
  { q: "Do you provide warranty on repairs?", a: "Yes. Parts are covered by manufacturer warranty. Our labor is guaranteed for 12 months or 12,000 miles, whichever comes first." },
  { q: "Can you service all vehicle makes and models?", a: "Absolutely. Our certified technicians are trained for all makes and models — domestic, Asian, and European. We have the latest diagnostic equipment." },
];

const SOCIALS = [
  { icon: faFacebook, name: "Facebook", color: "#1877f2",},
  { icon: faInstagram, name: "Instagram", color: "#e4405f",},
  { icon: faTwitter, name: "Twitter", color: "#ccc",},
  { icon: faLinkedin, name: "LinkedIn", color: "#0a66c2",},
  { icon: faYoutube, name: "YouTube", color: "#ff0000",},
];

const STATS_TARGETS = { customers: 2500, services: 15000, years: 25, rating: 48 };

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

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [counters, setCounters] = useState({ customers: 0, services: 0, years: 0, rating: 0 });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const steps = 60; const duration = 2000; let step = 0;
    const t = setInterval(() => {
      step++;
      setCounters({
        customers: Math.min(Math.round((STATS_TARGETS.customers / steps) * step), STATS_TARGETS.customers),
        services: Math.min(Math.round((STATS_TARGETS.services / steps) * step), STATS_TARGETS.services),
        years: Math.min(Math.round((STATS_TARGETS.years / steps) * step), STATS_TARGETS.years),
        rating: Math.min(Math.round((STATS_TARGETS.rating / steps) * step), STATS_TARGETS.rating),
      });
      if (step >= steps) clearInterval(t);
    }, duration / steps);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, err = false) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1600));
    setSubmitting(false);
    setSuccess(true);
    showToast("✓ Message sent! We'll reply within 24 hours.");
    setTimeout(() => {
      setSuccess(false);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3500);
  };

  const toggleFaq = (i) => setOpenFaq(openFaq === i ? null : i);
  const copyToClipboard = (t) => { navigator.clipboard.writeText(t); showToast(`✓ Copied: ${t}`); };

  return (
    <div className="page">
      <style>{S}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <MaterialIcon name="support_agent" size={16} /> 24/7 Customer Support
          </div>
          <h1>Get In <em>Touch</em></h1>
          <p className="hero-sub">Ready to experience premium automotive care? Our expert team is here to help with all your service needs.</p>
          <div className="stats-strip">
            <div className="stat-box">
              <span className="stat-num">{counters.customers.toLocaleString()}+</span>
              <div className="stat-lbl">
                <MaterialIcon name="favorite" size={14} /> Happy Customers
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-num">{counters.services.toLocaleString()}+</span>
              <div className="stat-lbl">
                <MaterialIcon name="build" size={14} /> Services Done
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-num">{counters.years}+</span>
              <div className="stat-lbl">
                <MaterialIcon name="schedule" size={14} /> Years Experience
              </div>
            </div>
            <div className="stat-box">
              <span className="stat-num">{(counters.rating / 10).toFixed(1)}</span>
              <div className="stat-lbl">
                <MaterialIcon name="star" size={14} /> Rating
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* CONTACT */}
      <div style={{ position: "relative", zIndex: 1, background: "var(--black)" }}>
        <div className="section">
          <div className="sec-header">
            <div className="sec-eyebrow">
              <MaterialIcon name="contact_mail" size={16} /> Contact Us
            </div>
            <h2 className="sec-title">We're Here to <em>Help</em></h2>
            <p className="sec-desc">Whether you need a quote, want to schedule an appointment, or just have a question — we'd love to hear from you.</p>
          </div>

          <div className="contact-grid">
            {/* Sidebar */}
            <div>
              <div className="info-card">
                <div className="info-card-head">
                  <div className="info-card-icon">
                    <MaterialIcon name="location_on" size={24} />
                  </div>
                  <div className="info-card-title">Our Location</div>
                </div>
                <p className="info-line" style={{ color: "var(--white)", fontWeight: 600 }}>Abe Garage HQ</p>
                <p className="info-line">123 Automotive Drive, Suite 100</p>
                <p className="info-line">San Francisco, CA 94102</p>
                <a href="#map" className="dir-link">
                  <MaterialIcon name="directions" size={14} /> Get Directions
                </a>
              </div>

              <div className="info-card">
                <div className="info-card-head">
                  <div className="info-card-icon">
                    <MaterialIcon name="phone" size={24} />
                  </div>
                  <div className="info-card-title">Call Us</div>
                </div>
                <a href="tel:+14155551234" className="info-link">
                  <span className="info-link-lbl">
                    <MaterialIcon name="call" size={14} /> Main Line
                  </span>
                  <span className="info-link-val">(415) 555-1234</span>
                </a>
                <a href="tel:+14155559999" className="info-link emerg">
                  <span className="info-link-lbl">
                    <MaterialIcon name="warning" size={14} /> 24/7 Emergency
                  </span>
                  <span className="info-link-val">(415) 555-9999</span>
                </a>
              </div>

              <div className="info-card">
                <div className="info-card-head">
                  <div className="info-card-icon">
                    <MaterialIcon name="email" size={24} />
                  </div>
                  <div className="info-card-title">Email Us</div>
                </div>
                <div className="info-link" style={{ cursor: "pointer" }} onClick={() => copyToClipboard("service@abegarage.com")}>
                  <span className="info-link-lbl">
                    <MaterialIcon name="build" size={14} /> Service Inquiries
                  </span>
                  <span className="info-link-val">service@abegarage.com</span>
                </div>
                <div className="info-link" style={{ cursor: "pointer" }} onClick={() => copyToClipboard("parts@abegarage.com")}>
                  <span className="info-link-lbl">
                    <MaterialIcon name="inventory" size={14} /> Parts Department
                  </span>
                  <span className="info-link-val">parts@abegarage.com</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-card-head">
                  <div className="info-card-icon">
                    <MaterialIcon name="schedule" size={24} />
                  </div>
                  <div className="info-card-title">Business Hours</div>
                </div>
                {[
                  ["Mon – Fri", "8:00 AM – 6:00 PM", ""],
                  ["Saturday", "8:00 AM – 4:00 PM", ""],
                  ["Sunday", "Closed", "closed"],
                  ["Emergency", "24 / 7 Available", "emerg"],
                ].map(([d, t, cls]) => (
                  <div key={d} className={`hours-row ${cls}`}>
                    <span className="hours-day">{d}</span>
                    <span className="hours-time">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="form-card">
              <div className="form-card-head">
                <div className="form-card-icon">
                  <MaterialIcon name="chat" size={28} />
                </div>
                <div>
                  <h3>Send Us a Message</h3>
                  <p>We'll get back to you within 24 hours.</p>
                </div>
              </div>
              <form className="form-body" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">
                      <MaterialIcon name="person" size={16} /> Full Name *
                    </label>
                    <input className="field-input" type="text" name="name" value={form.name} onChange={handleChange} required placeholder="John Smith" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <MaterialIcon name="email" size={16} /> Email *
                    </label>
                    <input className="field-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">
                      <MaterialIcon name="phone" size={16} /> Phone
                    </label>
                    <input className="field-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="(555) 000-0000" />
                  </div>
                  <div className="field">
                    <label className="field-label">
                      <MaterialIcon name="sell" size={16} /> Subject *
                    </label>
                    <select className="field-input" name="subject" value={form.subject} onChange={handleChange} required>
                      <option value="">Select a subject</option>
                      <option>Service Appointment</option>
                      <option>Repair Quote</option>
                      <option>Emergency Service</option>
                      <option>Parts Inquiry</option>
                      <option>General Inquiry</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">
                    <MaterialIcon name="message" size={16} /> Your Message *
                  </label>
                  <textarea className="field-textarea" name="message" value={form.message} onChange={handleChange} required placeholder="Tell us how we can help you..." />
                </div>
                <button type="submit" className={`submit-btn ${submitting ? "disabled" : ""} ${success ? "success" : ""}`} disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="spinner"></div> Sending...
                    </>
                  ) : success ? (
                    <>
                      <MaterialIcon name="check_circle" size={16} /> Message Sent!
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="send" size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MAP */}
      <div id="map" className="map-wrap" style={{ position: "relative", zIndex: 1 }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555096471!2d-122.50764017948502!3d37.75780956920463!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1706745600000!5m2!1sen!2sus"
          title="Abe Garage Location" allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
        <div className="map-card-overlay">
          <div className="map-pin">
            <MaterialIcon name="location_on" size={32} style={{ color: "var(--red)" }} />
          </div>
          <h4>Abe Garage</h4>
          <p>123 Automotive Drive<br />San Francisco, CA 94102</p>
          <a href="https://maps.google.com/?q=San+Francisco+CA" target="_blank" rel="noopener noreferrer" className="map-cta">
            Open in Google Maps <MaterialIcon name="arrow_forward" size={14} />
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="faq-section">
        <div className="section">
          <div className="sec-header" style={{ textAlign: "center" }}>
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>
              <MaterialIcon name="help" size={16} /> FAQ
            </div>
            <h2 className="sec-title">Frequently Asked <em>Questions</em></h2>
            <p className="sec-desc" style={{ margin: "0 auto" }}>Quick answers to common questions about our services and policies.</p>
          </div>
          <div>
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item${openFaq === i ? " open" : ""}`} onClick={() => toggleFaq(i)}>
                <div className="faq-q">
                  <div className="faq-q-text">{f.q}</div>
                  <div className="faq-toggle">
                    {openFaq === i ? <MaterialIcon name="remove" size={18} /> : <MaterialIcon name="add" size={18} />}
                  </div>
                </div>
                <div className="faq-answer">
                  <div className="faq-answer-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="section">
          <div className="sec-header" style={{ textAlign: "center" }}>
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>
              <MaterialIcon name="rocket_launch" size={16} /> Get Started
            </div>
            <h2 className="sec-title">Connect With <em>Our Team</em></h2>
            <p className="sec-desc" style={{ margin: "0 auto" }}>Choose the best way to reach us and get the service you need, fast.</p>
          </div>
          <div className="action-cards">
            <div className="action-card">
              <div className="action-badge-tag">
                <MaterialIcon name="access_time" size={12} /> Available 24/7
              </div>
              <span className="action-icon-big">
                <MaterialIcon name="phone" size={48} />
              </span>
              <h3>Call Now</h3>
              <p>Speak directly with our service team for immediate assistance with your automotive needs.</p>
              <a href="tel:+14155551234" className="action-cta">
                <MaterialIcon name="phone" size={14} /> (415) 555-1234
              </a>
            </div>
            <div className="action-card primary-card">
              <div className="action-badge-tag">
                <MaterialIcon name="star" size={12} /> Most Popular
              </div>
              <span className="action-icon-big">
                <MaterialIcon name="edit_calendar" size={48} />
              </span>
              <h3>Book Online</h3>
              <p>Schedule your service appointment online at your convenience. Same-day appointments available.</p>
              <a href="/book-appointment" className="action-cta">
                <MaterialIcon name="calendar_month" size={14} /> Book Appointment
              </a>
            </div>
            <div className="action-card">
              <div className="action-badge-tag">
                <MaterialIcon name="bolt" size={12} /> Instant Response
              </div>
              <span className="action-icon-big">
                <MaterialIcon name="chat" size={48} />
              </span>
              <h3>Live Chat</h3>
              <p>Chat with our service advisors for quick questions and real-time support from certified techs.</p>
              <button className="action-cta" onClick={() => showToast("Live chat coming soon!")}>
                <MaterialIcon name="chat" size={14} /> Start Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SOCIAL */}
      <div className="social-strip">
        <h3>Connect With <span style={{ color: "var(--red)" }}>Us</span></h3>
        <p>Follow us for updates, tips, and exclusive offers</p>
        <div className="social-row">
          {SOCIALS.map((s, i) => (
            <a key={i} href="#" className="social-btn" onClick={e => { e.preventDefault(); showToast(`${s.name} coming soon!`); }}>
              <FontAwesomeIcon icon={s.icon} style={{ fontSize: "20px" }} />
              <span style={{ marginLeft: "10px" }}>{s.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-area">
          <div className={`toast-msg${toast.err ? " err" : ""}`}>
            <MaterialIcon name={toast.err ? "error" : "check_circle"} size={16} style={{ marginRight: "8px" }} />
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
