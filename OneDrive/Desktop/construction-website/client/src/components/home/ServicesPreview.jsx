import { Link } from 'react-router-dom';
import { FaHome, FaBuilding, FaPencilRuler, FaClipboardList } from 'react-icons/fa';

const ServicesPreview = () => {
    const services = [
        {
            id: 1,
            title: "Residential Construction",
            desc: "Building dream homes from the ground up with precision.",
            icon: <FaHome size={40} />
        },
        {
            id: 2,
            title: "Commercial Construction",
            desc: "Scalable solutions for office buildings and retail spaces.",
            icon: <FaBuilding size={40} />
        },
        {
            id: 3,
            title: "Renovation & Remodeling",
            desc: "Transforming existing spaces into modern masterpieces.",
            icon: <FaPencilRuler size={40} />
        },
        {
            id: 4,
            title: "Project Management",
            desc: "End-to-end management ensuring timely delivery.",
            icon: <FaClipboardList size={40} />
        }
    ];

    return (
        <section className="section-padding bg-light">
            <div className="container">
                <div className="text-center mb-5">
                    <h5 className="text-primary-custom text-uppercase fw-bold">Our Services</h5>
                    <h2 className="display-6 fw-bold">What We Offer</h2>
                </div>

                <div className="row g-4">
                    {services.map((service) => (
                        <div key={service.id} className="col-md-6 col-lg-3">
                            <div className="card h-100 border-0 shadow-sm hover-up transition-all">
                                <div className="card-body text-center p-4">
                                    <div className="text-primary-custom mb-3">
                                        {service.icon}
                                    </div>
                                    <h4 className="h5 fw-bold mb-3">{service.title}</h4>
                                    <p className="text-secondary small mb-4">{service.desc}</p>
                                    <Link to="/services" className="text-decoration-none fw-bold text-dark hover-primary">
                                        Read More &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesPreview;
