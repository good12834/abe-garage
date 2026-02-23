import { useState, useEffect, useRef } from "react";
import "./About.css";

// Font Awesome for social media icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(fab, fas);

// ─── Data ─────────────────────────────────────────────────────────────────────

const MILESTONES = [
  { year: "2014", title: "The Beginning", desc: "Founded as a small family-owned repair shop with just 2 bays and a dream to do things differently." },
  { year: "2016", title: "ASE Certification", desc: "Achieved national ASE certification, establishing our unwavering commitment to technical excellence." },
  { year: "2018", title: "Expansion", desc: "Doubled our facility size to 8 service bays to accommodate rapidly growing customer demand." },
  { year: "2020", title: "Digital Transformation", desc: "Implemented state-of-the-art diagnostics technology and launched our digital customer portal." },
  { year: "2022", title: "Award Winning", desc: "Recognized as 'Best Auto Shop' in the community choice awards for the second consecutive year." },
  { year: "2024", title: "Industry Leader", desc: "Now leading with EV-certified technicians, sustainable practices, and 5,000+ satisfied customers." },
];

const TESTIMONIALS = [
  { name: "Jennifer Martinez", role: "Business Owner", stars: 5, avatar: "JM", text: "Abe Garage has maintained my fleet of delivery vehicles for 3 years. Their preventive approach has saved us thousands in repair costs. Absolutely unmatched." },
  { name: "Robert Chen", role: "Software Engineer", stars: 5, avatar: "RC", text: "Finally found a shop that explains everything clearly. No surprises, fair pricing, and they actually care about getting it right the first time." },
  { name: "Amanda Foster", role: "Healthcare Professional", stars: 5, avatar: "AF", text: "As someone who knows nothing about cars, I appreciate how they take time to educate me. The digital inspection reports with photos give complete peace of mind." },
];

const TEAM = [
  {
    name: "Michael Rodriguez",
    role: "Master Technician & Owner",
    exp: "15+ years engine diagnostics & performance tuning.",
    badges: ["ASE Master", "BMW Certified"],
    color: "#e63329",
    social: {
      linkedin: "https://linkedin.com/in/michael",
      twitter: "https://twitter.com/michael",
      email: "michael@abegarage.com"
    }
  },
  {
    name: "Sarah Chen",
    role: "Lead Diagnostic Specialist",
    exp: "Expert in vehicle electronics and EV/hybrid systems with 12+ years experience.",
    badges: ["ASE L1", "EV Certified"],
    color: "#f5c518",
    social: {
      linkedin: "https://linkedin.com/in/sarah",
      github: "https://github.com/sarah",
      email: "sarah@abegarage.com"
    }
  },
  {
    name: "David Thompson",
    role: "Brake & Suspension Expert",
    exp: "Specialized in braking systems and suspension geometry. 10+ years experience.",
    badges: ["ASE P2", "Safety Certified"],
    color: "#22c55e",
    social: {
      linkedin: "https://linkedin.com/in/david",
      facebook: "https://facebook.com/david",
      email: "david@abegarage.com"
    }
  },
];

const VALUES = [
  { icon: "precision_manufacturing", title: "State-of-the-Art Equipment", desc: "Cutting-edge diagnostic tools and modern equipment ensure precise, efficient repairs with unparalleled accuracy.", features: ["OEM Diagnostic Tools", "Computer Alignment", "EV/Hybrid Certified"] },
  { icon: "verified", title: "Comprehensive Warranties", desc: "Every service backed by our comprehensive warranty program, providing peace of mind for your investment.", features: ["24-Month Parts Warranty", "12-Month Labor Guarantee", "Nationwide Coverage"], featured: true },
  { icon: "favorite", title: "Customer-Centric Approach", desc: "Transparent communication, honest recommendations, and genuine care for every vehicle that enters our facility.", features: ["Digital Inspections", "Real-Time Updates", "No Pressure Sales"] },
];

const FEATURES = [
  ["schedule", "Same-Day Service Available"], ["payments", "Transparent Pricing"],
  ["eco", "Eco-Friendly Practices"], ["local_shuttle", "Free Wi-Fi & Shuttle"],
  ["description", "Digital Service Records"], ["support_agent", "24/7 Emergency Support"],
];

