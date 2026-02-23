import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ClockIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PhotoIcon,
  MapPinIcon,
  PhoneIcon,
  BellIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "../../context/AuthContext";

const CustomerServiceTimeline = () => {
  const { user } = useAuth();
  const [timelineData, setTimelineData] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTimelineData();
  }, [selectedFilter, selectedYear]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);

      // Mock timeline data
      const mockTimeline = [
        {
          id: 1,
          date: "2025-12-10",
          time: "14:30",
          type: "service_completed",
          title: "Oil Change & Filter Replacement",
          description: "Completed routine oil change with premium filter",
          status: "completed",
          technician: "John Smith",
          cost: 65.99,
          duration: 45,
          location: "Service Bay 2",
          documents: ["Invoice INV-2025-0156", "Service Report"],
          photos: ["before.jpg", "after.jpg"],
          rating: 5,
          feedback: "Excellent service, very professional",
          nextService: "2025-06-10",
          mileage: 45230,
          warranty: "6 months or 5,000 miles",
          partsUsed: ["Oil Filter OF-123", "Oil 5W-30 QT"],
        },
        {
          id: 2,
          date: "2025-10-15",
          time: "09:00",
          type: "diagnostic",
          title: "Engine Diagnostics",
          description: "Comprehensive engine diagnostic scan and inspection",
          status: "completed",
          technician: "Sarah Johnson",
          cost: 150.0,
          duration: 120,
          location: "Diagnostic Bay",
          documents: ["Diagnostic Report", "OBD Scan Results"],
          photos: ["diagnostic-results.jpg"],
          rating: 5,
          feedback: "Found the issue quickly and explained everything clearly",
          nextService: "2026-10-15",
          mileage: 43850,
          warranty: "Diagnostic report valid for 90 days",
          partsUsed: [],
        },
        {
          id: 3,
          date: "2025-08-22",
          time: "11:15",
          type: "maintenance",
          title: "Brake Inspection & Tire Rotation",
          description: "Routine brake inspection and tire rotation service",
          status: "completed",
          technician: "Mike Wilson",
          cost: 89.5,
          duration: 90,
          location: "Service Bay 1",
          documents: ["Inspection Report", "Invoice INV-2025-0112"],
          photos: ["brake-inspection.jpg", "tire-rotation.jpg"],
          rating: 4,
          feedback: "Good work, took a bit longer than expected",
          nextService: "2026-02-22",
          mileage: 41200,
          warranty: "90 days",
          partsUsed: ["Grease GP-456"],
        },
        {
          id: 4,
          date: "2025-06-10",
          time: "13:45",
          type: "service_completed",
          title: "Transmission Fluid Change",
          description: "Automatic transmission fluid and filter replacement",
          status: "completed",
          technician: "Lisa Chen",
          cost: 185.75,
          duration: 150,
          location: "Service Bay 3",
          documents: ["Invoice INV-2025-0089", "Service Report"],
          photos: ["transmission-service.jpg"],
          rating: 5,
          feedback: "Car runs much smoother now, great job!",
          nextService: "2026-06-10",
          mileage: 38500,
          warranty: "1 year or 12,000 miles",
          partsUsed: ["Transmission Filter TF-789", "ATF Fluid QT"],
        },
        {
          id: 5,
          date: "2025-04-05",
          time: "10:30",
          type: "emergency",
          title: "Battery Replacement",
          description: "Emergency battery replacement due to complete failure",
          status: "completed",
          technician: "David Brown",
          cost: 220.0,
          duration: 60,
          location: "Quick Service Bay",
          documents: ["Invoice INV-2025-0056", "Battery Test Report"],
          photos: ["old-battery.jpg", "new-battery.jpg"],
          rating: 5,
          feedback: "Quick response to emergency, very satisfied",
          nextService: "2027-04-05",
          mileage: 36200,
          warranty: "2 years",
          partsUsed: ["Battery BAT-550", "Terminal Cleaner TC-123"],
        },
        {
          id: 6,
          date: "2025-01-18",
          time: "15:00",
          type: "maintenance",
          title: "Winter Maintenance Package",
          description:
            "Complete winter preparation: antifreeze, battery test, tire inspection",
          status: "completed",
          technician: "John Smith",
          cost: 145.25,
          duration: 105,
          location: "Service Bay 2",
          documents: ["Invoice INV-2025-0023", "Winter Checklist"],
          photos: ["winter-service.jpg"],
          rating: 5,
          feedback: "Thorough service, prepared my car for winter perfectly",
          nextService: "2025-07-18",
          mileage: 34200,
          warranty: "6 months",
          partsUsed: ["Antifreeze AF-50", "Battery Terminal Treatment"],
        },
      ];

      const mockSummary = {
        totalServices: mockTimeline.length,
        totalSpent: mockTimeline.reduce((sum, item) => sum + item.cost, 0),
        averageRating: 4.8,
        lastService: "2025-12-10",
        nextService: "2025-06-10",
        currentMileage: 45230,
        serviceFrequency: "Every 4.2 months",
        mostUsedTechnician: "John Smith",
        commonServices: [
          { service: "Oil Change", count: 3, cost: 197.97 },
          { service: "Brake Service", count: 2, cost: 179.0 },
          { service: "Transmission", count: 1, cost: 185.75 },
        ],
        monthlySpending: [
          { month: "Jan", spending: 145.25, services: 1 },
          { month: "Apr", spending: 220.0, services: 1 },
          { month: "Jun", spending: 185.75, services: 1 },
          { month: "Aug", spending: 89.5, services: 1 },
          { month: "Oct", spending: 150.0, services: 1 },
          { month: "Dec", spending: 65.99, services: 1 },
        ],
        yearlyComparison: [
          { year: "2023", services: 8, spending: 1200.5 },
          { year: "2024", services: 6, spending: 856.25 },
          { year: "2025", services: 6, spending: 856.49 },
        ],
      };

      setTimeout(() => {
        setTimelineData(mockTimeline);
        setServiceSummary(mockSummary);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching timeline data:", error);
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "service_completed":
        return <CheckCircleIcon className="w-5 h-5 text-success" />;
      case "diagnostic":
        return <WrenchScrewdriverIcon className="w-5 h-5 text-primary" />;
      case "maintenance":
        return <ClockIcon className="w-5 h-5 text-info" />;
      case "emergency":
        return <ExclamationTriangleIcon className="w-5 h-5 text-danger" />;
      case "repair":
        return <WrenchScrewdriverIcon className="w-5 h-5 text-warning" />;
      default:
        return <CalendarDaysIcon className="w-5 h-5 text-muted" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "service_completed":
        return "#10b981";
      case "diagnostic":
        return "#3b82f6";
      case "maintenance":
        return "#06b6d4";
      case "emergency":
        return "#ef4444";
      case "repair":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="badge bg-success">Completed</span>;
      case "in_progress":
        return <span className="badge bg-warning">In Progress</span>;
      case "scheduled":
        return <span className="badge bg-info">Scheduled</span>;
      case "cancelled":
        return <span className="badge bg-danger">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const filteredTimeline = timelineData.filter((item) => {
    const matchesFilter =
      selectedFilter === "all" || item.type === selectedFilter;
    const matchesYear =
      selectedYear === "all" ||
      new Date(item.date).getFullYear().toString() === selectedYear;
    const matchesSearch =
      searchTerm === "" ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesYear && matchesSearch;
  });

  const uniqueYears = [
    ...new Set(timelineData.map((item) => new Date(item.date).getFullYear())),
  ];

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <ClockIcon className="me-2 text-primary" />
            Customer Service Timeline
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading service history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-dashboard">
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h2>
            <ClockIcon className="me-3 text-primary" />
            Customer Service Timeline
          </h2>
          <div className="d-flex gap-2">
            <div className="input-group" style={{ width: "300px" }}>
              <span className="input-group-text">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="all">All Services</option>
              <option value="service_completed">Completed</option>
              <option value="diagnostic">Diagnostics</option>
              <option value="maintenance">Maintenance</option>
              <option value="emergency">Emergency</option>
            </select>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ width: "auto" }}
            >
              <option value="all">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Service Summary */}
      <div className="service-summary mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{serviceSummary.totalServices}</h3>
                <p className="mb-0">Total Services</p>
                <small>Since ownership</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">
                  {formatCurrency(serviceSummary.totalSpent)}
                </h3>
                <p className="mb-0">Total Investment</p>
                <small>In vehicle maintenance</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{serviceSummary.averageRating}★</h3>
                <p className="mb-0">Average Rating</p>
                <small>Service satisfaction</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white">
              <div className="card-body text-center">
                <h3 className="mb-0">{serviceSummary.serviceFrequency}</h3>
                <p className="mb-0">Service Frequency</p>
                <small>Maintenance schedule</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Monthly Spending Pattern</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={serviceSummary.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar
                      dataKey="spending"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-header">
                <h6 className="mb-0">Service Types</h6>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceSummary.commonServices}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      nameKey="service"
                      label={({ service, count }) => `${service}: ${count}`}
                    >
                      {serviceSummary.commonServices.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getTypeColor(entry.service)}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service History */}
      <div className="timeline-section">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Service History Timeline</h6>
              <span className="badge bg-primary">
                {filteredTimeline.length} services
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="timeline">
              {filteredTimeline.map((service, index) => (
                <motion.div
                  key={service.id}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="timeline-marker">
                    <div
                      className="timeline-icon"
                      style={{ backgroundColor: getTypeColor(service.type) }}
                    >
                      {getTypeIcon(service.type)}
                    </div>
                    <div className="timeline-line"></div>
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-header">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{service.title}</h6>
                          <div className="d-flex align-items-center gap-2">
                            <small className="text-muted">
                              <CalendarDaysIcon className="w-4 h-4 me-1" />
                              {formatDate(service.date)} at {service.time}
                            </small>
                            <small className="text-muted">
                              <MapPinIcon className="w-4 h-4 me-1" />
                              {service.location}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          {getStatusBadge(service.status)}
                          <div className="mt-1">
                            <strong>{formatCurrency(service.cost)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-body">
                      <p className="text-muted mb-2">{service.description}</p>

                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <small className="text-muted d-block">
                            <WrenchScrewdriverIcon className="w-4 h-4 me-1" />
                            Technician: {service.technician}
                          </small>
                          <small className="text-muted d-block">
                            <ClockIcon className="w-4 h-4 me-1" />
                            Duration: {service.duration} minutes
                          </small>
                          <small className="text-muted d-block">
                            <CurrencyDollarIcon className="w-4 h-4 me-1" />
                            Cost: {formatCurrency(service.cost)}
                          </small>
                        </div>
                        <div className="col-md-6">
                          {service.rating && (
                            <small className="text-muted d-block">
                              ⭐ Rating: {service.rating}/5
                            </small>
                          )}
                          {service.feedback && (
                            <small className="text-muted d-block">
                              💬 "{service.feedback}"
                            </small>
                          )}
                          {service.nextService && (
                            <small className="text-muted d-block">
                              🔄 Next service: {formatDate(service.nextService)}
                            </small>
                          )}
                        </div>
                      </div>

                      {service.partsUsed.length > 0 && (
                        <div className="mb-3">
                          <small className="text-muted d-block mb-1">
                            Parts Used:
                          </small>
                          <div className="d-flex flex-wrap gap-1">
                            {service.partsUsed.map((part, idx) => (
                              <span
                                key={idx}
                                className="badge bg-light text-dark"
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                          {service.documents.length > 0 && (
                            <button className="btn btn-outline-primary btn-sm">
                              <DocumentTextIcon className="w-4 h-4 me-1" />
                              Documents ({service.documents.length})
                            </button>
                          )}
                          {service.photos.length > 0 && (
                            <button className="btn btn-outline-info btn-sm">
                              <PhotoIcon className="w-4 h-4 me-1" />
                              Photos ({service.photos.length})
                            </button>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-success btn-sm">
                            View Details
                          </button>
                          {service.rating && (
                            <button className="btn btn-outline-warning btn-sm">
                              Edit Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceTimeline;
