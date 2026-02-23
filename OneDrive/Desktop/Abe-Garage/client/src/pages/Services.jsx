import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";
import { servicesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  TruckIcon,
  SparklesIcon,
  CheckCircleIcon,
  HeartIcon,
  UsersIcon,
  TrophyIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import "./Services.css";

const getServiceIcon = (serviceName) => {
  const map = {
    "Oil Change": <WrenchScrewdriverIcon className="icon-svg" />,
    "Brake Inspection": <ShieldCheckIcon className="icon-svg" />,
    "Engine Diagnostics": <ChartBarIcon className="icon-svg" />,
    "Transmission Service": <WrenchScrewdriverIcon className="icon-svg" />,
    "Tire Installation": <TruckIcon className="icon-svg" />,
    "Air Conditioning Service": <SparklesIcon className="icon-svg" />,
    "Brake Pad Replacement": <ShieldCheckIcon className="icon-svg" />,
    "Battery Replacement": <CheckCircleIcon className="icon-svg" />,
    "Spark Plug Replacement": <WrenchScrewdriverIcon className="icon-svg" />,
    "Car Wash & Detail": <SparklesIcon className="icon-svg" />,
  };
  return map[serviceName] || <WrenchScrewdriverIcon className="icon-svg" />;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Services() {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = (await servicesAPI.getAllServices?.({
          active: true,
        })) || { data: { success: false } };
        if (response.data?.success && response.data?.data?.services) {
          const uniqueServices = response.data.data.services
            .filter(
              (service, index, arr) =>
                arr.findIndex((s) => s.name === service.name) === index,
            )
            .sort((a, b) => a.name.localeCompare(b.name));
          if (mounted) setServices(uniqueServices);
        } else {
          if (mounted) {
            setServices([]);
            setError(null);
          }
        }
      } catch (err) {
        console.error("fetch services error", err);
        if (mounted) {
          setError("Unable to load services right now.");
          setServices([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchServices();
    return () => (mounted = false);
  }, []);

  return (
    <div className="services-page">
      {/* Header */}
      <div className="services-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="services-header-content"
          >
            <h1>All Our Services</h1>
            <p>
              Comprehensive automotive services to keep your vehicle running
              smoothly
            </p>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading services...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <div className="text-warning mb-2">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <p className="muted">{error}</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-5">
            <p className="muted">
              No services currently available. Please check back later.
            </p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((s) => (
              <motion.div
                key={s.id}
                className="service-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="service-card-icon">
                  {getServiceIcon(s.name)}
                </div>
                <h3>{s.name}</h3>
                <p className="service-description muted">
                  {(s.description || "Professional service").slice(0, 120)}
                  {(s.description || "").length > 120 ? "..." : ""}
                </p>
                <div className="service-meta">
                  <span className="service-price">${s.base_price}</span>
                  <span className="service-duration">
                    {s.duration_minutes} min
                  </span>
                </div>
                <Link
                  to={`/book-appointment?service=${s.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Book Now
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
