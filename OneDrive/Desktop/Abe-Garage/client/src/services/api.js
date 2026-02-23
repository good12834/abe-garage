import axios from "axios";

// Utility function to get token from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Configure base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("Token expired, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Access forbidden
      console.log("Access forbidden, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 400) {
      // Bad request - log for debugging
      console.log(
        "Bad request error:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (profileData) => api.put("/auth/profile", profileData),
  changePassword: (passwordData) =>
    api.put("/auth/change-password", passwordData),
  logout: () => api.post("/auth/logout"),
  verifyToken: () => api.get("/auth/verify"),
};

// Services API
export const servicesAPI = {
  getAllServices: (params) => api.get("/services", { params }),
  getServiceById: (id) => api.get(`/services/${id}`),
  createService: (serviceData) => api.post("/services", serviceData),
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  deleteService: (id) => api.delete(`/services/${id}`),
  getCategories: () => api.get("/services/categories/list"),
  getServicesPagination: (params) =>
    api.get("/services/pagination", { params }),
};

// Appointments API
export const appointmentsAPI = {
  createAppointment: (appointmentData) =>
    api.post("/appointments", appointmentData),
  getMyAppointments: () => api.get("/appointments/my-appointments"),
  getAllAppointments: (params) => api.get("/appointments", { params }),
  getAppointmentById: (id) => {
    // Validate ID before making request
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      throw new Error("Invalid appointment ID");
    }

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(
        "Authentication required. Please login to view appointment details.",
      );
    }

    return api.get(`/appointments/${id}`).catch((error) => {
      // Handle specific authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Access denied. You don't have permission to view this appointment.",
        );
      } else if (error.response?.status === 404) {
        throw new Error("Appointment not found.");
      }
      throw error;
    });
  },
  updateAppointmentStatus: (id, statusData) =>
    api.put(`/appointments/${id}/status`, statusData),
  assignMechanic: (id, mechanicData) =>
    api.put(`/appointments/${id}/assign-mechanic`, mechanicData),
  cancelAppointment: (id, reason) =>
    api.put(`/appointments/${id}/cancel`, { reason }),
  getAppointmentStats: () => api.get("/appointments/stats/overview"),
};

// Mechanics API
export const mechanicsAPI = {
  getAllMechanics: (params) => api.get("/mechanics", { params }),
  getMechanicById: (id) => api.get(`/mechanics/${id}`),
  createMechanic: (mechanicData) => api.post("/mechanics", mechanicData),
  updateMechanic: (id, mechanicData) =>
    api.put(`/mechanics/${id}`, mechanicData),
  deleteMechanic: (id) => api.delete(`/mechanics/${id}`),
  getMechanicWorkload: (id) => api.get(`/mechanics/${id}/workload`),
  getAvailableMechanics: (params) =>
    api.get("/mechanics/available", { params }),
  getMechanicsList: (params) => api.get("/mechanics/admin/list", { params }),
};

// Invoices API
export const invoicesAPI = {
  createInvoice: (invoiceData) => api.post("/invoices", invoiceData),
  getMyInvoices: () => api.get("/invoices/my-invoices"),
  getAllInvoices: (params) => api.get("/invoices", { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  updatePaymentStatus: (id, paymentData) =>
    api.put(`/invoices/${id}/payment-status`, paymentData),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
  getInvoiceStats: () => api.get("/invoices/stats/overview"),
  refundInvoice: (id, reason) => api.put(`/invoices/${id}/refund`, { reason }),
};

// Users API
export const usersAPI = {
  getAllUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, isActive) =>
    api.put(`/users/${id}/status?isActive=${isActive}`),
  getUserStats: () => api.get("/users/stats/overview"),
  searchUsers: (query) => api.get("/users/search", { params: { q: query } }),
};

// Vehicles API
export const vehiclesAPI = {
  getVehicles: (params) => api.get("/vehicles", { params }),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (vehicleData) => api.post("/vehicles", vehicleData),
  updateVehicle: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post("/payments/create-intent", data),
};

// Chat API
export const chatAPI = {
  getMessages: (appointmentId) => api.get(`/chat/appointment/${appointmentId}`),
  sendMessage: (messageData) => api.post("/chat/send", messageData),
  markAsRead: (appointmentId) =>
    api.put(`/chat/appointment/${appointmentId}/read`),
  getUnreadCount: () => api.get("/chat/unread-count"),
  getConversations: () => api.get("/chat/conversations"),
  deleteMessage: (messageId) => api.delete(`/chat/message/${messageId}`),
  uploadFile: (uploadData) => api.post("/chat/upload", uploadData),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get("/notifications", { params }),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Error handler
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    const message = data?.error?.message || "An error occurred";
    return {
      status,
      message,
      details: data?.error?.details,
    };
  } else if (error.request) {
    // Network error
    return {
      status: 0,
      message: "Network error. Please check your connection.",
    };
  } else {
    // Other error
    return {
      status: 0,
      message: error.message || "An unexpected error occurred",
    };
  }
};

// Format date for API (ISO string)
export const formatDateForAPI = (date) => {
  return new Date(date).toISOString();
};

