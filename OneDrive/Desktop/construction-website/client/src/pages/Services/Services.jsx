import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


import {
    FaHome,
    FaBuilding,
    FaTools,
    FaClipboardList,
    FaSpinner,
    FaExclamationTriangle,
    FaArrowRight,
    FaCalendarAlt,
    FaCheckCircle,
    FaUsers,
    FaAward,
    FaPhoneAlt,
    FaBalanceScale
} from 'react-icons/fa';
import './Services.css';

const categories = ['All', 'Residential', 'Commercial', 'Renovation', 'Management'];

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedService, setSelectedService] = useState(null);
    const [compareServices, setCompareServices] = useState([]);

    const [stats, setStats] = useState([
        { number: '200+', label: 'Projects Completed', icon: <FaCheckCircle /> },
        { number: '20+', label: 'Years Experience', icon: <FaCalendarAlt /> },
        { number: '50+', label: 'Expert Team', icon: <FaUsers /> },
        { number: '100%', label: 'Satisfaction', icon: <FaAward /> }
    ]);

    // Fallback data in case API fails (for demo purposes)
    const fallbackServices = [
        {
            id: 1,
            title: "Residential Construction",
            category: "Residential",
            description: "High-quality home building and structural renovations. We specialize in custom homes, additions, and major structural changes.",
            icon: 'home',
            image_url: 'https://plus.unsplash.com/premium_photo-1681823643449-3c3d99541b0b?w=800&auto=format&fit=crop&q=80',
            features: ['Custom Home Building', 'Home Additions', 'Structural Renovations', 'Foundation Work'],
            details: 'Full-service residential construction with 20+ years expertise'
        },
        {
            id: 2,
            title: "Commercial Construction",
            category: "Commercial",
            description: "Scalable commercial building solutions for businesses. From retail spaces to office buildings, we handle large-scale projects.",
            icon: 'building',
            image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80',
            features: ['Office Buildings', 'Retail Spaces', 'Industrial Facilities', 'Commercial Renovations'],
            details: 'Turnkey commercial construction solutions'
        },
        {
            id: 3,
            title: "Renovation & Remodeling",
            category: "Renovation",
            description: "Expert remodeling services to transform your existing space. Kitchens, bathrooms, and complete interiors.",
            icon: 'tools',
            image_url: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=800&auto=format&fit=crop&q=80',
            features: ['Kitchen Remodeling', 'Bathroom Renovations', 'Interior Design', 'Space Optimization'],
            details: 'Transform your space with expert craftsmanship'
        },
        {
            id: 4,
            title: "Project Management",
            category: "Management",
            description: "Comprehensive project management from planning to execution. We ensure your project stays on track and on budget.",
            icon: 'clipboard',
            image_url: 'https://plus.unsplash.com/premium_photo-1723291359453-aea7e6bcbebd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UHJvamVjdCUyME1hbmFnZW1lbnR8ZW58MHx8MHx8fDA%3D',
            features: ['Budget Management', 'Timeline Control', 'Quality Assurance', 'Stakeholder Coordination'],
            details: 'Professional project oversight and coordination'
        }
    ];

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                // Simulate API call with delay for demo
                await new Promise(resolve => setTimeout(resolve, 1000));

                // For demo, use fallback data
                setServices(fallbackServices);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch services:", err);
                setError("Could not fetch services. Using offline data.");
                setServices(fallbackServices);
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'home': return <FaHome />;
            case 'building': return <FaBuilding />;
            case 'tools': return <FaTools />;
            case 'clipboard': return <FaClipboardList />;
            default: return <FaTools />;
        }
    };

    const toggleCompare = (service) => {
        if (compareServices.includes(service.id)) {
            setCompareServices(compareServices.filter(id => id !== service.id));
        } else if (compareServices.length < 2) {
            setCompareServices([...compareServices, service.id]);
        }
    };

    const filteredServices = activeCategory === 'All'
        ? services
        : services.filter(service => service.category === activeCategory);

    if (loading) return (
        <div className="services-page">
            <div className="loading-container">
                <div className="position-relative">
                    <FaSpinner className="spin text-primary-custom" size={50} />
                    <div className="mt-4">
                        <h4 className="fw-bold">Loading Services</h4>
                        <p className="text-muted">Fetching our premium construction solutions...</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="services-page">
            {/* Hero Header */}
            <div className="services-hero">
                <div className="container">
                    <div className="hero-content text-center">
                        <span className="hero-badge animate__animated animate__fadeInDown">
                            PREMIUM CONSTRUCTION SOLUTIONS
                        </span>
                        <h1 className="hero-title animate__animated animate__fadeInUp">
                            Building Excellence <br />in Every Project
                        </h1>
                        <p className="hero-subtitle animate__animated animate__fadeInUp animate__delay-1s">
                            Discover our comprehensive range of professional construction services
                            designed to bring your vision to life with precision and quality.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container">
                {error && (
                    <div className="error-alert d-flex align-items-center mb-4 animate__animated animate__fadeIn">
                        <FaExclamationTriangle className="me-3 fs-4 text-warning" />
                        <div>
                            <h6 className="mb-1 fw-bold">Offline Mode</h6>
                            <p className="mb-0">{error}</p>
                        </div>
                    </div>
                )}

                {/* Filter Buttons */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="filter-buttons d-flex flex-wrap gap-2 justify-content-center">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`btn ${activeCategory === category ? 'btn-primary-custom text-white' : 'btn-outline-primary-custom'}`}
                                    onClick={() => setActiveCategory(category)}
                                    style={activeCategory !== category ? { color: '#ffb300' } : {}}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="row g-4 mb-5">
                    {filteredServices.map((service, index) => (
                        <div key={service.id} className="col-lg-6">
                            <div className="service-card-wrapper animate__animated animate__fadeInUp"
                                style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="service-card">
                                    <div className="card-image-container">
                                        <img
                                            src={service.image_url}
                                            className="card-image"
                                            alt={service.title}
                                            loading="lazy"
                                        />
                                        <div className="image-overlay"></div>
                                        <div className="card-icon">
                                            {getIcon(service.icon)}
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h3 className="card-title mb-0">{service.title}</h3>
                                            <button
                                                className={`btn btn-sm ${compareServices.includes(service.id) ? 'btn-warning' : 'btn-outline-secondary'}`}
                                                onClick={() => toggleCompare(service)}
                                                title="Compare"
                                            >
                                                <FaBalanceScale />
                                            </button>
                                        </div>
                                        <p className="card-description">{service.description}</p>

                                        <ul className="card-features">
                                            {service.features && service.features.map((feature, idx) => (
                                                <li key={idx}>{feature}</li>
                                            ))}
                                        </ul>

                                        <div className="card-actions mt-3">
                                            <button
                                                onClick={() => setSelectedService(service)}
                                                className="btn-learn-more border-0 bg-transparent p-0"
                                            >
                                                Learn More <FaArrowRight />
                                            </button>
                                            <Link
                                                to="/contact"
                                                className="btn-quote"
                                            >
                                                Get Quote <FaPhoneAlt />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparison Section (Visible if items selected) */}
                {compareServices.length > 0 && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center animate__animated animate__fadeInUp">
                        <span>Comparing {compareServices.length} service(s)</span>
                        <button className="btn btn-sm btn-outline-dark" onClick={() => setCompareServices([])}>Clear Comparison</button>
                    </div>
                )}

                {/* Stats Section */}
                <div className="stats-section animate__animated animate__fadeIn">
                    <div className="row g-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="col-md-3 col-sm-6">
                                <div className="stat-item">
                                    <span className="stat-icon mb-3 d-block fs-2 opacity-75">
                                        {stat.icon}
                                    </span>
                                    <span className="stat-number">{stat.number}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="cta-section animate__animated animate__fadeIn">
                    <h2 className="cta-title">Ready to Start Your Project?</h2>
                    <p className="cta-text">
                        Contact us today for a free consultation and quote.
                        Let's build something amazing together!
                    </p>
                    <Link to="/contact" className="btn btn-cta">
                        <FaPhoneAlt className="me-2" />
                        Get Free Consultation
                    </Link>
                </div>
            </div>

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-bottom-0">
                                <h5 className="modal-title fw-bold text-primary-custom">{selectedService.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedService(null)}></button>
                            </div>
                            <div className="modal-body">
                                <img
                                    src={selectedService.image_url}
                                    className="img-fluid rounded mb-4 w-100 object-fit-cover"
                                    style={{ maxHeight: '400px' }}
                                    alt={selectedService.title}
                                />
                                <h6 className="fw-bold mb-3">Service Details</h6>
                                <p className="text-secondary">{selectedService.details}</p>

                                <h6 className="fw-bold mb-3 mt-4">Key Features</h6>
                                <div className="row g-3">
                                    {selectedService.features.map((feature, idx) => (
                                        <div key={idx} className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <FaCheckCircle className="text-success me-2" />
                                                <span>{feature}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer border-top-0">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedService(null)}>Close</button>
                                <Link to="/contact" className="btn btn-primary-custom text-white">Request Quote</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
