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
  FaBell,
  FaSearch,
  FaPrint,
  FaEnvelope,
  FaCamera,
  FaFileAlt,
  FaExpandArrowsAlt,
  FaCompressArrowsAlt,
  FaTimes,
} from "react-icons/fa";
import api from "../../services/api";
import socketService from "../../services/socket";
import "./LiveQueueStatus.css";

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
    estimated_completion_time: new Date(
      Date.now() + 15 * 60 * 1000
    ).toISOString(),
    start_time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updated_at: new Date(),
    services: ["Tire Rotation", "Oil Top-up"],
  },
  {
    id: 4,
    bay_number: 4,
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
  },
];

const LiveQueueStatus = () => {
  const [serviceBays, setServiceBays] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("bays");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedBay, setSelectedBay] = useState(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [showBayModal, setShowBayModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchServiceBays = async () => {
    try {
      const response = await api.get("/service-bays");
      if (response.data.success) {
        setServiceBays(response.data.data.service_bays);
        setError(null);
      } else {
        setServiceBays(mockServiceBays);
      }
    } catch (err) {
      console.error("Error fetching service bays:", err);
      setServiceBays(mockServiceBays);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await api.get("/service-bays/queue");
      if (response.data.success) {
        setQueue(response.data.data.queue);
      } else {
        setQueue(mockQueue);
      }
    } catch (err) {
      console.error("Error fetching queue:", err);
      setQueue(mockQueue);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchServiceBays(), fetchQueue()]);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
      // Fallback to mock data
      setServiceBays(mockServiceBays);
      setQueue(mockQueue);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    connectSocket();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (autoRefresh) {
        fetchData();
        setLastUpdated(new Date());
      }
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      socketService.disconnect();
    };
  }, [autoRefresh]);

  const connectSocket = () => {
    const socket = socketService.connect();

    if (socket) {
      setIsConnected(true);

      socketService.on("socket_connected", () => {
        setIsConnected(true);
      });

      socketService.on("socket_disconnected", () => {
        setIsConnected(false);
      });

      socketService.on("service_bay_status_update", (data) => {
        setServiceBays((prevBays) =>
          prevBays.map((bay) =>
            bay.id === data.bay_id
              ? { ...bay, ...data, updated_at: new Date() }
              : bay
          )
        );
        setLastUpdated(new Date());
      });

      socketService.on("queue_status_update", (data) => {
        setQueue((prevQueue) =>
          prevQueue.map((item) =>
            item.appointment_id === data.appointment_id
              ? { ...item, ...data }
              : item
          )
        );
        setLastUpdated(new Date());
      });
    }
  };

  const getBayTypeIcon = (type) => {
    switch (type) {
      case "premium_repair":
        return <FaShieldAlt className="bay-type-icon premium" />;
      case "express_service":
        return <FaBolt className="bay-type-icon express" />;
      case "diagnostic_bay":
        return <FaTachometerAlt className="bay-type-icon diagnostic" />;
      case "body_repair":
        return <FaTools className="bay-type-icon body" />;
      default:
        return <FaWrench className="bay-type-icon standard" />;
    }
  };

  const getBayTypeLabel = (type) => {
    return type.replace("_", " ").toUpperCase();
  };

  const getServiceIcon = (service) => {
    if (service.toLowerCase().includes("oil")) return <FaOilCan />;
    if (service.toLowerCase().includes("battery")) return <FaBolt />;
    if (service.toLowerCase().includes("tire")) return <FaCarAlt />;
    return <FaWrench />;
  };

  const calculateTimeRemaining = (completionTime) => {
    const now = new Date();
    const completion = new Date(completionTime);
    const diffMs = completion - now;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins <= 0) return "Completed";
    if (diffMins < 60) return `${diffMins}m`;

    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "#ff4757";
      case "high":
        return "#ffa502";
      case "normal":
        return "#2ed573";
      case "low":
        return "#576574";
      default:
        return "#a4b0be";
    }
  };

  const handleAssignBay = (queueItemId, bayId) => {
    // In a real app, this would call an API
    console.log(`Assigning queue item ${queueItemId} to bay ${bayId}`);
  };

  const handleManualRefresh = () => {
    fetchData();
    setLastUpdated(new Date());
  };

  const handleViewBayDetails = (bay) => {
    setSelectedBay(bay);
    setShowBayModal(true);
  };

  const handleViewQueueItemDetails = (queueItem) => {
    setSelectedQueueItem(queueItem);
    setShowQueueModal(true);
  };

  const closeBayModal = () => {
    setShowBayModal(false);
    setSelectedBay(null);
  };

  const closeQueueModal = () => {
    setShowQueueModal(false);
    setSelectedQueueItem(null);
  };

  const addNotification = (message, type = "info", duration = 5000) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications((prev) => [...prev, notification]);

    // Play sound if enabled
    if (soundEnabled) {
      playNotificationSound(type);
    }

    // Auto remove notification
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  const playNotificationSound = (type) => {
    // Create audio context for sound effects
    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      const frequencies = {
        info: 800,
        success: 1000,
        warning: 600,
        error: 400,
      };

      oscillator.frequency.setValueAtTime(
        frequencies[type] || 800,
        audioContext.currentTime
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Audio not supported or blocked");
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleStatusChange = (bayId, newStatus) => {
    setServiceBays((prevBays) =>
      prevBays.map((bay) =>
        bay.id === bayId
          ? { ...bay, status: newStatus, updated_at: new Date() }
          : bay
      )
    );

    addNotification(
      `Bay #${
        serviceBays.find((b) => b.id === bayId)?.bay_number
      } status changed to ${newStatus}`,
      newStatus === "available" ? "success" : "info"
    );
  };

  const handleQuickAction = (action, item) => {
    switch (action) {
      case "complete_service":
        addNotification(
          `Service completed for ${item.vehicle_info?.brand || "vehicle"}`,
          "success"
        );
        break;
      case "delay_service":
        addNotification(
          `Service delayed for ${item.vehicle_info?.brand || "vehicle"}`,
          "warning"
        );
        break;
      case "priority_boost":
        addNotification(`Priority boosted for ${item.customer_name}`, "info");
        break;
      case "contact_customer":
        addNotification(`Contacting ${item.customer_name}`, "info");
        break;
      default:
        break;
    }
  };

  const exportData = () => {
    const data = {
      serviceBays: serviceBays.map((bay) => ({
        bayNumber: bay.bay_number,
        bayName: bay.bay_name,
        status: bay.status,
        vehicle: bay.vehicle_info
          ? `${bay.vehicle_info.year} ${bay.vehicle_info.brand} ${bay.vehicle_info.model}`
          : "N/A",
        mechanic: bay.assigned_mechanic || "N/A",
        progress: bay.service_progress || 0,
      })),
      queue: queue.map((item) => ({
        position: item.queue_position,
        customer: item.customer_name,
        vehicle: `${item.car_year} ${item.car_brand} ${item.car_model}`,
        service: item.service_name,
        waitTime: item.estimated_wait_time,
      })),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-queue-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification("Queue data exported successfully", "success");
  };

  const filteredServiceBays = serviceBays.filter((bay) => {
    const matchesStatus = filterStatus === "all" || bay.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      bay.bay_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bay.assigned_mechanic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bay.vehicle_info?.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredQueue = queue.filter((item) => {
    const matchesStatus =
      filterStatus === "all" || item.queue_status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.car_brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="queue-status-loading">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
          </div>
          <h3>Loading Dashboard</h3>
          <p>Fetching live queue status...</p>
        </div>
      </div>
    );
  }

  const availableBays = serviceBays.filter((bay) => bay.is_available).length;
  const occupiedBays = serviceBays.filter(
    (bay) => bay.status === "occupied"
  ).length;
  const totalQueue = queue.length;

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
              <p className="subtitle">
                Real-time monitoring & queue management
              </p>
            </div>
          </div>

          <div className="header-controls">
            <button
              className={`refresh-btn ${loading ? "refreshing" : ""}`}
              onClick={handleManualRefresh}
              disabled={loading}
            >
              <FaSync />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="export-btn"
              onClick={exportData}
              title="Export Data"
            >
              <FaDownload />
              Export
            </button>

            <button
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle Filters"
            >
              <FaFilter />
              Filters
            </button>

            <div className="notification-center">
              <button className="notification-btn">
                <FaBell />
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            <div className="sound-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>🔊 Sound</span>
            </div>

            <div className="auto-refresh-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span>Auto-refresh</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="status-bar">
          <div className="connection-status">
            <div
              className={`status-indicator ${
                isConnected ? "connected" : "disconnected"
              }`}
            >
              <div className="status-dot"></div>
              <FaSignal />
              <span>{isConnected ? "Live Connected" : "Disconnected"}</span>
            </div>
            <span className="last-updated">
              Last updated:{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>

          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-icon available">
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <span className="stat-number">{availableBays}</span>
                <span className="stat-label">Available</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon occupied">
                <FaWrench />
              </div>
              <div className="stat-content">
                <span className="stat-number">{occupiedBays}</span>
                <span className="stat-label">In Service</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon total">
                <FaTools />
              </div>
              <div className="stat-content">
                <span className="stat-number">{serviceBays.length}</span>
                <span className="stat-label">Total Bays</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon waiting">
                <FaUsers />
              </div>
              <div className="stat-content">
                <span className="stat-number">{totalQueue}</span>
                <span className="stat-label">In Queue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="filter-section">
            <div className="filter-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by customer, service, vehicle, or mechanic..."
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
                  <option value="maintenance">Maintenance</option>
                  <option value="waiting">Waiting</option>
                  <option value="in_service">In Service</option>
                </select>

                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification System */}
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification notification-${notification.type}`}
            >
              <div className="notification-content">
                <span className="notification-message">
                  {notification.message}
                </span>
                <button
                  className="notification-close"
                  onClick={() => removeNotification(notification.id)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="notification-timestamp">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === "bays" ? "active" : ""}`}
            onClick={() => setActiveTab("bays")}
          >
            <FaTools />
            Service Bays
            <span className="tab-badge">{filteredServiceBays.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
            onClick={() => setActiveTab("queue")}
          >
            <FaHourglassHalf />
            Service Queue
            <span className="tab-badge">{filteredQueue.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FaTachometerAlt />
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === "bays" && (
          <div className="service-bays-grid">
            {filteredServiceBays.length === 0 ? (
              <div className="no-results">
                <FaSearch />
                <h3>No service bays match your criteria</h3>
                <p>Try adjusting your search or filter settings</p>
              </div>
            ) : (
              filteredServiceBays.map((bay) => (
                <div
                  key={bay.id}
                  className={`service-bay-card status-${bay.status}`}
                >
                  {/* Bay Header */}
                  <div className="bay-header">
                    <div className="bay-title">
                      <div className="bay-number">
                        <span>#{bay.bay_number}</span>
                      </div>
                      <div className="bay-info">
                        <h3>{bay.bay_name}</h3>
                        <div className="bay-type">
                          {getBayTypeIcon(bay.bay_type)}
                          <span>{getBayTypeLabel(bay.bay_type)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`bay-status-indicator status-${bay.status}`}
                    >
                      <span>{bay.status.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Bay Content */}
                  <div className="bay-content">
                    {bay.status === "occupied" ? (
                      <>
                        {/* Vehicle Info */}
                        <div className="vehicle-section">
                          <div className="vehicle-header">
                            <FaCarAlt />
                            <h4>Current Vehicle</h4>
                          </div>
                          <div className="vehicle-details">
                            <div className="vehicle-main">
                              <div className="vehicle-model">
                                <span className="vehicle-brand">
                                  {bay.vehicle_info?.brand}
                                </span>
                                <span className="vehicle-name">
                                  {bay.vehicle_info?.model}
                                </span>
                              </div>
                              <div className="vehicle-meta">
                                <span>{bay.vehicle_info?.year}</span>
                                <span className="vehicle-plate">
                                  {bay.vehicle_info?.plate}
                                </span>
                                <span className="vehicle-color">
                                  {bay.vehicle_info?.color}
                                </span>
                              </div>
                            </div>
                            <div className="vehicle-services">
                              <h5>Services in Progress:</h5>
                              <div className="services-list">
                                {bay.services?.map((service, idx) => (
                                  <div key={idx} className="service-item">
                                    {getServiceIcon(service)}
                                    <span>{service}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Service Progress</span>
                            <span>{bay.service_progress || 0}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${bay.service_progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Mechanic & Time Info */}
                        <div className="mechanic-section">
                          <div className="mechanic-info">
                            <div className="mechanic-avatar">
                              {bay.mechanic_avatar}
                            </div>
                            <div>
                              <h5>Assigned Mechanic</h5>
                              <p className="mechanic-name">
                                {bay.assigned_mechanic}
                              </p>
                            </div>
                          </div>
                          <div className="time-info">
                            <div className="time-item">
                              <FaClock />
                              <div>
                                <span className="time-label">Started</span>
                                <span className="time-value">
                                  {formatTime(bay.start_time)}
                                </span>
                              </div>
                            </div>
                            <div className="time-item">
                              <FaClock />
                              <div>
                                <span className="time-label">ETA</span>
                                <span className="time-value">
                                  {formatTime(bay.estimated_completion_time)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : bay.status === "available" ? (
                      <div className="available-section">
                        <div className="available-icon">
                          <FaCheckCircle />
                        </div>
                        <h4>Ready for Service</h4>
                        <p>Bay is available for next appointment</p>
                        {bay.next_appointment && (
                          <div className="next-appointment">
                            <FaClock />
                            <span>
                              Next: {bay.next_appointment.customer} at{" "}
                              {formatTime(bay.next_appointment.time)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : bay.status === "maintenance" ? (
                      <div className="maintenance-section">
                        <div className="maintenance-icon">
                          <FaCog />
                        </div>
                        <h4>Under Maintenance</h4>
                        <p>
                          {bay.maintenance_note || "Maintenance in progress"}
                        </p>
                        {bay.maintenance_ends && (
                          <div className="maintenance-eta">
                            <FaClock />
                            <span>
                              ETA:{" "}
                              {calculateTimeRemaining(bay.maintenance_ends)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="out-of-service-section">
                        <div className="out-of-service-icon">
                          <FaExclamationTriangle />
                        </div>
                        <h4>Out of Service</h4>
                        <p>This bay is currently unavailable</p>
                      </div>
                    )}

                    {/* Capacity Info */}
                    <div className="capacity-info">
                      <span>Capacity:</span>
                      <span className="capacity-value">
                        {bay.capacity_vehicle_size?.toUpperCase() || "ANY"}
                      </span>
                    </div>
                  </div>

                  {/* Bay Footer */}
                  <div className="bay-footer">
                    <button
                      className="bay-action-btn"
                      onClick={() => handleViewBayDetails(bay)}
                    >
                      View Details
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "queue" && (
          <div className="queue-container">
            <div className="queue-header">
              <h2>Service Queue</h2>
              <div className="queue-stats">
                <span className="waiting-count">
                  {queue.filter((q) => q.queue_status === "waiting").length}{" "}
                  Waiting
                </span>
                <span className="avg-wait-time">Avg Wait: 25m</span>
              </div>
            </div>

            <div className="queue-list">
              {filteredQueue.length === 0 ? (
                <div className="no-results">
                  <FaSearch />
                  <h3>No queue items match your criteria</h3>
                  <p>Try adjusting your search or filter settings</p>
                </div>
              ) : (
                filteredQueue.map((item) => (
                  <div key={item.id} className="queue-item-card">
                    <div className="queue-item-header">
                      <div className="queue-position">
                        <span className="position-number">
                          #{item.queue_position}
                        </span>
                        <div
                          className="priority-indicator"
                          style={{
                            backgroundColor: getPriorityColor(item.priority),
                          }}
                        ></div>
                      </div>

                      <div className="queue-status-badge">
                        <span className={`status-${item.queue_status}`}>
                          {item.queue_status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="queue-item-content">
                      {/* Customer Info */}
                      <div className="customer-section">
                        <div className="customer-header">
                          <FaUserAlt />
                          <h4>Customer</h4>
                        </div>
                        <div className="customer-details">
                          <span className="customer-name">
                            {item.customer_name}
                          </span>
                          <div className="customer-contacts">
                            <span className="contact-item">
                              <FaPhoneAlt />
                              {item.customer_phone}
                            </span>
                            <span className="contact-item">
                              <FaCalendarAlt />
                              {formatTime(item.appointment_time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="queue-vehicle-section">
                        <div className="vehicle-header">
                          <FaCarAlt />
                          <h4>Vehicle</h4>
                        </div>
                        <div className="vehicle-details">
                          <div className="vehicle-model">
                            <span className="vehicle-brand">
                              {item.car_brand}
                            </span>
                            <span className="vehicle-name">
                              {item.car_model} {item.car_year}
                            </span>
                          </div>
                          <div className="vehicle-meta">
                            <span className="vehicle-color">
                              {item.car_color}
                            </span>
                            <span className="vehicle-plate">
                              {item.license_plate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Service Info */}
                      <div className="service-request-section">
                        <div className="service-header">
                          <FaWrench />
                          <h4>Service Request</h4>
                        </div>
                        <div className="service-details">
                          <span className="service-name">
                            {item.service_name}
                          </span>
                          <div className="service-list">
                            {item.services?.map((service, idx) => (
                              <span key={idx} className="service-tag">
                                {getServiceIcon(service)}
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Wait Time & Actions */}
                      <div className="queue-footer">
                        <div className="wait-time-info">
                          <FaClock />
                          <div>
                            <span className="wait-label">Est. Wait Time</span>
                            <span className="wait-value">
                              {item.estimated_wait_time} minutes
                            </span>
                          </div>
                        </div>

                        <div className="queue-actions">
                          <button
                            className="assign-btn"
                            onClick={() => handleAssignBay(item.id, null)}
                          >
                            Assign Bay
                          </button>
                          <button
                            className="details-btn"
                            onClick={() => handleViewQueueItemDetails(item)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-container">
            <div className="analytics-header">
              <h2>Service Analytics</h2>
              <p>Performance metrics and insights</p>
            </div>

            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Today's Overview</h3>
                <div className="analytics-stats">
                  <div className="stat-row">
                    <span>Services Completed</span>
                    <span className="stat-value">12</span>
                  </div>
                  <div className="stat-row">
                    <span>Avg Service Time</span>
                    <span className="stat-value">45m</span>
                  </div>
                  <div className="stat-row">
                    <span>Customer Satisfaction</span>
                    <span className="stat-value">4.8/5.0</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Bay Utilization</h3>
                <div className="utilization-bar">
                  <div
                    className="utilization-fill"
                    style={{ width: "78%" }}
                  ></div>
                </div>
                <span className="utilization-percent">78% Utilization</span>
              </div>

              <div className="analytics-card">
                <h3>Peak Hours</h3>
                <p>9:00 AM - 11:00 AM</p>
                <p>2:00 PM - 4:00 PM</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Bay Detail Modal */}
      {showBayModal && selectedBay && (
        <div className="modal-overlay" onClick={closeBayModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Service Bay #{selectedBay.bay_number} Details</h2>
              <button className="modal-close" onClick={closeBayModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Bay Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bay Name:</span>
                    <span className="detail-value">{selectedBay.bay_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {getBayTypeLabel(selectedBay.bay_type)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className={`detail-value status-${selectedBay.status}`}
                    >
                      {selectedBay.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">
                      {selectedBay.capacity_vehicle_size?.toUpperCase() ||
                        "ANY"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBay.status === "occupied" && (
                <div className="detail-section">
                  <h3>Current Service</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Vehicle:</span>
                      <span className="detail-value">
                        {selectedBay.vehicle_info?.year}{" "}
                        {selectedBay.vehicle_info?.brand}{" "}
                        {selectedBay.vehicle_info?.model}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">License Plate:</span>
                      <span className="detail-value">
                        {selectedBay.vehicle_info?.plate}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Color:</span>
                      <span className="detail-value">
                        {selectedBay.vehicle_info?.color}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Service Type:</span>
                      <span className="detail-value">
                        {selectedBay.service_type}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Progress:</span>
                      <span className="detail-value">
                        {selectedBay.service_progress || 0}%
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Mechanic:</span>
                      <span className="detail-value">
                        {selectedBay.assigned_mechanic}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Started:</span>
                      <span className="detail-value">
                        {formatTime(selectedBay.start_time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">ETA:</span>
                      <span className="detail-value">
                        {formatTime(selectedBay.estimated_completion_time)}
                      </span>
                    </div>
                  </div>
                  <div className="services-detail">
                    <h4>Services Being Performed:</h4>
                    <div className="services-list-detail">
                      {selectedBay.services?.map((service, idx) => (
                        <span key={idx} className="service-tag-detail">
                          {getServiceIcon(service)}
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedBay.status === "maintenance" && (
                <div className="detail-section">
                  <h3>Maintenance Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">Under Maintenance</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Note:</span>
                      <span className="detail-value">
                        {selectedBay.maintenance_note ||
                          "Maintenance in progress"}
                      </span>
                    </div>
                    {selectedBay.maintenance_ends && (
                      <div className="detail-item">
                        <span className="detail-label">ETA:</span>
                        <span className="detail-value">
                          {calculateTimeRemaining(selectedBay.maintenance_ends)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Queue Item Detail Modal */}
      {showQueueModal && selectedQueueItem && (
        <div className="modal-overlay" onClick={closeQueueModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Queue Item #{selectedQueueItem.queue_position} Details</h2>
              <button className="modal-close" onClick={closeQueueModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedQueueItem.customer_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {selectedQueueItem.customer_phone}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      {selectedQueueItem.customer_email}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span
                      className="detail-value"
                      style={{
                        color: getPriorityColor(selectedQueueItem.priority),
                      }}
                    >
                      {selectedQueueItem.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Vehicle Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Vehicle:</span>
                    <span className="detail-value">
                      {selectedQueueItem.car_year} {selectedQueueItem.car_brand}{" "}
                      {selectedQueueItem.car_model}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">License Plate:</span>
                    <span className="detail-value">
                      {selectedQueueItem.license_plate}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">
                      {selectedQueueItem.car_color}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Service Request</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service Name:</span>
                    <span className="detail-value">
                      {selectedQueueItem.service_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Service Type:</span>
                    <span className="detail-value">
                      {selectedQueueItem.service_type.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Appointment Time:</span>
                    <span className="detail-value">
                      {formatTime(selectedQueueItem.appointment_time)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Estimated Wait:</span>
                    <span className="detail-value">
                      {selectedQueueItem.estimated_wait_time} minutes
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Queue Status:</span>
                    <span className="detail-value">
                      {selectedQueueItem.queue_status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="services-detail">
                  <h4>Services Requested:</h4>
                  <div className="services-list-detail">
                    {selectedQueueItem.services?.map((service, idx) => (
                      <span key={idx} className="service-tag-detail">
                        {getServiceIcon(service)}
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQueueStatus;
