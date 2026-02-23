import { useState } from "react";
import './BookAppointment.css';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const SERVICES = [
  { id: 1, name: "Oil Change", icon: "oil_barrel", duration: "45 min", price: 49, popular: true },
  { id: 2, name: "Brake Service", icon: "build", duration: "90 min", price: 189, popular: true },
  { id: 3, name: "Engine Diagnostics", icon: "electrical_services", duration: "60 min", price: 99 },
  { id: 4, name: "Tire Rotation", icon: "rotate_left", duration: "30 min", price: 39 },
  { id: 5, name: "Battery Replacement", icon: "battery_charging_full", duration: "45 min", price: 129 },
  { id: 6, name: "AC Service", icon: "ac_unit", duration: "75 min", price: 149 },
  { id: 7, name: "Wheel Alignment", icon: "adjust", duration: "60 min", price: 89 },
  { id: 8, name: "Full Inspection", icon: "search", duration: "120 min", price: 79 },
];

const TIMES = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

const MAKES = ["Acura", "Audi", "BMW", "Chevrolet", "Ford", "Honda", "Hyundai", "Jeep", "Kia", "Lexus", "Mazda", "Mercedes-Benz", "Nissan", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"];

const styles = `
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

const BookingSummaryContent = ({
  selectedService,
  subtotal,
  shopFee,
  tax,
  total,
  form,
  isMobile = false
}) => (
  <>
    {selectedService ? (
      <div>
        {!isMobile && <div className="side-card-title">Booking Summary</div>}
        <div className="summary-service">
          <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "6px", letterSpacing: "1.5px", textTransform: "uppercase", fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "700" }}>Selected Plan</div>
          <div className="summary-service-header">
            <span className="summary-service-icon">
              <MaterialIcon name={selectedService.icon} size={28} />
            </span>
            <div className="summary-service-name">{selectedService.name}</div>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Shop Fee</span>
            <strong>${shopFee.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>Est. Tax (8%)</span>
            <strong>${tax.toFixed(2)}</strong>
          </div>

          {(form.date || form.time || form.make) && (
            <div className="summary-details-group">
              {form.date && <div className="summary-row">
                <span>
                  <MaterialIcon name="event" size={14} /> Contactless Date
                </span>
                <strong>{new Date(form.date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
              </div>}
              {form.time && <div className="summary-row">
                <span>
                  <MaterialIcon name="schedule" size={14} /> Arrival Window
                </span>
                <strong>{form.time}</strong>
              </div>}
              {form.make && <div className="summary-row">
                <span>
                  <MaterialIcon name="directions_car" size={14} /> Vehicle Spec
                </span>
                <strong>{form.make} {form.model}</strong>
              </div>}
            </div>
          )}
        </div>

        <div className="promo-box">
          <input type="text" placeholder="PROMO CODE" className="promo-input" />
          <button className="promo-btn" type="button">Apply</button>
        </div>

        <div className="summary-total">
          <span>Estimated Total</span>
          <strong>${total.toFixed(2)}</strong>
        </div>

        {isMobile && (
          <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "12px", textAlign: "center" }}>
            * Final price may vary based on vehicle inspection.
          </p>
        )}
      </div>
    ) : (
      <div style={{ color: "var(--muted)", fontSize: "14px", padding: "30px 0", textAlign: "center" }}>
        {!isMobile && <div className="side-card-title">Booking Summary</div>}
        <div style={{ fontSize: "40px", marginBottom: "12px", opacity: "0.5" }}>
          <MaterialIcon name="build" size={48} style={{ opacity: "0.5" }} />
        </div>
        <p style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>Summary Unavailable</p>
        <p style={{ fontSize: "12px", marginTop: "4px" }}>Select a service to see your breakdown</p>
      </div>
    )}
  </>
);

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState({
    date: "", time: "", make: "", model: "", year: new Date().getFullYear(),
    description: "", name: "", phone: "", email: "", notes: "", terms: false,
    firstVisit: false, sms: true
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [refNum] = useState(() => "ABG-" + Math.floor(10000 + Math.random() * 90000));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Calculations
  const subtotal = selectedService ? selectedService.price : 0;
  const shopFee = selectedService ? 15 : 0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shopFee + tax;

  const handleServiceSelect = (svc) => {
    setSelectedService(svc);
    if (step < 2) setStep(2);
    showToast(`✓ ${svc.name} selected`);
  };

  const handleTimeSelect = (t) => {
    setForm(f => ({ ...f, time: t }));
    if (step < 3) setStep(3);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (name === "make") setForm(f => ({ ...f, make: value, model: "" }));
    if ((name === "make" || name === "model") && step < 4) setStep(4);
  };

  const canSubmit = selectedService && form.date && form.time && form.make && form.model && form.description && form.name && form.phone && form.email && form.terms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) { showToast("⚠ Please complete all required fields"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setDone(true);
  };

  const modelsByMake = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Prius"],
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "HR-V"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape", "Ranger", "Bronco"],
    Chevrolet: ["Silverado", "Equinox", "Tahoe", "Camaro", "Malibu"],
    BMW: ["3 Series", "5 Series", "X3", "X5", "M3", "M5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE"],
    Audi: ["A4", "A6", "Q5", "Q7", "e-tron"],
    Volkswagen: ["Golf", "Jetta", "Passat", "Tiguan", "Atlas"],
    Nissan: ["Altima", "Rogue", "Sentra", "Maxima", "Murano"],
    Hyundai: ["Elantra", "Tucson", "Santa Fe", "Sonata", "Palisade"],
    Kia: ["Sportage", "Sorento", "Telluride", "Forte", "Soul"],
    Subaru: ["Outback", "Forester", "Crosstrek", "Impreza", "WRX"],
    Mazda: ["CX-5", "Mazda3", "CX-9", "MX-5 Miata"],
    Lexus: ["RX", "ES", "NX", "GX", "IS"],
    Jeep: ["Wrangler", "Grand Cherokee", "Compass", "Gladiator"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
    Volvo: ["XC60", "XC90", "S60", "V60"],
    Acura: ["MDX", "RDX", "TLX", "ILX"],
  };

  const getStepClass = (s) => {
    if (step > s) return "done";
    if (step === s) return "active";
    return "";
  };

  if (done) {
    return (
      <div className="page">
        <style>{styles}</style>
        <div className="success-screen">
          <div className="success-icon">
            <MaterialIcon name="celebration" size={64} />
          </div>
          <h2>Appointment <em style={{ WebkitTextStroke: "1.5px #f5f5f0", color: "transparent" }}>Confirmed</em></h2>
          <div className="success-ref">Confirmation #: {refNum}</div>

          <div className="success-summary">
            <div className="success-summary-row">
              <span className="label">
                <MaterialIcon name="build" size={14} /> Service
              </span>
              <span className="value">{selectedService?.name}</span>
            </div>
            <div className="success-summary-row">
              <span className="label">
                <MaterialIcon name="event" size={14} /> Date & Time
              </span>
              <span className="value">{new Date(form.date + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} at {form.time}</span>
            </div>
            <div className="success-summary-row">
              <span className="label">
                <MaterialIcon name="directions_car" size={14} /> Vehicle
              </span>
              <span className="value">{form.year} {form.make} {form.model}</span>
            </div>
          </div>

          <p style={{ color: "var(--light)", maxWidth: "500px", margin: "0 auto 32px", lineHeight: "1.6" }}>
            A confirmation email has been sent to <strong>{form.email}</strong>.
            We'll also send an SMS reminder to <strong>{form.phone}</strong> 24 hours before your appointment.
          </p>
          <button className="confirm-btn" onClick={() => window.location.reload()} style={{ padding: "16px 40px", width: "auto" }}>
            Book Another Appointment <MaterialIcon name="arrow_forward" size={16} />
          </button>
        </div>
        <div className="about-cta-section" style={{ marginTop: "0" }}>
          <div className="cta-content">
            <div className="section-label">Need Help?</div>
            <h2 className="professional-section-title">Have Questions About Your <span className="text-gradient">Service?</span></h2>
            <p className="professional-section-subtitle">Our service advisors are standing by to help you with any questions about your upcoming visit.</p>
            <div className="cta-buttons">
              <a href="tel:5559112886" className="confirm-btn" style={{ textDecoration: "none" }}>
                <MaterialIcon name="phone" size={14} /> Call (555) 911-AUTO
              </a>
              <button className="secondary-btn">
                <MaterialIcon name="chat" size={14} /> Open Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <style>{styles}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero-img"></div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            <MaterialIcon name="schedule" size={14} /> Schedule Service
          </div>
          <h1>Book Your<br /><em>Appointment</em></h1>
          <p className="hero-sub">
            Fast, reliable service from ASE-certified technicians.
            Most services available next business day.
          </p>
          <div className="hero-chips">
            <div className="chip">
              <MaterialIcon name="check_circle" size={14} style={{ color: "var(--green)" }} /> Same-Day Quotes
            </div>
            <div className="chip">
              <MaterialIcon name="verified" size={14} style={{ color: "var(--green)" }} /> 24-Mo Warranty
            </div>
            <div className="chip">
              <MaterialIcon name="visibility" size={14} style={{ color: "var(--green)" }} /> Free Inspection
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <div className="main">
        {/* FORM */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-header-icon">
              <MaterialIcon name="edit_calendar" size={32} />
            </div>
            <div>
              <h2>Book Your Service</h2>
              <p>Complete all fields — takes less than 3 minutes</p>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar-outer">
            <div className={`progress-step ${getStepClass(1)}`}>
              <div className="progress-step-dot">{step > 1 ? <MaterialIcon name="check" size={14} /> : "1"}</div>
              <div className="progress-step-label">Service</div>
            </div>
            <div className={`progress-line ${step > 1 ? "active" : ""}`}></div>
            <div className={`progress-step ${getStepClass(2)}`}>
              <div className="progress-step-dot">{step > 2 ? <MaterialIcon name="check" size={14} /> : "2"}</div>
              <div className="progress-step-label">Date & Time</div>
            </div>
            <div className={`progress-line ${step > 2 ? "active" : ""}`}></div>
            <div className={`progress-step ${getStepClass(3)}`}>
              <div className="progress-step-dot">{step > 3 ? <MaterialIcon name="check" size={14} /> : "3"}</div>
              <div className="progress-step-label">Vehicle</div>
            </div>
            <div className={`progress-line ${step > 3 ? "active" : ""}`}></div>
            <div className={`progress-step ${getStepClass(4)}`}>
              <div className="progress-step-dot">{step > 4 ? <MaterialIcon name="check" size={14} /> : "4"}</div>
              <div className="progress-step-label">Details</div>
            </div>
          </div>

          <form className="form-body" onSubmit={handleSubmit}>
            {/* STEP 1 — SERVICE */}
            <div className="section">
              <div className="section-label">
                <span className="num">1</span>
                Select a Service
              </div>
              <div className="service-grid">
                {SERVICES.map(svc => (
                  <div
                    key={svc.id}
                    className={`service-tile ${selectedService?.id === svc.id ? "selected" : ""}`}
                    onClick={() => handleServiceSelect(svc)}
                  >
                    {svc.popular && <div className="popular-tag">Popular</div>}
                    {selectedService?.id === svc.id && <div className="check-mark">
                      <MaterialIcon name="check_circle" size={18} />
                    </div>}
                    <span className="service-tile-icon">
                      <MaterialIcon name={svc.icon} size={32} />
                    </span>
                    <div className="service-tile-name">{svc.name}</div>
                    <div className="service-tile-meta">
                      <span className="service-tile-price">${svc.price}</span>
                      <span className="service-tile-duration">{svc.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STEP 2 — DATE & TIME */}
            <div className="section">
              <div className="section-label">
                <span className="num">2</span>
                <MaterialIcon name="event" size={16} /> Date & Time
              </div>
              <div className="date-time-grid">
                <div>
                  <label className="field-label">
                    <MaterialIcon name="calendar_today" size={14} /> Preferred Date *
                  </label>
                  <input
                    type="date" name="date" value={form.date}
                    min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; })()}
                    onChange={e => { handleChange(e); if (step < 2) setStep(2); }}
                    required className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">
                    <MaterialIcon name="schedule" size={14} /> Select Time *
                  </label>
                  <div className="time-grid">
                    {TIMES.map(t => (
                      <button
                        key={t} type="button"
                        className={`time-btn ${form.time === t ? "selected" : ""}`}
                        onClick={() => handleTimeSelect(t)}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3 — VEHICLE */}
            <div className="section">
              <div className="section-label">
                <span className="num">3</span>
                <MaterialIcon name="directions_car" size={16} /> Vehicle Information
              </div>
              <div className="vehicle-grid">
                <div>
                  <label className="field-label">Make *</label>
                  <select name="make" value={form.make} onChange={handleChange} required className="field-input">
                    <option value="">Select Make</option>
                    {MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Model *</label>
                  <select name="model" value={form.model} onChange={handleChange} required className="field-input" disabled={!form.make}>
                    <option value="">Select Model</option>
                    {(modelsByMake[form.make] || []).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="year-col">
                  <label className="field-label">Year *</label>
                  <select name="year" value={form.year} onChange={handleChange} className="field-input">
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">
                  <MaterialIcon name="description" size={14} /> Describe the Problem *
                </label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  required placeholder="What's going on with your vehicle? Any symptoms, noises, warning lights..."
                  className="textarea-input"
                />
              </div>
            </div>

            {/* STEP 4 — CONTACT */}
            <div className="section">
              <div className="section-label">
                <span className="num">4</span>
                <MaterialIcon name="contact_page" size={16} /> Your Details
              </div>
              <div className="contact-grid" style={{ marginBottom: "16px" }}>
                <div>
                  <label className="field-label">
                    <MaterialIcon name="person" size={14} /> Full Name *
                  </label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required
                    placeholder="John Smith" className="field-input" />
                </div>
                <div>
                  <label className="field-label">
                    <MaterialIcon name="phone" size={14} /> Phone *
                  </label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="(555) 000-0000" className="field-input" />
                </div>
                <div>
                  <label className="field-label">
                    <MaterialIcon name="email" size={14} /> Email *
                  </label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required
                    placeholder="you@email.com" className="field-input" />
                </div>
                <div>
                  <label className="field-label">
                    <MaterialIcon name="notes" size={14} /> Additional Notes
                  </label>
                  <input type="text" name="notes" value={form.notes} onChange={handleChange}
                    placeholder="Anything else we should know?" className="field-input" />
                </div>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.firstVisit} onChange={e => setForm(f => ({ ...f, firstVisit: e.target.checked }))} />
                <MaterialIcon name="favorite" size={14} style={{ color: "var(--red)", marginRight: "8px" }} />
                <span>This is my first visit to Abe Garage</span>
              </label>
              <label className="checkbox-row">
                <input type="checkbox" checked={form.sms !== false} onChange={e => setForm(f => ({ ...f, sms: e.target.checked }))} />
                <MaterialIcon name="sms" size={14} style={{ color: "var(--blue)", marginRight: "8px" }} />
                <span>Send SMS appointment reminders</span>
              </label>
            </div>

            {/* SUBMIT */}
            <div className="submit-section">
              <div className="terms-row">
                <input type="checkbox" name="terms" id="terms" checked={form.terms} onChange={handleChange} required />
                <label htmlFor="terms" style={{ cursor: "pointer" }}>
                  <span>
                    I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
                    I understand that cancellations within 24 hours may incur a fee.
                  </span>
                </label>
              </div>
              <button type="submit" className="submit-btn" disabled={!canSubmit || submitting}>
                {submitting ? (
                  <>
                    <div className="spinner"></div> Processing your booking...
                  </>
                ) : (
                  <>
                    <span className="submit-btn-icon">
                      <MaterialIcon name="build" size={18} />
                    </span> Confirm Appointment
                  </>
                )}
              </button>
            </div>

            {/* MOBILE SUMMARY - Visible only on small screens */}
            <div className="mobile-summary-wrapper">
              <div className="section-label" style={{ border: "none", marginBottom: "16px" }}>
                <span className="num">S</span>
                <MaterialIcon name="summarize" size={16} /> Review Summary
              </div>
              <div className="side-card" style={{ marginBottom: "0" }}>
                <BookingSummaryContent
                  selectedService={selectedService}
                  subtotal={subtotal}
                  shopFee={shopFee}
                  tax={tax}
                  total={total}
                  form={form}
                  isMobile={true}
                />
              </div>
            </div>
          </form>
        </div>

        {/* SIDEBAR */}
        <aside className="sidebar-scroll-area">
          <div className="appointment-sidebar">
            {/* Booking Summary */}
            <div className="side-card">
              <BookingSummaryContent
                selectedService={selectedService}
                subtotal={subtotal}
                shopFee={shopFee}
                tax={tax}
                total={total}
                form={form}
              />
            </div>

            {/* Trust */}
            <div className="side-card">
              <div className="side-card-title">
                <MaterialIcon name="verified" size={16} /> Why Choose Us
              </div>
              {[
                ["emoji_events", "ASE Certified", "All mechanics are nationally certified"],
                ["handyman", "OEM Parts", "Factory-quality parts, not aftermarket"],
                ["security", "24-Mo Warranty", "Longest warranty in the region"],
                ["payments", "Transparent Pricing", "No hidden fees, ever"],
                ["local_shuttle", "Shuttle Service", "Free drop-off & pickup within 5 miles"],
              ].map(([icon, title, desc]) => (
                <div className="trust-item" key={title}>
                  <div className="trust-icon">
                    <MaterialIcon name={icon} size={24} />
                  </div>
                  <div>
                    <div className="trust-title">{title}</div>
                    <div className="trust-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="side-card">
              <div className="side-card-title">
                <MaterialIcon name="star" size={16} /> Customer Rating
              </div>
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <MaterialIcon key={i} name="star" size={20} style={{ color: "var(--yellow)" }} />
                  ))}
                </div>
                <div className="review-score">4.9</div>
                <div className="review-sub">Based on 847 verified reviews</div>
              </div>
              {[
                ["Quality of Work", "98%"],
                ["On-Time Service", "94%"],
                ["Value for Money", "96%"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: "700", color: "var(--yellow)", fontSize: "15px" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="side-card">
              <div className="side-card-title">
                <MaterialIcon name="schedule" size={16} /> Shop Hours
              </div>
              {[
                ["Mon – Fri", "8:00 AM – 6:00 PM", true],
                ["Saturday", "9:00 AM – 4:00 PM", true],
                ["Sunday", "Closed", false],
              ].map(([day, hrs, open]) => (
                <div className="hours-row" key={day}>
                  <span>{day}</span>
                  <span className={open ? "open" : ""} style={!open ? { color: "var(--muted)" } : {}}>{hrs}</span>
                </div>
              ))}
            </div>

            {/* Emergency */}
            <div className="side-card emergency-card">
              <div style={{ fontSize: "11px", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", color: "var(--red)", marginBottom: "8px" }}>
                <MaterialIcon name="warning" size={14} style={{ color: "var(--red)" }} /> Emergency Line
              </div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "15px", fontWeight: "700", color: "var(--white)" }}>
                24 / 7 Roadside Assistance
              </div>
              <div className="emergency-number">
                <MaterialIcon name="phone" size={14} /> (555) 911-AUTO
              </div>
              <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "8px", lineHeight: "1.6" }}>
                Available nights, weekends & holidays
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-area">
          <div className="toast">
            {toast.includes("✓") ? (
              <MaterialIcon name="check_circle" size={16} style={{ color: "var(--green)", marginRight: "8px" }} />
            ) : (
              <MaterialIcon name="warning" size={16} style={{ color: "var(--red)", marginRight: "8px" }} />
            )}
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}  
