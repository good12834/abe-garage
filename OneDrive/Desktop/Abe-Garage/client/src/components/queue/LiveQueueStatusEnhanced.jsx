import React, { useState, useEffect } from "react";
import {
  FaCar,
  FaWrench,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCog,
  FaUsers,
  FaHourglassHalf,
  FaSync,
  FaSignal,
  FaTools,
  FaWarehouse,
  FaChevronRight,
  FaUserAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaCarAlt,
  FaOilCan,
  FaBolt,
  FaTachometerAlt,
  FaShieldAlt,
  FaDownload,
  FaFilter,
  FaSearch,
  FaCreditCard,
  FaSignature,
  FaClipboardList,
  FaHeadset,
  FaBrain,
  FaTrophy,
  FaShare,
  FaCamera,
  FaComments,
  FaQrcode,
} from "react-icons/fa";
import api from "../../services/api";
import socketService from "../../services/socket";

// Import new feature components
import ChatSystem from "./ChatSystem";
import NotificationSystem from "./NotificationSystem";
// Note: We are keeping the imports but simplifying the usage in the render for a cleaner look

import "./LiveQueueStatusModern.css";
// We don't need all the individual CSS files if we are using the unified modern CSS, 
// but keeping them for now to avoid breaking sub-components if they rely on them.
import "./ChatSystem.css";
import "./NotificationSystem.css";
import "./QRCodeSystem.css";
import "./PaymentIntegration.css";
import "./DigitalSignature.css";
import "./ServiceBayCamera.css";
import "./AIPredictionEngine.css";
import "./VoiceCommandInterface.css";
import "./GamificationSystem.css";
import "./SocialMediaIntegration.css";

// Enhanced mock data with more details
const mockServiceBays = [
  {
    id: 1,
    bay_number: 1,
    bay_name: "Premium Bay 1",
    bay_type: "premium_repair",
    status: "occupied",
    is_available: false,
    capacity_vehicle_size: "SUV",
    service_type: "Full Service",
    service_progress: 65,
    vehicle_info: {
      brand: "BMW",
      model: "X5",
      year: 2022,
      plate: "ABC-123",
      color: "Black",
    },
    assigned_mechanic: "John Smith",
    mechanic_avatar: "JS",
    service_advisor: "Sarah Wilson",
    estimated_completion_time: new Date(
      Date.now() + 45 * 60 * 1000
    ).toISOString(),
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(),
    services: ["Oil Change", "Brake Check", "Tire Rotation"],
  },
  {
    id: 2,
    bay_number: 2,
    bay_name: "Standard Bay 2",
    bay_type: "standard_repair",
    status: "available",
    is_available: true,
    capacity_vehicle_size: "sedan",
    updated_at: new Date(),
    next_appointment: {
      time: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      customer: "Michael Brown",
    },
    service_advisor: "Mike Johnson",
  },
  {
    id: 3,
    bay_number: 3,
    bay_name: "Express Bay 1",
    bay_type: "express_service",
    status: "occupied",
    is_available: false,
    capacity_vehicle_size: "compact",
    service_type: "Quick Service",
    service_progress: 85,
    vehicle_info: {
      brand: "Toyota",
      model: "Corolla",
      year: 2021,
      plate: "XYZ-789",
      color: "White",
    },
    assigned_mechanic: "Sarah Johnson",
    mechanic_avatar: "SJ",
    service_advisor: "Lisa Davis",
    estimated_completion_time: new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString(),
    start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updated_at: new Date(),
    services: ["Tire Rotation", "Oil Top-up"],
  },
  {
    id: 4,
    bay_name: "Diagnostic Bay",
    bay_type: "diagnostic_bay",
    status: "occupied",
    is_available: false,
    capacity_vehicle_size: "any",
    service_type: "Engine Diagnostics",
    service_progress: 40,
    vehicle_info: {
      brand: "Mercedes",
      model: "E-Class",
      year: 2020,
      plate: "MERC-456",
      color: "Silver",
    },
    assigned_mechanic: "Mike Davis",
    mechanic_avatar: "MD",
    service_advisor: "Robert Chen",
    estimated_completion_time: new Date(
      Date.now() + 90 * 60 * 1000
    ).toISOString(),
    start_time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    updated_at: new Date(),
    services: ["Engine Scan", "ECU Update"],
  },
  {
    id: 5,
    bay_number: 5,
    bay_name: "Body Shop",
    bay_type: "body_repair",
    status: "maintenance",
    is_available: false,
    capacity_vehicle_size: "truck",
    maintenance_note: "Equipment calibration in progress",
    updated_at: new Date(),
    maintenance_ends: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    service_advisor: "Emma Wilson",
  },
];

