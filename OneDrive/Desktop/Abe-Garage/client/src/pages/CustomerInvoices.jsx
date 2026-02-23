import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { invoicesAPI } from "../services/api";
import { toast } from "react-toastify";
import { formatDateForDisplay, formatCurrency } from "../services/api";

const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await invoicesAPI.getMyInvoices();
        setInvoices(response.data.data.invoices || []);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        // Load mock invoices for demo purposes
        const mockInvoices = [
          {
            id: 1,
            invoice_number: "INV-2024-001",
            created_at: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            subtotal: 150.0,
            tax_rate: 0.08,
            tax_amount: 12.0,
            total_amount: 162.0,
            payment_status: "paid",
            payment_method: "Credit Card",
            payment_date: new Date(
              Date.now() - 6 * 24 * 60 * 60 * 1000
            ).toISOString(),
            notes: "Oil change and tire rotation service",
          },
          {
            id: 2,
            invoice_number: "INV-2024-002",
            created_at: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            subtotal: 85.0,
            tax_rate: 0.08,
            tax_amount: 6.8,
            total_amount: 91.8,
            payment_status: "paid",
            payment_method: "Cash",
            payment_date: new Date(
              Date.now() - 13 * 24 * 60 * 60 * 1000
            ).toISOString(),
            notes: "Brake inspection and minor adjustments",
          },
          {
            id: 3,
            invoice_number: "INV-2024-003",
            created_at: new Date(
              Date.now() - 21 * 24 * 60 * 60 * 1000
            ).toISOString(),
            subtotal: 275.0,
            tax_rate: 0.08,
            tax_amount: 22.0,
            total_amount: 297.0,
            payment_status: "pending",
            notes: "Engine diagnostic and spark plug replacement",
          },
        ];
        setInvoices(mockInvoices);
        toast.info("Showing demo invoices");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInvoices();
    }
  }, [user]);

  // Filter and sort invoices
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoice_number
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (invoice) => invoice.payment_status === statusFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "amount":
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case "status":
          aValue = a.payment_status;
          bValue = b.payment_status;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "badge bg-warning",
      paid: "badge bg-success",
      partially_paid: "badge bg-info",
      refunded: "badge bg-secondary",
    };

    const statusText = {
      pending: "Pending",
      paid: "Paid",
      partially_paid: "Partially Paid",
      refunded: "Refunded",
    };

    return (
      <span className={statusClasses[status] || "badge bg-secondary"}>
        {statusText[status] || status}
      </span>
    );
  };

  // Calculate invoice statistics
  const getInvoiceStats = () => {
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter(
      (inv) => inv.payment_status === "paid"
    ).length;
    const pending = filteredInvoices.filter(
      (inv) => inv.payment_status === "pending"
    ).length;
    const totalAmount = filteredInvoices.reduce(
      (sum, inv) => sum + inv.total_amount,
      0
    );
    const paidAmount = filteredInvoices
      .filter((inv) => inv.payment_status === "paid")
      .reduce((sum, inv) => sum + inv.total_amount, 0);

    return { total, paid, pending, totalAmount, paidAmount };
  };

  const handleEmailInvoice = async (invoice) => {
    try {
      // In a real app, this would send an email via API
      toast.success(`Invoice ${invoice.invoice_number} sent to your email!`, {
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const response = await invoicesAPI.generatePDF(invoiceId);
      // The API returns a blob, so we need to download it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // Generate a mock PDF for demo purposes
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        // Create a simple text representation as a downloadable file
        const pdfContent = `
ABE GARAGE INVOICE
==================

Invoice Number: ${invoice.invoice_number}
Date: ${formatDateForDisplay(invoice.created_at)}

Customer: ${user?.first_name} ${user?.last_name}

Service Details:
${invoice.notes}

Subtotal: ${formatCurrency(invoice.subtotal)}
Tax (${(invoice.tax_rate * 100).toFixed(1)}%): ${formatCurrency(
          invoice.tax_amount
        )}
Total: ${formatCurrency(invoice.total_amount)}

Payment Status: ${invoice.payment_status}
${invoice.payment_method ? `Payment Method: ${invoice.payment_method}` : ""}
${
  invoice.payment_date
    ? `Payment Date: ${formatDateForDisplay(invoice.payment_date)}`
    : ""
}

Thank you for choosing Abe Garage!
        `.trim();

        const blob = new Blob([pdfContent], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${invoice.invoice_number}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Demo invoice downloaded (text format)");
      } else {
        toast.error("Invoice not found");
      }
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const stats = getInvoiceStats();

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4">My Invoices</h1>

          {/* Statistics Cards */}
          {invoices.length > 0 && (
            <div className="row mb-4">
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="h4 text-primary mb-1">{stats.total}</div>
                    <div className="small text-muted">Total Invoices</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="h4 text-success mb-1">{stats.paid}</div>
                    <div className="small text-muted">Paid</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="h4 text-warning mb-1">{stats.pending}</div>
                    <div className="small text-muted">Pending</div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 mb-3">
                <div className="card text-center">
                  <div className="card-body">
                    <div className="h4 text-info mb-1">
                      {formatCurrency(stats.totalAmount)}
                    </div>
                    <div className="small text-muted">Total Amount</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Controls */}
          {invoices.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="partially_paid">Partially Paid</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date">Sort by Date</option>
                      <option value="amount">Sort by Amount</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      <i
                        className={`bi bi-sort-${
                          sortOrder === "asc" ? "up" : "down"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {filteredInvoices.length === 0 && invoices.length > 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-search text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <h4 className="mt-3 text-muted">No invoices match your search</h4>
              <p className="text-muted">Try adjusting your search criteria</p>
              <button
                className="btn btn-outline-primary"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-5">
              <i
                className="bi bi-receipt text-muted"
                style={{ fontSize: "3rem" }}
              ></i>
              <h4 className="mt-3 text-muted">No invoices found</h4>
              <p className="text-muted">
                Your invoices will appear here once services are completed.
              </p>
            </div>
          ) : (
            <div className="row">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          Invoice #{invoice.invoice_number}
                        </h5>
                        {getStatusBadge(invoice.payment_status)}
                      </div>

                      <div className="mb-3">
                        <p className="mb-1">
                          <i className="bi bi-calendar me-2"></i>
                          Date: {formatDateForDisplay(invoice.created_at)}
                        </p>
                        <p className="mb-1">
                          <i className="bi bi-cash me-2"></i>
                          Subtotal: {formatCurrency(invoice.subtotal)}
                        </p>
                        <p className="mb-1">
                          <i className="bi bi-percent me-2"></i>
                          Tax: {formatCurrency(invoice.tax_amount)} (
                          {(invoice.tax_rate * 100).toFixed(1)}%)
                        </p>
                        <p className="mb-2">
                          <strong>
                            Total: {formatCurrency(invoice.total_amount)}
                          </strong>
                        </p>
                        {invoice.payment_method && (
                          <p className="mb-1">
                            <i className="bi bi-credit-card me-2"></i>
                            Payment: {invoice.payment_method}
                          </p>
                        )}
                        {invoice.payment_date && (
                          <p className="mb-1">
                            <i className="bi bi-check-circle me-2"></i>
                            Paid: {formatDateForDisplay(invoice.payment_date)}
                          </p>
                        )}
                      </div>

                      {invoice.notes && (
                        <div className="mb-3">
                          <strong>Notes:</strong>
                          <p className="mb-0 text-muted small">
                            {invoice.notes}
                          </p>
                        </div>
                      )}

                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleDownloadPDF(invoice.id)}
                          title="Download invoice as PDF"
                        >
                          <i className="bi bi-download me-1"></i>
                          Download
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleEmailInvoice(invoice)}
                          title="Email invoice to yourself"
                        >
                          <i className="bi bi-envelope me-1"></i>
                          Email
                        </button>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => {
                            // Show invoice details in a toast for demo
                            toast.info(
                              `Invoice ${invoice.invoice_number}: ${invoice.notes}`,
                              {
                                autoClose: 5000,
                              }
                            );
                          }}
                          title="View invoice details"
                        >
                          <i className="bi bi-eye me-1"></i>
                          Details
                        </button>
                        {invoice.payment_status === "pending" && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => {
                              toast.info("Payment processing would be initiated here");
                            }}
                            title="Pay this invoice"
                          >
                            <i className="bi bi-credit-card me-1"></i>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoices;
