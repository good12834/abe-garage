import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { appointmentsAPI, vehiclesAPI, invoicesAPI } from "../services/api";

// ─── Static Data ────────────────────────────────────────────────────────────
import './CustomerDashboard.css';
const STATS = [
  { key: "totalAppointments", label: "Total Appointments", value: 5, icon: "calendar_month", trend: "+12%", up: true },
  { key: "completedServices", label: "Completed Services", value: 3, icon: "check_circle", trend: "+8%", up: true },
  { key: "loyaltyPoints", label: "Loyalty Points", value: 450, icon: "emoji_events", trend: "Bronze Tier", up: null },
  { key: "pendingPayments", label: "Pending Payment", value: "$120", icon: "credit_card", trend: null, up: null },
  { key: "totalSpent", label: "Total Spent", value: "$1,250", icon: "build", trend: "This Year", up: null },
  { key: "carbonSaved", label: "CO₂ Saved", value: "12.5 kg", icon: "eco", trend: "Eco-Friendly", up: null },
];

const APPOINTMENTS = [
  { id: 1, service: "Oil Change & Filter", date: "2024-02-15", time: "10:00 AM", status: "confirmed", vehicle: "2022 Toyota Camry", bay: "Bay A1", technician: "John Smith", duration: "45 min", priority: "high", cost: 89 },
  { id: 2, service: "Brake Pad Replacement", date: "2024-02-20", time: "2:30 PM", status: "pending", vehicle: "2020 Honda Civic", bay: "Bay B2", technician: "Mike Johnson", duration: "1.5 hrs", priority: "medium", cost: 250 },
  { id: 3, service: "Tire Rotation", date: "2024-02-25", time: "11:00 AM", status: "scheduled", vehicle: "2022 Toyota Camry", bay: "Bay C3", technician: "Sarah Williams", duration: "30 min", priority: "low", cost: 45 },
];

