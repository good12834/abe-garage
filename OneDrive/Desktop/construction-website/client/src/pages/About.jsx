import { FaAward, FaUserTie, FaCertificate } from 'react-icons/fa';

const About = () => {
    const team = [
        { name: "John Smith", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" },
        { name: "Sarah Johnson", role: "Senior Architect", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80" },
        { name: "Michael Brown", role: "Project Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80" },
    ];

    return (
        <div className="bg-white min-vh-100 pb-5">
            <div className="bg-secondary text-white py-5 mb-5 text-center">
                <div className="container">
                    <h1 className="display-4 fw-bold">About Us</h1>
                    <p className="lead">Building Trust, Deliver Excellence Since 1998</p>
                </div>
            </div>

            <div className="container">
                {/* Company History */}
                <div className="row align-items-center mb-5 section-padding">
                    <div className="col-lg-6">
                        <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80" className="img-fluid rounded shadow" alt="Construction team" />
                    </div>
                    <div className="col-lg-6 ps-lg-5 mt-4 mt-lg-0">
                        <h2 className="fw-bold mb-3">Our Story</h2>
                        <p className="text-secondary lead">
                            Established in 1998, BuildMaster began as a small family-owned business with a passion for quality craftsmanship. Today, we are a leading construction firm delivering award-winning Residential and Commercial projects.
                        </p>
                        <p className="text-secondary">
                            Our mission is to provide superior construction services with integrity, safety, and innovation. We believe in building lasting relationships with our clients by exceeding their expectations at every stage of the project.
                        </p>
                        <div className="d-flex gap-4 mt-4">
                            <div className="text-center">
                                <h3 className="fw-bold text-primary-custom mb-0">25+</h3>
                                <small className="text-muted">Years Experience</small>
                            </div>
                            <div className="text-center">
                                <h3 className="fw-bold text-primary-custom mb-0">500+</h3>
                                <small className="text-muted">Projects Completed</small>
                            </div>
                            <div className="text-center">
                                <h3 className="fw-bold text-primary-custom mb-0">100%</h3>
                                <small className="text-muted">Client Satisfaction</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-5 section-padding bg-light rounded-3 p-5">
                    <div className="text-center mb-5">
                        <h5 className="text-primary-custom text-uppercase">Our Team</h5>
                        <h2 className="fw-bold">Meet Values Experts</h2>
                    </div>
                    <div className="row g-4">
                        {team.map((member, index) => (
                            <div key={index} className="col-md-4 text-center">
                                <div className="bg-white p-4 rounded shadow-sm h-100 hover-up transition-all">
                                    <img src={member.image} className="rounded-circle mb-3 object-fit-cover shadow-sm" width="150" height="150" alt={member.name} />
                                    <h4 className="fw-bold mb-1">{member.name}</h4>
                                    <p className="text-primary-custom mb-0">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                <div className="text-center section-padding">
                    <h2 className="fw-bold mb-5">Certifications & Licenses</h2>
                    <div className="d-flex justify-content-center gap-5 flex-wrap">
                        <div className="d-flex align-items-center gap-2 text-secondary">
                            <FaAward className="text-primary-custom" size={40} />
                            <div className="text-start">
                                <h5 className="mb-0 fw-bold">ISO 9001</h5>
                                <small>Certified Quality</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary">
                            <FaCertificate className="text-primary-custom" size={40} />
                            <div className="text-start">
                                <h5 className="mb-0 fw-bold">Safety First</h5>
                                <small>OSHA Certified</small>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-secondary">
                            <FaUserTie className="text-primary-custom" size={40} />
                            <div className="text-start">
                                <h5 className="mb-0 fw-bold">Licensed</h5>
                                <small>General Contractor</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for dynamic icon not used, direct components used
const FaIcon = ({ icon, ...props }) => null;

export default About;
