import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <div className="hero-section">
            {/* Background with zoom effect */}
            <div className="hero-background"></div>

            {/* Particle Effects */}
            <div className="particles-container">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

            {/* Floating decorative elements */}
            <div className="floating-element floating-1"></div>
            <div className="floating-element floating-2"></div>
            <div className="floating-element floating-3"></div>

            {/* Overlay */}
            <div className="hero-overlay"></div>

            {/* Main Content */}
            <div className="hero-content">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-xl-8 text-center animate-fade-in-up">
                            <span className="hero-subtitle">
                                Reliable Construction Services
                            </span>

                            <h3 className="hero-title mb-4">
                                Building Your Visions into Reality
                            </h3>

                            <p className="hero-description animate-fade-in-up animate-delay-1">
                                From residential dreams to commercial landmarks, we deliver excellence
                                in every project with precision, passion, and unmatched expertise.
                                Trusted by homeowners and businesses for over 20 years.
                            </p>

                            <div className="hero-buttons animate-fade-in-up animate-delay-2">
                                <Link to="/contact" className="btn btn-hero-primary">
                                    <i className="fas fa-comment-dots me-2"></i>
                                    Get a Free Quote
                                </Link>
                                <Link to="/projects" className="btn btn-hero-outline">
                                    <i className="fas fa-images me-2"></i>
                                    View Our Projects
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator">
               
                <div className="mouse">
                    <div className="wheel"></div>
                </div>
            </div>

            {/* Statistics at bottom */}
            <div className="hero-stats animate-fade-in-up animate-delay-3">
                <div className="stats-container">
                    <div className="row g-4">
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <div className="stat-number">200+</div>
                                <div className="stat-label">Projects Completed</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <div className="stat-number">20+</div>
                                <div className="stat-label">Years Experience</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <div className="stat-number">50+</div>
                                <div className="stat-label">Expert Team</div>
                            </div>
                        </div>
                        <div className="col-md-3 col-6">
                            <div className="stat-item">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Client Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
