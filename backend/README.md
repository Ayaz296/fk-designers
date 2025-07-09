# FK Designers Backend API

A Node.js/Express backend API for the FK Designers luxury Indian clothing website.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations for products with advanced filtering
- **User Management**: Customer and staff management with audit logging
- **Contact Forms**: Handle contact inquiries and customization requests
- **Security**: Rate limiting, input validation, SQL injection protection
- **Database**: MySQL with connection pooling

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Setup

1. **Create Database in Hostinger**:
   - Log into your Hostinger control panel
   - Go to "Databases" → "MySQL Databases"
   - Create a new database (e.g., `fk_designers_db`)
   - Create a database user and assign it to the database

2. **Run Database Schema**:
   - Import the `database/schema.sql` file into your database
   - You can use phpMyAdmin or MySQL command line

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Hostinger database credentials:
   ```env
   DB_HOST=your_hostinger_db_host
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=fk_designers_db
   DB_PORT=3306
   
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
   
   PORT=5000
   NODE_ENV=production
   
   FRONTEND_URL=https://your-frontend-domain.com
   ```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Staff only)
- `PUT /api/products/:id` - Update product (Admin/Staff only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users
- `GET /api/users/customers` - Get all customers (Admin/Staff only)
- `GET /api/users/staff` - Get all staff (Admin only)
- `PATCH /api/users/:userId/status` - Update user status (Admin only)
- `GET /api/users/audit-logs` - Get audit logs (Admin only)

### Contact
- `POST /api/contact/contact` - Submit contact form
- `POST /api/contact/customization` - Submit customization request

## Database Schema

### Tables Created:
1. **users** - User accounts (customers, staff, admin)
2. **customers** - Customer-specific information
3. **staff** - Staff-specific information
4. **products** - Product catalog
5. **contact_inquiries** - Contact form submissions
6. **customization_requests** - Custom tailoring requests
7. **audit_logs** - System activity logs

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Sanitizes and validates all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Audit Logging**: Tracks all important actions

## Default Admin Account

- **Email**: admin@fkdesigners.com
- **Password**: admin
- **Role**: admin

**⚠️ Important**: Change the default admin password immediately after setup!

## Deployment to Hostinger

1. **Upload Files**: Upload the backend folder to your Hostinger hosting
2. **Install Dependencies**: Run `npm install` on the server
3. **Environment**: Set up your `.env` file with production values
4. **Database**: Import the schema.sql file
5. **Start**: Use `npm start` or set up a process manager like PM2

## Frontend Integration

Update your frontend to use the API endpoints:

```javascript
// Example API configuration
const API_BASE_URL = 'https://your-backend-domain.com/api';

// Login example
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};
```

## Support

For issues or questions, contact the development team or refer to the API documentation.