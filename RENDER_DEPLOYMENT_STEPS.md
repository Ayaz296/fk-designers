# 🚀 RENDER DEPLOYMENT - STEP BY STEP

## 📋 Your Supabase Details:
- **Host:** `aws-0-ap-south-1.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres.bnikjygyzstmvdtjohwn`
- **Pool Mode:** `session` ✅

---

## 🔧 Step 1: Set Environment Variables in Render

When you create your Render Web Service, add these environment variables:

### **Required Environment Variables:**

```env
DATABASE_URL=postgresql://postgres.bnikjygyzstmvdtjohwn:YOUR_ACTUAL_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true

JWT_SECRET=FK_DESIGNERS_2025_SUPER_SECRET_JWT_KEY_FOR_AUTHENTICATION_SECURITY

NODE_ENV=production

FRONTEND_URL=https://fkdesigner.in

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

MAX_FILE_SIZE=5242880

UPLOAD_PATH=./uploads
```

**⚠️ IMPORTANT:** Replace `YOUR_ACTUAL_PASSWORD` with your real Supabase database password!

---

## 🚀 Step 2: Create Render Web Service

1. **Go to Render Dashboard** → **"New"** → **"Web Service"**

2. **Connect GitHub Repository**

3. **Service Configuration:**
   - **Name:** `fk-designers-backend`
   - **Region:** `Singapore` (closest to ap-south-1)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add Environment Variables** (from Step 1 above)

5. **Click "Create Web Service"**

---

## 📊 Step 3: Monitor Deployment

### ✅ Success Logs to Look For:
```
🔗 Database connection config: {
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  database: 'postgres',
  user: 'postgres.bnikjygyzstmvdtjohwn',
  port: 5432,
  ssl: true
}

🔄 Testing database connection...
✅ Database connected successfully!
📅 Database time: 2025-01-08T...
🗄️ PostgreSQL version: PostgreSQL 15.x
👥 Users in database: 1

🔧 Initializing admin user...
✅ Admin user updated successfully
📧 Admin Email: fk.designer1@gmail.com
🔑 Admin Password: Aamirfkdesigner1

🚀 Server running on port 10000
✅ FK Designers API Server is ready!
```

### ❌ Common Errors & Solutions:

**"connect ENETUNREACH"**
- ✅ Make sure you're using the Session Pooler URL
- ✅ Check the `?pgbouncer=true` parameter is included

**"password authentication failed"**
- ✅ Double-check your Supabase database password
- ✅ Go to Supabase → Settings → Database → Reset password if needed

**"relation 'users' does not exist"**
- ✅ Run the SQL migration in Supabase SQL Editor first

---

## 🧪 Step 4: Test Your Deployed API

Once deployment is successful, test these endpoints:

### 1. Health Check:
```
GET https://your-app-name.onrender.com/health
```

### 2. Admin Login:
```
POST https://your-app-name.onrender.com/api/auth/login

Body:
{
  "email": "fk.designer1@gmail.com",
  "password": "Aamirfkdesigner1"
}
```

### 3. User Registration:
```
POST https://your-app-name.onrender.com/api/auth/register

Body:
{
  "first_name": "Test",
  "last_name": "User", 
  "email": "newuser@example.com",
  "phone": "+91 9876543210",
  "password": "password123"
}
```

---

## 🌐 Step 5: Update Frontend API URL

Update your frontend to use the new backend URL:

**File:** `src/config/api.ts`
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.onrender.com/api' 
  : 'http://localhost:5000/api';
```

---

## 📝 Quick Checklist:

- [ ] GitHub repository uploaded with latest code
- [ ] Render Web Service created with correct settings
- [ ] Environment variables added (especially DATABASE_URL)
- [ ] Deployment successful (check logs)
- [ ] Health endpoint working
- [ ] Admin login working
- [ ] User registration working
- [ ] Frontend updated with new API URL

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Render deployment logs** for specific error messages
2. **Verify your Supabase password** is correct
3. **Make sure the SQL migration** has been run in Supabase
4. **Test the database connection** directly in Supabase

**Ready to deploy?** Follow the steps above and let me know if you need help with any specific step!