import React, { useState, useEffect } from "react";
import {
  FaCertificate,
  FaAward,
  FaShieldAlt,
  FaIndustry,
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from "react-icons/fa";
import { GiCertificate, GiTechnoHeart } from "react-icons/gi";
import api from "../../services/api";
import "./MechanicCertificationsWall.css";

const MechanicCertificationsWall = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredCertification, setHoveredCertification] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const certificationIcons = {
    technical: FaTools,
    safety: FaShieldAlt,
    manufacturer: FaAward,
    industry: FaIndustry,
    specialty: GiTechnoHeart,
  };

  const certificationColors = {
    technical: "#3b82f6", // blue
    safety: "#10b981", // green
    manufacturer: "#f59e0b", // amber
    industry: "#8b5cf6", // purple
    specialty: "#ef4444", // red
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/certifications", {
        params: {
          verified_only: true,
        },
      });

      if (response.data.success) {
        setCertifications(response.data.data.certifications);
      } else {
        setError("Failed to load certifications");
      }
    } catch (err) {
      console.error("Error fetching certifications:", err);
      setError("Error loading certifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (verificationStatus) => {
    switch (verificationStatus) {
      case "verified":
        return <FaCheckCircle className="status-icon verified" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "expired":
        return <FaExclamationTriangle className="status-icon expired" />;
      default:
        return <FaCertificate className="status-icon unknown" />;
    }
  };

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return "No expiry";

    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return "Expired";
    } else if (daysUntilExpiry <= 30) {
      return `Expires in ${daysUntilExpiry} days`;
    } else {
      return expiry.toLocaleDateString();
    }
  };

  const filteredCertifications =
    filterType === "all"
      ? certifications
      : certifications.filter((mechanic) =>
          mechanic.certifications.some(
            (cert) => cert.certification_type === filterType
          )
        );

  if (loading) {
    return (
      <div className="certifications-wall loading">
        <div className="loading-spinner"></div>
        <p>Loading certifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="certifications-wall error">
        <p>{error}</p>
        <button onClick={fetchCertifications} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="certifications-wall">
      <div className="wall-header">
        <h2>
          <FaCertificate className="header-icon" />
          Mechanic Certifications
        </h2>
        <p>Meet our certified professionals with verified credentials</p>

        <div className="filter-tabs">
          <button
            className={filterType === "all" ? "active" : ""}
            onClick={() => setFilterType("all")}
          >
            All
          </button>
          <button
            className={filterType === "technical" ? "active" : ""}
            onClick={() => setFilterType("technical")}
          >
            Technical
          </button>
          <button
            className={filterType === "safety" ? "active" : ""}
            onClick={() => setFilterType("safety")}
          >
            Safety
          </button>
          <button
            className={filterType === "manufacturer" ? "active" : ""}
            onClick={() => setFilterType("manufacturer")}
          >
            Manufacturer
          </button>
          <button
            className={filterType === "industry" ? "active" : ""}
            onClick={() => setFilterType("industry")}
          >
            Industry
          </button>
          <button
            className={filterType === "specialty" ? "active" : ""}
            onClick={() => setFilterType("specialty")}
          >
            Specialty
          </button>
        </div>
      </div>

      <div className="certifications-grid">
        {filteredCertifications.map((mechanic) => (
          <div key={mechanic.mechanic_id} className="mechanic-card">
            <div className="mechanic-header">
              <h3>{mechanic.mechanic_name}</h3>
              {mechanic.mechanic_specialties && (
                <p className="specialties">{mechanic.mechanic_specialties}</p>
              )}
            </div>

            <div className="certifications-list">
              {mechanic.certifications.map((cert) => {
                const IconComponent =
                  certificationIcons[cert.certification_type] || FaCertificate;
                const color =
                  certificationColors[cert.certification_type] || "#6b7280";

                return (
                  <div
                    key={cert.id}
                    className="certification-badge"
                    style={{ borderLeftColor: color }}
                    onMouseEnter={() => setHoveredCertification(cert)}
                    onMouseLeave={() => setHoveredCertification(null)}
                  >
                    <div className="badge-header">
                      <IconComponent
                        className="certification-icon"
                        style={{ color }}
                      />
                      <div className="badge-info">
                        <h4>{cert.certification_name}</h4>
                        <p className="issuing-org">
                          {cert.issuing_organization}
                        </p>
                      </div>
                      {getStatusIcon(cert.verification_status)}
                    </div>

                    {hoveredCertification?.id === cert.id && (
                      <div className="certification-details">
                        <div className="detail-row">
                          <span className="label">Certificate #:</span>
                          <span className="value">
                            {cert.certificate_number || "N/A"}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Issued:</span>
                          <span className="value">
                            {new Date(cert.issue_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Expires:</span>
                          <span className="value">
                            {formatExpiryDate(cert.expiry_date)}
                          </span>
                        </div>
                        {cert.description && (
                          <div className="detail-row">
                            <span className="label">Description:</span>
                            <span className="value">{cert.description}</span>
                          </div>
                        )}
                        {cert.skills_covered &&
                          cert.skills_covered.length > 0 && (
                            <div className="skills-covered">
                              <span className="label">Skills Covered:</span>
                              <div className="skills-list">
                                {cert.skills_covered.map((skill, index) => (
                                  <span key={index} className="skill-tag">
                                    {skill.replace(/_/g, " ")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        {cert.credential_url && (
                          <div className="credential-link">
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="verify-link"
                            >
                              Verify Certificate
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredCertifications.length === 0 && !loading && (
        <div className="no-certifications">
          <FaCertificate className="no-cert-icon" />
          <p>No certifications found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default MechanicCertificationsWall;
