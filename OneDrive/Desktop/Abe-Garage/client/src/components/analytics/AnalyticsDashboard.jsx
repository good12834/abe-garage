import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const AnalyticsDashboard = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState({
    revenue: [],
    services: [],
    appointments: [],
    customerSatisfaction: [],
  });

  useEffect(() => {
    // Mock data - in real app, this would come from API
    setData({
      revenue: [
        { month: "Jan", revenue: 15000, profit: 3000 },
        { month: "Feb", revenue: 18000, profit: 3600 },
        { month: "Mar", revenue: 22000, profit: 4400 },
        { month: "Apr", revenue: 19000, profit: 3800 },
        { month: "May", revenue: 25000, profit: 5000 },
        { month: "Jun", revenue: 28000, profit: 5600 },
      ],
      services: [
        { name: "Oil Change", count: 120, color: "#60a5fa" },
        { name: "Brake Service", count: 85, color: "#f87171" },
        { name: "Engine Repair", count: 65, color: "#34d399" },
        { name: "Tire Service", count: 95, color: "#fbbf24" },
        { name: "AC Service", count: 45, color: "#a78bfa" },
      ],
      appointments: [
        { day: "Mon", scheduled: 25, completed: 23 },
        { day: "Tue", scheduled: 30, completed: 28 },
        { day: "Wed", scheduled: 28, completed: 27 },
        { day: "Thu", scheduled: 32, completed: 30 },
        { day: "Fri", scheduled: 35, completed: 33 },
        { day: "Sat", scheduled: 20, completed: 18 },
        { day: "Sun", scheduled: 15, completed: 14 },
      ],
      customerSatisfaction: [
        { month: "Jan", rating: 4.2 },
        { month: "Feb", rating: 4.4 },
        { month: "Mar", rating: 4.6 },
        { month: "Apr", rating: 4.3 },
        { month: "May", rating: 4.7 },
        { month: "Jun", rating: 4.8 },
      ],
    });
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection,
    color,
    iconColor,
  }) => (
    <motion.div
      className="stat-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 relative overflow-hidden group"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-500 ease-out ${color}`}
      ></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {trend && (
            <div
              className={`flex items-center mt-3 text-xs font-semibold px-2 py-1 rounded-full w-fit ${trendDirection === "up"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
            >
              <ArrowTrendingUpIcon
                className={`w-3 h-3 mr-1 ${trendDirection === "down" ? "transform rotate-180" : ""
                  }`}
              />
              {trend}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-md p-4 border border-slate-700/50 rounded-xl shadow-2xl">
          <p className="font-semibold text-slate-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-400 capitalize">{entry.name || entry.dataKey}:</span>
              <span className="font-mono text-slate-200">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className={`analytics-dashboard w-full p-8 rounded-3xl bg-[#0f172a] relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Dashboard
            </h2>
            <p className="text-slate-400">
              Overview of your garage performance metrics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl">
            {[
              { id: "overview", label: "Overview" },
              { id: "revenue", label: "Revenue" },
              { id: "services", label: "Services" },
              { id: "performance", label: "Performance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value="$147,000"
            icon={CurrencyDollarIcon}
            trend="+12.5%"
            trendDirection="up"
            color="bg-blue-500"
            iconColor="text-blue-400"
          />
          <StatCard
            title="Services Done"
            value="1,247"
            icon={ChartBarIcon}
            trend="+8.2%"
            trendDirection="up"
            color="bg-emerald-500"
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Avg. Time"
            value="2.4 hrs"
            icon={ClockIcon}
            trend="-5.1%"
            trendDirection="up"
            color="bg-orange-500"
            iconColor="text-orange-400"
          />
          <StatCard
            title="Rating"
            value="4.8/5"
            icon={ArrowTrendingUpIcon}
            trend="+0.3"
            trendDirection="up"
            color="bg-purple-500"
            iconColor="text-purple-400"
          />
        </div>

        {/* Charts Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
          {activeTab === "overview" && (
            <>
              {/* Revenue Chart */}
              <motion.div
                className="col-span-1 lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-xl font-semibold text-white mb-6">
                  Revenue Growth
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={data.revenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}

          {activeTab === "revenue" && (
            <motion.div
              className="col-span-1 lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Revenue vs Profit Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeTab === "services" && (
            <motion.div
              className="col-span-1 lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Service Type Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.services}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.services.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value) => <span className="text-slate-300 ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div
              className="col-span-1 lg:col-span-2 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold text-white mb-6">Weekly Appointment Traffic</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.appointments} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Legend />
                  <Bar dataKey="scheduled" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
