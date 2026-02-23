import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI } from "../services/api";
import './AdminDashboard.css'
const S = `
 
`;

const QUICK_LINKS = [
  { icon:'👥', title:'Customers', desc:'Manage customer accounts and view complete service histories.', link:'/admin/customers', cta:'View All', badge:'CRM' },
  { icon:'📅', title:'Appointments', desc:'View, assign, and manage all service appointments in real-time.', link:'/admin/appointments', cta:'Manage', badge:'Live' },
  { icon:'🔧', title:'Services', desc:'Add, edit and configure available services and pricing tiers.', link:'/admin/services', cta:'Modify', badge:'Catalog' },
  { icon:'⚙️', title:'Mechanics', desc:'Manage mechanic profiles, workloads and task assignments.', link:'/admin/mechanics', cta:'Setup', badge:'Staff' },
  { icon:'🧾', title:'Invoices', desc:'Generate, view and track invoices and customer payments.', link:'/admin/invoices', cta:'Billing', badge:'Finance' },
  { icon:'📊', title:'Reports', desc:'Dive into business analytics, trends and performance data.', link:'/admin/reports', cta:'Analysis', badge:'Analytics' },
];

const SERVICES_ALLOC = [
  { name:'Oil Change', pct:45, color:'var(--red)' },
  { name:'Brake Service', pct:25, color:'var(--green)' },
  { name:'Diagnostics', pct:20, color:'var(--yellow)' },
  { name:'AC Service', pct:10, color:'var(--blue)' },
];