const mockQueue = [
  {
    id: 1,
    appointment_id: 101,
    queue_position: 1,
    customer_name: "Alice Johnson",
    customer_phone: "(555) 123-4567",
    customer_email: "alice@email.com",
    appointment_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    car_year: 2022,
    car_brand: "Tesla",
    car_model: "Model 3",
    car_color: "Red",
    license_plate: "TES-001",
    service_name: "Battery Check",
    service_type: "premium",
    priority: "high",
    queue_status: "waiting",
    assigned_bay: null,
    estimated_wait_time: 15,
    services: ["Battery Diagnostics", "Software Update"],
    total_amount: 299.99,
    service_advisor: "Sarah Wilson",
  },
  {
    id: 2,
    appointment_id: 102,
    queue_position: 2,
    customer_name: "Bob Wilson",
    customer_phone: "(555) 234-5678",
    customer_email: "bob@email.com",
    appointment_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    car_year: 2021,
    car_brand: "Ford",
    car_model: "Mustang",
    car_color: "Blue",
    license_plate: "MUS-2021",
    service_name: "Performance Tune",
    service_type: "standard",
    priority: "normal",
    queue_status: "waiting",
    assigned_bay: null,
    estimated_wait_time: 30,
    services: ["Engine Tune", "Alignment Check"],
    total_amount: 450.0,
    service_advisor: "Mike Johnson",
  },
  {
    id: 3,
    appointment_id: 103,
    queue_position: 3,
    customer_name: "Carol Brown",
    customer_phone: "(555) 345-6789",
    customer_email: "carol@email.com",
    appointment_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    car_year: 2023,
    car_brand: "Porsche",
    car_model: "911",
    car_color: "Yellow",
    license_plate: "POR-911",
    service_name: "Full Inspection",
    service_type: "premium",
    priority: "urgent",
    queue_status: "waiting",
    assigned_bay: null,
    estimated_wait_time: 45,
    services: ["Full Inspection", "Oil Change", "Brake Service"],
    total_amount: 650.0,
    service_advisor: "Lisa Davis",
  },
];

