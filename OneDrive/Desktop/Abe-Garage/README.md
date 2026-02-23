# 🚗 Abe Garage - Full Stack Auto Service Management System

A modern, comprehensive full-stack web application for managing auto service operations, built with React (Vite) + Bootstrap for the frontend and Node.js + Express + MySQL for the backend.

## 🌟 Features

### Frontend (React + Vite + Bootstrap)
- **Modern UI/UX** with Bootstrap components and custom styling
- **Responsive Design** that works on all devices
- **Authentication Flow** with JWT token management
- **Homepage** with hero section, services showcase, and customer testimonials
- **Appointment Booking** system for customers
- **Customer Dashboard** to track appointments and invoices
- **Admin Dashboard** for complete system management
- **Real-time Status Updates** for service progress

### Backend (Node.js + Express + MySQL)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with role-based access control
- **Database Design** with optimized MySQL schema
- **PDF Invoice Generation** for completed services
- **Error Handling** with custom error classes
- **Security Features** including rate limiting and validation
- **Data Validation** using express-validator

### Core Functionalities
- **User Management** (Customers & Admins)
- **Service Catalog** management
- **Appointment Booking** and scheduling
- **Mechanic Assignment** and tracking
-  **Invoice Generation** with PDF download
- **Dashboard Analytics** for admins
- **Search & Filter** capabilities
-  **Mobile-First** responsive design

##  Architecture

```
abe-garage/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   └── styles/         # CSS styles
│   └── public/             # Static assets
├── server/                 # Node.js backend
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── config/             # Database configuration
│   └── models/             # Data models
└── database/               # SQL schema and migrations
```

##  Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd abe-garage
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p < ../database/abe_garage.sql
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=abe_garage

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
```

##  API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Services Endpoints
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Appointments Endpoints
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/my-appointments` - Get user appointments
- `PUT /api/appointments/:id/status` - Update status (Admin)
- `PUT /api/appointments/:id/assign-mechanic` - Assign mechanic (Admin)

### Mechanics Endpoints
- `GET /api/mechanics` - Get all mechanics
- `POST /api/mechanics` - Create mechanic (Admin)
- `PUT /api/mechanics/:id` - Update mechanic (Admin)

### Invoices Endpoints
- `POST /api/invoices` - Create invoice (Admin)
- `GET /api/invoices/my-invoices` - Get user invoices
- `GET /api/invoices/:id/pdf` - Generate PDF invoice

## 🎨 UI/UX Features

### Design System
- **Primary Color**: Dark Gray (#2c3e50)
- **Secondary Color**: Yellow/Gold (#f39c12)
- **Typography**: Modern, readable fonts
- **Icons**: Bootstrap Icons for consistency

### Components
- Responsive navigation with dropdown menus
- Dashboard cards with statistics
- Service booking forms with validation
- Invoice tables with action buttons
- Loading states and error handling

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting for API requests
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 📊 Database Schema

### Core Tables
- `users` - Customer and admin accounts
- `services` - Available service offerings
- `appointments` - Service bookings
- `mechanics` - Staff management
- `invoices` - Billing and payments
- `service_updates` - Progress tracking

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd client
npm run build

# Backend
cd ../server
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure production database
- Set secure JWT secret
- Enable HTTPS
- Configure email service for notifications

## 📈 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Email notifications for appointments
- [ ] Payment integration (Stripe/PayPal)
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Inventory management system
- [ ] Multi-location support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for professional auto service management.

---

**Abe Garage** - Professional Auto Service Management System