// Format date for display
export const formatDateForDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Service Packages API
export const servicePackagesAPI = {
  getAllPackages: (params) => api.get("/service-packages", { params }),
  getPackageById: (id) => api.get(`/service-packages/${id}`),
  createPackage: (packageData) => api.post("/service-packages", packageData),
  updatePackage: (id, packageData) =>
    api.put(`/service-packages/${id}`, packageData),
  deletePackage: (id) => api.delete(`/service-packages/${id}`),
  applyPackage: (id, appointmentId) =>
    api.post(`/service-packages/${id}/apply`, {
      appointment_id: appointmentId,
    }),
};

// Coupons API
export const couponsAPI = {
  validateCoupon: (code, orderAmount) =>
    api.post("/coupons/validate", { code, order_amount: orderAmount }),
  getAllCoupons: (params) => api.get("/coupons", { params }),
  getCouponById: (id) => api.get(`/coupons/${id}`),
  createCoupon: (couponData) => api.post("/coupons", couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  useCoupon: (id, orderAmount) =>
    api.post(`/coupons/${id}/use`, { order_amount: orderAmount }),
  getCouponStats: (id) => api.get(`/coupons/${id}/stats`),
};

// Customer Preferences API
export const preferencesAPI = {
  getPreferences: () => api.get("/preferences"),
  updatePreferences: (preferencesData) =>
    api.put("/preferences", preferencesData),
  getNotificationSettings: () => api.get("/preferences/notifications"),
  updateNotificationSettings: (settings) =>
    api.put("/preferences/notifications", settings),
  getMechanicPreference: () => api.get("/preferences/mechanic"),
  setPreferredMechanic: (mechanicId) =>
    api.put("/preferences/mechanic", { preferred_mechanic_id: mechanicId }),
};

// Referrals API
export const referralsAPI = {
  generateCode: () => api.post("/referrals/generate-code"),
  getMyReferrals: () => api.get("/referrals/my-referrals"),
  useCode: (code, email) =>
    api.post("/referrals/use-code", {
      referral_code: code,
      referred_email: email,
    }),
  getRewards: () => api.get("/referrals/rewards"),
  useReward: (id) => api.post(`/referrals/rewards/${id}/use`),
};

// Emergency Services API
export const emergencyAPI = {
  getServices: () => api.get("/emergency"),
  getServiceById: (id) => api.get(`/emergency/${id}`),
  bookService: (bookingData) => api.post("/emergency/book", bookingData),
  getMyBookings: () => api.get("/emergency/bookings/my"),
  getBookingDetails: (id) => api.get(`/emergency/bookings/${id}`),
  cancelBooking: (id) => api.post(`/emergency/bookings/${id}/cancel`),
};

// Vehicle Recalls API
export const recallsAPI = {
  getAllRecalls: (params) => api.get("/recalls", { params }),
  checkRecalls: (vehicleData) => api.post("/recalls/check", vehicleData),
  getRecallById: (id) => api.get(`/recalls/${id}`),
  getMyVehicleRecalls: () => api.get("/recalls/my-vehicles"),
  acknowledgeRecall: (recallId, vehicleId) =>
    api.post(`/recalls/${recallId}/acknowledge`, { vehicle_id: vehicleId }),
  scheduleRecallRepair: (recallId, vehicleId, date) =>
    api.post(`/recalls/${recallId}/schedule`, {
      vehicle_id: vehicleId,
      preferred_date: date,
    }),
};

// Service Add-ons API
export const addonsAPI = {
  getAllAddons: () => api.get("/addons"),
  getAddonById: (id) => api.get(`/addons/${id}`),
  createAddon: (addonData) => api.post("/addons", addonData),
  updateAddon: (id, addonData) => api.put(`/addons/${id}`, addonData),
  deleteAddon: (id) => api.delete(`/addons/${id}`),
  addToAppointment: (addonId, appointmentId, quantity) =>
    api.post(`/addons/${addonId}/add-to-appointment`, {
      addon_id: addonId,
      appointment_id: appointmentId,
      quantity,
    }),
  removeFromAppointment: (addonId, appointmentId) =>
    api.delete(`/addons/${addonId}/remove-from-appointment/${appointmentId}`),
  getAppointmentAddons: (appointmentId) =>
    api.get(`/addons/appointment/${appointmentId}`),
};

// Waiting List API
export const waitingListAPI = {
  join: (data) => api.post("/waiting-list/join", data),
  getMyList: () => api.get("/waiting-list/my"),
  cancel: (id) => api.post(`/waiting-list/${id}/cancel`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get("/analytics/dashboard"),
  getRevenueAnalytics: (period) =>
    api.get("/analytics/revenue", { params: { period } }),
  getServiceAnalytics: () => api.get("/analytics/services"),
  getCustomerAnalytics: () => api.get("/analytics/customers"),
  getAppointmentAnalytics: () => api.get("/analytics/appointments"),
  getMechanicPerformance: () => api.get("/analytics/mechanics"),
  trackEvent: (eventType, eventData) =>
    api.post("/analytics/track", {
      event_type: eventType,
      event_data: eventData,
    }),
};

export default api;
