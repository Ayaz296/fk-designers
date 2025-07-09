# 🚀 Render Deployment Guide for FK Designers

## 📋 Prerequisites

1. **GitHub repository** with your updated code
2. **Supabase project** with database setup
3. **Render account** (free tier works)

---

## 🗄️ Step 1: Get Supabase Connection Details

### For Render (IPv4), use the **Session Pooler**:

1. **Go to Supabase Dashboard** → Your Project
2. **Click "Settings"** → **"Database"**
3. **Find "Connection Pooling"** section
4. **Copy the "Session" connection string** (not Transaction)

**Example Session Pooler URL:**
```
postgresql://postgres.abcdefghijklmnop:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Important:** 
- ✅ Use **Session Pooler** (port 5432)
- ❌ Don't use Transaction Pooler (port 6543)
- ✅ Include `?pgbouncer=true` parameter

---

## 🚀 Step 2: Deploy to Render

### Create New Web Service:

1. **Go to Render Dashboard** → **"New"** → **"Web Service"**
2. **Connect your GitHub repository**
3. **Configure the service:**

   **Basic Settings:**
   - **Name:** `fk-designers-backend`
   - **Region:** `Oregon (US West)` or closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`

   **Build & Deploy:**
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Advanced Settings:**
   - **Node Version:** `18` or `20`
   - **Auto-Deploy:** `Yes`

---

## 🔧 Step 3: Set Environment Variables

In Render dashboard, go to **"Environment"** and add:

```env
DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-region.pooler.supabase.com:5432/postgres?pgbouncer=true

JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

NODE_ENV=production

FRONTEND_URL=https://fkdesigner.in

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

**⚠️ Important:**
- Replace `your-ref`, `your-password`, and `region` with your actual Supabase details
- Generate a strong JWT_SECRET (at least 32 characters)
- Update FRONTEND_URL to your actual domain

---

## 📊 Step 4: Monitor Deployment

### Check Deployment Logs:

Look for these success messages:
```
✅ Database connected successfully!
📅 Database time: 2025-01-08T10:30:00.000Z
🗄️ PostgreSQL version: PostgreSQL 15.x
👥 Users in database: 1
✅ Admin user updated successfully
📧 Admin Email: fk.designer1@gmail.com
🔑 Admin Password: Aamirfkdesigner1
🚀 Server running on port 10000
```

### Common Issues & Solutions:

**❌ "connect ENETUNREACH"**
- ✅ Use Session Pooler URL (not direct connection)
- ✅ Ensure `?pgbouncer=true` is in connection string

**❌ "password authentication failed"**
- ✅ Check your Supabase password is correct
- ✅ Reset database password if needed

**❌ "relation 'users' does not exist"**
- ✅ Run the SQL migration in Supabase SQL Editor
- ✅ Check database schema is created

---

## 🧪 Step 5: Test Your API

### Test Endpoints:

1. **Health Check:**
   ```
   GET https://your-app-name.onrender.com/health
   ```

2. **Admin Login:**
   ```
   POST https://your-app-name.onrender.com/api/auth/login
   
   Body:
   {
     "email": "fk.designer1@gmail.com",
     "password": "Aamirfkdesigner1"
   }
   ```

3. **User Registration:**
   ```
   POST https://your-app-name.onrender.com/api/auth/register
   
   Body:
   {
     "first_name": "Test",
     "last_name": "User",
     "email": "test@example.com",
     "phone": "+91 9876543210",
     "password": "testpassword123"
   }
   ```

---

## 🌐 Step 6: Update Frontend

Update your frontend API configuration:

**File:** `src/config/api.ts`
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.onrender.com/api' 
  : 'http://localhost:5000/api';
```

---

## 🔒 Step 7: Security Checklist

- ✅ **Strong JWT_SECRET** (32+ characters)
- ✅ **HTTPS only** in production
- ✅ **CORS configured** for your domain
- ✅ **Rate limiting** enabled
- ✅ **Environment variables** secure
- ✅ **Database password** strong

---

## 📈 Step 8: Performance Optimization

### Render Settings:
- **Instance Type:** `Starter` (free) or `Standard` (paid)
- **Auto-scaling:** Enable if using paid plan
- **Health checks:** Default settings work fine

### Database Optimization:
- **Connection pooling:** Already configured
- **Query optimization:** Monitor slow queries
- **Indexing:** Already set up in schema

---

## 🆘 Troubleshooting

### If deployment fails:

1. **Check build logs** for errors
2. **Verify environment variables** are set correctly
3. **Test database connection** in Supabase
4. **Check Node.js version** compatibility

### If admin login fails:

1. **Check server logs** for admin user creation
2. **Verify database migration** ran successfully
3. **Test database connection** manually

### If user registration fails:

1. **Check for duplicate emails** in database
2. **Verify validation rules** are working
3. **Check database constraints** are set up

---

## 📞 Support

**Need help?** Check these resources:

1. **Render Documentation:** https://render.com/docs
2. **Supabase Documentation:** https://supabase.com/docs
3. **Server logs** in Render dashboard
4. **Database logs** in Supabase dashboard

---

## ✅ Success Checklist

- [ ] Supabase Session Pooler URL configured
- [ ] Environment variables set in Render
- [ ] Deployment successful with no errors
- [ ] Health check endpoint working
- [ ] Admin login working
- [ ] User registration working
- [ ] Frontend API URL updated
- [ ] CORS configured for your domain

**🎉 Congratulations! Your FK Designers backend is now live on Render!**