const VEHICLES = [
  { id: 1, make: "Toyota", model: "Camry", year: "2022", license: "ABC-1234", mileage: 18500, health: 85, nextService: "2024-03-15", insurance: "2024-06-15", image: "https://media.ed.edmunds-media.com/toyota/camry/2021/oem/2021_toyota_camry_sedan_xse_fq_oem_1_500.jpg" },
  { id: 2, make: "Honda", model: "Civic", year: "2020", license: "XYZ-5678", mileage: 32500, health: 75, nextService: "2024-04-30", insurance: "2024-04-01", image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&auto=format&fit=crop&q=60" },
];

const NOTIFICATIONS = [
  { id: 1, title: "Appointment Confirmed", message: "Your oil change on Feb 15 is confirmed", time: "2 hours ago", read: false, type: "success", icon: "event_available" },
  { id: 2, title: "Loyalty Points Earned", message: "You earned 50 points for recent service", time: "Yesterday", read: false, type: "warning", icon: "stars" },
  { id: 3, title: "Payment Received", message: "Payment of $120 processed successfully", time: "3 days ago", read: true, type: "info", icon: "payment" },
  { id: 4, title: "Vehicle Health Alert", message: "Tire replacement recommended soon", time: "1 week ago", read: true, type: "danger", icon: "warning" },
];

const REMINDERS = [
  { id: 1, vehicle: "2022 Toyota Camry", service: "Oil Change", daysLeft: 22, mileage: 20000, priority: "high", cost: 89 },
  { id: 2, vehicle: "2020 Honda Civic", service: "Tire Rotation", daysLeft: 68, mileage: 35000, priority: "medium", cost: 45 },
  { id: 3, vehicle: "2022 Toyota Camry", service: "Brake Inspection", daysLeft: 85, mileage: 22000, priority: "low", cost: 120 },
];

const PROMOTIONS = [
  { id: 1, title: "Spring Maintenance Special", desc: "20% off oil changes and tune-ups", code: "SPRING20", expiry: "Mar 31, 2024", badge: "20% OFF" },
  { id: 2, title: "New Customer Bonus", desc: "Free tire rotation with any service", code: "NEWYEAR", expiry: "Apr 15, 2024", badge: "FREE" },
];

const QUICK_ACTIONS = [
  { label: "Book Service", icon: "edit_calendar", color: "#e63329" },
  { label: "My Vehicles", icon: "directions_car", color: "#f5c518" },
  { label: "Track Service", icon: "location_on", color: "#22c55e" },
  { label: "Invoices", icon: "receipt", color: "#3b82f6" },
  { label: "Vehicle Health", icon: "favorite", color: "#ef4444" },
  { label: "Rewards", icon: "card_giftcard", color: "#a855f7" },
  { label: "History", icon: "history", color: "#14b8a6" },
  { label: "QR Check-in", icon: "qr_code_scanner", color: "#f97316" },
];

const RECENT_SERVICES = [
  { date: "Jan 15, 2024", service: "Oil Change", vehicle: "Toyota Camry", technician: "John Smith", cost: "$89.99" },
  { date: "Jan 30, 2024", service: "Brake Inspection", vehicle: "Honda Civic", technician: "Mike Johnson", cost: "$120.00" },
  { date: "Feb 10, 2024", service: "Tire Rotation", vehicle: "Toyota Camry", technician: "Sarah Williams", cost: "$65.00" },
];

const TIPS = [
  { id: 1, title: "Extend Your Battery Life", category: "Battery", icon: "battery_charging_full", tip: "Keep terminals clean and avoid frequent short trips." },
  { id: 2, title: "Tire Pressure Matters", category: "Tires", icon: "rotate_left", tip: "Check pressure monthly for better fuel efficiency." },
  { id: 3, title: "Oil Change Intervals", category: "Maintenance", icon: "oil_barrel", tip: "Change oil every 5,000–7,500 miles for optimal health." },
];

const LINE_DATA = [
  { month: "Jan", services: 2, cost: 180 }, { month: "Feb", services: 3, cost: 320 },
  { month: "Mar", services: 1, cost: 120 }, { month: "Apr", services: 4, cost: 450 },
  { month: "May", services: 2, cost: 210 }, { month: "Jun", services: 3, cost: 280 },
];

const PIE_DATA = [
  { name: "Maintenance", value: 40, color: "#f5c518" },
  { name: "Repairs", value: 25, color: "#e63329" },
  { name: "Inspections", value: 20, color: "#22c55e" },
  { name: "Emergency", value: 15, color: "#8a8a8a" },
];

const BAR_DATA = [
  { month: "Jul", amount: 150 }, { month: "Aug", amount: 280 }, { month: "Sep", amount: 190 },
  { month: "Oct", amount: 320 }, { month: "Nov", amount: 250 }, { month: "Dec", amount: 180 },
];

// ─── Styles ──────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusClass = (s) => ({ confirmed: "status-confirmed", pending: "status-pending", scheduled: "status-scheduled" }[s] || "");
const getPriorityClass = (p) => ({ high: "priority-high", medium: "priority-medium", low: "priority-low" }[p] || "");
const getDotClass = (p) => ({ high: "dot-high", medium: "dot-medium", low: "dot-low" }[p] || "");
const getMonthShort = (d) => new Date(d).toLocaleString("default", { month: "short" });
const getDay = (d) => new Date(d).getDate();

// ─── Component ────────────────────────────────────────────────────────────────

// Icon component for consistent Material Icons usage
function MaterialIcon({ name, size = 24, className = "", style = {} }) {
  return (
    <span className={`material-icons md-${size} ${className}`} style={{ fontSize: `${size}px`, ...style }}>
      {name}
    </span>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const notifRef = useRef(null);

  // Real data state
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState(STATS);
  const [loading, setLoading] = useState(true);
  const [recentServices, setRecentServices] = useState([]);

  const unread = notifs.filter(n => !n.read).length;
  const greeting = currentTime.getHours() < 12 ? "Good Morning" : currentTime.getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const userName = user?.firstName || "Customer";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [aptRes, vehicleRes] = await Promise.all([
          appointmentsAPI.getMyAppointments(),
          vehiclesAPI.getVehicles({ customer_id: user?.id })
        ]);

        const apts = aptRes.data.data.appointments || [];
        const vehs = vehicleRes.data || [];

        setAppointments(apts.filter(a => ['pending', 'confirmed', 'scheduled'].includes(a.status)).slice(0, 3));
        setRecentServices(apts.filter(a => ['completed'].includes(a.status)).slice(0, 5));
        setVehicles(vehs);

        // Update stats
        const totalApts = apts.length;
        const completed = apts.filter(a => a.status === 'completed').length;
        const totalSpent = apts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (parseFloat(a.final_cost || a.estimated_cost) || 0), 0);

        setStats(prev => prev.map(s => {
          if (s.key === 'totalAppointments') return { ...s, value: totalApts };
          if (s.key === 'completedServices') return { ...s, value: completed };
          if (s.key === 'totalSpent') return { ...s, value: `$${totalSpent.toLocaleString()}` };
          return s;
        }));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const copyCode = (code) => { navigator.clipboard.writeText(code); showToast(`✓ Code "${code}" copied to clipboard`); };
  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));

  const tooltipStyle = { backgroundColor: "#161616", borderColor: "#2a2a2a", color: "#f2f0eb" };

  return (
    <div className="db">
      <style>{S}</style>

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <div className="header-brand-icon">
              <MaterialIcon name="build" size={28} />
            </div>
            <div className="header-brand-name">ABE<span>GARAGE</span></div>
          </div>

          <div className="header-welcome">
            <div className="header-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div>
              <div className="header-greeting">{greeting}, {userName}</div>
              <div className="header-time">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>

          <div className="header-actions">
            <Link to="/emergency-service" className="hbtn hbtn-emergency">
              <MaterialIcon name="warning" size={16} /> Emergency
            </Link>

            <div className="notif-wrap" ref={notifRef}>
              <button className="notif-btn" onClick={() => setNotifOpen(p => !p)}>
                <MaterialIcon name="notifications" size={20} />
                {unread > 0 && <span className="notif-count">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-head">
                    <h6>Notifications</h6>
                    <button onClick={markAllRead}>Mark all read</button>
                  </div>
                  <div className="notif-list">
                    {notifs.map(n => (
                      <div key={n.id} className={`notif-item${n.read ? "" : " unread"}`} onClick={() => markRead(n.id)}>
                        <span className="notif-icon">
                          <MaterialIcon name={n.icon} size={20} />
                        </span>
                        <div className="notif-body">
                          <h6>{n.title}</h6>
                          <p>{n.message}</p>
                          <small>{n.time}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="notif-foot">
                    <Link to="/notifications" className="hbtn hbtn-ghost" style={{ width: "100%", justifyContent: "center", fontSize: "11px", textDecoration: "none" }}>
                      View All Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/book-appointment" className="hbtn hbtn-primary">
              <MaterialIcon name="edit_calendar" size={16} /> Book Service
            </Link>
            <Link to="/customer/settings" className="hbtn hbtn-outline">
              <MaterialIcon name="settings" size={16} /> Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── LIVE BANNER ── */}
      <div className="live-banner">
        <div className="live-banner-inner">
          <div className="live-dot"></div>
          <span className="live-text">Live Service</span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
            <span style={{ fontSize: "12px", color: "var(--lighter)" }}>2022 Toyota Camry — Oil Change & Filter</span>
            <div className="live-progress-wrap">
              <div className="live-bar-bg"><div className="live-bar-fill"></div></div>
              <div className="live-label">65% Complete — Bay A1 — John Smith</div>
            </div>
          </div>
          <span className="live-next">Next: <strong>Quality Check</strong></span>
          <Link to="/track-my-car" className="hbtn hbtn-ghost" style={{ fontSize: "11px", padding: "7px 14px" }}>
            <MaterialIcon name="location_on" size={14} /> Track Live
          </Link>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="content">

        {/* Stats */}
        <div className="stats-row">
          {stats.map((s, i) => (
            <div className="stat-card" key={s.key} style={{ animationDelay: `${i * 60}ms`, backgroundColor: "var(--dark)", cursor: "pointer" }} onClick={() => navigate(s.key === 'loyaltyPoints' ? '/customer/rewards' : '/customer/appointments')}  >
              <span className="stat-icon">
                <MaterialIcon name={s.icon} size={28} />
              </span>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.trend && (
                <div className={`stat-trend ${s.up ? "up" : s.trend.includes("Eco") ? "eco" : "neutral"}`}>
                  {s.up && <MaterialIcon name="trending_up" size={14} />} {s.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="two-col">
          {/* LEFT */}
          <div className="left-col">

            {/* Appointments */}
            <div className="card" onClick={() => navigate("/customer/appointments")} style={{ cursor: "pointer" }}>
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <MaterialIcon name="calendar_month" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}>Upcoming Appointments</span>
                </div>
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <Link to="/customer/appointments" className="hbtn hbtn-ghost" style={{ fontSize: "11px", padding: "7px 14px" }}>View All</Link>
                  <Link to="/book-appointment" className="hbtn hbtn-primary" style={{ fontSize: "11px", padding: "7px 14px" }}>
                    <MaterialIcon name="add" size={14} /> New
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="p-4 text-center">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                  <div className="p-4 text-center text-muted">No upcoming appointments.</div>
                ) : appointments.map(apt => (
                  <div className="apt-item" key={apt.id}>
                    <div className="apt-date">
                      <div className="apt-date-day">{getDay(apt.appointment_date)}</div>
                      <div className="apt-date-mon">{getMonthShort(apt.appointment_date)}</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <div className="apt-service">{apt.service_name || apt.service}</div>
                        <span className={`priority-tag ${getPriorityClass(apt.priority || 'medium')}`}>{apt.priority || 'medium'}</span>
                      </div>
                      <div className="apt-meta">
                        <span className="apt-meta-item">
                          <MaterialIcon name="directions_car" size={14} /> {apt.car_brand} {apt.car_model}
                        </span>
                        <span className="apt-meta-item">
                          <MaterialIcon name="schedule" size={14} /> {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {apt.mechanic_name && (
                          <span className="apt-meta-item">
                            <MaterialIcon name="person" size={14} /> {apt.mechanic_name}
                          </span>
                        )}
                        <span className="apt-meta-item cost">
                          <MaterialIcon name="attach_money" size={14} /> Est. ${apt.estimated_cost}
                        </span>
                      </div>
                    </div>
                    <div className="apt-right">
                      <span className={`status-tag ${getStatusClass(apt.status)}`}>{apt.status}</span>
                      <div className="apt-btns">
                        <Link to={`/customer/appointments/${apt.id}`} className="sm-btn">View</Link>
                        <Link to={`/customer/appointments/${apt.id}`} className="sm-btn">Reschedule</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
              <div className="chart-card card" style={{backgroundColor: "var(--dark)"}}>
                <div className="card-head">
                  <div className="card-title" style={{ fontSize: "13px" }}>
                    <div className="card-title-icon">
                      <MaterialIcon name="trending_up" size={16} />
                    </div>
                    <span style={{ color: "var(--white)" }}>Service History</span>
                  </div>
                </div>
                <div className="card-body" style={{ padding: "16px" }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={LINE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#555" tick={{ fontSize: 11, fontFamily: "Barlow Condensed", fill: "#999" }} />
                      <YAxis stroke="#555" tick={{ fontSize: 11, fill: "#999" }} />
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f2f0eb" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Barlow Condensed", letterSpacing: "1px" }} />
                      <Line type="monotone" dataKey="services" stroke="#e63329" strokeWidth={2} dot={{ r: 3, fill: "#e63329" }} />
                      <Line type="monotone" dataKey="cost" stroke="#f5c518" strokeWidth={2} dot={{ r: 3, fill: "#f5c518" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card card" style={{backgroundColor: "var(--dark)"}}>
                <div className="card-head">
                  <div className="card-title" style={{ fontSize: "13px" }}>
                    <div className="card-title-icon">
                      <MaterialIcon name="pie_chart" size={16} />
                    </div>
                    <span style={{ color: "var(--white)" }}>Service Distribution</span>
                  </div>
                </div>
                <div className="card-body" style={{ padding: "16px" }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={PIE_DATA} cx="50%" cy="50%" labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={75} dataKey="value">
                        {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#f2f0eb" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Spending bar chart */}
            <div className="card chart-card" style={{backgroundColor: "var(--dark)"}}>
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "13px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="bar_chart" size={16} />
                  </div>
                  <span style={{ color: "var(--white)" }}>Monthly Spending Trend</span>
                </div>
              </div>
              <div className="card-body" style={{ padding: "16px" }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={BAR_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#555" tick={{ fontSize: 11, fontFamily: "Barlow Condensed", fill: "#999" }} />
                    <YAxis stroke="#555" tick={{ fontSize: 11, fill: "#999" }} />
                    <Tooltip formatter={(v) => `$${v}`} contentStyle={tooltipStyle} itemStyle={{ color: "#f2f0eb" }} />
                    <Bar dataKey="amount" fill="#e63329" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Services Table */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">
                  <div className="card-title-icon">
                    <MaterialIcon name="history" size={18} />
                  </div>
                  <span style={{ color: "var(--white)" }}>Recent Services</span>
                </div>
                <Link to="/customer/vehicle-history" className="hbtn hbtn-ghost" style={{ fontSize: "11px", padding: "7px 14px" }}>View History</Link>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="p-4 text-center">Loading history...</div>
                ) : recentServices.length === 0 ? (
                  <div className="p-4 text-center text-muted">No service history found.</div>
                ) : (
                  <table className="rtable">
                    <thead>
                      <tr>
                        <th>Date</th><th>Service</th><th>Vehicle</th><th>Technician</th><th>Cost</th><th>Status</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentServices.map((r, i) => (
                        <tr key={i}>
                          <td>{new Date(r.appointment_date).toLocaleDateString()}</td>
                          <td style={{ color: "var(--white)", fontWeight: 500 }}>{r.service_name || r.service}</td>
                          <td>{r.car_brand} {r.car_model}</td>
                          <td>{r.mechanic_name || 'TBD'}</td>
                          <td style={{ color: "var(--yellow)", fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "15px" }}>${parseFloat(r.final_cost || r.estimated_cost).toFixed(2)}</td>
                          <td><span className={`status-tag ${getStatusClass(r.status)}`}>{r.status}</span></td>
                          <td>
                            <Link to={`/customer/appointments/${r.id}`} className="sm-btn" style={{ padding: "4px 10px" }}>
                              <MaterialIcon name="visibility" size={14} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="right-col">

            {/* Quick Actions */}
            <div className="card">
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="bolt" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}> Quick Actions</span>
                </div>
              </div>
              <div className="card-body">
                <div className="qa-grid">
                  {QUICK_ACTIONS.map((a, i) => (
                    <button
                      key={i}
                      className="qa-btn"
                      onClick={() => {
                        const map = {
                          "Book Service": "/book-appointment",
                          "My Vehicles": "/customer/vehicles",
                          "Track Service": "/track-my-car",
                          "Invoices": "/customer/invoices",
                          "Vehicle Health": "/vehicle-health",
                          "Rewards": "/customer/rewards",
                          "History": "/customer/vehicle-history",
                          "QR Check-in": "/qr-checkin"
                        };
                        navigate(map[a.label] || "/");
                      }}
                    >
                      <span className="qa-icon">
                        <MaterialIcon name={a.icon} size={24} style={{ color: a.color }} />
                      </span>
                      <span className="qa-label">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Maintenance Reminders */}
            <div className="card">
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="notifications_active" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}> Maintenance Reminders</span>
                </div>
              </div>
              <div className="card-body">
                {REMINDERS.map(r => (
                  <div key={r.id} className="reminder-item" onClick={() => navigate("/book-appointment")} style={{ cursor: "pointer" }}>
                    <div className="reminder-top">
                      <div className={`reminder-dot ${getDotClass(r.priority)}`}></div>
                      <div className="reminder-service">{r.service}</div>
                    </div>
                    <div className="reminder-vehicle">{r.vehicle}</div>
                    <div className="reminder-meta">
                      <span><MaterialIcon name="calendar_today" size={14} /> {r.daysLeft} days</span>
                      <span><MaterialIcon name="speed" size={14} /> {r.mileage.toLocaleString()} mi</span>
                      <span className="r-cost"><MaterialIcon name="attach_money" size={14} /> ~${r.cost}</span>
                    </div>
                    <button className="sched-btn" onClick={(e) => { e.stopPropagation(); navigate("/book-appointment"); }}>
                      Schedule Now <MaterialIcon name="arrow_forward" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Vehicle Health */}
            <div className="card" onClick={() => navigate("/vehicle-health")} style={{ cursor: "pointer" }}>
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="favorite" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}> Vehicle Health</span>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="p-4 text-center">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                  <div className="p-4 text-center text-muted">No vehicles registered.</div>
                ) : vehicles.map(v => (
                  <div key={v.id} className="vh-item">
                    <div className="vh-header">
                      {v.image_url ? (
                        <img src={v.image_url} alt={v.model} className="vh-img" />
                      ) : (
                        <div className="vh-img-placeholder" style={{ backgroundColor: 'var(--dark-light)', width: '60px', height: '60px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialIcon name="directions_car" size={32} />
                        </div>
                      )}
                      <div>
                        <div className="vh-name">{v.year} {v.make} {v.model}</div>
                        <div className="vh-license">
                          <MaterialIcon name="local_offer" size={12} /> {v.license_plate} · {v.mileage?.toLocaleString()} mi
                        </div>
                      </div>
                    </div>
                    {/* Placeholder health score if not in DB */}
                    <div className="vh-bar-wrap">
                      <div className="vh-bar-top">
                        <span className="vh-bar-label">Condition</span>
                        <span className="vh-bar-pct vh-good">Great</span>
                      </div>
                      <div className="vh-bar">
                        <div className="vh-fill fill-good" style={{ width: `85%` }}></div>
                      </div>
                    </div>
                    <div className="vh-details">
                      <span><MaterialIcon name="build" size={12} /> Next: {v.next_service_due ? new Date(v.next_service_due).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'TBD'}</span>
                      <span><MaterialIcon name="security" size={12} /> Reg: {v.registration_expiry ? new Date(v.registration_expiry).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'TBD'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty */}
            <div className="card" onClick={() => navigate("/customer/rewards")} style={{ cursor: "pointer" }}>
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="emoji_events" size={18} />
                  </div>
                   <span style={{ color: "var(--white)" }}> Loyalty Rewards</span>
                </div>
              </div>
              <div className="card-body">
                <div className="loyalty-tiers">
                  <div className="tier tier-active">
                    <div className="tier-label"><MaterialIcon name="military_tech" size={14} /> Bronze</div>
                  </div>
                  <div className="tier">
                    <div className="tier-label"><MaterialIcon name="workspace_premium" size={14} /> Silver</div>
                  </div>
                  <div className="tier">
                    <div className="tier-label"><MaterialIcon name="crown" size={14} /> Gold</div>
                  </div>
                </div>
                <div className="loyalty-bar"><div className="loyalty-bar-fill"></div></div>
                <div className="loyalty-bottom">
                  <div>
                    <div className="points-big">450</div>
                    <div className="points-label">Total Points</div>
                  </div>
                  <div className="loyalty-info">
                    <p><MaterialIcon name="arrow_forward" size={12} /> 50 pts to Silver</p>
                    <p><MaterialIcon name="card_giftcard" size={12} /> Redeem for discounts</p>
                  </div>
                </div>
                <button className="sched-btn" style={{ marginTop: "16px" }} onClick={(e) => { e.stopPropagation(); navigate("/customer/rewards"); }}>
                  View Rewards <MaterialIcon name="arrow_forward" size={14} />
                </button>
              </div>
            </div>

            {/* Promos */}
            <div className="card">
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="card_giftcard" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}> Special Offers</span>
                </div>
              </div>
              <div className="card-body">
                {PROMOTIONS.map(p => (
                  <div key={p.id} className="promo-item">
                    <div className="promo-badge">{p.badge}</div>
                    <div className="promo-title">{p.title}</div>
                    <div className="promo-desc">{p.desc}</div>
                    <div className="promo-code-row">
                      <span className="promo-code" onClick={() => copyCode(p.code)}>{p.code}</span>
                      <button className="copy-btn" onClick={() => copyCode(p.code)}>
                        <MaterialIcon name="content_copy" size={14} />
                      </button>
                    </div>
                    <div className="promo-exp">Valid until {p.expiry}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="card">
              <div className="card-head">
                <div className="card-title" style={{ fontSize: "14px" }}>
                  <div className="card-title-icon">
                    <MaterialIcon name="lightbulb" size={18} />
                  </div>
                 <span style={{ color: "var(--white)" }}> Car Care Tips</span>
                </div>
              </div>
              <div className="card-body">
                {TIPS.map(t => (
                  <div key={t.id} className="tip-item">
                    <div className="tip-icon-wrap">
                      <MaterialIcon name={t.icon} size={24} />
                    </div>
                    <div>
                      <div className="tip-title">{t.title}</div>
                      <span className="tip-cat">{t.category}</span>
                      <p className="tip-text">{t.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency strip */}
      <div className="emergency-strip" onClick={() => navigate("/emergency-service")} style={{ cursor: "pointer" }}>
        <div className="emergency-inner">
          <div className="emergency-text">
            <MaterialIcon name="warning" size={18} style={{ color: "var(--yellow)" }} />
            <strong>Emergency?</strong>
            <span style={{ color: "var(--lighter)" }}>24/7 Roadside Hotline</span>
            <a href="tel:+11234567891" onClick={e => e.stopPropagation()}>+1 (123) 456-7891</a>
          </div>
          <button className="hbtn hbtn-emergency" onClick={(e) => { e.stopPropagation(); navigate("/emergency-service"); }}>
            <MaterialIcon name="phone" size={14} /> Call Now
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-wrap">
          <div className="toast-msg">
            <MaterialIcon name="check_circle" size={16} style={{ color: "var(--green)", marginRight: "8px" }} />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