const MECHANICS = [
  { name:'Michael R.', status:'active', load:72 },
  { name:'Sarah C.', status:'busy', load:90 },
  { name:'David T.', status:'active', load:55 },
  { name:'James L.', status:'active', load:40 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_appointments:0, pending_count:0, approved_count:0, in_service_count:0, completed_count:0, cancelled_count:0, total_revenue:0 });
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (!loading) setTimeout(() => setAnimated(true), 100); }, [loading]);

  const loadStats = async () => {
    try {
      const res = await appointmentsAPI.getAppointmentStats();
      setStats(res.data.data.stats);
    } catch (e) { console.error('Error loading stats:', e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="ad-loading">
      <style>{S}</style>
      <div className="ad-spinner"></div>
      <div className="ad-loading-txt">Loading Dashboard...</div>
    </div>
  );

  const total = Number(stats.total_appointments) || 1;
  const completed = Number(stats.completed_count) || 0;
  const completionRate = Math.round((completed / total) * 100);

  const STATUS_ITEMS = [
    { label:'Pending', count:stats.pending_count, color:'var(--yellow)' },
    { label:'Approved', count:stats.approved_count, color:'var(--blue)' },
    { label:'In Service', count:stats.in_service_count, color:'var(--orange)' },
    { label:'Completed', count:stats.completed_count, color:'var(--green)' },
    { label:'Cancelled', count:stats.cancelled_count, color:'var(--red)' },
  ];

  return (
    <div className="ad">
      <style>{S}</style>
      <div className="ad-inner">

        {/* ── HEADER ── */}
        <div className="ad-header">
          <div>
            <div className="ad-eyebrow">Abe Garage Management</div>
            <h1 className="ad-title">Admin <em>Dashboard</em></h1>
            <div className="ad-sub">
              Welcome back, {user?.first_name}. System performance is optimal.
              <span className="ad-live"><span className="ad-live-dot"></span>Live</span>
            </div>
          </div>
          <div className="ad-header-actions">
            <button className="ad-btn-ghost" onClick={loadStats}>↻ Refresh</button>
            <button className="ad-btn-ghost">⬇ Export</button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="ad-stats">
          {[
            { label:'Total Appointments', num:stats.total_appointments, icon:'📋', color:'c-red', change:'↑ +12%' },
            { label:'Ongoing Repairs', num:stats.in_service_count, icon:'🔧', color:'c-orange', change:'Active' },
            { label:'Completed Jobs', num:stats.completed_count, icon:'✅', color:'c-green', change:`${completionRate}% rate` },
            { label:'Total Revenue', num:`$${Number(stats.total_revenue||0).toFixed(0)}`, icon:'💰', color:'c-purple', change:'↑ +8%', money:true },
          ].map((s, i) => (
            <div key={i} className={`ad-stat ${s.color}`}>
              <div className="ad-stat-accent"></div>
              <div className="ad-stat-inner">
                <div className="ad-stat-top">
                  <div className="ad-stat-icon">{s.icon}</div>
                  <span className="ad-stat-change">{s.change}</span>
                </div>
                <span className={`ad-stat-num${s.money?' money':''}`}>{s.num}</span>
                <span className="ad-stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── STATUS STRIP ── */}
        <div className="ad-status-strip">
          {STATUS_ITEMS.map(item => (
            <div key={item.label} className="ad-status-item">
              <div className="ad-status-dot" style={{ background:item.color }}></div>
              <div>
                <span className="ad-status-label">{item.label}</span>
                <span className="ad-status-count">{item.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK ACCESS ── */}
        <div className="ad-section-label">Quick Access</div>
        <div className="ad-quick">
          {QUICK_LINKS.map(card => (
            <div key={card.title} className="ad-quick-card">
              <div className="ad-quick-inner">
                <div className="ad-quick-top">
                  <div className="ad-quick-icon">{card.icon}</div>
                  <span className="ad-quick-badge">{card.badge}</span>
                </div>
                <div className="ad-quick-title">{card.title}</div>
                <div className="ad-quick-desc">{card.desc}</div>
                <Link to={card.link} className="ad-quick-link">
                  {card.cta} <span className="ad-quick-link-arrow">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── ANALYTICS ── */}
        <div className="ad-section-label">System Analytics</div>
        <div className="ad-analytics">

          {/* Revenue velocity */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title">
                <div className="ad-card-title-icon">📈</div>
                Revenue Velocity
              </div>
              <span style={{ fontFamily:'var(--fd)', fontSize:'11px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>
                ${Number(stats.total_revenue||0).toFixed(0)} total
              </span>
            </div>
            <div className="ad-card-body">
              {[
                { label:'Daily Revenue', val:'$1,240', pct:75, color:'var(--red)' },
                { label:'Weekly Target', val:'$8,680', pct:85, color:'var(--orange)' },
                { label:'Monthly Forecast', val:'$34,000', pct:62, color:'var(--yellow)' },
              ].map(r => (
                <div key={r.label} className="ad-rev-item">
                  <div className="ad-rev-row">
                    <span className="ad-rev-lbl">{r.label}</span>
                    <span className="ad-rev-val" style={{ color:r.color }}>{r.val}</span>
                  </div>
                  <div className="ad-bar-track">
                    <div className="ad-bar-fill" style={{ width: animated ? `${r.pct}%` : '0%', background:r.color, transition:'width 1s cubic-bezier(0.4,0,0.2,1)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service allocation */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title"><div className="ad-card-title-icon">🍩</div>Service Allocation</div>
            </div>
            <div className="ad-card-body">
              {SERVICES_ALLOC.map(s => (
                <div key={s.name} className="ad-alloc-item">
                  <div className="ad-alloc-dot" style={{ background:s.color }}></div>
                  <span className="ad-alloc-name">{s.name}</span>
                  <div className="ad-alloc-bar">
                    <div className="ad-alloc-fill" style={{ width: animated ? `${s.pct}%` : '0%', background:s.color, transition:'width 1s cubic-bezier(0.4,0,0.2,1)' }}></div>
                  </div>
                  <span className="ad-alloc-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="ad-bottom">

          {/* Mechanic workload */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title"><div className="ad-card-title-icon">⚙️</div>Mechanic Workload</div>
              <span style={{ fontFamily:'var(--fd)', fontSize:'10px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px' }}>85% Capacity</span>
            </div>
            <div className="ad-card-body">
              <div className="ad-workload">
                {MECHANICS.map(m => (
                  <div key={m.name} className="ad-mech-item">
                    <div className="ad-mech-avatar">{m.name[0]}</div>
                    <span className="ad-mech-name">{m.name}</span>
                    <span className={`ad-mech-status ${m.status}`}>{m.status}</span>
                    <div className="ad-mech-bar">
                      <div className={`ad-mech-bar-fill${m.load >= 80 ? ' high' : ''}`} style={{ width: animated ? `${m.load}%` : '0%', transition:'width 1s cubic-bezier(0.4,0,0.2,1)' }}></div>
                    </div>
                    <span style={{ fontFamily:'var(--fd)', fontSize:'11px', color:'var(--muted)', minWidth:'30px', textAlign:'right' }}>{m.load}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Efficiency metrics */}
          <div className="ad-card">
            <div className="ad-card-head">
              <div className="ad-card-title"><div className="ad-card-title-icon">📊</div>Efficiency Metrics</div>
            </div>
            <div className="ad-card-body">
              <div className="ad-metrics-nums">
                <div className="ad-metric-num">
                  <span className="ad-metric-val" style={{ color:'var(--white)' }}>{stats.total_appointments}</span>
                  <span className="ad-metric-lbl">Total</span>
                </div>
                <div className="ad-metric-num">
                  <span className="ad-metric-val" style={{ color:'var(--yellow)' }}>{stats.pending_count}</span>
                  <span className="ad-metric-lbl">Pending</span>
                </div>
                <div className="ad-metric-num">
                  <span className="ad-metric-val" style={{ color:'var(--green)' }}>{stats.completed_count}</span>
                  <span className="ad-metric-lbl">Done</span>
                </div>
              </div>
              <div>
                <div className="ad-progress-row">
                  <span className="ad-progress-lbl">Completion Rate</span>
                  <span className="ad-progress-pct">{completionRate}%</span>
                </div>
                <div className="ad-progress-track">
                  <div className="ad-progress-fill" style={{ width: animated ? `${completionRate}%` : '0%' }}></div>
                </div>
              </div>
              <div style={{ marginTop:'16px' }}>
                <div className="ad-progress-row">
                  <span className="ad-progress-lbl">In-Service Rate</span>
                  <span className="ad-progress-pct" style={{ color:'var(--orange)' }}>
                    {Math.round((Number(stats.in_service_count||0)/total)*100)}%
                  </span>
                </div>
                <div className="ad-progress-track">
                  <div className="ad-progress-fill" style={{ width: animated ? `${Math.round((Number(stats.in_service_count||0)/total)*100)}%` : '0%', background:'var(--orange)' }}></div>
                </div>
              </div>
              <div style={{ marginTop:'16px' }}>
                <div className="ad-progress-row">
                  <span className="ad-progress-lbl">Approval Rate</span>
                  <span className="ad-progress-pct" style={{ color:'var(--blue)' }}>
                    {Math.round((Number(stats.approved_count||0)/total)*100)}%
                  </span>
                </div>
                <div className="ad-progress-track">
                  <div className="ad-progress-fill" style={{ width: animated ? `${Math.round((Number(stats.approved_count||0)/total)*100)}%` : '0%', background:'var(--blue)' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}