import React, { useState } from 'react';
import { FaCertificate, FaHeartbeat, FaCalendarAlt, FaList } from 'react-icons/fa';
import MechanicCertificationsWall from '../components/certifications/MechanicCertificationsWall';
import LiveQueueStatus from '../components/queue/LiveQueueStatus';
import VehicleHealthDashboard from '../components/health/VehicleHealthDashboard';
import ServiceHistoryTimeline from '../components/timeline/ServiceHistoryTimeline';
import './AdvancedFeaturesDemo.css';

const AdvancedFeaturesDemo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaList },
    { id: 'certifications', label: 'Certifications', icon: FaCertificate },
    { id: 'queue', label: 'Live Queue', icon: FaList },
    { id: 'health', label: 'Health Dashboard', icon: FaHeartbeat },
    { id: 'timeline', label: 'Service Timeline', icon: FaCalendarAlt },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'certifications':
        return <MechanicCertificationsWall />;
      case 'queue':
        return <LiveQueueStatus />;
      case 'health':
        return <VehicleHealthDashboard />;
      case 'timeline':
        return <ServiceHistoryTimeline />;
      case 'overview':
      default:
        return <Overview />;
    }
  };

  return (
    <div className="advanced-features-demo">
      <div className="demo-header">
        <h1>Advanced Features Demo</h1>
        <p>Explore the new advanced features added to Abe Garage</p>
      </div>

      <div className="demo-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className="tab-icon" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="demo-content">
        {renderContent()}
      </div>
    </div>
  );
};

const Overview = () => {
  const features = [
    {
      id: 'certifications',
      title: 'Mechanic Certifications',
      description: 'Digital badge wall displaying verified certifications and credentials of our professional mechanics.',
      benefits: [
        'Verified certification badges',
        'Hover details with skills and expiry dates',
        'Filter by certification type',
        'Direct links to credential verification'
      ],
      icon: FaCertificate,
      color: '#3b82f6'
    },
    {
      id: 'queue',
      title: 'Live Queue Status',
      description: 'Real-time service bay availability and queue management with WebSocket updates.',
      benefits: [
        'Real-time bay status updates',
        'Live queue position tracking',
        'Estimated wait times',
        'Service bay equipment details'
      ],
      icon: FaList,
      color: '#10b981'
    },
    {
      id: 'health',
      title: 'Vehicle Health Dashboard',
      description: 'Interactive dashboard showing comprehensive vehicle condition scores and breakdowns.',
      benefits: [
        'Overall health score visualization',
        'System-by-system breakdown',
        'Historical trend analysis',
        'Critical issues and recommendations'
      ],
      icon: FaHeartbeat,
      color: '#ef4444'
    },
    {
      id: 'timeline',
      title: 'Service History Timeline',
      description: 'Visual timeline of vehicle service history with detailed events and documentation.',
      benefits: [
        'Chronological service events',
        'Photo documentation (before/after)',
        'Part replacement tracking',
        'Warranty and recommendation history'
      ],
      icon: FaCalendarAlt,
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="overview-content">
      <div className="overview-header">
        <h2>Welcome to Advanced Features</h2>
        <p>
          This demo showcases four powerful new features designed to enhance the Abe Garage experience. 
          Each feature provides valuable insights and real-time information for both customers and staff.
        </p>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <div key={feature.id} className="feature-card">
              <div className="feature-header">
                <div 
                  className="feature-icon"
                  style={{ backgroundColor: feature.color }}
                >
                  <IconComponent />
                </div>
                <h3>{feature.title}</h3>
              </div>
              
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-benefits">
                <h4>Key Benefits:</h4>
                <ul>
                  {feature.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="technical-info">
        <h3>Technical Implementation</h3>
        <div className="tech-stack">
          <div className="tech-section">
            <h4>Backend</h4>
            <ul>
              <li>New API endpoints for certifications, service bays, vehicle health, and timeline</li>
              <li>Enhanced database schema with supporting tables</li>
              <li>WebSocket integration for real-time updates</li>
              <li>Advanced query optimization and views</li>
            </ul>
          </div>
          
          <div className="tech-section">
            <h4>Frontend</h4>
            <ul>
              <li>React components with responsive design</li>
              <li>Chart.js integration for data visualization</li>
              <li>Real-time WebSocket connections</li>
              <li>Interactive hover states and animations</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-instructions">
        <h3>How to Explore</h3>
        <ol>
          <li>Use the tabs above to switch between different features</li>
          <li>Hover over certification badges to see detailed information</li>
          <li>Watch the live queue status for real-time updates</li>
          <li>Explore the health dashboard charts and breakdowns</li>
          <li>Scroll through the timeline to see service history</li>
        </ol>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;