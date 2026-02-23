import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PDFService {
  constructor() {
    this.invoicesDir = path.join(__dirname, "../invoices");
    this.reportsDir = path.join(__dirname, "../reports");

    // Create directories if they don't exist
    this.ensureDirectoryExists(this.invoicesDir);
    this.ensureDirectoryExists(this.reportsDir);
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Generate invoice PDF
  async generateInvoice(invoiceData) {
    const {
      invoice,
      appointment,
      customer,
      service,
      invoiceItems = [],
      mechanic,
    } = invoiceData;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `invoice_${invoice.invoice_number}_${Date.now()}.pdf`;
        const filePath = path.join(this.invoicesDir, fileName);

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        this.addInvoiceHeader(doc, invoice);

        // Customer and Service Details
        this.addCustomerServiceDetails(doc, {
          customer,
          appointment,
          service,
          mechanic,
        });

        // Invoice Items Table
        this.addInvoiceItemsTable(doc, invoiceItems);

        // Invoice Summary
        this.addInvoiceSummary(doc, invoice);

        // Footer
        this.addInvoiceFooter(doc);

        doc.end();

        stream.on("finish", () => {
          resolve({
            success: true,
            fileName,
            filePath,
            fileSize: fs.statSync(filePath).size,
          });
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add header to invoice PDF
  addInvoiceHeader(doc, invoice) {
    // Company Logo/Name (placeholder for now)
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Abe Garage", 50, 50)
      .fontSize(12)
      .font("Helvetica")
      .text("Professional Auto Service", 50, 80)
      .text("123 Main Street, City, State 12345", 50, 95)
      .text("Phone: (555) 123-4567 | Email: info@abegarage.com", 50, 110);

    // Invoice title and details
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("INVOICE", 300, 50, { align: "right" })
      .fontSize(12)
      .font("Helvetica")
      .text(`Invoice #: ${invoice.invoice_number}`, 300, 80, { align: "right" })
      .text(
        `Date: ${new Date(invoice.created_at).toLocaleDateString()}`,
        300,
        95,
        { align: "right" }
      )
      .text(
        `Due Date: ${
          invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString()
            : "N/A"
        }`,
        300,
        110,
        { align: "right" }
      );

    // Add a line separator
    doc.moveTo(50, 130).lineTo(550, 130).stroke();
  }

  // Add customer and service details
  addCustomerServiceDetails(doc, data) {
    const { customer, appointment, service, mechanic } = data;

    // Customer details
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("BILL TO:", 50, 150)
      .fontSize(12)
      .font("Helvetica")
      .text(`${customer.first_name} ${customer.last_name}`, 50, 170)
      .text(customer.email, 50, 185)
      .text(customer.phone || "Phone not provided", 50, 200);

    // Service details
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("SERVICE DETAILS:", 300, 150)
      .fontSize(12)
      .font("Helvetica")
      .text(`Service: ${service.name}`, 300, 170)
      .text(
        `Vehicle: ${appointment.car_year} ${appointment.car_brand} ${appointment.car_model}`,
        300,
        185
      )
      .text(
        `Date: ${new Date(appointment.appointment_date).toLocaleDateString()}`,
        300,
        200
      );

    // Mechanic details (if available)
    if (mechanic) {
      doc.text(
        `Mechanic: ${mechanic.first_name} ${mechanic.last_name}`,
        300,
        215
      );
    }

    // Add problem description if available
    if (appointment.problem_description) {
      doc
        .fontSize(10)
        .text(
          `Problem Description: ${appointment.problem_description}`,
          50,
          220,
          { width: 500 }
        );
    }
  }

  // Add invoice items table
  addInvoiceItemsTable(doc, invoiceItems) {
    const startY = 280;

    // Table header
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("white")
      .rect(50, startY, 500, 25)
      .fill()
      .text("Description", 60, startY + 7)
      .text("Qty", 300, startY + 7)
      .text("Unit Price", 350, startY + 7)
      .text("Total", 450, startY + 7);

    doc.fillColor("black");

    // Table rows
    let currentY = startY + 25;
    let subtotal = 0;

    invoiceItems.forEach((item, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor("#f5f5f5").rect(50, currentY, 500, 20).fill();
        doc.fillColor("black");
      }

      doc
        .text(item.description, 60, currentY + 5)
        .text(item.quantity.toString(), 300, currentY + 5)
        .text(`$${item.unit_price.toFixed(2)}`, 350, currentY + 5)
        .text(`$${item.total_price.toFixed(2)}`, 450, currentY + 5);

      subtotal += item.total_price;
      currentY += 20;
    });

    return { subtotal, endY: currentY };
  }

  // Add invoice summary
  addInvoiceSummary(doc, invoice, tableResult = null) {
    const summaryY = tableResult ? tableResult.endY + 30 : 400;

    // Subtotal
    doc
      .fontSize(12)
      .font("Helvetica")
      .text("Subtotal:", 350, summaryY)
      .text(`$${invoice.subtotal.toFixed(2)}`, 450, summaryY);

    // Tax
    if (invoice.tax_amount > 0) {
      const taxRate = (invoice.tax_rate * 100).toFixed(2);
      doc
        .text(`Tax (${taxRate}%):`, 350, summaryY + 20)
        .text(`$${invoice.tax_amount.toFixed(2)}`, 450, summaryY + 20);
    }

    // Total
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("Total:", 350, summaryY + 40)
      .text(`$${invoice.total_amount.toFixed(2)}`, 450, summaryY + 40);

    // Payment information
    const paymentY = summaryY + 70;

    if (invoice.payment_method) {
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Payment Method:", 50, paymentY)
        .text(
          `${this.formatPaymentMethod(invoice.payment_method)}`,
          50,
          paymentY + 15
        );
    }

    if (invoice.payment_status === "paid" && invoice.payment_date) {
      doc
        .text("Payment Date:", 50, paymentY + 30)
        .text(
          new Date(invoice.payment_date).toLocaleDateString(),
          50,
          paymentY + 45
        );
    }
  }

  // Add footer to invoice
  addInvoiceFooter(doc) {
    const footerY = 700;

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Thank you for choosing Abe Garage!", 50, footerY)
      .text(
        "For questions about this invoice, please contact us.",
        50,
        footerY + 15
      );

    // Terms and conditions
    doc
      .fontSize(8)
      .text(
        "Terms: Payment due within 30 days. Late payments may incur additional fees.",
        50,
        footerY + 30,
        { width: 500 }
      );
  }

  // Format payment method for display
  formatPaymentMethod(method) {
    const paymentMethods = {
      cash: "Cash",
      credit_card: "Credit Card",
      debit_card: "Debit Card",
      bank_transfer: "Bank Transfer",
      insurance: "Insurance",
    };

    return paymentMethods[method] || method;
  }

  // Generate service report PDF
  async generateServiceReport(reportData) {
    const { customer, serviceHistory, recommendations, timeRange } = reportData;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const fileName = `service_report_${customer.id}_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        this.addReportHeader(doc, customer, timeRange);

        // Service history
        this.addServiceHistory(doc, serviceHistory);

        // Recommendations
        this.addRecommendations(doc, recommendations);

        // Footer
        this.addReportFooter(doc);

        doc.end();

        stream.on("finish", () => {
          resolve({
            success: true,
            fileName,
            filePath,
            fileSize: fs.statSync(filePath).size,
          });
        });

        stream.on("error", (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Add header to service report
  addReportHeader(doc, customer, timeRange) {
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Abe Garage", 50, 50)
      .fontSize(18)
      .text("Vehicle Service Report", 50, 80);

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Customer: ${customer.first_name} ${customer.last_name}`, 50, 120)
      .text(`Email: ${customer.email}`, 50, 135)
      .text(`Report Period: ${timeRange}`, 50, 150);

    doc.moveTo(50, 170).lineTo(550, 170).stroke();
  }

  // Add service history section
  addServiceHistory(doc, serviceHistory) {
    doc.fontSize(16).font("Helvetica-Bold").text("Service History", 50, 190);

    let currentY = 210;

    serviceHistory.forEach((record, index) => {
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          `${record.service_name} - ${new Date(
            record.service_date
          ).toLocaleDateString()}`,
          50,
          currentY
        )
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Vehicle: ${record.car_year} ${record.car_brand} ${record.car_model}`,
          60,
          currentY + 15
        )
        .text(`Cost: $${record.cost?.toFixed(2) || "N/A"}`, 60, currentY + 30);

      if (record.notes) {
        doc.text(`Notes: ${record.notes}`, 60, currentY + 45, { width: 450 });
      }

      currentY += 60;
    });
  }

  // Add recommendations section
  addRecommendations(doc, recommendations) {
    if (recommendations.length === 0) {
      return;
    }

    doc.addPage();
    let currentY = 50;

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Recommended Services", 50, currentY)
      .fontSize(12)
      .font("Helvetica");

    currentY += 30;

    recommendations.forEach((rec, index) => {
      if (currentY > 650) {
        doc.addPage();
        currentY = 50;
      }

      doc
        .font("Helvetica-Bold")
        .text(
          `${rec.priority.toUpperCase()}: ${rec.service_name}`,
          50,
          currentY
        )
        .font("Helvetica")
        .text(`Reason: ${rec.reason}`, 60, currentY + 15)
        .text(
          `Estimated Cost: $${rec.estimated_cost?.toFixed(2) || "TBD"}`,
          60,
          currentY + 30
        );

      currentY += 50;
    });
  }

  // Add footer to service report
  addReportFooter(doc) {
    doc
      .fontSize(10)
      .text(
        "This report is generated by Abe Garage Service Management System.",
        50,
        700
      )
      .text(
        "For questions about these recommendations, please contact us.",
        50,
        715
      );
  }

  // Delete old PDF files
  async cleanupOldFiles(directory, maxAgeDays = 30) {
    try {
      const files = fs.readdirSync(directory);
      const now = Date.now();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Deleted old file: ${file}`);
        }
      });
    } catch (error) {
      console.error("❌ Error cleaning up old files:", error);
    }
  }

  // Get file stats
  getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      return null;
    }
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export default new PDFService();
