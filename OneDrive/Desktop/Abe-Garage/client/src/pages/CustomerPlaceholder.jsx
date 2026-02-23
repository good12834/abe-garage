import React from "react";
import { useLocation, Link } from "react-router-dom";

const CustomerPlaceholder = () => {
    const location = useLocation();
    const path = location.pathname.split("/").pop();
    const title = path.replace(/-/g, ' ').charAt(0).toUpperCase() + path.replace(/-/g, '').slice(1);

    return (
        <div className="container py-5">
            <div className="card bg-dark text-white border-secondary shadow-lg">
                <div className="card-body text-center py-5">
                    <div className="mb-4">
                        <span className="material-icons text-red" style={{ fontSize: "64px" }}>
                            auto_awesome
                        </span>
                    </div>
                    <h2 className="lp-title mb-3" style={{ fontFamily: "var(--fd)" }}>
                        {title}
                    </h2>
                    <p className="text-muted mb-4 fs-5">
                        The {title.toLowerCase()} module is coming soon!
                        We're building a state-of-the-art experience for our members.
                        Check back shortly for exclusive rewards and features.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Link to="/customer/dashboard" className="btn btn-outline-primary px-4">
                            <span className="material-icons align-middle me-2">arrow_back</span>
                            Return to Dashboard
                        </Link>
                        <Link to="/" className="btn btn-secondary px-4">
                            Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPlaceholder;
