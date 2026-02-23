import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import LiveQueueStatusEnhanced from "../components/queue/LiveQueueStatusEnhanced";
import "./LiveQueueModern.css";
import {
  ClockIcon,
  TruckIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function LiveQueue() {
  const { isAuthenticated } = useAuth();

  return (
    <div
      className="modern-queue-dashboard live-queue-page"
      style={{ paddingTop: "0", minHeight: "100vh" }}
    >
      {/* Modern Header */}
      <section className="dashboard-hero">
        <div className="hero-background">
          <div className="gradient-overlay"></div>
          <div className="floating-particles">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-main"
          >
            <div className="status-indicator live">
              <div className="pulse-dot"></div>
              <span>LIVE QUEUE ACTIVE</span>
            </div>

            <h1 className="hero-title">
              <span className="title-main">Service Queue</span>
              <span className="title-accent">Dashboard</span>
            </h1>

            <p className="hero-subtitle">
              Real-time monitoring and management of our service operations
            </p>

            <div className="hero-stats">
              <div className="stat-card">
                <div className="stat-icon available">
                  <CheckCircleIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-number">3</span>
                  <span className="stat-label">Available Bays</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon occupied">
                  <WrenchScrewdriverIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-number">2</span>
                  <span className="stat-label">In Service</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon waiting">
                  <UserGroupIcon />
                </div>
                <div className="stat-info">
                  <span className="stat-number">7</span>
                  <span className="stat-label">In Queue</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="actions-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="actions-bar"
          >
            <div className="actions-left">
              <button className="action-btn primary">
                <PlayIcon className="btn-icon" />
                Start Monitoring
              </button>

              <button className="action-btn secondary">
                <ArrowPathIcon className="btn-icon" />
                Refresh Data
              </button>

              <button className="action-btn tertiary">
                <PauseIcon className="btn-icon" />
                Pause Updates
              </button>
            </div>

            <div className="actions-right">
              <div className="connection-status">
                <div className="status-dot connected"></div>
                <span>Connected • Last update: 2s ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Overview */}
      <section className="features-showcase">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="section-header"
          >
            <h2 className="section-title">Advanced Queue Management</h2>
            <p className="section-subtitle">
              Powered by real-time data and intelligent automation
            </p>
          </motion.div>

          <div className="features-grid">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="feature-card modern"
            >
              <div className="feature-header">
                <div className="feature-icon gradient-blue">
                  <TruckIcon />
                </div>
                <div className="feature-badge">LIVE</div>
              </div>
              <div className="feature-content">
                <h3>Real-Time Tracking</h3>
                <p>
                  Live vehicle tracking through service bays with instant status
                  updates
                </p>
                <div className="feature-metrics">
                  <div className="metric">
                    <span className="metric-value">98%</span>
                    <span className="metric-label">Accuracy</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">~1s</span>
                    <span className="metric-label">Update Time</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="feature-card modern"
            >
              <div className="feature-header">
                <div className="feature-icon gradient-green">
                  <WrenchScrewdriverIcon />
                </div>
                <div className="feature-badge">AI</div>
              </div>
              <div className="feature-content">
                <h3>Smart Predictions</h3>
                <p>
                  AI-powered wait time estimates and service completion
                  predictions
                </p>
                <div className="feature-metrics">
                  <div className="metric">
                    <span className="metric-value">±2m</span>
                    <span className="metric-label">Precision</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">95%</span>
                    <span className="metric-label">Confidence</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="feature-card modern"
            >
              <div className="feature-header">
                <div className="feature-icon gradient-orange">
                  <ClockIcon />
                </div>
                <div className="feature-badge">NEW</div>
              </div>
              <div className="feature-content">
                <h3>Optimized Scheduling</h3>
                <p>Intelligent bay allocation and service time optimization</p>
                <div className="feature-metrics">
                  <div className="metric">
                    <span className="metric-value">40%</span>
                    <span className="metric-label">Time Saved</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">85%</span>
                    <span className="metric-label">Efficiency</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="feature-card modern"
            >
              <div className="feature-header">
                <div className="feature-icon gradient-purple">
                  <UserGroupIcon />
                </div>
                <div className="feature-badge">PRO</div>
              </div>
              <div className="feature-content">
                <h3>Customer Experience</h3>
                <p>
                  Enhanced communication tools and transparent service updates
                </p>
                <div className="feature-metrics">
                  <div className="metric">
                    <span className="metric-value">4.9/5</span>
                    <span className="metric-label">Satisfaction</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">24/7</span>
                    <span className="metric-label">Support</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Queue Dashboard Component */}
      <section className="dashboard-main">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="dashboard-container"
          >
            <LiveQueueStatusEnhanced />
          </motion.div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="value-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="value-content"
          >
            <div className="value-text">
              <h2 className="value-title">
                Experience the Future of
                <span className="title-gradient"> Service Management</span>
              </h2>
              <p className="value-description">
                Our advanced queue system combines cutting-edge technology with
                intuitive design to deliver unprecedented transparency and
                efficiency in automotive service.
              </p>

              <div className="value-benefits">
                <div className="benefit-item">
                  <CheckCircleIcon className="benefit-icon" />
                  <span>Real-time service tracking</span>
                </div>
                <div className="benefit-item">
                  <CheckCircleIcon className="benefit-icon" />
                  <span>Instant notifications and updates</span>
                </div>
                <div className="benefit-item">
                  <CheckCircleIcon className="benefit-icon" />
                  <span>Optimized service bay utilization</span>
                </div>
                <div className="benefit-item">
                  <CheckCircleIcon className="benefit-icon" />
                  <span>Enhanced customer communication</span>
                </div>
              </div>
            </div>

            <div className="value-actions">
              <a href="/book-appointment" className="cta-button primary">
                Book Your Service
              </a>
              {!isAuthenticated && (
                <a href="/register" className="cta-button secondary">
                  Create Account
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
