# 🔧 RENDER ENVIRONMENT VARIABLES

## Set these EXACT environment variables in your Render Web Service:

### **Database Connection (Individual Variables):**
```
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_USER=postgres.bnikjygyzstmvdtjohwn
DB_PASSWORD=YOUR_ACTUAL_SUPABASE_PASSWORD
DB_NAME=postgres
DB_PORT=5432
```

### **Application Settings:**
```
JWT_SECRET=FK_DESIGNERS_2025_SUPER_SECRET_JWT_KEY_FOR_AUTHENTICATION_SECURITY_VERY_LONG_STRING

NODE_ENV=production

FRONTEND_URL=https://fkdesigner.in

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

MAX_FILE_SIZE=5242880

UPLOAD_PATH=./uploads
```

## 🚨 IMPORTANT:

1. **Replace `YOUR_ACTUAL_SUPABASE_PASSWORD`** with your real Supabase database password
2. **Use the Session Pooler host** (aws-0-ap-south-1.pooler.supabase.com)
3. **Port must be 5432** (Session Pooler port)
4. **Database name is `postgres`** (default Supabase database)

## 📋 How to Set in Render:

1. Go to your Render Web Service dashboard
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable above **one by one**
5. Click **"Save Changes"**
6. Your service will automatically redeploy

## ✅ Expected Success Logs:

After setting these variables, you should see:
```
🔗 Database connection config: {
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  database: 'postgres',
  user: 'postgres.bnikjygyzstmvdtjohwn',
  port: 5432,
  ssl: true
}

🔄 Testing database connection...
🔗 Connecting to: aws-0-ap-south-1.pooler.supabase.com:5432/postgres
✅ Database connected successfully!
📅 Database time: 2025-01-08T...
🗄️ PostgreSQL version: PostgreSQL 15.x
👥 Users in database: 1
```

## 🆘 If Still Getting Errors:

1. **Double-check your Supabase password**
2. **Go to Supabase → Settings → Database → Reset password**
3. **Make sure you're using the Session Pooler URL** (not direct connection)
4. **Verify all environment variables are set correctly**

Ready to set these variables in Render!