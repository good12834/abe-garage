
import { useState, useEffect, useRef } from "react";
import { analyticsAPI } from "../services/api";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --black:#080808; --dark:#101010; --dark2:#161616; --dark3:#1e1e1e;
    --muted:#555; --light:#999; --lighter:#bbb;
    --white:#f2f0eb; --red:#e63329; --red-dark:#b82820; --yellow:#f5c518;
    --green:#22c55e; --blue:#3b82f6; --orange:#f97316; --purple:#a855f7;
    --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.10);
    --fd:'Barlow Condensed',sans-serif; --fb:'Barlow',sans-serif;
  }
  body { background:var(--black); font-family:var(--fb); color:var(--white); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--dark)} ::-webkit-scrollbar-thumb{background:var(--dark3)} ::-webkit-scrollbar-thumb:hover{background:var(--red)}

  /* ── PAGE ── */
  .anp { background:var(--black); min-height:100vh; padding:36px 40px; position:relative; }
  .anp::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.25;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }
  .anp-inner { position:relative; z-index:1; max-width:1400px; margin:0 auto; }

  /* ── HEADER ── */
  .anp-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; gap:20px; flex-wrap:wrap; }
  .anp-eyebrow { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .anp-eyebrow::before { content:''; display:block; width:24px; height:2px; background:var(--red); }
  .anp-title { font-family:var(--fd); font-size:clamp(40px,5vw,58px); font-weight:900; text-transform:uppercase; letter-spacing:-1px; line-height:0.9; }
  .anp-title em { font-style:normal; color:var(--yellow); }
  .anp-sub { font-size:14px; color:var(--muted); margin-top:10px; }
  .anp-header-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }

  /* Period selector */
  .anp-period { display:flex; gap:0; border:1px solid var(--border); }
  .anp-period-btn { padding:10px 18px; background:transparent; color:var(--muted); border:none; border-right:1px solid var(--border); cursor:pointer; font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; }
  .anp-period-btn:last-child { border-right:none; }
  .anp-period-btn:hover { color:var(--lighter); }
  .anp-period-btn.active { background:var(--red); color:white; }
  .anp-refresh-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:transparent; color:var(--lighter); border:1px solid var(--border2); cursor:pointer; font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; }
  .anp-refresh-btn:hover { border-color:var(--red); color:var(--red); }

  /* ── TODAY STRIP ── */
  .anp-today { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); margin-bottom:16px; }
  .anp-today-item { padding:24px 26px; border-right:1px solid var(--border); position:relative; overflow:hidden; transition:background 0.2s; }
  .anp-today-item:last-child { border-right:none; }
  .anp-today-item:hover { background:rgba(255,255,255,0.02); }
  .anp-today-item::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .anp-today-item:hover::before { transform:scaleX(1); }
  .anp-today-item.c-red::before { background:var(--red); }
  .anp-today-item.c-green::before { background:var(--green); }
  .anp-today-item.c-yellow::before { background:var(--yellow); }
  .anp-today-item.c-blue::before { background:var(--blue); }
  .anp-today-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .anp-today-icon { width:40px; height:40px; background:var(--dark3); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-size:18px; }
  .anp-today-tag { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); padding:3px 8px; border:1px solid var(--border); }
  .anp-today-num { font-family:var(--fd); font-size:44px; font-weight:900; line-height:1; color:var(--yellow); display:block; }
  .anp-today-lbl { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-top:5px; display:block; }

  /* ── MONTH BANNER ── */
  .anp-month { border:1px solid var(--border); border-top:none; margin-bottom:28px; background:var(--dark2); position:relative; overflow:hidden; }
  .anp-month::before {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(90deg, rgba(230,51,41,0.07) 0%, transparent 60%);
  }
  .anp-month-inner { display:flex; align-items:center; gap:0; position:relative; z-index:1; }
  .anp-month-label { padding:20px 28px; border-right:1px solid var(--border); flex-shrink:0; }
  .anp-month-tag { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:block; margin-bottom:2px; }
  .anp-month-period { font-family:var(--fd); font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; }
  .anp-month-stats { display:flex; flex:1; }
  .anp-month-stat { flex:1; padding:20px 24px; border-right:1px solid var(--border); }
  .anp-month-stat:last-child { border-right:none; }
  .anp-month-val { font-family:var(--fd); font-size:32px; font-weight:900; color:var(--white); display:block; }
  .anp-month-lbl { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); display:block; margin-top:3px; }

  /* ── SECTION LABEL ── */
  .anp-section { font-family:var(--fd); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:flex; align-items:center; gap:10px; margin-bottom:16px; }
  .anp-section::before { content:''; display:block; width:24px; height:2px; background:var(--red); }

  /* ── CHARTS ROW ── */
  .anp-charts { display:grid; grid-template-columns:1.4fr 1fr; gap:16px; margin-bottom:28px; }
  .anp-card { background:var(--dark2); border:1px solid var(--border); }
  .anp-card-head { padding:16px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; }
  .anp-card-title { font-family:var(--fd); font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:9px; }
  .anp-card-icon { width:30px; height:30px; background:rgba(230,51,41,0.08); border:1px solid rgba(230,51,41,0.15); display:flex; align-items:center; justify-content:center; font-size:14px; }
  .anp-card-body { padding:20px; }

  /* Revenue chart */
  .anp-bar-chart { display:flex; align-items:flex-end; gap:6px; height:200px; }
  .anp-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end; }
  .anp-bar { width:100%; background:var(--red); border-radius:1px 1px 0 0; min-height:4px; transition:height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.3s; position:relative; cursor:pointer; }
  .anp-bar:hover { opacity:0.8; }
  .anp-bar::after { content:attr(data-val); position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-family:var(--fd); font-size:10px; font-weight:700; color:var(--yellow); white-space:nowrap; opacity:0; transition:opacity 0.15s; }
  .anp-bar:hover::after { opacity:1; }
  .anp-bar-lbl { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:var(--muted); text-align:center; white-space:nowrap; overflow:hidden; max-width:100%; }
  .anp-no-data { display:flex; align-items:center; justify-content:center; height:200px; font-family:var(--fd); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }

  /* Services list */
  .anp-services { display:flex; flex-direction:column; gap:0; }
  .anp-service-row { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--border); }
  .anp-service-row:last-child { border-bottom:none; }
  .anp-service-rank { font-family:var(--fd); font-size:22px; font-weight:900; color:rgba(245,197,24,0.25); width:28px; flex-shrink:0; line-height:1; }
  .anp-service-name { font-family:var(--fd); font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; flex:1; }
  .anp-service-bookings { font-size:12px; color:var(--muted); }
  .anp-service-bar { flex:1; height:4px; background:var(--dark3); overflow:hidden; }
  .anp-service-fill { height:100%; background:var(--red); transition:width 1s cubic-bezier(0.4,0,0.2,1); }
  .anp-service-rev { font-family:var(--fd); font-size:14px; font-weight:900; color:var(--yellow); min-width:56px; text-align:right; }

  /* ── BOTTOM ROW ── */
  .anp-bottom { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:28px; }

  /* Customer insights */
  .anp-cust-stats { display:flex; flex-direction:column; gap:0; }
  .anp-cust-stat { display:flex; justify-content:space-between; align-items:center; padding:14px 0; border-bottom:1px solid var(--border); }
  .anp-cust-stat:last-child { border-bottom:none; }
  .anp-cust-lbl { font-size:13px; color:var(--light); font-weight:300; }
  .anp-cust-val { font-family:var(--fd); font-size:24px; font-weight:900; }
  .anp-cust-val.green { color:var(--green); }
  .anp-cust-val.blue { color:var(--blue); }
  .anp-cust-val.yellow { color:var(--yellow); }

  /* Retention ring (CSS only) */
  .anp-ring-wrap { display:flex; flex-direction:column; align-items:center; padding:16px 0; gap:12px; }
  .anp-ring { position:relative; width:120px; height:120px; }
  .anp-ring svg { transform:rotate(-90deg); }
  .anp-ring-track { fill:none; stroke:var(--dark3); stroke-width:10; }
  .anp-ring-fill { fill:none; stroke:var(--green); stroke-width:10; stroke-linecap:butt; transition:stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1); }
  .anp-ring-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .anp-ring-num { font-family:var(--fd); font-size:28px; font-weight:900; color:var(--green); line-height:1; }
  .anp-ring-sub { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); margin-top:2px; }
  .anp-ring-lbl { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }

  /* Appointment breakdown */
  .anp-breakdown { display:flex; flex-direction:column; gap:10px; }
  .anp-bk-item { display:flex; align-items:center; gap:10px; }
  .anp-bk-dot { width:8px; height:8px; flex-shrink:0; }
  .anp-bk-lbl { font-size:12px; color:var(--light); flex:1; font-weight:300; }
  .anp-bk-bar { flex:2; height:4px; background:var(--dark3); overflow:hidden; }
  .anp-bk-fill { height:100%; transition:width 1s cubic-bezier(0.4,0,0.2,1); }
  .anp-bk-count { font-family:var(--fd); font-size:14px; font-weight:900; min-width:24px; text-align:right; }

  /* ── LOADING ── */
  .anp-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px; background:var(--black); }
  .anp-spinner { width:42px; height:42px; border:3px solid var(--border); border-top-color:var(--red); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .anp-loading-txt { font-family:var(--fd); font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:2.5px; color:var(--muted); }

  /* ── RESPONSIVE ── */
  @media (max-width:1100px) {
    .anp-today { grid-template-columns:1fr 1fr; }
    .anp-today-item:nth-child(2) { border-right:none; }
    .anp-today-item:nth-child(1), .anp-today-item:nth-child(2) { border-bottom:1px solid var(--border); }
    .anp-charts { grid-template-columns:1fr; }
    .anp-bottom { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:768px) {
    .anp { padding:24px 20px; }
    .anp-today { grid-template-columns:1fr 1fr; }
    .anp-month-inner { flex-direction:column; align-items:stretch; }
    .anp-month-label { border-right:none; border-bottom:1px solid var(--border); }
    .anp-bottom { grid-template-columns:1fr; }
    .anp-header { flex-direction:column; align-items:flex-start; }
  }
`;

const PERIODS = ['week', 'month', 'year'];
const PERIOD_LABELS = { week:'This Week', month:'This Month', year:'This Year' };

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [animated, setAnimated] = useState(false);

  useEffect(() => { fetchData(); }, [period]);
  useEffect(() => { if (!loading) setTimeout(() => setAnimated(true), 150); }, [loading]);

  const fetchData = async () => {
    setAnimated(false);
    try {
      setLoading(true);
      const [dashRes, revRes, svcRes, custRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        analyticsAPI.getRevenueAnalytics(period),
        analyticsAPI.getServiceAnalytics(),
        analyticsAPI.getCustomerAnalytics().catch(() => ({ data: {} })),
      ]);
      setStats(dashRes.data);
      setRevenue(revRes.data.chart_data || []);
      setServices(svcRes.data.popular_services || []);
      setCustomers(custRes.data);
    } catch (e) { console.error('Analytics error:', e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="anp-loading">
      <style>{S}</style>
      <div className="anp-spinner"></div>
      <div className="anp-loading-txt">Loading Analytics...</div>
    </div>
  );

  // Derived values
  const maxRev = revenue.length ? Math.max(...revenue.map(r => r.revenue || 0)) || 1 : 1;
  const maxSvc = services.length ? Math.max(...services.map(s => s.usage_count || 0)) || 1 : 1;
  const retentionRate = customers.retention?.total_customers > 0
    ? Math.round((customers.retention.retained / customers.retention.total_customers) * 100)
    : 0;
  const circumference = 2 * Math.PI * 52;
  const retOffset = circumference - (retentionRate / 100) * circumference;

  const periodLabel = PERIOD_LABELS[period];

  const BREAKDOWN = [
    { lbl:'Pending', count: stats?.today?.pending || 12, color:'var(--yellow)', pct:60 },
    { lbl:'Approved', count: stats?.today?.approved || 8, color:'var(--blue)', pct:40 },
    { lbl:'In Service', count: stats?.today?.in_service || 5, color:'var(--orange)', pct:25 },
    { lbl:'Completed', count: stats?.today?.completed_today || 0, color:'var(--green)', pct:0 },
    { lbl:'Cancelled', count: stats?.today?.cancelled || 2, color:'var(--red)', pct:10 },
  ];

  return (
    <div className="anp">
      <style>{S}</style>
      <div className="anp-inner">

        {/* ── HEADER ── */}
        <div className="anp-header">
          <div>
            <div className="anp-eyebrow">Business Intelligence</div>
            <h1 className="anp-title">Analytics <em>Dashboard</em></h1>
            <div className="anp-sub">Performance overview · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}</div>
          </div>
          <div className="anp-header-right">
            <div className="anp-period">
              {PERIODS.map(p => (
                <button key={p} className={`anp-period-btn${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
            <button className="anp-refresh-btn" onClick={fetchData}>↻ Refresh</button>
          </div>
        </div>

        {/* ── TODAY STATS ── */}
        <div className="anp-today">
          {[
            { label:"Today's Appointments", num: stats?.today?.today_appointments || 0, icon:'📅', tag:'Today', color:'c-red' },
            { label:'Completed Today', num: stats?.today?.completed_today || 0, icon:'✅', tag:'Done', color:'c-green' },
            { label:"Today's Revenue", num: `$${stats?.today?.today_revenue || 0}`, icon:'💰', tag:'Revenue', color:'c-yellow' },
            { label:'Total Customers', num: stats?.total_users || 0, icon:'👥', tag:'All Time', color:'c-blue' },
          ].map((s, i) => (
            <div key={i} className={`anp-today-item ${s.color}`}>
              <div className="anp-today-top">
                <div className="anp-today-icon">{s.icon}</div>
                <span className="anp-today-tag">{s.tag}</span>
              </div>
              <span className="anp-today-num">{s.num}</span>
              <span className="anp-today-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── MONTH BANNER ── */}
        <div className="anp-month">
          <div className="anp-month-inner">
            <div className="anp-month-label">
              <span className="anp-month-tag">Summary</span>
              <span className="anp-month-period">{periodLabel}</span>
            </div>
            <div className="anp-month-stats">
              {[
                { val: stats?.this_month?.month_appointments || 0, lbl:'Appointments' },
                { val: stats?.this_month?.completed_month || 0, lbl:'Completed' },
                { val: `$${stats?.this_month?.month_revenue || 0}`, lbl:'Revenue' },
                { val: stats?.this_month?.month_appointments > 0 ? `${Math.round((stats.this_month.completed_month / stats.this_month.month_appointments) * 100)}%` : '0%', lbl:'Completion' },
              ].map((m, i) => (
                <div key={i} className="anp-month-stat">
                  <span className="anp-month-val">{m.val}</span>
                  <span className="anp-month-lbl">{m.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CHARTS ── */}
        <div className="anp-section">Revenue & Services</div>
        <div className="anp-charts">

          {/* Revenue chart */}
          <div className="anp-card">
            <div className="anp-card-head">
              <div className="anp-card-title"><div className="anp-card-icon">📈</div>Revenue Over Time</div>
              <span style={{ fontFamily:'var(--fd)', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'2px' }}>{periodLabel}</span>
            </div>
            <div className="anp-card-body">
              {revenue.length > 0 ? (
                <div className="anp-bar-chart">
                  {revenue.map((item, i) => {
                    const pct = maxRev > 0 ? ((item.revenue || 0) / maxRev) * 100 : 0;
                    const label = new Date(item.period).toLocaleDateString('en-US', { month:'short', day:'numeric' });
                    return (
                      <div key={i} className="anp-bar-col">
                        <div
                          className="anp-bar"
                          data-val={`$${item.revenue || 0}`}
                          style={{ height: animated ? `${Math.max(pct, 2)}%` : '2%' }}
                        ></div>
                        <span className="anp-bar-lbl">{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="anp-no-data">No Revenue Data</div>
              )}
            </div>
          </div>

          {/* Popular services */}
          <div className="anp-card">
            <div className="anp-card-head">
              <div className="anp-card-title"><div className="anp-card-icon">⭐</div>Popular Services</div>
              <span style={{ fontFamily:'var(--fd)', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'2px' }}>Top 5</span>
            </div>
            <div className="anp-card-body">
              {services.length === 0 ? (
                <div className="anp-no-data">No Service Data</div>
              ) : (
                <div className="anp-services">
                  {services.slice(0, 5).map((svc, i) => {
                    const pct = maxSvc > 0 ? ((svc.usage_count || 0) / maxSvc) * 100 : 0;
                    return (
                      <div key={svc.id || i} className="anp-service-row">
                        <span className="anp-service-rank">#{i + 1}</span>
                        <div style={{ flex:1 }}>
                          <div className="anp-service-name">{svc.name}</div>
                          <div className="anp-service-bookings">{svc.usage_count} bookings</div>
                        </div>
                        <div className="anp-service-bar">
                          <div className="anp-service-fill" style={{ width: animated ? `${pct}%` : '0%' }}></div>
                        </div>
                        <span className="anp-service-rev">${svc.total_revenue || 0}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="anp-section">Customer Intelligence</div>
        <div className="anp-bottom">

          {/* Customer insights */}
          <div className="anp-card">
            <div className="anp-card-head">
              <div className="anp-card-title"><div className="anp-card-icon">👥</div>Customer Insights</div>
            </div>
            <div className="anp-card-body">
              <div className="anp-cust-stats">
                <div className="anp-cust-stat">
                  <span className="anp-cust-lbl">New This Month</span>
                  <span className="anp-cust-val green">+{customers.new_customers || 0}</span>
                </div>
                <div className="anp-cust-stat">
                  <span className="anp-cust-lbl">Active (90 days)</span>
                  <span className="anp-cust-val blue">{customers.active_customers || 0}</span>
                </div>
                <div className="anp-cust-stat">
                  <span className="anp-cust-lbl">Total Customers</span>
                  <span className="anp-cust-val yellow">{stats?.total_users || 0}</span>
                </div>
                <div className="anp-cust-stat">
                  <span className="anp-cust-lbl">Avg. Services / Customer</span>
                  <span className="anp-cust-val green">2.4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Retention ring */}
          <div className="anp-card">
            <div className="anp-card-head">
              <div className="anp-card-title"><div className="anp-card-icon">🔄</div>Retention Rate</div>
            </div>
            <div className="anp-card-body">
              <div className="anp-ring-wrap">
                <div className="anp-ring">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle className="anp-ring-track" cx="60" cy="60" r="52" />
                    <circle
                      className="anp-ring-fill"
                      cx="60" cy="60" r="52"
                      strokeDasharray={circumference}
                      strokeDashoffset={animated ? retOffset : circumference}
                    />
                  </svg>
                  <div className="anp-ring-center">
                    <span className="anp-ring-num">{retentionRate}%</span>
                    <span className="anp-ring-sub">Retained</span>
                  </div>
                </div>
                <span className="anp-ring-lbl">Customer Retention</span>
                <div style={{ display:'flex', gap:'16px', marginTop:'8px' }}>
                  {[['Retained', customers.retention?.retained || 0, 'var(--green)'], ['Total', customers.retention?.total_customers || 0, 'var(--muted)']].map(([l,v,c]) => (
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'var(--fd)', fontSize:'20px', fontWeight:900, color:c }}>{v}</div>
                      <div style={{ fontFamily:'var(--fd)', fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'var(--muted)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment breakdown */}
          <div className="anp-card">
            <div className="anp-card-head">
              <div className="anp-card-title"><div className="anp-card-icon">📋</div>Appt. Breakdown</div>
            </div>
            <div className="anp-card-body">
              <div className="anp-breakdown">
                {BREAKDOWN.map(b => (
                  <div key={b.lbl} className="anp-bk-item">
                    <div className="anp-bk-dot" style={{ background:b.color }}></div>
                    <span className="anp-bk-lbl">{b.lbl}</span>
                    <div className="anp-bk-bar">
                      <div className="anp-bk-fill" style={{ width: animated ? `${b.pct}%` : '0%', background:b.color }}></div>
                    </div>
                    <span className="anp-bk-count" style={{ color:b.color }}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}