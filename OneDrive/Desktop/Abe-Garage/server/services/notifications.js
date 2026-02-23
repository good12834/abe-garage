import twilio from "twilio";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Initialize email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class NotificationService {
  constructor() {
    this.twilioConfigured = !!twilioClient;
    this.emailConfigured = !!process.env.SMTP_USER;

    console.log("📱 Notification Service initialized:");
    console.log(
      `  - SMS (Twilio): ${
        this.twilioConfigured ? "✅ Configured" : "❌ Not configured"
      }`
    );
    console.log(
      `  - Email: ${
        this.emailConfigured ? "✅ Configured" : "❌ Not configured"
      }`
    );
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message, metadata = {}) {
    if (!this.twilioConfigured) {
      console.log("📱 SMS not sent (Twilio not configured):", message);
      return { success: false, reason: "Twilio not configured" };
    }

    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      console.log("📱 SMS sent successfully:", result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error("📱 SMS failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmail(emailAddress, subject, message, options = {}) {
    if (!this.emailConfigured) {
      console.log("📧 Email not sent (SMTP not configured):", subject);
      return { success: false, reason: "SMTP not configured" };
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || "noreply@abegarage.com",
        to: emailAddress,
        subject,
        text: message,
        html:
          options.html || this.createHTMLTemplate(subject, message, options),
        attachments: options.attachments || [],
      };

      const result = await emailTransporter.sendMail(mailOptions);
      console.log("📧 Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("📧 Email failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(appointmentData) {
    const { customer, appointment, service } = appointmentData;
    const messages = [];

    // SMS confirmation
    if (customer.phone) {
      const smsMessage = `🔧 Abe Garage: Your ${
        service.name
      } appointment is confirmed for ${new Date(
        appointment.appointment_date
      ).toLocaleDateString()} at ${new Date(
        appointment.appointment_date
      ).toLocaleTimeString()}. We'll keep you updated on progress.`;
      const smsResult = await this.sendSMS(customer.phone, smsMessage, {
        type: "appointment_confirmation",
        appointmentId: appointment.id,
        customerId: customer.id,
      });
      messages.push(smsResult);
    }

    // Email confirmation
    const emailSubject = `Appointment Confirmed - ${service.name}`;
    const emailMessage = `
      Dear ${customer.first_name},

      Your ${service.name} appointment has been confirmed:

      📅 Date: ${new Date(appointment.appointment_date).toLocaleString()}
      🔧 Service: ${service.name}
      🚗 Vehicle: ${appointment.car_year} ${appointment.car_brand} ${
      appointment.car_model
    }
      📍 Location: Abe Garage

      We'll send you updates on the progress. If you have any questions, feel free to contact us.

      Best regards,
      Abe Garage Team
    `;

    const emailResult = await this.sendEmail(
      customer.email,
      emailSubject,
      emailMessage,
      {
        type: "appointment_confirmation",
        appointmentId: appointment.id,
        customerId: customer.id,
        template: "appointment_confirmation",
      }
    );
    messages.push(emailResult);

    return messages;
  }

  // Send progress update notification
  async sendProgressUpdate(appointmentData) {
    const { customer, appointment, service, progressUpdate } = appointmentData;
    const messages = [];

    // SMS progress update (brief)
    if (customer.phone && progressUpdate.status !== "pending") {
      const statusMessages = {
        approved: "approved and scheduled",
        in_service: "started - our mechanic is working on your vehicle",
        completed: "completed! Your vehicle is ready for pickup",
        cancelled: "cancelled. Please contact us for assistance",
      };

      const smsMessage = `🔧 Abe Garage: Your ${service.name} is ${
        statusMessages[progressUpdate.status] || progressUpdate.status
      }. ${progressUpdate.message || ""}`;
      const smsResult = await this.sendSMS(customer.phone, smsMessage, {
        type: "progress_update",
        appointmentId: appointment.id,
        customerId: customer.id,
        status: progressUpdate.status,
      });
      messages.push(smsResult);
    }

    // Email progress update (detailed)
    if (progressUpdate.message || progressUpdate.status === "completed") {
      const emailSubject = `Update: Your ${service.name} Appointment`;
      const emailMessage = `
        Dear ${customer.first_name},

        Here's an update on your ${service.name} appointment:

        📅 Appointment: ${new Date(
          appointment.appointment_date
        ).toLocaleString()}
        🚗 Vehicle: ${appointment.car_year} ${appointment.car_brand} ${
        appointment.car_model
      }
        🔧 Status: ${progressUpdate.status.toUpperCase()}
        📝 Update: ${progressUpdate.message || "No additional details"}

        ${
          progressUpdate.status === "completed"
            ? `
        🎉 Your service is complete! Please arrange pickup at your convenience.
        `
            : ""
        }

        If you have any questions, please don't hesitate to contact us.

        Best regards,
        Abe Garage Team
      `;

      const emailResult = await this.sendEmail(
        customer.email,
        emailSubject,
        emailMessage,
        {
          type: "progress_update",
          appointmentId: appointment.id,
          customerId: customer.id,
          status: progressUpdate.status,
          template: "progress_update",
        }
      );
      messages.push(emailResult);
    }

    return messages;
  }

  // Send pickup reminder
  async sendPickupReminder(appointmentData) {
    const { customer, appointment, service } = appointmentData;
    const messages = [];

    // SMS reminder
    if (customer.phone) {
      const smsMessage = `🔧 Abe Garage: Your ${service.name} is complete! Please pick up your ${appointment.car_year} ${appointment.car_brand} at your earliest convenience.`;
      const smsResult = await this.sendSMS(customer.phone, smsMessage, {
        type: "pickup_reminder",
        appointmentId: appointment.id,
        customerId: customer.id,
      });
      messages.push(smsResult);
    }

    // Email reminder with invoice attachment info
    const emailSubject = "Vehicle Ready for Pickup";
    const emailMessage = `
      Dear ${customer.first_name},

      Great news! Your ${
        service.name
      } is complete and your vehicle is ready for pickup.

      📅 Service Date: ${new Date(
        appointment.appointment_date
      ).toLocaleString()}
      🚗 Vehicle: ${appointment.car_year} ${appointment.car_brand} ${
      appointment.car_model
    }
      🔧 Service: ${service.name}

      Please visit us during business hours to collect your vehicle. 
      ${appointment.final_cost ? `Total cost: $${appointment.final_cost}` : ""}

      Thank you for choosing Abe Garage!

      Best regards,
      Abe Garage Team
    `;

    const emailResult = await this.sendEmail(
      customer.email,
      emailSubject,
      emailMessage,
      {
        type: "pickup_reminder",
        appointmentId: appointment.id,
        customerId: customer.id,
        template: "pickup_reminder",
      }
    );
    messages.push(emailResult);

    return messages;
  }

  // Send service recommendation
  async sendServiceRecommendation(customerData) {
    const { customer, recommendations } = customerData;
    const messages = [];

    // Only send if there are high-priority recommendations
    const urgentRecommendations = recommendations.filter(
      (r) => r.priority === "high" || r.priority === "urgent"
    );

    if (urgentRecommendations.length === 0) {
      return messages;
    }

    // Email with recommendations
    const emailSubject = "Recommended Services for Your Vehicle";
    const recommendationsList = urgentRecommendations
      .map((r) => `• ${r.service_name}: ${r.reason}`)
      .join("\n");

    const emailMessage = `
      Dear ${customer.first_name},

      Based on your vehicle's service history and current mileage, we recommend the following services:

      ${recommendationsList}

      Regular maintenance helps ensure your vehicle's reliability and safety. 
      Please call us at your convenience to schedule an appointment.

      Vehicle: ${recommendations[0]?.car_year || "N/A"} ${
      recommendations[0]?.car_brand || ""
    } ${recommendations[0]?.car_model || ""}

      Best regards,
      Abe Garage Team
    `;

    const emailResult = await this.sendEmail(
      customer.email,
      emailSubject,
      emailMessage,
      {
        type: "service_recommendation",
        customerId: customer.id,
        template: "service_recommendation",
      }
    );
    messages.push(emailResult);

    return messages;
  }

  // Send low stock alert to admins
  async sendLowStockAlert(partsData) {
    const messages = [];

    if (partsData.length === 0) {
      return messages;
    }

    const partsList = partsData
      .map(
        (part) =>
          `• ${part.name} (${part.part_number}): ${part.stock_quantity} left (min: ${part.min_stock_level})`
      )
      .join("\n");

    // Get admin emails
    // This would typically query the database for admin users
    // For now, using environment variable
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

    for (const email of adminEmails) {
      const emailSubject = "🔴 Low Stock Alert - Parts Inventory";
      const emailMessage = `
        The following parts are running low and need to be reordered:

        ${partsList}

        Please review and reorder these items to maintain inventory levels.

        Best regards,
        Abe Garage Inventory System
      `;

      const emailResult = await this.sendEmail(
        email.trim(),
        emailSubject,
        emailMessage,
        {
          type: "low_stock_alert",
          template: "low_stock_alert",
        }
      );
      messages.push(emailResult);
    }

    return messages;
  }

  // Create HTML template for emails
  createHTMLTemplate(subject, message, options) {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { background-color: #34495e; color: white; padding: 15px; text-align: center; font-size: 12px; }
          .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 Abe Garage</h1>
          </div>
          <div class="content">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <div class="footer">
            <p>Abe Garage - Your Trusted Auto Service Partner</p>
            <p>📞 Phone: (555) 123-4567 | 📧 Email: info@abegarage.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return template;
  }

  // Test notification service
  async testNotifications(testEmail, testPhone) {
    const results = [];

    // Test SMS
    if (testPhone && this.twilioConfigured) {
      const smsResult = await this.sendSMS(
        testPhone,
        "🔧 Test message from Abe Garage notification system",
        {
          type: "test",
        }
      );
      results.push({ type: "SMS", result: smsResult });
    }

    // Test Email
    if (testEmail && this.emailConfigured) {
      const emailResult = await this.sendEmail(
        testEmail,
        "Test Email - Abe Garage System",
        "This is a test email from the Abe Garage notification system.",
        {
          type: "test",
        }
      );
      results.push({ type: "Email", result: emailResult });
    }

    return results;
  }

  // Get notification service status
  getStatus() {
    return {
      sms: {
        configured: this.twilioConfigured,
        provider: "Twilio",
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
      email: {
        configured: this.emailConfigured,
        provider: "SMTP",
        fromEmail: process.env.FROM_EMAIL,
      },
    };
  }
}

export default new NotificationService();