const CERTS = [
  { icon: "verified", title: "ASE Certified", sub: "Automotive Service Excellence", color: "#e63329" },
  { icon: "emoji_events", title: "Top Rated 2024", sub: "Local Business Excellence", color: "#3b82f6" },
  { icon: "star", title: "5-Star Service", sub: "Customer Satisfaction", color: "#f5c518" },
  { icon: "military_tech", title: "Best Auto Shop", sub: "Community Choice 2023", color: "#a855f7" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

const useCountUp = (end, duration = 2200) => {
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
    let startTime = null;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(ease * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end, duration]);

  return { count, ref };
};

const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
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

// ─── Component ────────────────────────────────────────────────────────────────

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "" }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px` }}>
      {name}
    </span>
  );
}

// Social Media Icon component using Font Awesome
function SocialIcon({ platform, url }) {
  const getIcon = () => {
    switch (platform) {
      case 'linkedin':
        return <FontAwesomeIcon icon={['fab', 'linkedin-in']} />;
      case 'twitter':
        return <FontAwesomeIcon icon={['fab', 'twitter']} />;
      case 'facebook':
        return <FontAwesomeIcon icon={['fab', 'facebook-f']} />;
      case 'github':
        return <FontAwesomeIcon icon={['fab', 'github']} />;
      case 'email':
        return <FontAwesomeIcon icon={['fas', 'envelope']} />;
      default:
        return <FontAwesomeIcon icon={['fas', 'link']} />;
    }
  };

  return (
    <a href={url} className="team-social-btn" target="_blank" rel="noopener noreferrer">
      {getIcon()}
    </a>
  );
}

export default function About() {
  const { count: yearsC, ref: yearsR } = useCountUp(10);
  const { count: vehiclesC, ref: vehiclesR } = useCountUp(5000);
  const { count: mechanicsC, ref: mechanicsR } = useCountUp(15);
  const { count: satisfyC, ref: satisfyR } = useCountUp(98);

  const heroRev = useReveal();
  const storyRev = useReveal();
  const valRev = useReveal();
  const timeRev = useReveal();
  const testRev = useReveal();
  const teamRev = useReveal();

  return (
    <div className="page">
      <style>{S}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-l"></div>
        <div className="hero-bg-r"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content" ref={heroRev.ref}>
          <div className="hero-eyebrow">Industry Leaders Since 2014</div>
          <h1>Driving <em>Excellence</em><br />in Automotive Care</h1>
          <p className="hero-sub">Where precision meets passion. We don't just service vehicles — we build lasting relationships through transparency, expertise, and uncompromising quality.</p>
          <div className="hero-stats">
            <div className="h-stat">
              <span className="h-stat-num">10+</span>
              <span className="h-stat-lbl"><MaterialIcon name="emoji_events" size={16} /> Years of Excellence</span>
            </div>
            <div className="h-stat">
              <span className="h-stat-num">5,000+</span>
              <span className="h-stat-lbl"><MaterialIcon name="favorite" size={16} /> Happy Customers</span>
            </div>
            <div className="h-stat">
              <span className="h-stat-num">98%</span>
              <span className="h-stat-lbl"><MaterialIcon name="star" size={16} /> Satisfaction Rate</span>
            </div>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-mouse"><div className="scroll-wheel"></div></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── STORY ── */}
      <div className="story-wrap">
        <div className={`sec reveal ${storyRev.visible ? "in" : ""}`} ref={storyRev.ref}>
          <div className="story-grid">
            {/* Left: text */}
            <div>
              <div className="story-label">Our Story</div>
              <h2 className="sec-title">A Legacy Built on<br /><em>Trust & Excellence</em></h2>
              <p className="story-text">Founded in 2014 with a singular vision: to revolutionize automotive service through uncompromising quality and genuine care for every vehicle that rolls through our doors.</p>
              <p className="story-text">What began as a small family-owned shop has evolved into a comprehensive automotive service center, recognized for our commitment to excellence. Our ASE-certified technicians blend time-honored craftsmanship with cutting-edge diagnostic technology.</p>
              <p className="story-text">Every vehicle that enters our facility receives the same meticulous attention to detail, whether it's routine maintenance or complex engine reconstruction. We don't just fix cars — we restore confidence and ensure safety on the road.</p>
              <div className="mission-box">
                <div className="mission-icon-wrap">
                  <MaterialIcon name="track_changes" size={28} />
                </div>
                <div>
                  <div className="mission-title">Our Mission</div>
                  <p className="mission-text">To provide automotive excellence that exceeds expectations, builds lasting relationships, and keeps our community moving safely and confidently.</p>
                </div>
              </div>
            </div>

            {/* Right: image, certs, stats */}
            <div className="img-side">
              <div className="img-main">
                <img src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?q=80&w=1740&auto=format&fit=crop" alt="Abe Garage Workshop" />
                <div className="img-badge">
                  <MaterialIcon name="verified" size={16} /> Certified Excellence
                </div>
                <div className="exp-badge">
                  <span className="exp-num">10+</span>
                  <span className="exp-lbl"><MaterialIcon name="schedule" size={14} /> Years</span>
                </div>
              </div>

              <div className="certs-grid">
                {CERTS.map((c, i) => (
                  <div key={i} className="cert-card">
                    <div className="cert-icon-box">
                      <MaterialIcon name={c.icon} size={24} style={{ color: c.color }} />
                    </div>
                    <div>
                      <div className="cert-name">{c.title}</div>
                      <div className="cert-sub">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="stats-4">
                <div className="stat-card4" ref={yearsR}>
                  <span className="stat-card4-num">{yearsC}+</span>
                  <span className="stat-card4-lbl"><MaterialIcon name="schedule" size={14} /> Years</span>
                </div>
                <div className="stat-card4" ref={vehiclesR}>
                  <span className="stat-card4-num">{vehiclesC.toLocaleString()}+</span>
                  <span className="stat-card4-lbl"><MaterialIcon name="directions_car" size={14} /> Vehicles</span>
                </div>
                <div className="stat-card4" ref={mechanicsR}>
                  <span className="stat-card4-num">{mechanicsC}+</span>
                  <span className="stat-card4-lbl"><MaterialIcon name="groups" size={14} /> Mechanics</span>
                </div>
                <div className="stat-card4" ref={satisfyR}>
                  <span className="stat-card4-num">{satisfyC}%</span>
                  <span className="stat-card4-lbl"><MaterialIcon name="thumb_up" size={14} /> Satisfied</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── VALUES ── */}
      <div className="values-wrap">
        <div className={`sec reveal ${valRev.visible ? "in" : ""}`} ref={valRev.ref}>
          <div className="sec-header-center">
            <div className="sec-eyebrow">Why Choose Us</div>
            <h2 className="sec-title">The Abe Garage <em>Difference</em></h2>
            <p className="sec-desc">Experience the difference that comes from a decade of automotive excellence and genuine passion for quality work.</p>
          </div>
          <div className="val-cards">
            {VALUES.map((v, i) => (
              <div key={i} className={`val-card${v.featured ? " featured" : ""}`}>
                {v.featured && <div className="feat-tag"><MaterialIcon name="star" size={14} /> Most Popular</div>}
                <span className="val-icon">
                  <MaterialIcon name={v.icon} size={40} />
                </span>
                <div className="val-title">{v.title}</div>
                <p className="val-desc">{v.desc}</p>
                <div className="val-feats">
                  {v.features.map((f, j) => (
                    <div key={j} className="val-feat">
                      <MaterialIcon name="check_circle" size={14} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="features-strip">
            {FEATURES.map(([icon, lbl], i) => (
              <div key={i} className="feat-strip-item">
                <MaterialIcon name={icon} size={20} />
                <span>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className="timeline-wrap">
        <div className={`sec reveal ${timeRev.visible ? "in" : ""}`} ref={timeRev.ref}>
          <div className="sec-header-center">
            <div className="sec-eyebrow">Our Journey</div>
            <h2 className="sec-title">Milestones of <em>Success</em></h2>
            <p className="sec-desc">A decade of growth, innovation, and unwavering commitment to excellence in automotive care.</p>
          </div>
          <div className="timeline">
            {MILESTONES.map((m, i) => {
              const isLeft = i % 2 === 0;
              return isLeft ? (
                <div key={i} className="tl-item-left" style={{ gridColumn: 1, gridRow: i + 1 }}>
                  <span className="tl-year">
                    <MaterialIcon name="event" size={14} /> {m.year}
                  </span>
                  <div className="tl-title">{m.title}</div>
                  <p className="tl-desc">{m.desc}</p>
                </div>
              ) : (
                <div key={i} className="tl-item-right" style={{ gridColumn: 3, gridRow: i + 1 }}>
                  <span className="tl-year">
                    <MaterialIcon name="event" size={14} /> {m.year}
                  </span>
                  <div className="tl-title">{m.title}</div>
                  <p className="tl-desc">{m.desc}</p>
                </div>
              );
            })}
            <div className="tl-line" style={{ gridColumn: 2, gridRow: `1 / ${MILESTONES.length + 1}` }}>
              {MILESTONES.map((_, i) => (
                <div key={i} className="tl-dot" style={{ marginTop: i === 0 ? "28px" : "56px" }}>
                  <MaterialIcon name="circle" size={12} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="test-wrap">
        <div className={`sec reveal ${testRev.visible ? "in" : ""}`} ref={testRev.ref}>
          <div className="sec-header-center">
            <div className="sec-eyebrow">Testimonials</div>
            <h2 className="sec-title">What Our <em>Customers Say</em></h2>
            <p className="sec-desc">Real stories from real customers who trust us with their vehicles every day.</p>
          </div>
          <div className="test-cards">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="test-card">
                <div className="test-head">
                  <div className="test-avatar">{t.avatar}</div>
                  <div>
                    <div className="test-name">{t.name}</div>
                    <div className="test-role">{t.role}</div>
                  </div>
                </div>
                <div className="test-stars">
                  {[...Array(t.stars)].map((_, i) => (
                    <MaterialIcon key={i} name="star" size={16} />
                  ))}
                </div>
                <p className="test-text">"{t.text}"</p>
              </div>
            ))}
          </div>
          <div className="trust-row">
            {[
              ["public", "4.9", "Google Rating"],
              ["location_on", "5.0", "Yelp Rating"],
              ["thumb_up", "4.8", "Facebook Rating"]
            ].map(([icon, score, lbl]) => (
              <div key={lbl} className="trust-item">
                <span className="trust-platform-icon">
                  <MaterialIcon name={icon} size={24} />
                </span>
                <div>
                  <span className="trust-score">{score}</span>
                  <span className="trust-lbl">{lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div className="team-wrap">
        <div className={`sec reveal ${teamRev.visible ? "in" : ""}`} ref={teamRev.ref}>
          <div className="sec-header-center">
            <div className="sec-eyebrow">Our Team</div>
            <h2 className="sec-title">Meet Our <em>Expert Team</em></h2>
            <p className="sec-desc">Certified professionals dedicated to delivering automotive excellence on every single job.</p>
          </div>
          <div className="team-cards">
            {TEAM.map((t, i) => (
              <div key={i} className="team-card">
                <div className="team-top">
                  <div className="team-avatar" style={{ background: t.color }}>
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="team-name">{t.name}</div>
                  <span className="team-role">{t.role}</span>
                  <div className="team-socials">
                    {Object.entries(t.social).map(([platform, url]) => (
                      <SocialIcon key={platform} platform={platform} url={url} />
                    ))}
                  </div>
                </div>
                <div className="team-bottom">
                  <p className="team-exp">{t.exp}</p>
                  <div className="badge-row">
                    {t.badges.map((b, j) => (
                      <span key={j} className="cert-badge">
                        <MaterialIcon name="verified" size={12} /> {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="cta-wrap">
        <div className="cta-inner">
          <h2>Ready to Experience<br />the <em>Difference?</em></h2>
          <p>Join thousands of satisfied customers who trust Abe Garage with their most valuable asset. Book your appointment today and feel the difference.</p>
          <div className="cta-btns">
            <a href="/book-appointment" className="cta-btn-main">
              <MaterialIcon name="calendar_month" size={18} /> Book Appointment
            </a>
            <a href="/contact" className="cta-btn-out">
              <MaterialIcon name="phone" size={18} /> Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}