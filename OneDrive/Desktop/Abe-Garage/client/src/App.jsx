import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Enable React Router v7 future flags to opt-in early
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

// Import components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Import pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import BookAppointment from "./pages/BookAppointment";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerSettings from "./pages/CustomerSettings";
import CustomerAppointments from "./pages/CustomerAppointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import CustomerInvoices from "./pages/CustomerInvoices";
import TrackMyCar from "./pages/TrackMyCar";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlaceholder from "./pages/AdminPlaceholder";
import CustomerPlaceholder from "./pages/CustomerPlaceholder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentPage from "./pages/PaymentPage";
import EmergencyService from "./pages/EmergencyService";
import VehicleHealth from "./pages/VehicleHealth";
import Notifications from "./pages/Notifications";
import RateService from "./pages/RateService";
import ActionAnalytics from "./pages/ActionAnalytics";
import VehicleHistory from "./pages/VehicleHistory";
import ARViewer from "./pages/ARViewer";
import QRCheckin from "./pages/QRCheckin";
import Help from "./pages/Help";
import Locations from "./pages/Locations";
import PaymentHistory from "./pages/PaymentHistory";
import Services from "./pages/Services";
import BudgetPlanner from "./pages/BudgetPlanner";
import CostCalculator from "./pages/CostCalculator";
import LiveQueue from "./pages/LiveQueue";
import Vehicles from "./pages/Vehicles";
import ServicePackages from "./pages/ServicePackages";
import Referrals from "./pages/Referrals";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

// Import styles
import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/customer/dashboard"
                element={<CustomerDashboard />}
              />
              <Route path="/customer/settings" element={<CustomerSettings />} />
              <Route
                path="/customer/appointments"
                element={<CustomerAppointments />}
              />
              <Route
                path="/customer/appointments/:id"
                element={<AppointmentDetail />}
              />
              <Route path="/customer/invoices" element={<CustomerInvoices />} />
              <Route
                path="/customer/vehicle-history"
                element={<VehicleHistory />}
              />
              <Route path="/customer/vehicles" element={<Vehicles />} />
              <Route path="/customer/rewards" element={<CustomerPlaceholder />} />
              <Route path="/track-my-car" element={<TrackMyCar />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/customers" element={<AdminPlaceholder />} />
              <Route path="/admin/appointments" element={<AdminPlaceholder />} />
              <Route path="/admin/services" element={<AdminPlaceholder />} />
              <Route path="/admin/mechanics" element={<AdminPlaceholder />} />
              <Route path="/admin/invoices" element={<AdminPlaceholder />} />
              <Route path="/admin/reports" element={<AdminPlaceholder />} />
              <Route path="/payment/:appointmentId" element={<PaymentPage />} />
              <Route path="/emergency-service" element={<EmergencyService />} />
              <Route path="/vehicle-health" element={<VehicleHealth />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/rate-service" element={<RateService />} />
              <Route path="/action-analytics" element={<ActionAnalytics />} />
              <Route path="/ar-viewer" element={<ARViewer />} />
              <Route path="/qr-checkin" element={<QRCheckin />} />
              <Route path="/help" element={<Help />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/services" element={<Services />} />
              <Route path="/budget-planner" element={<BudgetPlanner />} />
              <Route path="/cost-calculator" element={<CostCalculator />} />
              <Route path="/live-queue" element={<LiveQueue />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/service-packages" element={<ServicePackages />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
