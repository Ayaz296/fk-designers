# FK Designers - Luxury Indian Clothing Website

A full-stack e-commerce website for FK Designers, specializing in luxury Indian ethnic wear. Built with React, TypeScript, Node.js, Express, and MySQL.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Product Catalog**: Browse men's, kids', and fabric collections
- **Advanced Filtering**: Filter by category, color, fabric pattern, price range
- **Product Search**: Full-text search across products
- **Authentication**: Secure user registration and login
- **Admin Dashboard**: Product management, customer management, analytics
- **Contact Forms**: Contact inquiries and customization requests
- **Responsive Design**: Mobile-first approach with smooth animations

### Backend (Node.js + Express + MySQL)
- **RESTful API**: Complete API for all frontend operations
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Customer, Staff, and Admin roles
- **Product Management**: CRUD operations for products
- **User Management**: Customer and staff management
- **Security Features**: Rate limiting, input validation, SQL injection protection
- **Audit Logging**: Track all important system activities
- **Database Integration**: MySQL with connection pooling

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Lucide React for icons

### Backend
- Node.js with Express
- MySQL database
- JWT for authentication
- bcrypt for password hashing
- Express Rate Limit for security
- Helmet for security headers

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL database (Hostinger or local)
- Git

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Update API configuration:
   - Edit `src/config/api.ts`
   - Set `API_BASE_URL` to your backend URL

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database credentials:
   ```env
   DB_HOST=your_hostinger_db_host
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=fk_designers_db
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

5. Import database schema:
   - Import `supabase/migrations/20250628115320_wandering_union.sql` into your MySQL database

6. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🗄️ Database Schema

### Tables
- **users**: User accounts (customers, staff, admin)
- **customers**: Customer-specific information
- **staff**: Staff-specific information  
- **products**: Product catalog with JSON fields
- **contact_inquiries**: Contact form submissions
- **customization_requests**: Custom tailoring requests
- **audit_logs**: System activity tracking

## 🔐 Authentication & Security

### Default Admin Account
- **Email**: admin@fkdesigners.com
- **Password**: admin
- **Role**: admin

⚠️ **Important**: Change the default admin password after setup!

### Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication (24-hour expiry)
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- SQL injection protection
- CORS configuration
- Security headers with Helmet
- Audit logging for all actions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Staff)
- `PUT /api/products/:id` - Update product (Admin/Staff)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `GET /api/users/customers` - Get customers (Admin/Staff)
- `GET /api/users/staff` - Get staff (Admin)
- `PATCH /api/users/:id/status` - Update user status (Admin)

### Contact
- `POST /api/contact/contact` - Submit contact form
- `POST /api/contact/customization` - Submit customization request

## 🚀 Deployment

### Frontend Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to hosting provider**:
   - Upload `dist` folder to your web hosting
   - Configure your domain to point to the `dist` folder
   - Ensure your hosting supports SPA routing

### Backend Deployment (Hostinger)
1. **Upload backend files** to your server
2. **Install dependencies**:
   ```bash
   npm install --production
   ```
3. **Set up environment variables** in `.env`
4. **Import database schema** using phpMyAdmin or MySQL CLI
5. **Start the application**:
   ```bash
   npm start
   ```
6. **Use PM2 for production** (recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "fk-designers-api"
   pm2 startup
   pm2 save
   ```

### Database Setup (Hostinger)
1. **Create MySQL Database** in Hostinger control panel
2. **Create database user** and assign permissions
3. **Import schema** from `supabase/migrations/20250628115320_wandering_union.sql`
4. **Update connection details** in backend `.env` file

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=your_hostinger_mysql_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=fk_designers_db

# JWT
JWT_SECRET=your_secret_key

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

### Frontend Configuration
Update `src/config/api.ts`:
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:5000/api';
```

## 📊 Features Overview

### Customer Features
- Browse product catalog with advanced filtering
- Product search functionality
- User registration and authentication
- Contact forms and customization requests
- Responsive design for all devices

### Admin Features
- Complete product management (CRUD operations)
- Customer management and analytics
- Real-time data updates
- Audit logs for all actions
- Secure role-based access control

## 🔍 API Testing

Test your API endpoints:

```bash
# Health check
curl https://your-backend-domain.com/health

# Get products
curl https://your-backend-domain.com/api/products

# Login (get token)
curl -X POST https://your-backend-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fkdesigners.com","password":"admin"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for FK Designers.

## 📞 Support

For technical support or questions:
- Email: dev@fkdesigners.com
- Phone: +91 98765 43210

---

**FK Designers** - Crafting luxury Indian attire since 2005 🇮🇳