const LiveQueueStatusEnhanced = () => {
  const [serviceBays, setServiceBays] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("bays");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Mock enhanced features state
  const [weatherInfo, setWeatherInfo] = useState({
    condition: "Sunny",
    temperature: 22,
  });
  const [trafficInfo, setTrafficInfo] = useState({
    condition: "Light",
    averageDelay: "5 min",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // In real app, we would fetch from API
      // await Promise.all([api.get("/service-bays"), api.get("/service-bays/queue")]);

      // Simulate API delay
      setTimeout(() => {
        setServiceBays(mockServiceBays);
        setQueue(mockQueue);
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error("Error fetching data:", err);
      setServiceBays(mockServiceBays);
      setQueue(mockQueue);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      if (autoRefresh) {
        setLastUpdated(new Date());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredServiceBays = serviceBays.filter((bay) => {
    const matchesStatus = filterStatus === "all" || bay.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      bay.bay_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bay.vehicle_info?.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredQueue = queue.filter((item) => {
    const matchesStatus =
      filterStatus === "all" || item.queue_status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.car_brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getBayTypeIcon = (type) => {
    switch (type) {
      case "premium_repair": return <FaShieldAlt className="bay-type-icon premium" />;
      case "express_service": return <FaBolt className="bay-type-icon express" />;
      case "diagnostic_bay": return <FaTachometerAlt className="bay-type-icon diagnostic" />;
      case "body_repair": return <FaTools className="bay-type-icon body" />;
      default: return <FaWrench className="bay-type-icon standard" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "#ef4444";
      case "high": return "#f97316";
      case "normal": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  if (loading) {
    return (
      <div className="queue-status-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
          </div>
          <h3>Loading Dashboard</h3>
          <p>Syncing live operations data...</p>
        </div>
      </div>
    );
  }

  const availableBays = serviceBays.filter(b => b.is_available).length;
  const occupiedBays = serviceBays.filter(b => b.status === "occupied").length;

  return (
    <div className="queue-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-main">
          <div className="header-title">
            <div className="title-icon">
              <FaWarehouse />
            </div>
            <div>
              <h1>Service Bay Dashboard</h1>
              <p className="subtitle">Real-time monitoring & queue management</p>
            </div>
          </div>

          <div className="header-controls">
            <button className="refresh-btn" onClick={fetchData}>
              <FaSync /> Refresh
            </button>
            <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? "connected" : "disconnected"}`}>
              <div className="status-dot"></div>
              <span>{isConnected ? "Live System" : "Offline"}</span>
            </div>
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Available</span>
              <span className="stat-number">{availableBays}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In Service</span>
              <span className="stat-number">{occupiedBays}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Queue</span>
              <span className="stat-number">{queue.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="filter-section">
            <div className="filter-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search vehicles, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="waiting">Waiting</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "bays" ? "active" : ""}`}
            onClick={() => setActiveTab("bays")}
          >
            <FaTools /> Service Bays
            <span className="tab-badge">{filteredServiceBays.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => setActiveTab("queue")}
          >
            <FaHourglassHalf /> Service Queue
            <span className="tab-badge">{filteredQueue.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FaTachometerAlt /> Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === "bays" && (
          <div className="service-bays-grid">
            {filteredServiceBays.map((bay) => (
              <div key={bay.id} className={`service-bay-card status-${bay.status}`}>
                <div className="bay-header">
                  <div className="bay-title">
                    <div className="bay-number">#{bay.bay_number}</div>
                    <div className="bay-info">
                      <h3>{bay.bay_name}</h3>
                      <div className="bay-type">
                        {getBayTypeIcon(bay.bay_type)} {bay.bay_type.replace("_", " ")}
                      </div>
                    </div>
                  </div>
                  <div className={`bay-status-indicator status-${bay.status}`}>
                    {bay.status}
                  </div>
                </div>

                <div className="bay-content">
                  {bay.status === "occupied" ? (
                    <>
                      <div className="vehicle-details">
                        <div className="vehicle-brand">
                          {bay.vehicle_info?.brand} {bay.vehicle_info?.model}
                        </div>
                        <div className="vehicle-meta">
                          <span>{bay.vehicle_info?.year}</span>
                          <span className="vehicle-plate">{bay.vehicle_info?.plate}</span>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span>{bay.service_progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${bay.service_progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mechanic-info">
                        <div className="mechanic-avatar">
                          {bay.mechanic_avatar}
                        </div>
                        <div className="mechanic-name">
                          {bay.assigned_mechanic}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-results" style={{ padding: "1rem 0" }}>
                      <p>{bay.status === "available" ? "Ready for Service" : "Unavailable"}</p>
                    </div>
                  )}

                  <div className="bay-actions">
                    <button className="bay-action-btn">Details</button>
                    <button className="bay-action-btn">Log</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "queue" && (
          <div className="queue-list">
            {filteredQueue.map((item) => (
              <div key={item.id} className="queue-item">
                <div className="queue-position">
                  <div className="position-number">{item.queue_position}</div>
                  <div className="position-label">Pos</div>
                </div>
                <div className="queue-info">
                  <div className="customer-name">{item.customer_name}</div>
                  <div className="service-type">
                    {item.car_brand} {item.car_model} • {item.service_name}
                  </div>
                </div>
                <div className={`queue-status ${item.queue_status}`}>
                  {item.queue_status}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="no-results">
            <h3>Analytics Overview</h3>
            <p>Updated daily at midnight.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveQueueStatusEnhanced;
