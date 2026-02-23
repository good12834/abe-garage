import { useState, useEffect, useRef } from "react";
import { servicesAPI } from "../services/api";
import "./Home.css";

// ─── Static Data ──────────────────────────────────────────────────────────────

const SERVICE_ICONS = {
  "Oil Change": "oil_barrel",
  "Brake Inspection": "build",
  "Engine Diagnostics": "electrical_services",
  "AC Service": "ac_unit",
  "Air Conditioning Service": "ac_unit",
  "Battery Replacement": "battery_charging_full",
  "Car Wash & Detail": "local_car_wash",
  "Transmission Service": "settings_applications",
  "Tire Installation": "tire_repair",
  "Brake Pad Replacement": "emergency",
  "Spark Plug Replacement": "bolt",
};

const SERVICE_IMAGES = {
  "Oil Change": "/pouring-golden-oil-from-bottle.jpg",
  "Tire Installation": "/tire.png",
  "Engine Diagnostics": "/close-up-nozzles-diesel-engine-opened-bonnet.jpg",
  "Car Wash & Detail": "/beautiful-car-washing-service.jpg",
  "Air Conditioning Service": "/person-using-ar-technology-their-daily-occupation.jpg",
  "Brake Inspection": "/mechanic-man-repairing-car.jpg",
  "Transmission Service": "/mechanic-man-repairing-car.jpg",
  "Battery Replacement": "/is.jpg",
  "Brake Pad Replacement": "/mechanic-man-repairing-car.jpg",
  "Spark Plug Replacement": "/mechanic-man-repairing-car.jpg",
  "default": "/mechanic-man-repairing-car.jpg"
};

const getServiceIcon = (name) => SERVICE_ICONS[name] || "build";
const getServiceImage = (name) => SERVICE_IMAGES[name] || SERVICE_IMAGES["default"];

const STATS = [
  { end: 15, suffix: "+", label: "Years Experience", icon: "emoji_events" },
  { end: 50, suffix: "K+", label: "Happy Customers", icon: "favorite" },
  { end: 25, suffix: "", label: "Expert Mechanics", icon: "groups" },
  { end: 99, suffix: "%", label: "Satisfaction Rate", icon: "star" },
];

