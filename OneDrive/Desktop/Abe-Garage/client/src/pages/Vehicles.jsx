import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import VehicleHealthDashboard from "../components/health/VehicleHealthDashboard";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const S = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
  :root {
    --black:#080808; --dark:#101010; --dark2:#161616; --dark3:#1e1e1e;
    --gray:#2a2a2a; --gray2:#333; --muted:#555; --light:#999; --lighter:#bbb;
    --white:#f2f0eb; --red:#e63329; --red-dark:#b82820; --yellow:#f5c518;
    --green:#22c55e; --green2:rgba(34,197,94,0.12); --blue:#3b82f6;
    --orange:#f97316;
    --border:rgba(255,255,255,0.06); --border2:rgba(255,255,255,0.10); --border3:rgba(255,255,255,0.16);
    --fd:'Barlow Condensed',sans-serif; --fb:'Barlow',sans-serif;
  }
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--black); font-family:var(--fb); color:var(--white); -webkit-font-smoothing:antialiased; }
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--dark)} ::-webkit-scrollbar-thumb{background:var(--gray2)} ::-webkit-scrollbar-thumb:hover{background:var(--red)}

  /* PAGE */
  .vp { background:var(--black); min-height:100vh; padding:32px 40px; position:relative; }
  .vp::before {
    content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.3;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  }
  .vp-inner { position:relative; z-index:1; max-width:1400px; margin:0 auto; }

  /* ── PAGE HEADER ── */
  .vp-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:32px; gap:24px; flex-wrap:wrap; }
  .vp-header-left {}
  .vp-eyebrow { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:3px; color:var(--red); display:inline-flex; align-items:center; gap:8px; margin-bottom:8px; }
  .vp-eyebrow::before { content:''; display:block; width:24px; height:2px; background:var(--red); }
  .vp-title { font-family:var(--fd); font-size:clamp(36px,5vw,56px); font-weight:900; text-transform:uppercase; letter-spacing:-1px; line-height:0.9; }
  .vp-title em { font-style:normal; color:var(--yellow); }
  .vp-subtitle { font-size:14px; color:var(--light); margin-top:8px; display:flex; align-items:center; gap:10px; }
  .vp-count { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.2); font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; color:var(--red); }
  .vp-header-right { display:flex; gap:10px; align-items:center; flex-shrink:0; }

  /* BUTTONS */
  .btn-primary { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; background:var(--red); color:white; border:none; cursor:pointer; font-family:var(--fd); font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:2px; text-decoration:none; transition:background 0.2s; white-space:nowrap; }
  .btn-primary:hover { background:var(--red-dark); }
  .btn-outline { display:inline-flex; align-items:center; gap:8px; padding:12px 20px; background:transparent; color:var(--lighter); border:1px solid var(--border2); cursor:pointer; font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; }
  .btn-outline:hover { border-color:var(--red); color:var(--red); }
  .btn-ghost { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; background:transparent; color:var(--light); border:1px solid var(--border); cursor:pointer; font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; }
  .btn-ghost:hover { border-color:var(--border2); color:var(--white); }
  .btn-icon { width:36px; height:36px; background:transparent; border:1px solid var(--border); color:var(--light); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; font-size:16px; }
  .btn-icon:hover { border-color:var(--red); color:var(--red); }

  /* ── STATS GRID ── */
  .vp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); margin-bottom:28px; }
  .vp-stat { padding:24px 28px; border-right:1px solid var(--border); position:relative; overflow:hidden; transition:background 0.2s; }
  .vp-stat:last-child { border-right:none; }
  .vp-stat:hover { background:rgba(255,255,255,0.02); }
  .vp-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .vp-stat:hover::before { transform:scaleX(1); }
  .vp-stat.c-red::before { background:var(--red); }
  .vp-stat.c-green::before { background:var(--green); }
  .vp-stat.c-yellow::before { background:var(--yellow); }
  .vp-stat.c-blue::before { background:var(--blue); }
  .vp-stat-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
  .vp-stat-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:20px; background:var(--dark3); border:1px solid var(--border); }
  .vp-stat-badge { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--green); }
  .vp-stat-badge.warn { color:var(--yellow); }
  .vp-stat-num { font-family:var(--fd); font-size:48px; font-weight:900; line-height:1; color:var(--yellow); display:block; }
  .vp-stat-lbl { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-top:4px; display:block; }

  /* ── ANALYTICS ── */
  .vp-analytics { background:var(--dark2); border:1px solid var(--border); margin-bottom:28px; }
  .vp-analytics-head { padding:18px 24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; }
  .vp-analytics-title { font-family:var(--fd); font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:10px; }
  .vp-analytics-title-icon { width:32px; height:32px; background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.2); display:flex; align-items:center; justify-content:center; font-size:15px; }
  .vp-analytics-actions { display:flex; gap:8px; }
  .vp-analytics-body { padding:24px; display:grid; grid-template-columns:1fr 340px; gap:32px; }
  .vp-chart-label { font-family:var(--fd); font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-bottom:16px; }
  .vp-fleet-stats { display:flex; flex-direction:column; gap:0; }
  .vp-fleet-row { display:flex; justify-content:space-between; align-items:center; padding:13px 0; border-bottom:1px solid var(--border); }
  .vp-fleet-row:last-child { border-bottom:none; }
  .vp-fleet-key { font-size:13px; color:var(--light); }
  .vp-fleet-val { font-family:var(--fd); font-size:16px; font-weight:800; }
  .vp-fleet-val.red { color:var(--red); }
  .vp-fleet-val.green { color:var(--green); }
  .vp-fleet-val.yellow { color:var(--yellow); }
  .vp-fleet-val.blue { color:var(--blue); }

  /* ── CONTROLS ── */
  .vp-controls { background:var(--dark2); border:1px solid var(--border); padding:20px 24px; margin-bottom:20px; display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .vp-search { display:flex; align-items:center; gap:0; flex:1; min-width:240px; }
  .vp-search-icon { width:44px; height:44px; background:var(--dark3); border:1px solid var(--border2); border-right:none; display:flex; align-items:center; justify-content:center; font-size:16px; color:var(--muted); flex-shrink:0; }
  .vp-search-input { flex:1; height:44px; background:var(--dark3); border:1px solid var(--border2); color:var(--white); font-family:var(--fb); font-size:14px; padding:0 14px; outline:none; transition:border-color 0.2s; }
  .vp-search-input:focus { border-color:var(--red); }
  .vp-search-input::placeholder { color:var(--muted); }
  .vp-search-clear { width:44px; height:44px; background:var(--dark3); border:1px solid var(--border2); border-left:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); font-size:18px; transition:color 0.15s; flex-shrink:0; }
  .vp-search-clear:hover { color:var(--red); }
  .vp-filter-btn { position:relative; }
  .vp-filter-dd { position:absolute; top:calc(100% + 6px); left:0; width:200px; background:var(--dark2); border:1px solid var(--border2); box-shadow:0 8px 32px rgba(0,0,0,0.7); z-index:100; }
  .vp-filter-dd-head { padding:10px 16px; border-bottom:1px solid var(--border); font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }
  .vp-filter-dd-item { display:block; padding:10px 16px; font-size:13px; color:var(--light); cursor:pointer; transition:all 0.15s; border:none; background:none; width:100%; text-align:left; font-family:var(--fb); }
  .vp-filter-dd-item:hover, .vp-filter-dd-item.active { background:rgba(255,255,255,0.04); color:var(--white); }
  .vp-filter-dd-item.active::after { content:'✓'; float:right; color:var(--red); }
  .vp-controls-right { margin-left:auto; font-size:12px; color:var(--muted); font-family:var(--fd); text-transform:uppercase; letter-spacing:1px; white-space:nowrap; }

  /* ── BULK BAR ── */
  .vp-bulk { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:14px 20px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
  .vp-bulk-info { display:flex; align-items:center; gap:10px; font-family:var(--fd); font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
  .vp-bulk-dot { width:8px; height:8px; background:var(--blue); border-radius:50%; }
  .vp-bulk-actions { display:flex; gap:8px; }

  /* ── VEHICLE CARDS ── */
  .vp-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(320px,1fr)); gap:16px; margin-bottom:32px; }
  .vc { background:var(--dark2); border:1px solid var(--border); position:relative; overflow:hidden; transition:border-color 0.2s, transform 0.2s; cursor:default; display:flex; flex-direction:column; }
  .vc:hover { border-color:var(--border2); transform:translateY(-2px); }
  .vc::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
  .vc:hover::before { transform:scaleX(1); }
  .vc.st-success::before { background:var(--green); }
  .vc.st-warning::before { background:var(--yellow); }
  .vc.st-danger::before { background:var(--red); }
  .vc.st-secondary::before { background:var(--muted); }
  .vc-head { padding:18px 18px 14px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:flex-start; }
  .vc-head-left { display:flex; align-items:center; gap:10px; }
  .vc-check { width:18px; height:18px; border:1px solid var(--border2); background:var(--dark3); appearance:none; cursor:pointer; position:relative; transition:all 0.15s; flex-shrink:0; }
  .vc-check:checked { background:var(--red); border-color:var(--red); }
  .vc-check:checked::after { content:'✓'; position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; color:white; }
  .vc-type-icon { font-size:24px; }
  .vc-status-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; font-family:var(--fd); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; }
  .vc-status-badge.st-success { background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.2); color:var(--green); }
  .vc-status-badge.st-warning { background:rgba(245,197,24,0.1); border:1px solid rgba(245,197,24,0.2); color:var(--yellow); }
  .vc-status-badge.st-danger { background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.2); color:var(--red); }
  .vc-status-badge.st-secondary { background:rgba(255,255,255,0.04); border:1px solid var(--border); color:var(--muted); }
  .vc-status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }
  .vc-id { font-family:var(--fd); font-size:11px; font-weight:700; color:var(--muted); letter-spacing:1px; }
  .vc-body { padding:16px 18px; flex:1; }
  .vc-name { font-family:var(--fd); font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; line-height:1; }
  .vc-plate { display:inline-block; padding:3px 10px; background:var(--dark3); border:1px solid var(--border2); font-family:var(--fd); font-size:13px; font-weight:800; letter-spacing:2px; color:var(--white); margin-bottom:6px; }
  .vc-vin { font-size:11px; color:var(--muted); margin-bottom:12px; }
  .vc-customer { display:flex; align-items:center; gap:6px; margin-bottom:12px; padding:8px 10px; background:var(--dark3); border:1px solid var(--border); }
  .vc-customer-avatar { width:24px; height:24px; background:var(--red); display:flex; align-items:center; justify-content:center; font-family:var(--fd); font-size:11px; font-weight:900; color:white; flex-shrink:0; }
  .vc-customer-name { font-size:12px; font-weight:600; }
  .vc-customer-email { font-size:11px; color:var(--muted); }
  .vc-specs { display:grid; grid-template-columns:repeat(3,1fr); gap:0; border:1px solid var(--border); margin-bottom:12px; }
  .vc-spec { padding:10px 12px; border-right:1px solid var(--border); text-align:center; }
  .vc-spec:last-child { border-right:none; }
  .vc-spec-icon { font-size:16px; display:block; margin-bottom:4px; }
  .vc-spec-lbl { font-family:var(--fd); font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--muted); display:block; }
  .vc-spec-val { font-size:11px; color:var(--lighter); display:block; margin-top:2px; text-transform:capitalize; }
  .vc-color { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .vc-color-dot { width:14px; height:14px; border:1px solid var(--border2); border-radius:2px; flex-shrink:0; }
  .vc-color-lbl { font-size:12px; color:var(--muted); text-transform:capitalize; }
  .vc-progress { margin-bottom:10px; }
  .vc-progress-head { display:flex; justify-content:space-between; margin-bottom:5px; }
  .vc-progress-lbl { font-family:var(--fd); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--muted); }
  .vc-progress-days { font-family:var(--fd); font-size:11px; font-weight:800; }
  .vc-progress-days.st-success { color:var(--green); }
  .vc-progress-days.st-warning { color:var(--yellow); }
  .vc-progress-days.st-danger { color:var(--red); }
  .vc-progress-bar { height:4px; background:var(--dark3); position:relative; overflow:hidden; }
  .vc-progress-fill { height:100%; transition:width 0.5s ease; }
  .vc-progress-fill.st-success { background:var(--green); }
  .vc-progress-fill.st-warning { background:var(--yellow); }
  .vc-progress-fill.st-danger { background:var(--red); }
  .vc-dates { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
  .vc-date { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted); }
  .vc-date-icon { width:14px; text-align:center; }
  .vc-notes { font-size:12px; color:var(--muted); font-style:italic; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; padding:8px; background:var(--dark3); border:1px solid var(--border); border-left:2px solid var(--red); margin-bottom:10px; }
  .vc-foot { padding:12px 18px; border-top:1px solid var(--border); display:flex; gap:6px; }
  .vc-action-icon { width:34px; height:34px; background:transparent; border:1px solid var(--border); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; transition:all 0.15s; flex-shrink:0; }
  .vc-action-icon:hover { border-color:var(--border2); color:var(--lighter); }
  .vc-action-icon.danger:hover { border-color:rgba(230,51,41,0.4); color:var(--red); }
  .vc-action-main { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; background:transparent; border:1px solid var(--border); color:var(--lighter); cursor:pointer; font-family:var(--fd); font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1.5px; transition:all 0.2s; height:34px; }
  .vc-action-main:hover { border-color:var(--red); color:var(--red); background:rgba(230,51,41,0.04); }

  /* ── EMPTY STATE ── */
  .vp-empty { background:var(--dark2); border:1px solid var(--border); padding:80px 40px; text-align:center; }
  .vp-empty-icon { font-size:56px; opacity:0.3; margin-bottom:20px; }
  .vp-empty-title { font-family:var(--fd); font-size:28px; font-weight:900; text-transform:uppercase; margin-bottom:10px; }
  .vp-empty-desc { font-size:14px; color:var(--muted); margin-bottom:28px; }

  /* ── LOADING ── */
  .vp-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; gap:16px; }
  .vp-spinner { width:40px; height:40px; border:3px solid var(--border); border-top-color:var(--red); border-radius:50%; animation:spin 0.7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .vp-loading-txt { font-family:var(--fd); font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }

  /* ── PAGINATION ── */
  .vp-pagination { display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:32px; flex-wrap:wrap; }
  .vp-page-info { font-family:var(--fd); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-right:8px; }
  .vp-page-btn { width:36px; height:36px; background:transparent; border:1px solid var(--border); color:var(--light); display:flex; align-items:center; justify-content:center; cursor:pointer; font-family:var(--fd); font-size:13px; font-weight:700; transition:all 0.15s; }
  .vp-page-btn:hover:not(:disabled) { border-color:var(--red); color:var(--red); }
  .vp-page-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .vp-page-btn.active { background:var(--red); border-color:var(--red); color:white; }
  .vp-page-ellipsis { color:var(--muted); font-size:13px; }

  /* ── MODAL OVERLAY ── */
  .vp-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.2s ease; }
  .vp-modal { background:var(--dark2); border:1px solid var(--border2); width:100%; max-width:760px; max-height:90vh; display:flex; flex-direction:column; animation:slideUp 0.25s ease; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  .vp-modal.xl { max-width:1100px; }
  .vp-modal.sm { max-width:480px; }
  .vp-modal-head { padding:20px 24px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
  .vp-modal-head.danger { background:linear-gradient(90deg, rgba(230,51,41,0.08), transparent); border-bottom-color:rgba(230,51,41,0.2); }
  .vp-modal-title { font-family:var(--fd); font-size:22px; font-weight:900; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:10px; }
  .vp-modal-title-icon { width:36px; height:36px; background:rgba(230,51,41,0.1); border:1px solid rgba(230,51,41,0.2); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .vp-modal-close { width:36px; height:36px; background:transparent; border:1px solid var(--border); color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:all 0.2s; flex-shrink:0; }
  .vp-modal-close:hover { border-color:var(--red); color:var(--red); }
  .vp-modal-body { padding:24px; overflow-y:auto; flex:1; }
  .vp-modal-body::-webkit-scrollbar { width:4px; }
  .vp-modal-body::-webkit-scrollbar-thumb { background:var(--gray2); }
  .vp-modal-foot { padding:16px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; flex-shrink:0; }

  /* ── FORM ── */
  .vp-form-section { margin-bottom:24px; }
  .vp-form-section-title { font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-bottom:14px; padding-bottom:8px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
  .vp-form-section-title::before { content:''; display:block; width:3px; height:14px; background:var(--red); }
  .vp-form-row { display:grid; gap:14px; margin-bottom:14px; }
  .vp-form-row.cols-2 { grid-template-columns:1fr 1fr; }
  .vp-form-row.cols-3 { grid-template-columns:1fr 1fr 1fr; }
  .vp-form-row.cols-4 { grid-template-columns:1fr 1fr 1fr 1fr; }
  .vp-field { display:flex; flex-direction:column; gap:6px; }
  .vp-label { font-family:var(--fd); font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:var(--muted); }
  .vp-label.req::after { content:' *'; color:var(--red); }
  .vp-input { height:42px; background:var(--dark3); border:1px solid var(--border); color:var(--white); font-family:var(--fb); font-size:14px; padding:0 14px; outline:none; transition:border-color 0.2s; appearance:none; -webkit-appearance:none; }
  .vp-input:focus { border-color:var(--red); }
  .vp-input::placeholder { color:var(--muted); }
  .vp-textarea { background:var(--dark3); border:1px solid var(--border); color:var(--white); font-family:var(--fb); font-size:14px; padding:12px 14px; outline:none; resize:vertical; min-height:90px; transition:border-color 0.2s; }
  .vp-textarea:focus { border-color:var(--red); }
  .vp-textarea::placeholder { color:var(--muted); }
  .vp-select { height:42px; background:var(--dark3); border:1px solid var(--border); color:var(--white); font-family:var(--fb); font-size:14px; padding:0 14px; outline:none; cursor:pointer; transition:border-color 0.2s; appearance:none; -webkit-appearance:none; }
  .vp-select:focus { border-color:var(--red); }
  .vp-select option { background:var(--dark3); }

  /* ── DETAILS MODAL ── */
  .vp-details-hero { text-align:center; padding:24px; background:var(--dark3); border:1px solid var(--border); margin-bottom:20px; }
  .vp-details-hero-icon { font-size:48px; margin-bottom:10px; display:block; }
  .vp-details-hero-title { font-family:var(--fd); font-size:28px; font-weight:900; text-transform:uppercase; }
  .vp-details-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .vp-details-section { background:var(--dark3); border:1px solid var(--border); padding:18px; }
  .vp-details-section-title { font-family:var(--fd); font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:var(--muted); margin-bottom:14px; display:flex; align-items:center; gap:8px; }
  .vp-detail-row { display:flex; justify-content:space-between; padding:9px 0; border-bottom:1px solid var(--border); font-size:13px; }
  .vp-detail-row:last-child { border-bottom:none; }
  .vp-detail-key { color:var(--muted); }
  .vp-detail-val { color:var(--lighter); font-weight:500; }

  /* ── HISTORY ── */
  .vp-timeline { display:flex; flex-direction:column; gap:0; }
  .vp-tl-item { display:flex; gap:16px; padding:18px 0; border-bottom:1px solid var(--border); position:relative; }
  .vp-tl-item:last-child { border-bottom:none; }
  .vp-tl-dot { width:36px; height:36px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .vp-tl-content { flex:1; }
  .vp-tl-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
  .vp-tl-name { font-family:var(--fd); font-size:16px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; }
  .vp-tl-date { font-size:12px; color:var(--muted); }
  .vp-tl-desc { font-size:13px; color:var(--light); line-height:1.6; margin-bottom:8px; }
  .vp-tl-foot { display:flex; justify-content:space-between; align-items:center; }
  .vp-tl-cost { font-family:var(--fd); font-size:18px; font-weight:900; color:var(--yellow); }
  .vp-tl-tech { font-size:12px; color:var(--muted); }

  /* ── DELETE MODAL ── */
  .vp-delete-body { text-align:center; padding:32px; }
  .vp-delete-icon { font-size:56px; display:block; margin-bottom:16px; }
  .vp-delete-title { font-family:var(--fd); font-size:28px; font-weight:900; text-transform:uppercase; margin-bottom:10px; }
  .vp-delete-desc { font-size:14px; color:var(--muted); line-height:1.7; }
  .btn-danger { display:inline-flex; align-items:center; gap:8px; padding:12px 22px; background:var(--red); color:white; border:none; cursor:pointer; font-family:var(--fd); font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:2px; transition:background 0.2s; }
  .btn-danger:hover { background:var(--red-dark); }

  /* ── ALERT ── */
  .vp-alert { display:flex; align-items:center; gap:12px; padding:14px 18px; background:rgba(230,51,41,0.08); border:1px solid rgba(230,51,41,0.25); margin-bottom:20px; font-size:13px; color:var(--lighter); position:relative; }
  .vp-alert-close { position:absolute; right:14px; background:none; border:none; color:var(--muted); cursor:pointer; font-size:18px; transition:color 0.15s; }
  .vp-alert-close:hover { color:var(--red); }

  /* RESPONSIVE */
  @media (max-width:1100px) {
    .vp-stats { grid-template-columns:repeat(2,1fr); }
    .vp-stat:nth-child(2) { border-right:none; }
    .vp-stat:nth-child(1), .vp-stat:nth-child(2) { border-bottom:1px solid var(--border); }
    .vp-analytics-body { grid-template-columns:1fr; }
    .vp-form-row.cols-4 { grid-template-columns:1fr 1fr; }
    .vp-details-grid { grid-template-columns:1fr; }
  }
  @media (max-width:768px) {
    .vp { padding:20px; }
    .vp-header { flex-direction:column; align-items:flex-start; }
    .vp-stats { grid-template-columns:1fr 1fr; }
    .vp-grid { grid-template-columns:1fr; }
    .vp-controls { flex-direction:column; }
    .vp-search { width:100%; }
    .vp-controls-right { margin-left:0; }
    .vp-form-row.cols-2, .vp-form-row.cols-3, .vp-form-row.cols-4 { grid-template-columns:1fr; }
    .vp-overlay { padding:12px; }
    .vp-bulk-actions { flex-wrap:wrap; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = ['sedan','suv','truck','van','coupe','hatchback','wagon','convertible','motorcycle','other'];
const ENGINE_TYPES = ['gasoline','diesel','electric','hybrid','other'];
const TRANSMISSIONS = ['automatic','manual','cvt'];
const CHART_COLORS = ['#e63329','#f5c518','#22c55e','#3b82f6','#f97316','#a855f7','#06b6d4','#ec4899'];

const VEHICLE_ICONS = { sedan:'🚗', suv:'🚙', truck:'🛻', van:'🚐', coupe:'🏎', hatchback:'🚗', wagon:'🚗', convertible:'🏎', motorcycle:'🏍', other:'🚗' };
const ENGINE_ICONS = { gasoline:'⛽', diesel:'🛢', electric:'⚡', hybrid:'🔋', other:'⚙️' };
const TRANS_ICONS = { automatic:'⚙️', manual:'🔧', cvt:'🔩' };

const getStatusColor = (vehicle) => {
  if (!vehicle?.is_active) return 'secondary';
  const today = new Date();
  const getDays = (d) => d ? Math.ceil((new Date(d) - today) / 86400000) : Infinity;
  const min = Math.min(getDays(vehicle.next_service_due), getDays(vehicle.registration_expiry), getDays(vehicle.insurance_expiry));
  if (min <= 7) return 'danger';
  if (min <= 30) return 'warning';
  return 'success';
};

const STATUS_LABELS = { success:'Excellent', warning:'Attention', danger:'Urgent', secondary:'Inactive' };

const getMaintenancePct = (v) => {
  if (!v.last_service_date || !v.next_service_due) return 0;
  const total = new Date(v.next_service_due) - new Date(v.last_service_date);
  const passed = new Date() - new Date(v.last_service_date);
  return Math.min(Math.max((passed / total) * 100, 0), 100);
};

const getDaysUntil = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : 'N/A';

// ─── Component ────────────────────────────────────────────────────────────────

const BLANK_FORM = { customer_id:'', license_plate:'', vin:'', make:'', model:'', year: new Date().getFullYear(), color:'', vehicle_type:'sedan', engine_type:'gasoline', transmission:'automatic', mileage:0, last_service_date:'', next_service_due:'', registration_expiry:'', insurance_expiry:'', notes:'' };

export default function Vehicles() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type:'all', status:'all' });
  const [sortCfg, setSortCfg] = useState({ key:'year', dir:'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 8;

  const [selectedIds, setSelectedIds] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [openFilter, setOpenFilter] = useState(null);

  // Modals
  const [modal, setModal] = useState(null); // 'add'|'edit'|'details'|'history'|'health'|'delete'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [form, setForm] = useState({ ...BLANK_FORM });

  useEffect(() => { fetchVehicles(); if (isAdmin) fetchCustomers(); }, []);
  useEffect(() => { applyFilters(); }, [vehicles, search, filters, sortCfg]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const url = user?.role === 'customer' ? `/vehicles?customer_id=${user.id}` : '/vehicles';
      const res = await api.get(url);
      setVehicles(res.data);
      setError(null);
    } catch { setError('Failed to fetch vehicles'); }
    finally { setLoading(false); }
  };
  const fetchCustomers = async () => { try { const r = await api.get('/users?role=customer'); setCustomers(r.data); } catch {} };
  const fetchHistory = async (v) => {
    try {
      const r = await api.get(`/vehicles/${v.id}/service-history`);
      setServiceHistory(r.data);
      setSelectedVehicle(v);
      setModal('history');
    } catch { alert('Failed to fetch service history'); }
  };

  const applyFilters = () => {
    let f = vehicles.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !q || [v.license_plate, v.make, v.model, v.vin, v.customer_name, v.color].some(s => s?.toLowerCase().includes(q));
      const matchType = filters.type === 'all' || v.vehicle_type === filters.type;
      const matchStatus = filters.status === 'all' || getStatusColor(v) === filters.status;
      return matchSearch && matchType && matchStatus;
    });
    f.sort((a, b) => {
      const dir = sortCfg.dir === 'asc' ? 1 : -1;
      return a[sortCfg.key] < b[sortCfg.key] ? -dir : a[sortCfg.key] > b[sortCfg.key] ? dir : 0;
    });
    setFiltered(f);
    setCurrentPage(1);
  };

  const openAdd = () => { setEditingVehicle(null); setForm({ ...BLANK_FORM, customer_id: user?.role === 'customer' ? user.id : '' }); setModal('add'); };
  const openEdit = (v) => { setEditingVehicle(v); setForm({ customer_id:v.customer_id||'', license_plate:v.license_plate||'', vin:v.vin||'', make:v.make||'', model:v.model||'', year:v.year, color:v.color||'', vehicle_type:v.vehicle_type||'sedan', engine_type:v.engine_type||'gasoline', transmission:v.transmission||'automatic', mileage:v.mileage||0, last_service_date:v.last_service_date||'', next_service_due:v.next_service_due||'', registration_expiry:v.registration_expiry||'', insurance_expiry:v.insurance_expiry||'', notes:v.notes||'' }); setModal('edit'); };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (user?.role === 'customer' && !editingVehicle) data.customer_id = user.id;
      if (editingVehicle) await api.put(`/vehicles/${editingVehicle.id}`, data);
      else await api.post('/vehicles', data);
      setModal(null);
      fetchVehicles();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save vehicle'); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/vehicles/${selectedVehicle?.id || selectedVehicle}`); setModal(null); fetchVehicles(); }
    catch { alert('Failed to delete vehicle'); }
  };

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const clearSelection = () => setSelectedIds([]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentVehicles = filtered.slice((currentPage-1)*PER_PAGE, currentPage*PER_PAGE);

  // Analytics
  const total = vehicles.length || 1;
  const active = vehicles.filter(v => v.is_active).length;
  const serviceDue = vehicles.filter(v => { const d = getDaysUntil(v.next_service_due); return d !== null && d <= 30; }).length;
  const excellent = vehicles.filter(v => getStatusColor(v) === 'success').length;

  const makeData = Object.entries(vehicles.reduce((acc, v) => { if (v.make) acc[v.make] = (acc[v.make]||0)+1; return acc; }, {})).map(([name,count])=>({name,count}));

  const statusPieData = [
    { name:'Excellent', value: excellent },
    { name:'Attention', value: vehicles.filter(v => getStatusColor(v) === 'warning').length },
    { name:'Urgent', value: vehicles.filter(v => getStatusColor(v) === 'danger').length },
    { name:'Inactive', value: vehicles.filter(v => getStatusColor(v) === 'secondary').length },
  ].filter(d => d.value > 0);

  const avgAge = vehicles.length ? Math.round(vehicles.reduce((a, v) => a + (new Date().getFullYear() - v.year), 0) / vehicles.length) : 0;
  const topMake = makeData.sort((a,b) => b.count - a.count)[0]?.name || 'N/A';

  // Close filters on outside click
  const filterRef = useRef(null);
  useEffect(() => {
    const fn = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setOpenFilter(null); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const closeModal = () => { setModal(null); setSelectedVehicle(null); };

  return (
    <div className="vp">
      <style>{S}</style>
      <div className="vp-inner">

        {/* ── HEADER ── */}
        <div className="vp-header">
          <div className="vp-header-left">
            <div className="vp-eyebrow">{isAdmin ? 'Fleet Management' : 'My Garage'}</div>
            <h1 className="vp-title">{isAdmin ? <>Vehicle <em>Fleet</em></> : <>My <em>Vehicles</em></>}</h1>
            <div className="vp-subtitle">
              {isAdmin ? 'Manage and monitor all customer vehicles' : 'Track and maintain your vehicles'}
              <span className="vp-count">🚗 {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}</span>
            </div>
          </div>
          <div className="vp-header-right">
            {isAdmin && <button className="btn-outline" onClick={() => setShowAnalytics(p => !p)}>📊 {showAnalytics ? 'Hide' : 'Show'} Analytics</button>}
            <button className="btn-primary" onClick={openAdd}>＋ {isAdmin ? 'Add Vehicle' : 'Add My Vehicle'}</button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="vp-stats">
          <div className="vp-stat c-red">
            <div className="vp-stat-top"><div className="vp-stat-icon">🚗</div><span className="vp-stat-badge">↑ +12%</span></div>
            <span className="vp-stat-num">{vehicles.length}</span>
            <span className="vp-stat-lbl">Total Vehicles</span>
          </div>
          <div className="vp-stat c-green">
            <div className="vp-stat-top"><div className="vp-stat-icon">✅</div><span className="vp-stat-badge">{Math.round((active/total)*100)}% of fleet</span></div>
            <span className="vp-stat-num">{active}</span>
            <span className="vp-stat-lbl">Active Vehicles</span>
          </div>
          <div className="vp-stat c-yellow">
            <div className="vp-stat-top"><div className="vp-stat-icon">🔧</div><span className="vp-stat-badge warn">Next 30 days</span></div>
            <span className="vp-stat-num">{serviceDue}</span>
            <span className="vp-stat-lbl">Service Due</span>
          </div>
          <div className="vp-stat c-blue">
            <div className="vp-stat-top"><div className="vp-stat-icon">⭐</div><span className="vp-stat-badge">Overall</span></div>
            <span className="vp-stat-num">{Math.round((excellent/total)*100)}%</span>
            <span className="vp-stat-lbl">Fleet Health</span>
          </div>
        </div>

        {/* ── ANALYTICS ── */}
        {showAnalytics && isAdmin && vehicles.length > 0 && (
          <div className="vp-analytics">
            <div className="vp-analytics-head">
              <div className="vp-analytics-title">
                <div className="vp-analytics-title-icon">📈</div>
                Advanced Vehicle Analytics
              </div>
              <div className="vp-analytics-actions">
                <button className="btn-icon" title="Refresh" onClick={fetchVehicles}>↻</button>
                <button className="btn-icon" title="Download">⬇</button>
              </div>
            </div>
            <div className="vp-analytics-body">
              <div>
                <div className="vp-chart-label">Fleet by Make</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={makeData} margin={{ top:10, right:10, left:-10, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill:'#555', fontSize:11, fontFamily:'Barlow Condensed' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#555', fontSize:11 }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ background:'#161616', border:'1px solid rgba(255,255,255,0.1)', borderRadius:0, color:'#f2f0eb', fontFamily:'Barlow' }} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="count" radius={[2,2,0,0]}>
                      {makeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="vp-chart-label">Fleet Health</div>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                      {statusPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <RTooltip contentStyle={{ background:'#161616', border:'1px solid rgba(255,255,255,0.1)', borderRadius:0, color:'#f2f0eb', fontFamily:'Barlow' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="vp-fleet-stats" style={{ marginTop:'12px' }}>
                  <div className="vp-fleet-row"><span className="vp-fleet-key">Avg Vehicle Age</span><span className="vp-fleet-val red">{avgAge} yrs</span></div>
                  <div className="vp-fleet-row"><span className="vp-fleet-key">Most Common Make</span><span className="vp-fleet-val green">{topMake}</span></div>
                  <div className="vp-fleet-row"><span className="vp-fleet-key">Service Due</span><span className="vp-fleet-val yellow">{serviceDue}</span></div>
                  <div className="vp-fleet-row"><span className="vp-fleet-key">Compliance Rate</span><span className="vp-fleet-val blue">{Math.round(((total-serviceDue)/total)*100)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTROLS ── */}
        <div className="vp-controls" ref={filterRef}>
          <div className="vp-search">
            <div className="vp-search-icon">🔍</div>
            <input className="vp-search-input" placeholder="Search plate, make, model, VIN..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <div className="vp-search-clear" onClick={() => setSearch('')}>✕</div>}
          </div>

          {/* Type filter */}
          <div style={{ position:'relative' }} className="vp-filter-btn">
            <button className="btn-ghost" onClick={() => setOpenFilter(p => p === 'type' ? null : 'type')}>
              ⊟ Type {filters.type !== 'all' && `· ${filters.type}`}
            </button>
            {openFilter === 'type' && (
              <div className="vp-filter-dd">
                <div className="vp-filter-dd-head">Vehicle Type</div>
                <button className={`vp-filter-dd-item${filters.type === 'all' ? ' active' : ''}`} onClick={() => { setFilters(p => ({...p,type:'all'})); setOpenFilter(null); }}>All Types</button>
                {VEHICLE_TYPES.map(t => <button key={t} className={`vp-filter-dd-item${filters.type === t ? ' active' : ''}`} onClick={() => { setFilters(p => ({...p,type:t})); setOpenFilter(null); }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div style={{ position:'relative' }} className="vp-filter-btn">
            <button className="btn-ghost" onClick={() => setOpenFilter(p => p === 'status' ? null : 'status')}>
              ◎ Status {filters.status !== 'all' && `· ${STATUS_LABELS[filters.status]}`}
            </button>
            {openFilter === 'status' && (
              <div className="vp-filter-dd">
                <div className="vp-filter-dd-head">Status</div>
                {[['all','All Status'],['success','Excellent'],['warning','Attention'],['danger','Urgent']].map(([k,l]) => (
                  <button key={k} className={`vp-filter-dd-item${filters.status === k ? ' active' : ''}`} onClick={() => { setFilters(p => ({...p,status:k})); setOpenFilter(null); }}>{l}</button>
                ))}
              </div>
            )}
          </div>

          <button className="btn-ghost" onClick={() => { setSearch(''); setFilters({ type:'all', status:'all' }); }}>↺ Clear</button>
          <div className="vp-controls-right">
            {filtered.length > 0 && `Showing ${(currentPage-1)*PER_PAGE+1}–${Math.min(currentPage*PER_PAGE, filtered.length)} of ${filtered.length}`}
          </div>
        </div>

        {/* ── BULK BAR ── */}
        {selectedIds.length > 0 && (
          <div className="vp-bulk">
            <div className="vp-bulk-info">
              <div className="vp-bulk-dot"></div>
              {selectedIds.length} vehicle{selectedIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="vp-bulk-actions">
              <button className="btn-ghost">✓ Mark Active</button>
              <button className="btn-ghost">🔧 Schedule Service</button>
              <button className="btn-ghost" style={{ color:'var(--red)', borderColor:'rgba(230,51,41,0.3)' }}>🗑 Delete</button>
              <button className="btn-ghost" onClick={clearSelection}>✕ Clear</button>
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && (
          <div className="vp-alert">⚠️ {error}
            <button className="vp-alert-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="vp-loading">
            <div className="vp-spinner"></div>
            <div className="vp-loading-txt">Loading Vehicles...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="vp-empty">
            <div className="vp-empty-icon">🚗</div>
            <div className="vp-empty-title">No Vehicles Found</div>
            <div className="vp-empty-desc">{search ? 'No vehicles match your search. Try adjusting your filters.' : 'Get started by adding your first vehicle.'}</div>
            {!search && <button className="btn-primary" onClick={openAdd}>＋ Add First Vehicle</button>}
            {search && <button className="btn-outline" onClick={() => setSearch('')}>Clear Search</button>}
          </div>
        ) : (
          <>
            <div className="vp-grid">
              {currentVehicles.map(v => {
                const status = getStatusColor(v);
                const days = getDaysUntil(v.next_service_due);
                const pct = getMaintenancePct(v);
                return (
                  <div key={v.id} className={`vc st-${status}`}>
                    <div className="vc-head">
                      <div className="vc-head-left">
                        <input type="checkbox" className="vc-check" checked={selectedIds.includes(v.id)} onChange={() => toggleSelect(v.id)} />
                        <span className="vc-type-icon">{VEHICLE_ICONS[v.vehicle_type] || '🚗'}</span>
                        <span className={`vc-status-badge st-${status}`}>
                          <span className="vc-status-dot"></span>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      <span className="vc-id">#{v.id}</span>
                    </div>

                    <div className="vc-body">
                      <div className="vc-name">{v.year} {v.make} {v.model}</div>
                      <div className="vc-plate">{v.license_plate}</div>
                      {v.vin && <div className="vc-vin">VIN: {v.vin.slice(0,8)}···</div>}

                      {isAdmin && v.customer_name && (
                        <div className="vc-customer">
                          <div className="vc-customer-avatar">{v.customer_name[0]}</div>
                          <div>
                            <div className="vc-customer-name">{v.customer_name}</div>
                            {v.customer_email && <div className="vc-customer-email">{v.customer_email}</div>}
                          </div>
                        </div>
                      )}

                      <div className="vc-specs">
                        <div className="vc-spec"><span className="vc-spec-icon">{ENGINE_ICONS[v.engine_type]||'⚙️'}</span><span className="vc-spec-lbl">Engine</span><span className="vc-spec-val">{v.engine_type}</span></div>
                        <div className="vc-spec"><span className="vc-spec-icon">{TRANS_ICONS[v.transmission]||'⚙️'}</span><span className="vc-spec-lbl">Trans</span><span className="vc-spec-val">{v.transmission}</span></div>
                        <div className="vc-spec"><span className="vc-spec-icon">🏁</span><span className="vc-spec-lbl">Miles</span><span className="vc-spec-val">{(v.mileage||0).toLocaleString()}</span></div>
                      </div>

                      {v.color && (
                        <div className="vc-color">
                          <div className="vc-color-dot" style={{ background: v.color.toLowerCase() }}></div>
                          <span className="vc-color-lbl">{v.color}</span>
                        </div>
                      )}

                      {v.next_service_due && (
                        <div className="vc-progress">
                          <div className="vc-progress-head">
                            <span className="vc-progress-lbl">Service Status</span>
                            <span className={`vc-progress-days st-${status}`}>
                              {days === null ? 'No schedule' : days <= 0 ? 'Overdue' : `${days} days`}
                            </span>
                          </div>
                          <div className="vc-progress-bar">
                            <div className={`vc-progress-fill st-${status}`} style={{ width:`${pct}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="vc-dates">
                        {v.next_service_due && <div className="vc-date"><span className="vc-date-icon">📅</span>Service: {fmt(v.next_service_due)}</div>}
                        {v.registration_expiry && <div className="vc-date"><span className="vc-date-icon">📄</span>Reg: {fmt(v.registration_expiry)}</div>}
                        {v.insurance_expiry && <div className="vc-date"><span className="vc-date-icon">🛡</span>Insurance: {fmt(v.insurance_expiry)}</div>}
                      </div>

                      {v.notes && <div className="vc-notes">{v.notes}</div>}
                    </div>

                    <div className="vc-foot">
                      <button className="vc-action-icon" title="Details" onClick={() => { setSelectedVehicle(v); setModal('details'); }}>👁</button>
                      <button className="vc-action-icon" title="Health" onClick={() => { setSelectedVehicle(v); setModal('health'); }}>🛡</button>
                      <button className="vc-action-icon" title="History" onClick={() => fetchHistory(v)}>🕐</button>
                      <button className="vc-action-main" onClick={() => openEdit(v)}>✏ Edit</button>
                      <button className="vc-action-icon danger" title="Delete" onClick={() => { setSelectedVehicle(v); setModal('delete'); }}>🗑</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="vp-pagination">
                <span className="vp-page-info">Page {currentPage} / {totalPages}</span>
                <button className="vp-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
                <button className="vp-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i+1).filter(p => p===1 || p===totalPages || Math.abs(p-currentPage)<=1).reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i-1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, []).map((p, i) => (
                  p === '...' ? <span key={`e${i}`} className="vp-page-ellipsis">···</span> :
                  <button key={p} className={`vp-page-btn${p === currentPage ? ' active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                ))}
                <button className="vp-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}>›</button>
                <button className="vp-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
              </div>
            )}
          </>
        )}

        {/* ── ADD/EDIT MODAL ── */}
        {(modal === 'add' || modal === 'edit') && (
          <div className="vp-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="vp-modal">
              <div className="vp-modal-head">
                <div className="vp-modal-title">
                  <div className="vp-modal-title-icon">{modal === 'edit' ? '✏' : '＋'}</div>
                  {modal === 'edit' ? 'Edit Vehicle' : 'Add New Vehicle'}
                </div>
                <button className="vp-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="vp-modal-body">
                <form id="vform" onSubmit={handleSubmit}>
                  {isAdmin && (
                    <div className="vp-form-section">
                      <div className="vp-form-section-title">Customer</div>
                      <div className="vp-field">
                        <label className="vp-label req">Select Customer</label>
                        <select name="customer_id" className="vp-select" value={form.customer_id} onChange={handleFormChange} required>
                          <option value="">Select a customer...</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} – {c.email}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="vp-form-section">
                    <div className="vp-form-section-title">Registration</div>
                    <div className="vp-form-row cols-2">
                      <div className="vp-field"><label className="vp-label req">License Plate</label><input name="license_plate" className="vp-input" placeholder="ABC-1234" value={form.license_plate} onChange={handleFormChange} required /></div>
                      <div className="vp-field"><label className="vp-label">VIN</label><input name="vin" className="vp-input" placeholder="17-character VIN" maxLength={17} value={form.vin} onChange={handleFormChange} /></div>
                    </div>
                  </div>

                  <div className="vp-form-section">
                    <div className="vp-form-section-title">Vehicle Info</div>
                    <div className="vp-form-row cols-3">
                      <div className="vp-field"><label className="vp-label req">Make</label><input name="make" className="vp-input" placeholder="Toyota" value={form.make} onChange={handleFormChange} required /></div>
                      <div className="vp-field"><label className="vp-label req">Model</label><input name="model" className="vp-input" placeholder="Camry" value={form.model} onChange={handleFormChange} required /></div>
                      <div className="vp-field"><label className="vp-label req">Year</label><input name="year" type="number" className="vp-input" min={1900} max={new Date().getFullYear()+2} value={form.year} onChange={handleFormChange} required /></div>
                    </div>
                    <div className="vp-form-row cols-4">
                      <div className="vp-field"><label className="vp-label">Color</label><input name="color" className="vp-input" placeholder="Silver" value={form.color} onChange={handleFormChange} /></div>
                      <div className="vp-field"><label className="vp-label">Type</label><select name="vehicle_type" className="vp-select" value={form.vehicle_type} onChange={handleFormChange}>{VEHICLE_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                      <div className="vp-field"><label className="vp-label">Engine</label><select name="engine_type" className="vp-select" value={form.engine_type} onChange={handleFormChange}>{ENGINE_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                      <div className="vp-field"><label className="vp-label">Transmission</label><select name="transmission" className="vp-select" value={form.transmission} onChange={handleFormChange}>{TRANSMISSIONS.map(t=><option key={t} value={t}>{t.toUpperCase()}</option>)}</select></div>
                    </div>
                    <div className="vp-form-row cols-2">
                      <div className="vp-field"><label className="vp-label">Mileage</label><input name="mileage" type="number" className="vp-input" min={0} placeholder="0" value={form.mileage} onChange={handleFormChange} /></div>
                    </div>
                  </div>

                  <div className="vp-form-section">
                    <div className="vp-form-section-title">Service Dates</div>
                    <div className="vp-form-row cols-2">
                      <div className="vp-field"><label className="vp-label">Last Service</label><input name="last_service_date" type="date" className="vp-input" value={form.last_service_date} onChange={handleFormChange} /></div>
                      <div className="vp-field"><label className="vp-label">Next Service Due</label><input name="next_service_due" type="date" className="vp-input" value={form.next_service_due} onChange={handleFormChange} /></div>
                      <div className="vp-field"><label className="vp-label">Registration Expiry</label><input name="registration_expiry" type="date" className="vp-input" value={form.registration_expiry} onChange={handleFormChange} /></div>
                      <div className="vp-field"><label className="vp-label">Insurance Expiry</label><input name="insurance_expiry" type="date" className="vp-input" value={form.insurance_expiry} onChange={handleFormChange} /></div>
                    </div>
                  </div>

                  <div className="vp-form-section">
                    <div className="vp-form-section-title">Notes</div>
                    <div className="vp-field"><textarea name="notes" className="vp-textarea" placeholder="Additional notes about this vehicle..." value={form.notes} onChange={handleFormChange} /></div>
                  </div>
                </form>
              </div>
              <div className="vp-modal-foot">
                <button className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="btn-primary" form="vform" type="submit">{modal === 'edit' ? '✓ Update Vehicle' : '＋ Add Vehicle'}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── DETAILS MODAL ── */}
        {modal === 'details' && selectedVehicle && (
          <div className="vp-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="vp-modal">
              <div className="vp-modal-head">
                <div className="vp-modal-title"><div className="vp-modal-title-icon">🚗</div>Vehicle Details</div>
                <button className="vp-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="vp-modal-body">
                <div className="vp-details-hero">
                  <span className="vp-details-hero-icon">{VEHICLE_ICONS[selectedVehicle.vehicle_type]||'🚗'}</span>
                  <div className="vp-details-hero-title">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</div>
                  <div style={{ marginTop:'8px' }}><span className={`vc-status-badge st-${getStatusColor(selectedVehicle)}`}><span className="vc-status-dot"></span>{STATUS_LABELS[getStatusColor(selectedVehicle)]}</span></div>
                </div>
                <div className="vp-details-grid">
                  <div className="vp-details-section">
                    <div className="vp-details-section-title">🚗 Basic Info</div>
                    {[['License Plate', selectedVehicle.license_plate],['VIN', selectedVehicle.vin||'N/A'],['Color', selectedVehicle.color||'N/A'],['Type', selectedVehicle.vehicle_type]].map(([k,v])=><div key={k} className="vp-detail-row"><span className="vp-detail-key">{k}</span><span className="vp-detail-val">{v}</span></div>)}
                  </div>
                  <div className="vp-details-section">
                    <div className="vp-details-section-title">⚙️ Specs</div>
                    {[['Engine', selectedVehicle.engine_type],['Transmission', selectedVehicle.transmission],['Mileage', `${(selectedVehicle.mileage||0).toLocaleString()} mi`]].map(([k,v])=><div key={k} className="vp-detail-row"><span className="vp-detail-key">{k}</span><span className="vp-detail-val">{v}</span></div>)}
                  </div>
                  <div className="vp-details-section">
                    <div className="vp-details-section-title">📅 Service Dates</div>
                    {[['Last Service', fmt(selectedVehicle.last_service_date)],['Next Service', fmt(selectedVehicle.next_service_due)]].map(([k,v])=><div key={k} className="vp-detail-row"><span className="vp-detail-key">{k}</span><span className="vp-detail-val">{v}</span></div>)}
                  </div>
                  <div className="vp-details-section">
                    <div className="vp-details-section-title">🛡 Expiry Dates</div>
                    {[['Registration', fmt(selectedVehicle.registration_expiry)],['Insurance', fmt(selectedVehicle.insurance_expiry)]].map(([k,v])=><div key={k} className="vp-detail-row"><span className="vp-detail-key">{k}</span><span className="vp-detail-val">{v}</span></div>)}
                  </div>
                </div>
                {selectedVehicle.notes && <div style={{ marginTop:'16px', padding:'14px', background:'var(--dark3)', border:'1px solid var(--border)', borderLeft:'3px solid var(--red)', fontSize:'13px', color:'var(--light)', lineHeight:'1.7' }}>{selectedVehicle.notes}</div>}
              </div>
              <div className="vp-modal-foot">
                <button className="btn-ghost" onClick={closeModal}>Close</button>
                <button className="btn-outline" onClick={() => { closeModal(); openEdit(selectedVehicle); }}>✏ Edit Vehicle</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SERVICE HISTORY MODAL ── */}
        {modal === 'history' && (
          <div className="vp-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="vp-modal">
              <div className="vp-modal-head">
                <div className="vp-modal-title"><div className="vp-modal-title-icon">🕐</div>Service History</div>
                <button className="vp-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="vp-modal-body">
                {serviceHistory.length === 0 ? (
                  <div className="vp-empty" style={{ padding:'48px 24px' }}>
                    <div className="vp-empty-icon">🔧</div>
                    <div className="vp-empty-title">No History</div>
                    <div className="vp-empty-desc">This vehicle has no recorded service history yet.</div>
                  </div>
                ) : (
                  <div className="vp-timeline">
                    {serviceHistory.map((s, i) => (
                      <div key={s.id} className="vp-tl-item">
                        <div className="vp-tl-dot" style={{ background:CHART_COLORS[i%CHART_COLORS.length], color:'white', borderRadius:'2px' }}>🔧</div>
                        <div className="vp-tl-content">
                          <div className="vp-tl-head">
                            <div className="vp-tl-name">{s.service_name}</div>
                            <span className={`vc-status-badge st-${s.status === 'completed' ? 'success' : 'warning'}`}>{s.status}</span>
                          </div>
                          <div className="vp-tl-date">📅 {fmt(s.service_date)}</div>
                          <div className="vp-tl-desc">{s.description}</div>
                          <div className="vp-tl-foot">
                            <span className="vp-tl-cost">${s.cost}</span>
                            {s.mechanic_name && <span className="vp-tl-tech">👤 {s.mechanic_name}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="vp-modal-foot">
                <button className="btn-ghost" onClick={closeModal}>Close</button>
                <button className="btn-primary">🔧 Schedule Service</button>
              </div>
            </div>
          </div>
        )}

        {/* ── VEHICLE HEALTH MODAL ── */}
        {modal === 'health' && selectedVehicle && (
          <div className="vp-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="vp-modal xl">
              <div className="vp-modal-head">
                <div className="vp-modal-title"><div className="vp-modal-title-icon">🛡</div>Vehicle Health Monitor</div>
                <button className="vp-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="vp-modal-body" style={{ padding:'16px' }}>
                <VehicleHealthDashboard
                  customerId={selectedVehicle.customer_id || (user?.role !== 'admin' ? user?.id : null)}
                  targetVehicle={selectedVehicle}
                />
              </div>
              <div className="vp-modal-foot">
                <button className="btn-ghost" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE MODAL ── */}
        {modal === 'delete' && (
          <div className="vp-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="vp-modal sm">
              <div className="vp-modal-head danger">
                <div className="vp-modal-title"><div className="vp-modal-title-icon">⚠️</div>Confirm Deletion</div>
                <button className="vp-modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="vp-delete-body">
                <span className="vp-delete-icon">🗑</span>
                <div className="vp-delete-title">Are You Sure?</div>
                <div className="vp-delete-desc">This action cannot be undone. The vehicle will be permanently removed from the system along with all associated records.</div>
              </div>
              <div className="vp-modal-foot">
                <button className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete}>Yes, Delete Vehicle</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
