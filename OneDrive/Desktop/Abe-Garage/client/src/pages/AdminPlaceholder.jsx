import { useLocation, Link } from "react-router-dom";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --black:#080808; --dark:#101010; --dark2:#161616; --dark3:#1e1e1e;
    --muted:#555; --light:#999; --lighter:#bbb;
    --white:#f2f0eb; --red:#e63329; --red-dark:#b82820; --yellow:#f5c518;
    --green:#22c55e; --blue:#3b82f6;
    --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.10);
    --fd:'Barlow Condensed',sans-serif; --fb:'Barlow',sans-serif;
  }
  body { background:var(--black); font-family:var(--fb); color:var(--white); -webkit-font-smoothing:antialiased; }

  /* ── PAGE ── */
  .ph {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--black); padding:40px 24px; position:relative; overflow:hidden;
  }

  /* Background grid pattern */
  .ph::before {
    content:''; position:fixed; inset:0; pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size:48px 48px;
  }
  /* Noise overlay */
  .ph::after {
    content:''; position:fixed; inset:0; pointer-events:none; opacity:0.3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }

  /* Ambient red glow top-left */
  .ph-glow {
    position:fixed; top:-120px; left:-120px; width:480px; height:480px;
    background:radial-gradient(circle, rgba(230,51,41,0.07) 0%, transparent 65%);
    pointer-events:none; z-index:0;
  }
  /* Ambient yellow glow bottom-right */
  .ph-glow2 {
    position:fixed; bottom:-120px; right:-80px; width:360px; height:360px;
    background:radial-gradient(circle, rgba(245,197,24,0.04) 0%, transparent 65%);
    pointer-events:none; z-index:0;
  }

  /* ── CARD ── */
  .ph-card {
    position:relative; z-index:1; width:100%; max-width:640px;
    background:var(--dark2); border:1px solid var(--border2);
    animation:cardIn 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes cardIn { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }

  /* Top red stripe */
  .ph-card-stripe { height:3px; background:var(--red); width:100%; }

  /* Brand bar */
  .ph-brand-bar {
    padding:16px 28px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
  }
  .ph-brand { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .ph-brand-icon { width:30px; height:30px; background:var(--red); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .ph-brand-name { font-family:var(--fd); font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:2px; color:var(--white); }
  .ph-brand-name span { color:var(--red); }
  .ph-admin-tag { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); padding:4px 10px; border:1px solid var(--border); }

  /* Body */
  .ph-body { padding:52px 48px; text-align:center; }

  /* Construction icon */
  .ph-icon-wrap {
    width:88px; height:88px; margin:0 auto 28px;
    background:var(--dark3); border:1px solid var(--border2);
    display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden;
  }
  .ph-icon-wrap::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg, rgba(245,197,24,0.06) 0%, transparent 60%);
  }
  .ph-icon { font-size:40px; position:relative; z-index:1; animation:iconFloat 3s ease-in-out infinite; }
  @keyframes iconFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

  /* Corner accents on icon box */
  .ph-icon-wrap::after {
    content:''; position:absolute; top:0; left:0;
    width:12px; height:12px;
    border-top:2px solid var(--yellow); border-left:2px solid var(--yellow);
  }

  /* Eyebrow */
  .ph-eyebrow {
    font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase;
    letter-spacing:3px; color:var(--yellow); display:inline-flex; align-items:center;
    gap:8px; margin-bottom:14px;
  }
  .ph-eyebrow::before, .ph-eyebrow::after { content:''; display:block; width:20px; height:2px; background:var(--yellow); }

  /* Title */
  .ph-title {
    font-family:var(--fd); font-size:clamp(36px,6vw,52px); font-weight:900;
    text-transform:uppercase; letter-spacing:-0.5px; line-height:0.95; margin-bottom:16px;
  }
  .ph-title em { font-style:normal; color:var(--yellow); }

  /* Description */
  .ph-desc {
    font-size:14px; color:var(--muted); line-height:1.8; font-weight:300;
    max-width:440px; margin:0 auto 32px;
  }
  .ph-desc strong { color:var(--lighter); font-weight:500; }

  /* Progress indicator */
  .ph-progress { margin-bottom:36px; }
  .ph-progress-label {
    font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase;
    letter-spacing:2px; color:var(--muted); display:flex; justify-content:space-between;
    align-items:center; margin-bottom:8px;
  }
  .ph-progress-pct { color:var(--yellow); }
  .ph-progress-track { height:4px; background:var(--dark3); border:1px solid var(--border); overflow:hidden; }
  .ph-progress-fill {
    height:100%; width:68%; background:linear-gradient(90deg, var(--red), var(--yellow));
    animation:progressPulse 2.5s ease-in-out infinite;
    transform-origin:left;
  }
  @keyframes progressPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }

  /* Feature pills */
  .ph-pills { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:36px; }
  .ph-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border:1px solid var(--border); background:var(--dark3);
    font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase;
    letter-spacing:1.5px; color:var(--muted);
  }
  .ph-pill-dot { width:6px; height:6px; border-radius:50%; }

  /* Actions */
  .ph-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .ph-btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:13px 24px; background:var(--red); color:white; border:none;
    cursor:pointer; font-family:var(--fd); font-size:13px; font-weight:900;
    text-transform:uppercase; letter-spacing:2px; text-decoration:none;
    transition:background 0.2s; position:relative; overflow:hidden;
  }
  .ph-btn-primary:hover { background:var(--red-dark); color:white; }
  .ph-btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, transparent 60%, rgba(255,255,255,0.07)); }
  .ph-btn-ghost {
    display:inline-flex; align-items:center; gap:8px;
    padding:13px 22px; background:transparent; color:var(--lighter);
    border:1px solid var(--border2); cursor:pointer;
    font-family:var(--fd); font-size:12px; font-weight:800;
    text-transform:uppercase; letter-spacing:1.5px; text-decoration:none;
    transition:all 0.2s;
  }
  .ph-btn-ghost:hover { border-color:var(--border2); color:var(--white); background:rgba(255,255,255,0.03); }

  /* Footer bar */
  .ph-footer {
    padding:14px 28px; border-top:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    background:var(--dark3);
  }
  .ph-footer-txt { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }
  .ph-footer-status { display:flex; align-items:center; gap:6px; font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--yellow); }
  .ph-footer-dot { width:6px; height:6px; border-radius:50%; background:var(--yellow); animation:blink 1.5s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Responsive */
  @media (max-width:560px) {
    .ph-body { padding:36px 28px; }
    .ph-brand-bar { padding:14px 20px; }
    .ph-footer { padding:12px 20px; }
  }
`;

// Map known admin routes to better labels and icons
const ROUTE_CONFIG = {
  customers:   { label:'Customer',      icon:'👥', pill1:'CRM Module',          pill2:'User Management', pill3:'Service History' },
  appointments:{ label:'Appointment',   icon:'📅', pill1:'Live Scheduling',     pill2:'Mechanic Assignment', pill3:'Status Tracking' },
  services:    { label:'Service',       icon:'🔧', pill1:'Service Catalog',     pill2:'Pricing Engine', pill3:'Category Config' },
  mechanics:   { label:'Mechanic',      icon:'⚙️', pill1:'Staff Profiles',      pill2:'Workload Tracking', pill3:'Performance' },
  invoices:    { label:'Invoice',       icon:'🧾', pill1:'Billing Engine',      pill2:'Payment Tracking', pill3:'PDF Export' },
  reports:     { label:'Report',        icon:'📊', pill1:'Revenue Analytics',   pill2:'KPI Dashboard', pill3:'Export Tools' },
  vehicles:    { label:'Vehicle',       icon:'🚗', pill1:'Fleet Overview',      pill2:'Health Monitoring', pill3:'Service History' },
  users:       { label:'User',          icon:'👤', pill1:'Account Management',  pill2:'Role Permissions', pill3:'Audit Log' },
};

const PILL_COLORS = ['var(--red)', 'var(--yellow)', 'var(--blue)'];

export default function AdminPlaceholder() {
  const location = useLocation();
  const path = location.pathname.split('/').pop();
  const cfg = ROUTE_CONFIG[path] || {
    label: path.charAt(0).toUpperCase() + path.slice(1),
    icon: '🏗',
    pill1: 'Admin Module', pill2: 'Management Tools', pill3: 'Coming Soon',
  };

  return (
    <div className="ph">
      <style>{S}</style>
      <div className="ph-glow"></div>
      <div className="ph-glow2"></div>

      <div className="ph-card">
        <div className="ph-card-stripe"></div>

        {/* Brand bar */}
        <div className="ph-brand-bar">
          <Link to="/" className="ph-brand">
            <div className="ph-brand-icon">🔧</div>
            <span className="ph-brand-name">ABE<span>GARAGE</span></span>
          </Link>
          <span className="ph-admin-tag">Admin Panel</span>
        </div>

        {/* Body */}
        <div className="ph-body">

          {/* Icon */}
          <div className="ph-icon-wrap">
            <span className="ph-icon">{cfg.icon}</span>
          </div>

          <div className="ph-eyebrow">Under Development</div>

          <h1 className="ph-title">
            {cfg.label}<br /><em>Management</em>
          </h1>

          <p className="ph-desc">
            The <strong>{cfg.label.toLowerCase()} management module</strong> is being built as part of the premium dashboard redesign — a high-performance, real-time administrative interface with full data control.
          </p>

          {/* Progress */}
          <div className="ph-progress">
            <div className="ph-progress-label">
              <span>Build Progress</span>
              <span className="ph-progress-pct">68%</span>
            </div>
            <div className="ph-progress-track">
              <div className="ph-progress-fill"></div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="ph-pills">
            {[cfg.pill1, cfg.pill2, cfg.pill3].map((pill, i) => (
              <span key={pill} className="ph-pill">
                <span className="ph-pill-dot" style={{ background: PILL_COLORS[i] }}></span>
                {pill}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="ph-actions">
            <Link to="/admin/dashboard" className="ph-btn-primary">
              ← Return to Dashboard
            </Link>
            <Link to="/" className="ph-btn-ghost">
              ⌂ Go to Home
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="ph-footer">
          <span className="ph-footer-txt">Abe Garage · Admin Suite v2.0</span>
          <span className="ph-footer-status">
            <span className="ph-footer-dot"></span>
            In Development
          </span>
        </div>
      </div>
    </div>
  );
}