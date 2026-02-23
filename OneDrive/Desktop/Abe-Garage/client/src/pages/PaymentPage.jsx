import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { appointmentsAPI, paymentAPI, invoicesAPI } from "../services/api";
import CheckoutForm from "../components/CheckoutForm";
import { toast } from "react-toastify";

// Initialize Stripe (Move key to env variable in production)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Summary, 2: Method, 3: Card Form, 4: Result
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null); // success, failed

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      // Validate ID before making request
      if (
        !appointmentId ||
        isNaN(appointmentId) ||
        parseInt(appointmentId) <= 0
      ) {
        throw new Error("Invalid appointment ID");
      }

      const response = await appointmentsAPI.getAppointmentById(appointmentId);

      // Check if response has expected structure
      if (
        !response.data ||
        !response.data.data ||
        !response.data.data.appointment
      ) {
        throw new Error("Invalid response format from server");
      }

      setAppointment(response.data.data.appointment);
    } catch (error) {
      console.error("Error fetching appointment details:", error);

      // Provide more specific error messages
      if (error.response?.status === 400) {
        toast.error("Invalid appointment ID or request format");
      } else if (error.response?.status === 404) {
        toast.error("Appointment not found");
      } else if (error.response?.status === 401) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to load appointment details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.createPaymentIntent({
        appointmentId,
        paymentMethod,
      });
      setClientSecret(response.data.clientSecret);
      setStep(3); // Go to card form
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async () => {
    // For cash, we just confirm and show success (or update invoice status via API if needed)
    // Here assuming we just mark it as "Pay on Pickup" locally or via simple update
    setPaymentStatus("success");
    setStep(4);
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    setStep(4);
  };

  if (loading && !appointment) {
    return <Container className="py-5 text-center">Loading...</Container>;
  }

  if (!appointment) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Appointment not found</Alert>
      </Container>
    );
  }

  // Calculate Total
  // Prefer invoice amount if available (though controller logic for getAppointmentById might not join invoice, let's assume raw data for now)
  // Logic: Base Price + (Parts?) + Tax.
  // Since we don't have parts data available in this view easily yet, let's use base_price or estimated_cost.
  const totalAmount =
    appointment.final_cost ||
    appointment.estimated_cost ||
    appointment.base_price ||
    0;
  const taxAmount = totalAmount * 0.08; // 8% tax example
  const finalTotal = parseFloat(totalAmount) + parseFloat(taxAmount);

  return (
    <Container className="py-5">
      <h2 className="mb-4 text-center">Checkout & Payment</h2>

      {step === 1 && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Payment Summary</h4>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Service:</strong> {appointment.service_name}
                </div>
                <div className="mb-3">
                  <strong>Car:</strong> {appointment.car_year}{" "}
                  {appointment.car_brand} {appointment.car_model}
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Mechanic Cost / Service:</span>
                  <span>${parseFloat(totalAmount).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-muted">
                  <span>Tax (8%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fs-4 fw-bold">
                  <span>Total:</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setStep(2)}
                  >
                    Proceed to Payment
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Back to Booking
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {step === 2 && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Select Payment Method</h4>
              </Card.Header>
              <Card.Body>
                <div
                  className={`border rounded p-3 mb-3 cursor-pointer ${
                    paymentMethod === "card" ? "border-primary bg-light" : ""
                  }`}
                  onClick={() => setPaymentMethod("card")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-credit-card-2-front fs-3 me-3 text-primary"></i>
                    <div>
                      <h6 className="mb-0">Credit / Debit Card</h6>
                      <small className="text-muted">
                        Secure payment via Stripe
                      </small>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded p-3 mb-3 cursor-pointer ${
                    paymentMethod === "paypal" ? "border-primary bg-light" : ""
                  }`}
                  onClick={() => setPaymentMethod("paypal")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-paypal fs-3 me-3 text-primary"></i>
                    <div>
                      <h6 className="mb-0">PayPal</h6>
                      <small className="text-muted">
                        Pay securely with PayPal
                      </small>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded p-3 mb-3 cursor-pointer ${
                    paymentMethod === "cash" ? "border-primary bg-light" : ""
                  }`}
                  onClick={() => setPaymentMethod("cash")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-cash-coin fs-3 me-3 text-success"></i>
                    <div>
                      <h6 className="mb-0">Cash at Pickup</h6>
                      <small className="text-muted">
                        Pay when you pick up your car
                      </small>
                    </div>
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      if (paymentMethod === "card") handleCreatePaymentIntent();
                      else if (paymentMethod === "cash") handleCashPayment();
                      else alert("PayPal integration coming soon!");
                    }}
                  >
                    Continue
                  </Button>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {step === 3 && clientSecret && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h4 className="mb-0">Secure Payment</h4>
              </Card.Header>
              <Card.Body>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm onSuccess={handlePaymentSuccess} />
                </Elements>
                <Button
                  variant="link"
                  className="w-100 mt-3"
                  onClick={() => setStep(2)}
                >
                  Cancel
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {step === 4 && (
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm text-center p-4 border-0">
              <div className="mb-3">
                <i
                  className="bi bi-check-circle-fill text-success"
                  style={{ fontSize: "4rem" }}
                ></i>
              </div>
              <h3>Payment Successful!</h3>
              <p className="text-muted">Your transaction has been completed.</p>

              <div className="bg-light p-3 rounded mb-4 text-start">
                <p className="mb-1">
                  <strong>Payment ID:</strong>{" "}
                  {clientSecret
                    ? clientSecret.split("_secret")[0]
                    : "CASH-PENDING"}
                </p>
                <p className="mb-1">
                  <strong>Amount:</strong> ${finalTotal.toFixed(2)}
                </p>
              </div>

              <div className="d-grid gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => toast.info("Downloading PDF...")}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i> Download
                  Invoice
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate("/customer/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PaymentPage;
