# API 500 Error - Complete Fix Guide

## ✅ Issues Fixed

### 1. **VITE_API_URL Configuration** ✅
- **Problem**: Frontend didn't know where backend was running
- **Fix**: Set `.env: VITE_API_URL=http://localhost:4000`
- **Result**: Frontend now correctly calls backend on port 4000 instead of 3000

### 2. **Frontend Error Handling** ✅
- **Problem**: Generic error messages "Unable to fetch orders" without details
- **Fix**: Enhanced `orderApi.ts` to:
  - Log full error details including HTTP status codes
  - Return backend error messages to store
  - Show API URL in logs for debugging
- **Changes**: `fetchOrders()`, `createOrder()`, `updateOrder()`, `deleteOrderApi()`

### 3. **Backend Error Logging** ✅
- **Problem**: Errors weren't detailed enough for debugging
- **Fix**: Enhanced endpoints to log:
  - Full error code and SQL state
  - Request details
  - Timeline of operations
- **Endpoints Updated**: GET /api/orders, POST /api/orders, GET /api/orders/:id

### 4. **Health Check Endpoints** ✅
- **New**: `GET /health` - Check if backend server is running
- **New**: `GET /api/health` - Check database connection status
- **Benefits**: Easy diagnostic without complex setup

### 5. **Startup Diagnostics** ✅
- **Problem**: Unclear if database was connected at startup
- **Fix**: Show critical warnings if database fails to connect
- **Result**: Clear indication of what's broken

---

## 🚀 How to Test the Fix

### Step 1: Ensure MySQL is Running
```bash
# Windows - Check if MySQL service is running
# Open Services (services.msc) and look for "MySQL80" or similar

# Or check port 3306
netstat -an | findstr :3306
```

### Step 2: Verify .env Files

#### Backend `.backend/.env`
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=manojmagesh
DB_NAME=halleyx
PORT=4000
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:4000
```

### Step 3: Start Backend
```bash
cd backend
npm start
```

**Expected output:**
```
============================================================
✅ Backend server started on http://localhost:4000
📊 Health check: http://localhost:4000/health
📊 API health: http://localhost:4000/api/health
============================================================

✓ Database connected successfully
```

### Step 4: Start Frontend
```bash
npm run dev
```

### Step 5: Test API Endpoints

#### Test 1: Backend Health
```bash
curl http://localhost:4000/health
# Expected: {"status":"Backend server is running",...}
```

#### Test 2: Database Health
```bash
curl http://localhost:4000/api/health
# Expected: {"status":"OK","database":"Connected"}
```

#### Test 3: Fetch Orders
```bash
curl http://localhost:4000/api/orders
# Expected: [{"id":"...","product":"..."},...] or []
```

---

## 🐛 Troubleshooting

### Issue: Backend Doesn't Start

**Error**: `EADDRINUSE: address already in use :::4000`

**Fix**:
```bash
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use different port
set PORT=4001
npm start
```

### Issue: Database Connection Failed

**Error**: `✗ Database connection failed: connect ECONNREFUSED`

**Steps to Fix**:

1. **Check if MySQL is running**
   ```bash
   # Windows Services
   services.msc  # Look for MySQL service
   
   # Or start MySQL
   net start MySQL80
   ```

2. **Verify credentials in `backend/.env`**
   ```bash
   # Test connection
   mysql -h localhost -u root -pmanojmagesh -e "USE halleyx; SELECT * FROM orders LIMIT 1;"
   ```

3. **If database doesn't exist, create it**
   ```bash
   mysql -h localhost -u root -pmanojmagesh -e "CREATE DATABASE IF NOT EXISTS halleyx;"
   ```

4. **Recreate tables from schema**
   ```bash
   # Make sure schema.sql is in project root
   mysql -h localhost -u root -pmanojmagesh halleyx < schema.sql
   ```

### Issue: Frontend Still Shows "Unable to fetch orders"

**Diagnostics**:

1. **Check Console Logs** (Frontend Browser Dev Tools)
   - Look for error message with:
     - HTTP status code
     - Actual error from backend
     - API URL being called

2. **Check Console** (Terminal where frontend runs)
   - Look for [orderApi:*] prefixed logs

3. **Check Backend Terminal**
   - Look for [GET /api/orders] error logs with details

### Issue: CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Fix**: Backend already has CORS enabled, but verify:
```javascript
// backend/index.js line ~8
app.use(cors()); // This allows all origins

// If you need specific origins:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## 📊 Expected Console Output

### Frontend Console (Browser Dev Tools)

**Success Case**:
```
[Store:loadOrders] 🔄 Fetching orders from API...
[Store:loadOrders] ✅ Successfully loaded 5 orders
[Store:loadOrders] 📦 Sample order: {id: "...", product: "Laptop", ...}
```

**Error Case** (Now Shows Details):
```
[orderApi:fetchOrders] Error details: {
  message: "Failed to fetch orders (500): Table 'halleyx.orders' doesn't exist",
  apiUrl: "http://localhost:4000"
}
[Store:loadOrders] ❌ Failed to load orders: Unable to fetch orders: Failed to fetch orders (500)...
[Store:loadOrders] 💾 Using local cache or empty state (fallback mode)
```

### Backend Console

**Success Case**:
```
============================================================
✅ Backend server started on http://localhost:4000
📊 Health check: http://localhost:4000/health
📊 API health: http://localhost:4000/api/health
============================================================

✓ Database connected successfully
[GET /api/orders] 📋 Request received
[GET /api/orders] ✅ Fetched 5 orders
```

**Error Case** (Now Shows Details):
```
⚠️  CRITICAL: Database connection failed!
❌ Make sure MySQL is running and .env credentials are correct:
   DB_HOST: localhost
   DB_PORT: 3306
   DB_USER: root
   DB_NAME: halleyx
❌ API calls will return 500 errors until fixed!

[GET /api/orders] 📋 Request received
[GET /api/orders] ❌ Error details: {
  "message": "Table 'halleyx.orders' doesn't exist",
  "code": "ER_NO_SUCH_TABLE",
  "sqlState": "42S02"
}
```

---

## 🔍 Database Schema Check

If you get "Table doesn't exist" error:

```bash
# Connect to MySQL
mysql -u root -pmanojmagesh -h localhost

# Inside MySQL
USE halleyx;
SHOW TABLES;  # Should show 'orders' table

# If empty, import schema
# Exit MySQL first: exit or \q
# Then run:
mysql -u root -pmanojmagesh halleyx < schema.sql
```

---

## ✨ Summary of Code Changes

### Frontend Files Changed
- **`.env`**: Added `VITE_API_URL=http://localhost:4000`
- **`src/api/orderApi.ts`**: Enhanced error handling with detailed logging
- **`src/store.ts`**: Improved error messages and fallback logic

### Backend Files Changed
- **`backend/index.js`**: 
  - Added `/health` and `/api/health` endpoints
  - Enhanced error logging with SQL details
  - Better startup diagnostics

---

## 📞 Quick Reference

| Issue | Fix |
|-------|-----|
| 500 Error on /api/orders | Check MySQL is running + VITE_API_URL set |
| "Cannot connect to server" | Backend not running on :4000 |
| Database connection failed | MySQL service not running or wrong credentials |
| Orders not showing | Check schema.sql was imported |
| CORS error | Verify backend has `cors()` middleware |

---

## 🎯 Next Steps

1. ✅ Verify MySQL is running
2. ✅ Check `.env` files are correct
3. ✅ Start backend and check health endpoints
4. ✅ Start frontend and monitor console logs
5. ✅ Check browser network tab for API response details

Once working, you'll see orders load in the UI! 🎉
