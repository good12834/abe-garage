import React, { useState, useEffect } from "react";
import { servicePackagesAPI, formatCurrency } from "../services/api";

const ServicePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await servicePackagesAPI.getAllPackages({
        active: true,
      });
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (pkg) => {
    try {
      const response = await servicePackagesAPI.getPackageById(pkg.id);
      setSelectedPackage(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="service-packages-page">
      <div className="page-header">
        <h1>Service Packages</h1>
        <p>Choose from our bundled service packages for the best value</p>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div key={pkg.id} className="package-card">
            <div className="package-header">
              <h3>{pkg.name}</h3>
              {pkg.discount_percentage > 0 && (
                <span className="discount-badge">
                  {pkg.discount_percentage}% OFF
                </span>
              )}
            </div>
            <p className="package-description">{pkg.description}</p>

            <div className="package-services">
              <h4>Included Services:</h4>
              <ul>
                {pkg.service_names &&
                  pkg.service_names
                    .slice(0, 3)
                    .map((name, index) => <li key={index}>{name}</li>)}
                {pkg.service_names && pkg.service_names.length > 3 && (
                  <li className="more-services">
                    +{pkg.service_names.length - 3} more services
                  </li>
                )}
              </ul>
            </div>

            <div className="package-pricing">
              {pkg.discount_percentage > 0 && (
                <span className="original-price">
                  From {formatCurrency(pkg.total_value || 0)}
                </span>
              )}
              <span className="final-price">
                From {formatCurrency(pkg.final_price || 0)}
              </span>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handleViewDetails(pkg)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="no-packages">
          <p>No service packages available at the moment.</p>
          <p>Check back soon for our special offers!</p>
        </div>
      )}

      {/* Package Details Modal */}
      {showModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>

            <div className="modal-header">
              <h2>{selectedPackage.name}</h2>
              {selectedPackage.discount_percentage > 0 && (
                <span className="discount-badge large">
                  {selectedPackage.discount_percentage}% OFF
                </span>
              )}
            </div>

            <p className="modal-description">{selectedPackage.description}</p>

            <div className="modal-services">
              <h3>Included Services:</h3>
              <div className="services-list">
                {selectedPackage.items &&
                  selectedPackage.items.map((item) => (
                    <div key={item.id} className="service-item">
                      <span className="service-name">{item.service_name}</span>
                      <span className="service-price">
                        {formatCurrency(item.service_price)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="modal-pricing">
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Total Value:</span>
                  <span className="original-price">
                    {formatCurrency(selectedPackage.total_value || 0)}
                  </span>
                </div>
                {selectedPackage.discount_amount > 0 && (
                  <div className="price-row discount">
                    <span>Discount:</span>
                    <span>
                      -{formatCurrency(selectedPackage.discount_amount || 0)}
                    </span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Package Price:</span>
                  <span className="final-price">
                    {formatCurrency(selectedPackage.final_price || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  // Navigate to booking with package
                  window.location.href = `/book?package=${selectedPackage.id}`;
                }}
              >
                Book This Package
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .service-packages-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: #1a1a2e;
          margin-bottom: 0.5rem;
        }
        
        .page-header p {
          color: #666;
          font-size: 1.1rem;
        }
        
        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        
        .package-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .package-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .package-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .package-header h3 {
          font-size: 1.5rem;
          color: #1a1a2e;
          margin: 0;
        }
        
        .discount-badge {
          background: #4CAF50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .discount-badge.large {
          font-size: 1rem;
          padding: 0.5rem 1rem;
        }
        
        .package-description {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .package-services {
          margin-bottom: 1.5rem;
        }
        
        .package-services h4 {
          font-size: 1rem;
          color: #1a1a2e;
          margin-bottom: 0.75rem;
        }
        
        .package-services ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .package-services li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          color: #444;
        }
        
        .package-services li:last-child {
          border-bottom: none;
        }
        
        .more-services {
          color: #4CAF50;
          font-weight: 600;
        }
        
        .package-pricing {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .original-price {
          text-decoration: line-through;
          color: #999;
          font-size: 1rem;
          margin-right: 0.5rem;
        }
        
        .final-price {
          font-size: 1.75rem;
          font-weight: 700;
          color: #4CAF50;
        }
        
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 1rem;
        }
        
        .btn-primary {
          background: #4CAF50;
          color: white;
          width: 100%;
        }
        
        .btn-primary:hover {
          background: #388E3C;
        }
        
        .no-packages {
          text-align: center;
          padding: 4rem;
          color: #666;
        }
        
        .no-packages p {
          margin-bottom: 0.5rem;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
        }
        
        .modal-header {
          margin-bottom: 1rem;
        }
        
        .modal-header h2 {
          margin: 0;
          color: #1a1a2e;
        }
        
        .modal-description {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .modal-services {
          margin-bottom: 1.5rem;
        }
        
        .modal-services h3 {
          color: #1a1a2e;
          margin-bottom: 1rem;
        }
        
        .services-list {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1rem;
        }
        
        .service-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #eee;
        }
        
        .service-item:last-child {
          border-bottom: none;
        }
        
        .service-name {
          color: #1a1a2e;
          font-weight: 500;
        }
        
        .service-price {
          color: #4CAF50;
          font-weight: 600;
        }
        
        .modal-pricing {
          margin-bottom: 1.5rem;
        }
        
        .price-breakdown {
          background: #1a1a2e;
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
        }
        
        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }
        
        .price-row.discount {
          color: #4CAF50;
        }
        
        .price-row.total {
          border-top: 2px solid rgba(255, 255, 255, 0.2);
          margin-top: 0.5rem;
          padding-top: 1rem;
          font-size: 1.25rem;
          font-weight: 700;
        }
        
        .modal-actions {
          display: flex;
          gap: 1rem;
        }
        
        .modal-actions .btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
};

export default ServicePackages;
