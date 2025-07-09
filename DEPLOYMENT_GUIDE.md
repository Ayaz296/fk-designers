# FK Designers - Hostinger Deployment Guide

## 📋 Prerequisites

Before starting, ensure you have:
- Hostinger hosting account (Business or Premium plan recommended)
- Domain name configured
- Access to Hostinger control panel (hPanel)
- Node.js installed on your local machine
- Git installed (optional but recommended)

---

## 🗄️ Part 1: Database Setup (MySQL)

### Step 1: Create MySQL Database

1. **Login to Hostinger hPanel**
   - Go to [hostinger.com](https://hostinger.com)
   - Click "Login" and enter your credentials

2. **Navigate to Databases**
   - In hPanel, find "Databases" section
   - Click on "MySQL Databases"

3. **Create New Database**
   - Click "Create Database"
   - Database name: `fk_designers_db`
   - Click "Create"

4. **Create Database User**
   - In the same section, find "MySQL Users"
   - Click "Create User"
   - Username: `fk_admin` (or your preferred name)
   - Password: Create a strong password (save this!)
   - Click "Create User"

5. **Assign User to Database**
   - Find "Add User to Database" section
   - Select your user and database
   - Grant "All Privileges"
   - Click "Add"

6. **Note Database Connection Details**
   ```
   Host: localhost (or provided by Hostinger)
   Database: fk_designers_db
   Username: fk_admin
   Password: [your password]
   Port: 3306
   ```

### Step 2: Import Database Schema

1. **Access phpMyAdmin**
   - In hPanel, go to "Databases" → "phpMyAdmin"
   - Login with your database credentials

2. **Select Your Database**
   - Click on `fk_designers_db` in the left sidebar

3. **Import Schema**
   - Click "Import" tab
   - Click "Choose File"
   - Upload `supabase/migrations/20250628115320_wandering_union.sql`
   - Click "Go" to execute

4. **Verify Tables Created**
   - Check that all tables are created:
     - users
     - customers
     - staff
     - products
     - contact_inquiries
     - customization_requests
     - audit_logs

---

## 🖥️ Part 2: Backend Deployment

### Step 3: Prepare Backend Files

1. **Update API Configuration**
   - Open `backend/.env.example`
   - Copy it to `backend/.env`
   - Update with your Hostinger database details:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=fk_admin
   DB_PASSWORD=your_database_password
   DB_NAME=fk_designers_db
   DB_PORT=3306

   # JWT Secret (Generate a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

   # Server Configuration
   PORT=5000
   NODE_ENV=production

   # CORS Configuration
   FRONTEND_URL=https://yourdomain.com

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

### Step 4: Upload Backend to Hostinger

1. **Access File Manager**
   - In hPanel, go to "Files" → "File Manager"
   - Navigate to `public_html` folder

2. **Create API Directory**
   - Create a new folder called `api`
   - Enter the `api` folder

3. **Upload Backend Files**
   - Upload all files from your `backend` folder:
     - `server.js`
     - `package.json`
     - `.env`
     - `config/` folder
     - `routes/` folder
     - `middleware/` folder

4. **Install Dependencies**
   - In hPanel, go to "Advanced" → "SSH Access"
   - Enable SSH access
   - Connect via SSH or use Hostinger's terminal
   - Navigate to your API directory:
     ```bash
     cd public_html/api
     npm install --production
     ```

### Step 5: Configure Node.js Application

1. **Setup Node.js App**
   - In hPanel, go to "Advanced" → "Node.js"
   - Click "Create Application"
   - Application root: `/public_html/api`
   - Application URL: `yourdomain.com/api`
   - Application startup file: `server.js`
   - Node.js version: Latest LTS (18.x or higher)

2. **Set Environment Variables**
   - In the Node.js app settings
   - Add all your environment variables from `.env`

3. **Start Application**
   - Click "Start" to run your backend
   - Test by visiting: `https://yourdomain.com/api/health`

---

## 🌐 Part 3: Frontend Deployment

### Step 6: Build Frontend

1. **Update Frontend Configuration**
   - Open `src/config/api.ts`
   - Update the API_BASE_URL:

   ```typescript
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://yourdomain.com/api' 
     : 'http://localhost:5000/api';
   ```

2. **Build Production Version**
   ```bash
   npm run build
   ```

3. **Verify Build**
   - Check that `dist` folder is created
   - Contains `index.html`, `assets/` folder, etc.

### Step 7: Upload Frontend

1. **Clear public_html (except api folder)**
   - In File Manager, go to `public_html`
   - Delete all files EXCEPT the `api` folder
   - Keep: `api/` folder only

2. **Upload Build Files**
   - Upload all contents from `dist` folder to `public_html`
   - Your structure should look like:
     ```
     public_html/
     ├── api/              (backend)
     ├── index.html        (frontend)
     ├── assets/           (frontend assets)
     └── favicon.svg       (frontend)
     ```

3. **Configure URL Rewriting**
   - Create `.htaccess` file in `public_html`:

   ```apache
   # Handle React Router
   <IfModule mod_rewrite.c>
     RewriteEngine On
     
     # Handle API routes
     RewriteRule ^api/(.*)$ api/$1 [L]
     
     # Handle React Router (SPA)
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteCond %{REQUEST_URI} !^/api/
     RewriteRule . /index.html [L]
   </IfModule>

   # Security Headers
   <IfModule mod_headers.c>
     Header always set X-Content-Type-Options nosniff
     Header always set X-Frame-Options DENY
     Header always set X-XSS-Protection "1; mode=block"
   </IfModule>

   # Compression
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE application/xml
     AddOutputFilterByType DEFLATE application/xhtml+xml
     AddOutputFilterByType DEFLATE application/rss+xml
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

---

## 🔧 Part 4: Configuration & Testing

### Step 8: SSL Certificate

1. **Enable SSL**
   - In hPanel, go to "Security" → "SSL/TLS"
   - Enable "Force HTTPS redirect"
   - Hostinger provides free SSL certificates

### Step 9: Test Your Deployment

1. **Test Frontend**
   - Visit: `https://yourdomain.com`
   - Check all pages load correctly
   - Test navigation and responsive design

2. **Test Backend API**
   - Visit: `https://yourdomain.com/api/health`
   - Should return: `{"status":"OK","timestamp":"...","uptime":...}`

3. **Test Database Connection**
   - Try registering a new user
   - Check if data is saved in database

4. **Test Admin Panel**
   - Login with: `admin@fkdesigners.com` / `admin`
   - Access: `https://yourdomain.com/admin`

### Step 10: Performance Optimization

1. **Enable Caching**
   - In hPanel, go to "Speed" → "Cache"
   - Enable "LiteSpeed Cache"

2. **Optimize Images**
   - Use WebP format when possible
   - Compress images before upload

3. **Monitor Performance**
   - Use Hostinger's built-in analytics
   - Monitor Node.js app performance

---

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check database credentials in `.env`
   - Verify database user has correct privileges
   - Check if database server is running

2. **API Routes Not Working**
   - Verify Node.js app is running
   - Check `.htaccess` configuration
   - Review server logs in hPanel

3. **Frontend Not Loading**
   - Check if `index.html` is in root of `public_html`
   - Verify `.htaccess` file exists
   - Clear browser cache

4. **CORS Errors**
   - Update `FRONTEND_URL` in backend `.env`
   - Check CORS configuration in `server.js`

### Useful Commands:

```bash
# Check Node.js app status
pm2 status

# Restart Node.js app
pm2 restart all

# View logs
pm2 logs

# Check database connection
mysql -u fk_admin -p fk_designers_db
```

---

## 📞 Support

If you encounter issues:

1. **Hostinger Support**
   - 24/7 live chat support
   - Knowledge base: help.hostinger.com

2. **Check Logs**
   - Node.js app logs in hPanel
   - Error logs in File Manager

3. **Community Forums**
   - Hostinger community forums
   - Stack Overflow for technical issues

---

## ✅ Final Checklist

- [ ] Database created and schema imported
- [ ] Backend uploaded and running
- [ ] Frontend built and uploaded
- [ ] SSL certificate enabled
- [ ] API endpoints working
- [ ] Admin panel accessible
- [ ] Contact forms working
- [ ] All pages loading correctly
- [ ] Mobile responsiveness verified
- [ ] Performance optimized

**🎉 Congratulations! Your FK Designers website is now live on Hostinger!**

---

## 📝 Post-Deployment Tasks

1. **Change Default Admin Password**
   - Login to admin panel
   - Change password from default "admin"

2. **Add Real Products**
   - Use admin panel to add your actual products
   - Upload high-quality product images

3. **Configure Email**
   - Set up email forwarding for contact forms
   - Configure SMTP if needed

4. **SEO Optimization**
   - Add Google Analytics
   - Submit sitemap to Google Search Console
   - Optimize meta tags

5. **Backup Strategy**
   - Set up regular database backups
   - Backup website files periodically

6. **Monitor & Maintain**
   - Regular security updates
   - Monitor website performance
   - Keep dependencies updated