
import { useState, useEffect } from "react";
import { emergencyAPI, vehiclesAPI } from "../services/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --black:#080808; --dark:#101010; --dark2:#161616; --dark3:#1e1e1e;
    --muted:#555; --light:#999; --lighter:#bbb;
    --white:#f2f0eb; --red:#e63329; --red-dark:#b82820; --yellow:#f5c518;
    --green:#22c55e; --blue:#3b82f6; --orange:#f97316;
    --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.10);
    --fd:'Barlow Condensed',sans-serif; --fb:'Barlow',sans-serif;
  }
  body { background:var(--black); font-family:var(--fb); color:var(--white); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--dark)} ::-webkit-scrollbar-thumb{background:var(--dark3)}

  /* ── PAGE ── */
  .ep { background:var(--black); min-height:100vh; padding:36px 40px; position:relative; }
  .ep::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.25;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }
  .ep-inner { position:relative; z-index:1; max-width:1200px; margin:0 auto; }

  /* ── HEADER ── */
  .ep-header { text-align:center; margin-bottom:36px; }
  .ep-eyebrow { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:inline-flex; align-items:center; gap:8px; margin-bottom:12px; }
  .ep-eyebrow::before, .ep-eyebrow::after { content:''; display:block; width:24px; height:2px; background:var(--red); }
  .ep-title { font-family:var(--fd); font-size:clamp(44px,6vw,68px); font-weight:900; text-transform:uppercase; letter-spacing:-1px; line-height:0.9; margin-bottom:10px; }
  .ep-title em { font-style:normal; color:var(--red); }
  .ep-sub { font-size:15px; color:var(--muted); font-weight:300; }

  /* ── EMERGENCY BANNER ── */
  .ep-banner {
    position:relative; overflow:hidden; border:1px solid rgba(230,51,41,0.3);
    background:linear-gradient(135deg, rgba(230,51,41,0.12) 0%, rgba(230,51,41,0.04) 100%);
    margin-bottom:40px; padding:48px;
  }
  .ep-banner::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity:0.4;
  }
  /* Animated red glow corners */
  .ep-banner::after {
    content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px;
    background:radial-gradient(circle, rgba(230,51,41,0.15) 0%, transparent 70%);
    pointer-events:none;
  }
  .ep-banner-inner { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:32px; flex-wrap:wrap; }
  .ep-banner-left { flex:1; min-width:240px; }
  .ep-banner-pulse { display:inline-flex; align-items:center; gap:8px; padding:4px 14px; border:1px solid rgba(230,51,41,0.35); background:rgba(230,51,41,0.08); font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--red); margin-bottom:16px; }
  .ep-banner-pulse-dot { width:7px; height:7px; background:var(--red); border-radius:50%; animation:pulseDot 1.4s infinite; }
  @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }
  .ep-banner-title { font-family:var(--fd); font-size:clamp(28px,4vw,44px); font-weight:900; text-transform:uppercase; letter-spacing:0.5px; line-height:0.95; margin-bottom:10px; }
  .ep-banner-desc { font-size:14px; color:var(--lighter); line-height:1.7; font-weight:300; max-width:420px; }
  .ep-banner-right { display:flex; flex-direction:column; align-items:flex-end; gap:12px; flex-shrink:0; }
  .ep-call { display:flex; align-items:center; gap:12px; padding:14px 22px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); text-decoration:none; transition:border-color 0.2s; }
  .ep-call:hover { border-color:rgba(230,51,41,0.4); }
  .ep-call-icon { font-size:22px; }
  .ep-call-label { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); display:block; }
  .ep-call-num { font-family:var(--fd); font-size:22px; font-weight:900; color:var(--white); letter-spacing:1px; }
  .ep-cta { display:inline-flex; align-items:center; gap:10px; padding:16px 28px; background:var(--red); color:white; border:none; cursor:pointer; font-family:var(--fd); font-size:14px; font-weight:900; text-transform:uppercase; letter-spacing:2.5px; transition:background 0.2s; position:relative; overflow:hidden; }
  .ep-cta:hover { background:var(--red-dark); }
  .ep-cta::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.07)); }
  .ep-banner-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:1px solid rgba(255,255,255,0.06); margin-top:24px; }
  .ep-banner-stat { padding:14px 20px; border-right:1px solid rgba(255,255,255,0.06); text-align:center; }
  .ep-banner-stat:last-child { border-right:none; }
  .ep-banner-stat-num { font-family:var(--fd); font-size:28px; font-weight:900; color:var(--yellow); display:block; }
  .ep-banner-stat-lbl { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }

  /* ── SECTION LABEL ── */
  .ep-section { font-family:var(--fd); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .ep-section::before { content:''; display:block; width:24px; height:2px; background:var(--red); }

  /* ── SERVICES GRID ── */
  .ep-services { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:0; border:1px solid var(--border); margin-bottom:36px; }
  .ep-svc { padding:28px 24px; border-right:1px solid var(--border); border-bottom:1px solid var(--border); position:relative; overflow:hidden; transition:background 0.2s; cursor:default; }
  .ep-svc:hover { background:rgba(255,255,255,0.02); }
  .ep-svc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--red); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .ep-svc:hover::before { transform:scaleX(1); }
  .ep-svc-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
  .ep-svc-icon { width:52px; height:52px; background:var(--dark3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:24px; }
  .ep-svc-eta { display:flex; flex-direction:column; align-items:flex-end; }
  .ep-svc-eta-lbl { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }
  .ep-svc-eta-time { font-family:var(--fd); font-size:14px; font-weight:900; color:var(--green); }
  .ep-svc-name { font-family:var(--fd); font-size:20px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; line-height:1; }
  .ep-svc-desc { font-size:13px; color:var(--muted); line-height:1.6; margin-bottom:16px; font-weight:300; }
  .ep-svc-foot { display:flex; justify-content:space-between; align-items:center; padding-top:14px; border-top:1px solid var(--border); }
  .ep-svc-price { font-family:var(--fd); font-size:18px; font-weight:900; color:var(--yellow); }
  .ep-svc-price-lbl { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); display:block; }
  .ep-svc-badge { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding:4px 10px; border:1px solid rgba(34,197,94,0.25); background:rgba(34,197,94,0.06); color:var(--green); }

  /* ── BOOKINGS ── */
  .ep-bookings { display:flex; flex-direction:column; gap:0; border:1px solid var(--border); margin-bottom:36px; }
  .ep-booking { padding:20px 24px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:16px; transition:background 0.2s; }
  .ep-booking:last-child { border-bottom:none; }
  .ep-booking:hover { background:rgba(255,255,255,0.02); }
  .ep-booking-icon { width:44px; height:44px; background:var(--dark3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .ep-booking-info { flex:1; }
  .ep-booking-name { font-family:var(--fd); font-size:17px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px; }
  .ep-booking-meta { display:flex; gap:16px; flex-wrap:wrap; }
  .ep-booking-detail { font-size:12px; color:var(--muted); display:flex; align-items:center; gap:5px; }
  .ep-booking-detail-icon { font-size:12px; }
  .ep-booking-status { flex-shrink:0; }
  .ep-status-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; font-family:var(--fd); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; }
  .ep-status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }
  .ep-status-pending { background:rgba(245,197,24,0.1); border:1px solid rgba(245,197,24,0.25); color:var(--yellow); }
  .ep-status-dispatched { background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.25); color:var(--blue); }
  .ep-status-arrived { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.25); color:var(--green); }
  .ep-status-completed { background:rgba(255,255,255,0.04); border:1px solid var(--border2); color:var(--muted); }
  .ep-status-cancelled { background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.25); color:var(--red); }

  /* ── MODAL ── */
  .ep-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(8px); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .ep-modal { background:var(--dark2); border:1px solid var(--border2); width:100%; max-width:600px; max-height:90vh; display:flex; flex-direction:column; animation:slideUp 0.25s cubic-bezier(0.4,0,0.2,1); }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  .ep-modal-head { padding:20px 24px; border-bottom:1px solid rgba(230,51,41,0.2); background:linear-gradient(90deg, rgba(230,51,41,0.08), transparent); display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
  .ep-modal-title { font-family:var(--fd); font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:10px; }
  .ep-modal-title-icon { width:36px; height:36px; background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.25); display:flex; align-items:center; justify-content:center; font-size:18px; }
  .ep-modal-close { width:36px; height:36px; background:transparent; border:1px solid var(--border); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:all 0.2s; }
  .ep-modal-close:hover { border-color:var(--red); color:var(--red); }
  .ep-modal-body { padding:24px; overflow-y:auto; flex:1; }
  .ep-modal-body::-webkit-scrollbar { width:4px; }
  .ep-modal-body::-webkit-scrollbar-thumb { background:var(--dark3); }
  .ep-modal-foot { padding:16px 24px; border-top:1px solid var(--border); display:flex; gap:10px; justify-content:flex-end; flex-shrink:0; }

  /* Priority indicator */
  .ep-priority-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
  .ep-priority-opt { padding:10px 14px; border:1px solid var(--border); cursor:pointer; display:flex; align-items:center; gap:8px; transition:all 0.2s; position:relative; }
  .ep-priority-opt input { position:absolute; opacity:0; pointer-events:none; }
  .ep-priority-opt.sel-low { border-color:rgba(34,197,94,0.4); background:rgba(34,197,94,0.06); }
  .ep-priority-opt.sel-medium { border-color:rgba(245,197,24,0.4); background:rgba(245,197,24,0.06); }
  .ep-priority-opt.sel-high { border-color:rgba(249,115,22,0.4); background:rgba(249,115,22,0.06); }
  .ep-priority-opt.sel-critical { border-color:rgba(230,51,41,0.5); background:rgba(230,51,41,0.08); }
  .ep-priority-dot { width:10px; height:10px; flex-shrink:0; }
  .ep-priority-name { font-family:var(--fd); font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
  .ep-priority-sub { font-size:11px; color:var(--muted); display:block; }

  /* Form fields */
  .ep-field { margin-bottom:16px; }
  .ep-label { font-family:var(--fd); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2.5px; color:var(--muted); display:block; margin-bottom:8px; }
  .ep-label.req::after { content:' *'; color:var(--red); }
  .ep-select { width:100%; height:46px; background:var(--dark3); border:1px solid var(--border); color:var(--white); font-family:var(--fb); font-size:14px; padding:0 14px; outline:none; cursor:pointer; transition:border-color 0.2s; appearance:none; -webkit-appearance:none; }
  .ep-select:focus { border-color:var(--red); }
  .ep-select option { background:var(--dark3); }
  .ep-textarea { width:100%; background:var(--dark3); border:1px solid var(--border); color:var(--white); font-family:var(--fb); font-size:14px; padding:12px 14px; outline:none; resize:vertical; min-height:90px; transition:border-color 0.2s; }
  .ep-textarea:focus { border-color:var(--red); }
  .ep-textarea::placeholder { color:var(--muted); font-size:13px; }

  /* Buttons */
  .ep-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:13px 22px; background:var(--red); color:white; border:none; cursor:pointer; font-family:var(--fd); font-size:13px; font-weight:900; text-transform:uppercase; letter-spacing:2.5px; transition:background 0.2s; }
  .ep-btn-primary:hover { background:var(--red-dark); }
  .ep-btn-ghost { display:inline-flex; align-items:center; gap:8px; padding:13px 20px; background:transparent; color:var(--lighter); border:1px solid var(--border2); cursor:pointer; font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; }
  .ep-btn-ghost:hover { border-color:var(--border2); color:var(--white); }

  /* Form section title */
  .ep-form-section { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2.5px; color:var(--muted); display:flex; align-items:center; gap:8px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid var(--border); }
  .ep-form-section::before { content:''; display:block; width:3px; height:12px; background:var(--red); }

  /* Loading */
  .ep-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px; background:var(--black); }
  .ep-spinner { width:42px; height:42px; border:3px solid var(--border); border-top-color:var(--red); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .ep-loading-txt { font-family:var(--fd); font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:2.5px; color:var(--muted); }

  /* Empty state */
  .ep-empty { text-align:center; padding:48px 24px; border:1px solid var(--border); background:var(--dark2); }
  .ep-empty-icon { font-size:48px; opacity:0.3; margin-bottom:12px; }
  .ep-empty-txt { font-family:var(--fd); font-size:16px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }

  /* ── RESPONSIVE ── */
  @media (max-width:900px) {
    .ep { padding:24px 20px; }
    .ep-banner { padding:32px 24px; }
    .ep-banner-inner { flex-direction:column; align-items:flex-start; }
    .ep-banner-right { align-items:flex-start; }
    .ep-banner-stats { grid-template-columns:1fr 1fr 1fr; }
    .ep-priority-grid { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:600px) {
    .ep-overlay { padding:12px; }
    .ep-services { grid-template-columns:1fr; }
    .ep-booking { flex-wrap:wrap; }
    .ep-banner-stats { grid-template-columns:1fr 1fr; }
  }
`;

const SERVICE_ICONS = { tow:'🚛', battery:'🔋', lock:'🔐', fuel:'⛽', default:'🔧' };
const getServiceIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('tow')) return SERVICE_ICONS.tow;
  if (n.includes('battery')) return SERVICE_ICONS.battery;
  if (n.includes('lock')) return SERVICE_ICONS.lock;
  if (n.includes('fuel') || n.includes('gas')) return SERVICE_ICONS.fuel;
  return SERVICE_ICONS.default;
};

const STATUS_CLASSES = {
  pending:'ep-status-pending', dispatched:'ep-status-dispatched',
  arrived:'ep-status-arrived', completed:'ep-status-completed', cancelled:'ep-status-cancelled',
};

const PRIORITY_CONFIG = {
  low:    { color:'var(--green)',  dot:'#22c55e', label:'Low',      sub:'Can wait a bit' },
  medium: { color:'var(--yellow)', dot:'#f5c518', label:'Medium',   sub:'Need help soon' },
  high:   { color:'var(--orange)', dot:'#f97316', label:'High',     sub:'Urgent situation' },
  critical:{ color:'var(--red)',   dot:'#e63329', label:'Critical', sub:'Immediate danger' },
};

const BLANK = { vehicle_id:'', emergency_service_id:'', address:'', description:'', priority:'high' };

export default function EmergencyService() {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [svcRes, vehRes, bkRes] = await Promise.all([
        emergencyAPI.getServices(),
        vehiclesAPI.getVehicles(),
        emergencyAPI.getMyBookings().catch(() => ({ data: [] })),
      ]);
      setServices(svcRes.data || []);
      setVehicles(vehRes.data || []);
      setBookings(bkRes.data || []);
    } catch (e) {
      console.error('Error fetching data:', e);
      try { const r = await emergencyAPI.getServices(); setServices(r.data || []); } catch {}
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await emergencyAPI.bookService(form);
      setShowForm(false);
      setForm({ ...BLANK });
      fetchData();
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book emergency service. Please call us directly.');
    } finally { setSubmitting(false); }
  };

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return (
    <div className="ep-loading">
      <style>{S}</style>
      <div className="ep-spinner"></div>
      <div className="ep-loading-txt">Loading Emergency Services...</div>
    </div>
  );

  return (
    <div className="ep">
      <style>{S}</style>
      <div className="ep-inner">

        {/* ── HEADER ── */}
        <div className="ep-header">
          <div className="ep-eyebrow">24/7 Roadside Assistance</div>
          <h1 className="ep-title">Emergency <em>Service</em></h1>
          <p className="ep-sub">Immediate assistance when you need it most — day or night</p>
        </div>

        {/* ── BANNER ── */}
        <div className="ep-banner">
          <div className="ep-banner-inner">
            <div className="ep-banner-left">
              <div className="ep-banner-pulse">
                <span className="ep-banner-pulse-dot"></span>
                Available Now · Dispatching in Minutes
              </div>
              <div className="ep-banner-title">
                Stranded<br />on the Road?
              </div>
              <p className="ep-banner-desc">
                Our certified mechanics are on standby 24/7. One tap gets help on the way to your exact location — no waiting, no runaround.
              </p>

              <div className="ep-banner-stats">
                <div className="ep-banner-stat">
                  <span className="ep-banner-stat-num">&lt;30</span>
                  <span className="ep-banner-stat-lbl">Min Response</span>
                </div>
                <div className="ep-banner-stat">
                  <span className="ep-banner-stat-num">24/7</span>
                  <span className="ep-banner-stat-lbl">Available</span>
                </div>
                <div className="ep-banner-stat">
                  <span className="ep-banner-stat-num">4.9★</span>
                  <span className="ep-banner-stat-lbl">Avg. Rating</span>
                </div>
              </div>
            </div>

            <div className="ep-banner-right">
              <a href="tel:+15551234567" className="ep-call">
                <span className="ep-call-icon">📞</span>
                <div>
                  <span className="ep-call-label">Call Now</span>
                  <span className="ep-call-num">(555) 123-4567</span>
                </div>
              </a>
              <button className="ep-cta" onClick={() => setShowForm(true)}>
                🚨 Request Help Now
              </button>
            </div>
          </div>
        </div>

        {/* ── SERVICES ── */}
        <div className="ep-section">Available Emergency Services</div>
        {services.length === 0 ? (
          <div className="ep-empty" style={{ marginBottom:'36px' }}>
            <div className="ep-empty-icon">🔧</div>
            <div className="ep-empty-txt">No services available</div>
          </div>
        ) : (
          <div className="ep-services" style={{ marginBottom:'36px' }}>
            {services.map(svc => (
              <div key={svc.id} className="ep-svc">
                <div className="ep-svc-top">
                  <div className="ep-svc-icon">{getServiceIcon(svc.name)}</div>
                  {svc.response_time_estimate && (
                    <div className="ep-svc-eta">
                      <span className="ep-svc-eta-lbl">Est. Arrival</span>
                      <span className="ep-svc-eta-time">{svc.response_time_estimate}</span>
                    </div>
                  )}
                </div>
                <div className="ep-svc-name">{svc.name}</div>
                <div className="ep-svc-desc">{svc.description}</div>
                <div className="ep-svc-foot">
                  <div>
                    <span className="ep-svc-price-lbl">Starting from</span>
                    <span className="ep-svc-price">{svc.base_price ? `$${svc.base_price}` : 'Call us'}</span>
                  </div>
                  <span className="ep-svc-badge">Available</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {bookings.length > 0 && (
          <>
            <div className="ep-section">Your Service History</div>
            <div className="ep-bookings">
              {bookings.map(b => (
                <div key={b.id} className="ep-booking">
                  <div className="ep-booking-icon">{getServiceIcon(b.service_name)}</div>
                  <div className="ep-booking-info">
                    <div className="ep-booking-name">{b.service_name}</div>
                    <div className="ep-booking-meta">
                      <span className="ep-booking-detail"><span className="ep-booking-detail-icon">🚗</span>{b.year} {b.make} {b.model}</span>
                      <span className="ep-booking-detail"><span className="ep-booking-detail-icon">📅</span>{new Date(b.created_at).toLocaleDateString()}</span>
                      {b.address && <span className="ep-booking-detail"><span className="ep-booking-detail-icon">📍</span>{b.address}</span>}
                      {b.assigned_mechanic_name && <span className="ep-booking-detail"><span className="ep-booking-detail-icon">👤</span>{b.assigned_mechanic_name}</span>}
                    </div>
                  </div>
                  <div className="ep-booking-status">
                    <span className={`ep-status-badge ${STATUS_CLASSES[b.status] || 'ep-status-pending'}`}>
                      <span className="ep-status-dot"></span>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── MODAL ── */}
        {showForm && (
          <div className="ep-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="ep-modal">
              <div className="ep-modal-head">
                <div className="ep-modal-title">
                  <div className="ep-modal-title-icon">🚨</div>
                  Request Emergency Service
                </div>
                <button className="ep-modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>

              <div className="ep-modal-body">
                <form id="eform" onSubmit={handleSubmit} noValidate>

                  <div className="ep-form-section" style={{ marginBottom:'16px' }}>Vehicle & Service</div>

                  <div className="ep-field">
                    <label className="ep-label req">Select Vehicle</label>
                    <select className="ep-select" value={form.vehicle_id} onChange={e => setField('vehicle_id', e.target.value)} required>
                      <option value="">Choose your vehicle...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} · {v.license_plate}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ep-field">
                    <label className="ep-label req">Emergency Service Type</label>
                    <select className="ep-select" value={form.emergency_service_id} onChange={e => setField('emergency_service_id', e.target.value)} required>
                      <option value="">Select service type...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name}{s.base_price ? ` — from $${s.base_price}` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="ep-form-section" style={{ marginBottom:'16px', marginTop:'20px' }}>Location & Details</div>

                  <div className="ep-field">
                    <label className="ep-label req">Your Location</label>
                    <textarea
                      className="ep-textarea"
                      value={form.address}
                      onChange={e => setField('address', e.target.value)}
                      placeholder="Provide your exact location or nearest landmark..."
                      required
                      rows={2}
                    />
                  </div>

                  <div className="ep-field">
                    <label className="ep-label req">Describe the Emergency</label>
                    <textarea
                      className="ep-textarea"
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      placeholder="What's happening with your vehicle? Any sounds, warning lights, etc..."
                      required
                      rows={3}
                    />
                  </div>

                  <div className="ep-form-section" style={{ marginBottom:'14px', marginTop:'20px' }}>Priority Level</div>

                  <div className="ep-priority-grid">
                    {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                      <label
                        key={key}
                        className={`ep-priority-opt${form.priority === key ? ` sel-${key}` : ''}`}
                        onClick={() => setField('priority', key)}
                      >
                        <div className="ep-priority-dot" style={{ background: cfg.dot }}></div>
                        <div>
                          <span className="ep-priority-name" style={{ color: form.priority === key ? cfg.color : 'var(--lighter)' }}>{cfg.label}</span>
                          <span className="ep-priority-sub">{cfg.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                </form>
              </div>

              <div className="ep-modal-foot">
                <button className="ep-btn-ghost" type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="ep-btn-primary" form="eform" type="submit" disabled={submitting}>
                  {submitting ? '⏳ Sending...' : '🚨 Request Immediate Help'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}