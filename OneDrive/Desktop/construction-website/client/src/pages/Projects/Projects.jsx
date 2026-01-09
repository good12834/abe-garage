import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./projects.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSpinner,
  FaImages,
  FaArrowRight,
  FaHome,
  FaBuilding,
  FaRulerCombined,
  FaBed,
  FaBath,
  FaExpand,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaHardHat,
  FaCheckCircle,
} from "react-icons/fa";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    residential: 0,
    commercial: 0,
    successRate: 100,
  });

  const fallbackProjects = [
    {
      id: 1,
      title: "Modern Family Home",
      description:
        "A complete build of a modern 4-bedroom family home with sustainable features and smart home integration. This project features energy-efficient windows, solar panels, and a rainwater harvesting system.",
      category: "Residential",
      image_url:
        "https://images.unsplash.com/photo-1758957851828-5179f0e06985?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzV8fE1vZGVybiUyMEZhbWlseSUyMEhvbWV8ZW58MHx8MHx8fDA%3D",
      additional_images: [
        "https://plus.unsplash.com/premium_photo-1661964014750-963a28aeddea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aG9tZXxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9tZXxlbnwwfHwwfHx8MA%3D%3D",
      ],
      location: "Springfield, IL",
      completion_date: "2023-05-15",
      features: [
        "4 Bedrooms",
        "3 Bathrooms",
        "Smart Home",
        "Solar Panels",
        "2-Car Garage",
      ],
      size: "2800 sq ft",
      budget: "$450,000",
      status: "Completed",
    },
    {
      id: 2,
      title: "City Center Office",
      description:
        "Interior renovation of a downtown office space creating an open-plan collaborative environment with modern amenities and sustainable materials.",
      category: "Commercial",
      image_url:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800&auto=format&fit=crop&q=80",
      ],
      location: "Chicago, IL",
      completion_date: "2023-08-20",
      features: [
        "Open Plan",
        "Conference Rooms",
        "Cafeteria",
        "Green Roof",
        "Parking",
      ],
      size: "8500 sq ft",
      budget: "$1,200,000",
      status: "Completed",
    },
    {
      id: 3,
      title: "Lakeside Villa",
      description:
        "Luxury villa construction with landscape design, private dock, and custom finishing. Features panoramic lake views and premium amenities.",
      category: "Residential",
      image_url:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=80",
      ],
      location: "Lake Geneva, WI",
      completion_date: "2023-11-10",
      features: [
        "5 Bedrooms",
        "Pool",
        "Private Dock",
        "Wine Cellar",
        "Home Theater",
      ],
      size: "5200 sq ft",
      budget: "$1,800,000",
      status: "Completed",
    },
    {
      id: 4,
      title: "Retail Park Expansion",
      description:
        "Expansion of existing retail park adding 3 new units and parking with modern facade and energy-efficient systems.",
      category: "Commercial",
      image_url:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1572553793205-4f3e46852e7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9tZSUyMFJldGFpbCUyMFBhcmslMjBFeHBhbnNpb258ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1764801341736-ea42131f484c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGhvbWUlMjBSZXRhaWwlMjBQYXJrJTIwRXhwYW5zaW9ufGVufDB8fDB8fHww",
      ],
      location: "Naperville, IL",
      completion_date: "2022-09-30",
      features: [
        "3 Units",
        "100+ Parking",
        "LED Lighting",
        "Security System",
        "Landscaping",
      ],
      size: "15000 sq ft",
      budget: "$2,500,000",
      status: "Completed",
    },
    {
      id: 5,
      title: "Modern Apartment Complex",
      description:
        "Construction of a 12-unit luxury apartment building with rooftop garden and premium amenities.",
      category: "Residential",
      image_url:
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1722492559309-8f235c08975d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fE1vZGVybiUyMEFwYXJ0bWVudCUyMENvbXBsZXh8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1766950719102-8380fd98c33c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OTd8fE1vZGVybiUyMEFwYXJ0bWVudCUyMENvbXBsZXh8ZW58MHx8MHx8fDA%3D",
      ],
      location: "Milwaukee, WI",
      completion_date: "2024-03-15",
      features: [
        "12 Units",
        "Rooftop Garden",
        "Fitness Center",
        "Underground Parking",
        "EV Charging",
      ],
      size: "18000 sq ft",
      budget: "$3,200,000",
      status: "In Progress",
    },
    {
      id: 6,
      title: "Industrial Warehouse",
      description:
        "Construction of a large-scale industrial warehouse with advanced logistics systems and security features.",
      category: "Commercial",
      image_url:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://plus.unsplash.com/premium_photo-1661302828763-4ec9b91d9ce3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SW5kdXN0cmlhbCUyMFdhcmVob3VzZXxlbnwwfHwwfHx8MA%3D%3D",
        "https://images.unsplash.com/photo-1669003153363-6d7ba8e20c7e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fEluZHVzdHJpYWwlMjBXYXJlaG91c2V8ZW58MHx8MHx8fDA%3D",
      ],
      location: "Indianapolis, IN",
      completion_date: "2024-06-30",
      features: [
        "50000 sq ft",
        "Loading Docks",
        "Office Space",
        "Security Systems",
        "Sprinkler System",
      ],
      size: "50000 sq ft",
      budget: "$4,500,000",
      status: "In Progress",
    },
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For demo, use fallback
        setProjects(fallbackProjects);

        // Calculate stats
        const total = fallbackProjects.length;
        const residential = fallbackProjects.filter(
          (p) => p.category === "Residential"
        ).length;
        const commercial = fallbackProjects.filter(
          (p) => p.category === "Commercial"
        ).length;

        setStats({
          total,
          residential,
          commercial,
          successRate: 100,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects, using fallback");
        setProjects(fallbackProjects);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((project) => project.category === filter);

  const categories = [
    { name: "All", count: projects.length, icon: <FaHardHat /> },
    {
      name: "Residential",
      count: projects.filter((p) => p.category === "Residential").length,
      icon: <FaHome />,
    },
    {
      name: "Commercial",
      count: projects.filter((p) => p.category === "Commercial").length,
      icon: <FaBuilding />,
    },
  ];

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (selectedProject) {
      const images = [
        selectedProject.image_url,
        ...(selectedProject.additional_images || []),
      ];
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedProject) {
      const images = [
        selectedProject.image_url,
        ...(selectedProject.additional_images || []),
      ];
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-container">
          <div className="position-relative">
            <FaSpinner className="spin text-primary-custom" size={50} />
            <div className="mt-4 text-center">
              <h4 className="fw-bold text-dark mb-2">Loading Projects</h4>
              <p className="text-muted">
                Fetching our construction portfolio...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Hero Header */}
      <div className="projects-hero">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="hero-title animate__animated animate__fadeInDown">
                Our Construction Portfolio
              </h1>
              <p className="hero-subtitle animate__animated animate__fadeInUp">
                Explore our diverse portfolio of successful construction
                projects. From residential homes to commercial landmarks, we
                build with precision and passion.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filter Buttons */}
        <div className="d-flex justify-content-center mb-5">
          <div className="filter-container">
            <div className="filter-buttons animate__animated animate__fadeInUp">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className={`btn filter-btn ${
                    filter === cat.name ? "active" : "btn-outline-secondary"
                  }`}
                  onClick={() => setFilter(cat.name)}
                >
                  <span className="d-flex align-items-center gap-2">
                    {cat.icon}
                    {cat.name}
                    {cat.count > 0 && (
                      <span className="filter-count">{cat.count}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="project-card-wrapper animate__animated animate__fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="project-card">
                  {/* Image Container */}
                  <div className="image-container">
                    <img
                      src={project.image_url}
                      className="project-image"
                      alt={project.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTI1TDE2MCA5MEwyNDAgOTBMMjAwIDEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxNDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=";
                      }}
                    />
                    <div className="image-overlay"></div>

                    {/* Category Badge */}
                    <span
                      className={`category-badge ${project.category.toLowerCase()}`}
                    >
                      {project.category}
                    </span>

                    {/* Image Count */}
                    {project.additional_images &&
                      project.additional_images.length > 0 && (
                        <div className="image-count">
                          <FaImages /> {project.additional_images.length + 1}
                        </div>
                      )}
                  </div>

                  {/* Project Content */}
                  <div className="project-content">
                    <h3 className="project-title">{project.title}</h3>

                    <div className="project-meta">
                      <span className="meta-item">
                        <FaMapMarkerAlt /> {project.location}
                      </span>
                      <span className="meta-item">
                        <FaCalendarAlt />{" "}
                        {new Date(project.completion_date).getFullYear()}
                      </span>
                    </div>

                    <p className="project-description">{project.description}</p>

                    {/* Features */}
                    <ul className="project-features">
                      {project.features?.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="feature-tag">
                          <FaCheckCircle className="me-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Actions */}
                    <div className="project-actions">
                      <button
                        className="btn-view-project"
                        onClick={() => openProjectModal(project)}
                      >
                        View Details <FaArrowRight />
                      </button>

                      {project.additional_images &&
                        project.additional_images.length > 0 && (
                          <button
                            className="btn-gallery"
                            onClick={() => openProjectModal(project)}
                            title="View Gallery"
                          >
                            <FaImages />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <FaHardHat />
            </div>
            <h3 className="mb-3">No Projects Found</h3>
            <p className="text-muted">No projects match the selected filter.</p>
            <button
              className="btn btn-primary-custom mt-3"
              onClick={() => setFilter("All")}
            >
              View All Projects
            </button>
          </div>
        )}

        {/* Stats Section */}
        <div className="project-stats animate__animated animate__fadeIn">
          <h2 className="stats-title">Project Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.total}+</span>
              <span className="stat-label">Total Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.residential}</span>
              <span className="stat-label">Residential</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.commercial}</span>
              <span className="stat-label">Commercial</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.successRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="project-modal animate__animated animate__fadeIn">
          <div className="modal-content">
            <button className="close-modal" onClick={closeProjectModal}>
              <FaTimes />
            </button>

            <div className="modal-body p-0">
              {/* Image Gallery */}
              <div className="position-relative" style={{ height: "400px" }}>
                <img
                  src={
                    selectedProject.additional_images &&
                    selectedProject.additional_images.length > 0
                      ? [
                          selectedProject.image_url,
                          ...selectedProject.additional_images,
                        ][currentImageIndex]
                      : selectedProject.image_url
                  }
                  className="w-100 h-100 object-cover"
                  alt={selectedProject.title}
                  style={{ objectFit: "cover" }}
                />

                {/* Navigation Buttons */}
                {selectedProject.additional_images &&
                  selectedProject.additional_images.length > 0 && (
                    <>
                      <button
                        className="position-absolute top-50 start-0 translate-middle-y btn btn-dark rounded-circle m-3"
                        onClick={prevImage}
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        className="position-absolute top-50 end-0 translate-middle-y btn btn-dark rounded-circle m-3"
                        onClick={nextImage}
                        style={{ width: "50px", height: "50px" }}
                      >
                        <FaChevronRight />
                      </button>

                      {/* Image Counter */}
                      <div className="position-absolute bottom-0 end-0 m-3 bg-dark text-white px-3 py-1 rounded-pill">
                        {currentImageIndex + 1} /{" "}
                        {selectedProject.additional_images.length + 1}
                      </div>
                    </>
                  )}
              </div>

              {/* Project Details */}
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h3 className="fw-bold mb-2">{selectedProject.title}</h3>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-primary">
                        {selectedProject.category}
                      </span>
                      <span className="badge bg-success">
                        {selectedProject.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 text-muted">Completion Date</p>
                    <p className="fw-bold">
                      {new Date(
                        selectedProject.completion_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <p className="text-muted mb-2">
                      <FaMapMarkerAlt className="me-2 text-primary-custom" />
                      Location
                    </p>
                    <p className="fw-bold">{selectedProject.location}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-muted mb-2">
                      <FaRulerCombined className="me-2 text-primary-custom" />
                      Size
                    </p>
                    <p className="fw-bold">{selectedProject.size}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Project Description</h5>
                  <p>{selectedProject.description}</p>
                </div>

                <div className="mb-4">
                  <h5 className="fw-bold mb-3">Features</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedProject.features?.map((feature, idx) => (
                      <span
                        key={idx}
                        className="badge bg-light text-dark border px-3 py-2"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-4">
                  <Link
                    to="/contact"
                    className="btn btn-primary-custom btn-lg px-5"
                  >
                    <FaArrowRight className="me-2" />
                    Start Your Project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
