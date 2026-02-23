import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./PaymentHistory.css"; // Import custom styles to override background colors
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../context/AuthContext";

const PaymentHistory = () => {
  const { user } = useAuth();
  const [paymentData, setPaymentData] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPaymentData();
  }, [selectedFilter, selectedTimeframe]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);

      // Mock payment data
      const mockPayments = [
        {
          id: 1,
          date: "2025-12-10",
          amount: 65.99,
          status: "completed",
          method: "credit_card",
          description: "Oil Change & Filter Replacement",
          invoiceNumber: "INV-2025-0156",
          appointmentId: "APT-2025-1234",
          serviceType: "Routine Maintenance",
          technician: "John Smith",
          tax: 5.28,
          subtotal: 60.71,
          cardLast4: "1234",
          transactionId: "txn_abc123def456",
        },
        {
          id: 2,
          date: "2025-11-28",
          amount: 150.0,
          status: "completed",
          method: "debit_card",
          description: "Engine Diagnostics & Scan",
          invoiceNumber: "INV-2025-0145",
          appointmentId: "APT-2025-1189",
          serviceType: "Diagnostics",
          technician: "Sarah Johnson",
          tax: 12.0,
          subtotal: 138.0,
          cardLast4: "5678",
          transactionId: "txn_def456ghi789",
        },
        {
          id: 3,
          date: "2025-11-15",
          amount: 89.5,
          status: "completed",
          method: "cash",
          description: "Brake Inspection & Tire Rotation",
          invoiceNumber: "INV-2025-0134",
          appointmentId: "APT-2025-1167",
          serviceType: "Brake Service",
          technician: "Mike Wilson",
          tax: 7.16,
          subtotal: 82.34,
          cardLast4: null,
          transactionId: "txn_ghi789jkl012",
        },
        {
          id: 4,
          date: "2025-10-22",
          amount: 185.75,
          status: "completed",
          method: "credit_card",
          description: "Transmission Fluid Service",
          invoiceNumber: "INV-2025-0123",
          appointmentId: "APT-2025-1145",
          serviceType: "Transmission",
          technician: "Lisa Chen",
          tax: 14.86,
          subtotal: 170.89,
          cardLast4: "9012",
          transactionId: "txn_jkl012mno345",
        },
        {
          id: 5,
          date: "2025-10-08",
          amount: 220.0,
          status: "completed",
          method: "mobile_payment",
          description: "Emergency Battery Replacement",
          invoiceNumber: "INV-2025-0112",
          appointmentId: "APT-2025-1123",
          serviceType: "Emergency Service",
          technician: "David Brown",
          tax: 17.6,
          subtotal: 202.4,
          cardLast4: "3456",
          transactionId: "txn_mno345pqr678",
        },
        {
          id: 6,
          date: "2025-09-30",
          amount: 145.25,
          status: "completed",
          method: "credit_card",
          description: "Winter Maintenance Package",
          invoiceNumber: "INV-2025-0101",
          appointmentId: "APT-2025-1101",
          serviceType: "Maintenance Package",
          technician: "John Smith",
          tax: 11.62,
          subtotal: 133.63,
          cardLast4: "7890",
          transactionId: "txn_pqr678stu901",
        },
      ];

      const mockSummary = {
        totalPayments: mockPayments.length,
        totalAmount: mockPayments.reduce(
          (sum, payment) => sum + payment.amount,
          0
        ),
        averagePayment:
          mockPayments.reduce((sum, payment) => sum + payment.amount, 0) /
          mockPayments.length,
        completedPayments: mockPayments.filter((p) => p.status === "completed")
          .length,
        pendingPayments: mockPayments.filter((p) => p.status === "pending")
          .length,
        failedPayments: mockPayments.filter((p) => p.status === "failed")
          .length,
        monthlySpending: [
          { month: "Sep", amount: 145.25, transactions: 1 },
          { month: "Oct", amount: 405.75, transactions: 2 },
          { month: "Nov", amount: 239.5, transactions: 2 },
          { month: "Dec", amount: 65.99, transactions: 1 },
        ],
        paymentMethods: [
          { method: "Credit Card", count: 4, amount: 551.74, color: "#3b82f6" },
          { method: "Debit Card", count: 1, amount: 150.0, color: "#10b981" },
          { method: "Cash", count: 1, amount: 89.5, color: "#f59e0b" },
          {
            method: "Mobile Payment",
            count: 1,
            amount: 220.0,
            color: "#8b5cf6",
          },
        ],
        serviceTypeSpending: [
          { service: "Routine Maintenance", amount: 211.24, count: 2 },
          { service: "Diagnostics", amount: 150.0, count: 1 },
          { service: "Brake Service", amount: 89.5, count: 1 },
          { service: "Transmission", amount: 185.75, count: 1 },
          { service: "Emergency Service", amount: 220.0, count: 1 },
          { service: "Maintenance Package", amount: 145.25, count: 1 },
        ],
      };

      setTimeout(() => {
        setPaymentData(mockPayments);
        setPaymentSummary(mockSummary);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-success" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-warning" />;
      case "failed":
        return <ExclamationTriangleIcon className="w-5 h-5 text-danger" />;
      default:
        return <ClockIcon className="w-5 h-5 text-muted" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "failed":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCardIcon className="w-5 h-5" />;
      case "cash":
        return <BanknotesIcon className="w-5 h-5" />;
      case "mobile_payment":
        return <QrCodeIcon className="w-5 h-5" />;
      default:
        return <CurrencyDollarIcon className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPayments = paymentData.filter((payment) => {
    const matchesFilter =
      selectedFilter === "all" || payment.status === selectedFilter;
    const matchesTimeframe =
      selectedTimeframe === "all" ||
      (selectedTimeframe === "30days" &&
        new Date(payment.date) >=
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (selectedTimeframe === "90days" &&
        new Date(payment.date) >=
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) ||
      (selectedTimeframe === "1year" &&
        new Date(payment.date) >=
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
    const matchesSearch =
      searchTerm === "" ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesTimeframe && matchesSearch;
  });

  if (loading) {
    return (
      <div className="card h-100">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <CurrencyDollarIcon className="me-2 text-primary" />
            Payment History
          </h6>
        </div>
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="payment-history-page"
      style={{
        backgroundColor: "transparent !important",
        background: "transparent !important",
        backgroundImage: "none !important",
      }}
    >
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          className="payment-header mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="mb-2">
                <CurrencyDollarIcon className="me-2 text-primary" />
                Payment History
              </h1>
              <p className="text-muted">
                View and manage all your payment transactions and invoices.
              </p>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-sm">
                <ArrowDownTrayIcon className="w-4 h-4 me-1" />
                Export
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <PrinterIcon className="w-4 h-4 me-1" />
                Print Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          className="payment-summary mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card border-0 bg-primary text-white">
                <div className="card-body text-center">
                  <h3 className="mb-0">
                    {formatCurrency(paymentSummary.totalAmount)}
                  </h3>
                  <p className="mb-0">Total Spent</p>
                  <small>All time</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-success text-white">
                <div className="card-body text-center">
                  <h3 className="mb-0">{paymentSummary.totalPayments}</h3>
                  <p className="mb-0">Total Payments</p>
                  <small>Completed transactions</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-info text-white">
                <div className="card-body text-center">
                  <h3 className="mb-0">
                    {formatCurrency(paymentSummary.averagePayment)}
                  </h3>
                  <p className="mb-0">Average Payment</p>
                  <small>Per transaction</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-warning text-white">
                <div className="card-body text-center">
                  <h3 className="mb-0">{paymentSummary.completedPayments}</h3>
                  <p className="mb-0">Completed</p>
                  <small>Successful payments</small>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="charts-section mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="row g-3">
            <div className="col-md-8">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">Monthly Spending Trend</h6>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={paymentSummary.monthlySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="mb-0">Payment Methods</h6>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={paymentSummary.paymentMethods}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="amount"
                        nameKey="method"
                        label={({ method, amount }) =>
                          `${method}: ${formatCurrency(amount)}`
                        }
                      >
                        {paymentSummary.paymentMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="filters-section mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="card">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="1year">Last Year</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <span className="badge bg-primary">
                    {filteredPayments.length} payments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment List */}
        <motion.div
          className="payment-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Payment Transactions</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Service Type</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Invoice</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {formatDate(payment.date)}
                            </div>
                            <small className="text-muted">
                              {payment.transactionId}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {payment.description}
                            </div>
                            <small className="text-muted">
                              Technician: {payment.technician}
                            </small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {payment.serviceType}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="fw-bold text-success">
                              {formatCurrency(payment.amount)}
                            </div>
                            <small className="text-muted">
                              Subtotal: {formatCurrency(payment.subtotal)} |
                              Tax: {formatCurrency(payment.tax)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getMethodIcon(payment.method)}
                            <span className="ms-2 small">
                              {payment.method.replace("_", " ").toUpperCase()}
                              {payment.cardLast4 && ` ****${payment.cardLast4}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getStatusIcon(payment.status)}
                            <span className="ms-1 small text-capitalize">
                              {payment.status}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-medium">
                              {payment.invoiceNumber}
                            </div>
                            <small className="text-muted">
                              {payment.appointmentId}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary">
                              <DocumentTextIcon className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline-success">
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            <button className="btn btn-outline-info">
                              <PrinterIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentHistory;
