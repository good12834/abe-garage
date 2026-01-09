import { FaTools, FaHardHat, FaHandshake } from 'react-icons/fa';

const Intro = () => {
    return (
        <section className="section-padding bg-white">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <div className="position-relative">
                            <img
                                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"
                                alt="Construction Site"
                                className="img-fluid rounded shadow-lg"
                            />
                            <div className="bg-primary-custom text-white p-4 rounded position-absolute bottom-0 end-0 translate-middle-y me-n4 d-none d-md-block shadow">
                                <h2 className="display-5 fw-bold mb-0">25+</h2>
                                <p className="mb-0 fw-semibold">Years Experience</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 ps-lg-5">
                        <h5 className="text-primary-custom text-uppercase fw-bold">About Company</h5>
                        <h2 className="mb-4 display-6 fw-bold">We Provide the Best Construction Services</h2>
                        <p className="text-secondary mb-4">
                            At BuildMaster, we pride ourselves on delivering top-notch construction solutions tailored to your specific needs. Our team of certified professionals ensures that every project is completed on time and within budget, without compromising on quality.
                        </p>

                        <div className="d-flex flex-column gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary-custom">
                                    <FaHardHat size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold">Certified Team</h5>
                                    <p className="mb-0 text-secondary small">Highly skilled and licensed professionals.</p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-light p-3 rounded-circle text-primary-custom">
                                    <FaTools size={24} />
                                </div>
                                <div>
                                    <h5 className="mb-1 fw-bold">Modern Equipment</h5>
                                    <p className="mb-0 text-secondary small">Using the latest technology for efficiency.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Intro;