const FEATURES = [
  { icon: "handyman", title: "Expert Mechanics", desc: "Certified professionals with years of experience across all makes and models." },
  { icon: "schedule", title: "Quick Turnaround", desc: "Many repairs completed same-day with our efficient diagnostic tools and team." },
  { icon: "verified", title: "12-Month Warranty", desc: "Full warranty on all parts and labor for complete peace of mind every time." },
  { icon: "location_on", title: "Convenient Location", desc: "Easy to reach service center with comfortable waiting area and free Wi-Fi." },
  { icon: "calendar_month", title: "Online Booking", desc: "Book 24/7 from any device with real-time availability and instant confirmation." },
  { icon: "payments", title: "Transparent Pricing", desc: "Clear upfront quotes with no hidden fees. Get your estimate before we start." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Book Online", desc: "Schedule your appointment online or call us. Choose your preferred date and time slot." },
  { step: "02", title: "Drop Off Vehicle", desc: "Bring your vehicle in. We'll provide a free inspection and detailed quote upfront." },
  { step: "03", title: "Expert Service", desc: "Our certified mechanics perform the work using quality OEM parts and modern tools." },
  { step: "04", title: "Drive Away Happy", desc: "Pick up your vehicle with confidence. All work is covered by our 12-month guarantee." },
];

const TESTIMONIALS = [
  { name: "John S.", role: "Business Owner", avatar: "JS", stars: 5, text: "Fast, friendly, and professional. They diagnosed and fixed my transmission issue in just one day. Completely transparent about the costs. Highly recommend!" },
  { name: "Sarah J.", role: "Teacher", avatar: "SJ", stars: 5, text: "They found a brake issue before it got worse. Their attention to detail literally saved me money. Amazing service, honest advice — won't go anywhere else." },
  { name: "Mike D.", role: "Software Engineer", avatar: "MD", stars: 5, text: "Trusted these guys with my car for 5 years. Fair prices, quality work, and they always explain everything clearly without upselling things I don't need." },
];

const TRUST_BADGES = [
  { icon: "school", title: "ASE Certified", desc: "All mechanics nationally certified" },
  { icon: "security", title: "12-Month Warranty", desc: "Full warranty on parts & labor" },
  { icon: "star", title: "5-Star Rated", desc: "Top-rated service in the region" },
  { icon: "family_history", title: "Family Owned", desc: "Proudly serving since 2009" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let t0 = null;
    const tick = (now) => {
      if (!t0) t0 = now;
      const p = Math.min((now - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 4)) * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);
  return { count, ref };
};

const useReveal = (threshold = 0.08) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
};

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

// ─── Sub Components ───────────────────────────────────────────────────────────

function StatCounter({ end, suffix }) {
  const { count, ref } = useCountUp(end);
  return <span ref={ref}>{end >= 1000 ? (count / 1000).toFixed(0) : count}{suffix}</span>;
}

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "" }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px` }}>
      {name}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [email, setEmail] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        const response = await servicesAPI.getAllServices({ active: true });
        if (response.data?.success && response.data?.data?.services) {
          // Limit to 6 services for the home page grid
          setServices(response.data.data.services.slice(0, 6));
        }
      } catch (err) {
        console.error("Error fetching services for home page:", err);
        setServicesError("Failed to load services");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  const heroRev = useReveal(0.01);
  const trustRev = useReveal();
  const statsRev = useReveal();
  const stepsRev = useReveal();
  const servicesRev = useReveal();
  const whyRev = useReveal();
  const testRev = useReveal();
  const newsletterRev = useReveal();
  const ctaRev = useReveal();

  const showToast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 3000); };

  const handleNewsletter = (e) => {
    e.preventDefault();
    showToast("✓ Subscribed! Watch your inbox for exclusive offers.");
    setEmail("");
  };

  return (
    <div className="home">
      <style>{S}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-lines"></div>
        <div className="hero-inner" ref={heroRev.ref}>
          <div className={`reveal ${heroRev.visible ? "in" : ""}`}>
            <div className="hero-eyebrow">Trusted by 50,000+ Customers</div>

            <p className="hero-sub">Professional automotive services with certified mechanics, transparent pricing, and a 12-month warranty on every job. Your vehicle deserves the best.</p>
            <div className="hero-ctas">
              <a href="/book-appointment" className="btn-primary">
                <MaterialIcon name="calendar_month" size={20} /> Book Service Now
              </a>
              <a href="/register" className="btn-outline">
                <MaterialIcon name="person_add" size={20} /> Create Account
              </a>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item"><MaterialIcon name="check_circle" size={18} /> ASE Certified</div>
              <div className="hero-trust-item"><MaterialIcon name="check_circle" size={18} /> 12-Month Warranty</div>
              <div className="hero-trust-item"><MaterialIcon name="check_circle" size={18} /> Same-Day Service</div>
            </div>
          </div>

          <div className={`hero-card reveal reveal-d2 ${heroRev.visible ? "in" : ""}`}>
            <div className="hero-card-badge">
              <MaterialIcon name="emergency" size={16} /> 24/7 Emergency
            </div>
            <div className="hero-card-row">
              <span className="hero-card-sublabel">
                <MaterialIcon name="phone" size={16} /> Emergency Line
              </span>
              <div className="hero-card-phone">+1 (123) 456-7891</div>
            </div>
            <div className="hero-card-row">
              <span className="hero-card-sublabel">
                <MaterialIcon name="schedule" size={16} /> Open Hours
              </span>
              <div className="hero-card-hours">
                <span>Mon – Sat: 8:00 AM – 6:00 PM</span>
                <span style={{ color: "var(--muted)" }}>Sun: Emergency Only</span>
              </div>
            </div>
            <a href="/book-appointment" className="btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }}>
              <MaterialIcon name="calendar_month" size={18} /> Schedule Now
            </a>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
          <span>Scroll down</span>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <div className="trust-strip">
        <div className={`trust-strip-inner reveal ${trustRev.visible ? "in" : ""}`} ref={trustRev.ref}>
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="trust-badge">
              <span className="trust-badge-icon">
                <MaterialIcon name={b.icon} size={24} />
              </span>
              <div>
                <div className="trust-badge-name">{b.title}</div>
                <div className="trust-badge-desc">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="wrap" style={{ padding: "60px 40px" }}>
          <div className={`stats-grid reveal ${statsRev.visible ? "in" : ""}`} ref={statsRev.ref}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-icon">
                  <MaterialIcon name={s.icon} size={32} />
                </span>
                <span className="stat-num"><StatCounter end={s.end} suffix={s.suffix} /></span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="wrap-dark" style={{ color: "var(--white)" }}>
        <div className={`wrap reveal ${stepsRev.visible ? "in" : ""}`} ref={stepsRev.ref}>
          <div className="center" style={{ marginBottom: "0" }}>
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Simple Process</div>
            <h2 className="sec-title">How It <em>Works</em></h2>
            <p className="sec-desc" style={{ margin: "0 auto", color: "var(--white)" }}>Get your vehicle serviced in 4 easy steps</p>
          </div>
          <div className="steps-grid" style={{ color: "var(--white)" }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} className="step-item" style={{ color: "var(--white)" }}>
                {i < HOW_IT_WORKS.length - 1 && <div className="step-connector"></div>}
                <span className="step-num" style={{ color: "var(--yellow)" }}>{s.step}</span>
                <div className="step-title" style={{ color: "var(--white)" }}>{s.title}</div>
                <p className="step-desc" style={{ color: "var(--white)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className={`wrap reveal ${servicesRev.visible ? "in" : ""}`} ref={servicesRev.ref}>
          <div className="center">
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Our Services</div>
            <h2 className="sec-title">Professional <em>Auto Services</em></h2>
            <p className="sec-desc" style={{ color: "var(--black)" }}>Comprehensive automotive care to keep your vehicle running at its best.</p>
          </div>
          <div className="services-grid" style={{ color: "var(--black)" }}>
            {servicesLoading ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p style={{ marginTop: "1rem" }}>Loading our services...</p>
              </div>
            ) : servicesError ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px", color: "var(--red)" }}>
                <p>{servicesError}</p>
              </div>
            ) : services.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
                <p>No services available at the moment.</p>
              </div>
            ) : (
              services.map((s, i) => (
                <a key={i} href={`/book-appointment?service=${s.id}`} className="service-card" style={{ backgroundColor: "var(--dark)", color: "var(--white)" }}>
                  <div className="service-card-image">
                    <img src={getServiceImage(s.name)} alt={s.name} />
                  </div>
                  <div className="service-card-top">
                    <span className="service-card-icon">
                      <MaterialIcon name={getServiceIcon(s.name)} size={32} />
                    </span>
                    <div className="service-card-name">{s.name}</div>
                    <p className="service-card-desc" style={{ color: "var(--white)" }}>
                      {s.description || "Professional automotive service"}
                    </p>
                  </div>
                  <div className="service-card-foot">
                    <div>
                      <span className="service-price">From ${s.base_price}</span>
                      <span className="service-duration" style={{ display: "block", marginTop: "2px" }}>
                        <MaterialIcon name="schedule" size={14} /> {s.duration_minutes} min
                      </span>
                    </div>
                    <span className="service-arrow">
                      <MaterialIcon name="arrow_forward" size={20} />
                    </span>
                  </div>
                </a>
              ))
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <a href="/services" className="btn-ghost">View All Services <MaterialIcon name="arrow_forward" size={16} /></a>
          </div>
        </div>
      </div>

      {/* ── WHY CHOOSE US ── */}
      <div className="wrap-dark">
        <div className={`wrap reveal ${whyRev.visible ? "in" : ""}`} ref={whyRev.ref}>
          <div className="why-grid" style={{ color: "var(--white)" }}>
            <div>
              <div className="sec-eyebrow">Why Choose Us</div>
              <h2 className="sec-title">The Abe Garage <em>Difference</em></h2>
              <p className="sec-desc" style={{ color: "var(--white)" }}>For over 15 years, delivering exceptional automotive care with a focus on quality, transparency, and customer satisfaction.</p>
              <div className="why-list" style={{ color: "var(--white)" }}>
                {FEATURES.slice(0, 3).map((f, i) => (
                  <div key={i} className="why-list-item">
                    <div className="why-check">
                      <MaterialIcon name="check_circle" size={20} />
                    </div>
                    <div>
                      <div className="why-item-title">{f.title}</div>
                      <p className="why-item-desc" style={{ color: "var(--white)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "28px" }}>
                <a href="/about" className="btn-primary">
                  <MaterialIcon name="info" size={18} /> Learn More About Us
                </a>
              </div>
            </div>
            <div className="feat-cards">
              {FEATURES.map((f, i) => (
                <div key={i} className="feat-card">
                  <span className="feat-card-icon">
                    <MaterialIcon name={f.icon} size={32} />
                  </span>
                  <div className="feat-card-title">{f.title}</div>
                  <p className="feat-card-desc" style={{ color: "var(--white)" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className={`wrap reveal ${testRev.visible ? "in" : ""}`} ref={testRev.ref}>
          <div className="center">
            <div className="sec-eyebrow" style={{ justifyContent: "center" }}>Testimonials</div>
            <h2 className="sec-title">What Our <em>Customers Say</em></h2>
            <p className="sec-desc" style={{ color: "var(--white)" }}>Real feedback from real customers who trust us with their vehicles every single day.</p>
          </div>
          <div className="test-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="test-card">
                <div className="test-head">
                  <div className="test-avatar">{t.avatar}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-role" style={{ color: "var(--white)" }}>{t.role}</div>
                  </div>
                </div>
                <div className="test-stars">
                  {[...Array(t.stars)].map((_, i) => (
                    <MaterialIcon key={i} name="star" size={16} />
                  ))}
                </div>
                <p className="test-text" style={{ color: "var(--white)" }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER ── */}
      <div className="wrap-dark">
        <div className={`wrap reveal ${newsletterRev.visible ? "in" : ""}`} ref={newsletterRev.ref}>
          <div className="newsletter-box">
            <div>
              <div className="newsletter-title">Stay <em>Updated</em></div>
              <p className="newsletter-desc" style={{ color: "var(--white)" }}>Subscribe to our newsletter for maintenance tips, special offers, and exclusive automotive news delivered monthly.</p>
            </div>
            <div>
              <form className="newsletter-form" onSubmit={handleNewsletter}>
                <input
                  type="email" placeholder="Enter your email address"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required className="newsletter-input"
                />
                <button type="submit" className="btn-primary" style={{ border: "none", cursor: "pointer" }}>
                  <MaterialIcon name="send" size={18} /> Subscribe
                </button>
              </form>
              <div className="newsletter-note">No spam, ever. Unsubscribe at any time.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA BLOCK ── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className={`wrap reveal ${ctaRev.visible ? "in" : ""}`} ref={ctaRev.ref}>
          <div className="cta-block">
            <div>
              <h3>Ready to <em>Get Started?</em></h3>
              <p style={{ color: "var(--white)" }}>Book your appointment today and get back on the road with complete confidence. Our team is ready.</p>
            </div>
            <div className="cta-actions">
              <a href="/book-appointment" className="btn-primary">
                <MaterialIcon name="calendar_month" size={18} /> Book Appointment
              </a>
              <a href="/register" className="btn-outline">
                <MaterialIcon name="person_add" size={18} /> Create Account
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMERGENCY STRIP ── */}
      <div className="emergency">
        <div className="emergency-inner">
          <div className="emergency-text">
            <MaterialIcon name="warning" size={20} style={{ color: "var(--yellow)" }} />
            <strong>Emergency?</strong>
            <span style={{ color: "var(--lighter)" }}>24/7 Roadside Assistance</span>
            <a href="tel:+11234567891">
              <MaterialIcon name="phone" size={16} /> +1 (123) 456-7891
            </a>
          </div>
          <a href="tel:+11234567891" className="btn-outline btn-sm">
            <MaterialIcon name="phone" size={16} /> Call Now
          </a>
        </div>
      </div>

      {/* ── FAB ── */}
      <a href="/book-appointment" className="fab">
        <MaterialIcon name="calendar_month" size={20} /> Book Now
      </a>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "var(--dark2)", border: "1px solid var(--green)", padding: "12px 24px", color: "var(--white)", fontSize: "14px", whiteSpace: "nowrap", animation: "fabIn 0.3s ease" }}>
          <MaterialIcon name="check_circle" size={16} style={{ color: "var(--green)", marginRight: "8px" }} />
          {toastMsg}
        </div>
      )}
    </div>
  );
}