import Hero from '../components/home/Hero/Hero';
import Intro from '../components/home/Intro';
import ServicesPreview from '../components/home/ServicesPreview';

const Home = () => {
    return (
        <>
            <Hero />
            <Intro />
            <ServicesPreview />

            {/* Call to Action Section */}
            <section className="section-padding bg-primary-custom text-white text-center">
                <div className="container">
                    <h2 className="fw-bold mb-3">Ready to Start Your Project?</h2>
                    <p className="lead mb-4">Contact us today for a free consultation and estimate.</p>
                    <a href="/contact" className="btn btn-light btn-lg text-primary-custom fw-bold">Contact Us Now</a>
                </div>
            </section>
        </>
    );
};

export default Home;
