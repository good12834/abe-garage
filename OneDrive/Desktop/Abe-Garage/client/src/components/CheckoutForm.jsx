import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Alert, Spinner } from "react-bootstrap";

const CheckoutForm = ({ onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/payment/success", // We will handle success via callback mostly, but redirection is standard
            },
            redirect: "if_required", // Prevent redirect if not 3DS
        });

        if (submitError) {
            setError(submitError.message);
            setProcessing(false);
        } else {
            // Payment succeeded
            setProcessing(false);
            if (onSuccess) onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h5 className="mb-3">Card Details</h5>
            <div className="p-3 border rounded mb-3 bg-light">
                <PaymentElement />
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
                variant="primary"
                type="submit"
                disabled={!stripe || processing}
                className="w-100"
            >
                {processing ? (
                    <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        {" "}Processing...
                    </>
                ) : (
                    "Pay Now"
                )}
            </Button>

            <div className="mt-2 text-center text-muted small">
                <i className="bi bi-lock-fill me-1"></i>
                Your payment is encrypted and processed securely.
            </div>
        </form>
    );
};

export default CheckoutForm;
