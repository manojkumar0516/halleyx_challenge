# HalleyX Chart Widgets Setup & Usage Guide

## ✅ What's Fixed

Your chart widgets are now fully configured to display analytics data from the database. Here's what was done:

### 1. **Port Configuration**
- **Issue**: Frontend was hardcoded to connect to port 4002 (which wasn't running)
- **Fix**: Updated `.env` to use Vite proxy (forwards `/api` requests to backend on port 4000)
- **Result**: Frontend on port 3000 ↔ Backend on port 4000 now connected ✓

### 2. **Backend Analytics Endpoints**
Added specialized endpoints for chart data aggregation:
- `GET /api/analytics/chart/:field` - Get data grouped by any field
- `GET /api/analytics/timeseries` - Get daily trend data
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/status` - Get status breakdown

### 3. **Frontend Data Fetching**
Enhanced the chart widget renderer to:
- Fetch pre-aggregated data from backend
- Fall back to local aggregation if needed
- Show loading states while fetching
- Display empty state when no data available

---

## 🚀 How to Use Chart Widgets

### Step 1: Access the Dashboard
Visit `http://localhost:3000` in your browser

### Step 2: Add a Widget
1. Click the **"Config"** button (top right) to enter configuration mode
2. Drag widgets from the **Widget Palette** onto the grid

### Step 3: Configure a Chart Widget
1. **Hover over a widget** and click the **Settings icon** ⚙️
2. **Fill out the configuration fields**:

#### For **Pie Chart**:
```
Title: "Sales by Product"
Data Field: "product"
Show Legend: YES
```

#### For **Bar Chart**:
```
Title: "Orders by Status"
X-Axis: "status"
Y-Axis: "quantity"
Color: "#4f46e5" (indigo)
Show Data Labels: YES
```

#### For **Line Chart**:
```
Title: "Revenue Trend"
X-Axis: "orderDate" or "product"
Y-Axis: "totalAmount"
Color: "#06b6d4" (cyan)
```

### Step 4: View Data
1. **Click "Config"** to exit configuration mode
2. **Charts display with data** from the database
3. **Use Date Filter** (top bar) to filter data:
   - All time
   - Today
   - Last 7 Days
   - Last 30 Days
   - Last 90 Days

---

## 📊 Chart Widget Types

| Chart Type | Best For | X-Axis Examples | Y-Axis Examples |
|-----------|----------|-----------------|-----------------|
| **Pie** | Distribution | N/A | product, status, createdBy |
| **Bar** | Comparison | status, product, city | quantity, totalAmount |
| **Line** | Trends | orderDate, product | totalAmount, quantity |
| **Area** | Trends with fill | orderDate | totalAmount, quantity |
| **Scatter** | Correlation | quantity | totalAmount |

---

## 💾 Database Configuration

Your setup uses:
- **Database**: MySQL (halleyx)
- **Server**: localhost:3306
- **Connection**: Configured in `backend/.env`

### Required Tables & Indexes
```sql
-- Already created by schema.sql
INDEX idx_customerId (customerId)
INDEX idx_status (status)
INDEX idx_orderDate (orderDate)
```

---

## 🔍 Available Data Fields for Charts

All these fields can be used in chart configuration:

**Categorical** (good for grouping):
- `product` - Product name
- `status` - Order status (Pending, In progress, Completed)
- `createdBy` - Created by user
- `city`, `state`, `country` - Location
- `email`, `phone` - Contact info

**Numeric** (good for aggregation):
- `quantity` - Order quantity
- `unitPrice` - Unit price
- `totalAmount` - Total amount
- `customerId` - Customer ID

---

## 🧪 Testing Your Setup

### Test 1: Frontend Connection
```
✓ http://localhost:3000 - Should load the dashboard
```

### Test 2: Backend Orders API
```
GET http://localhost:4000/api/orders
Response: [] or [order objects]
```

### Test 3: Analytics API
```
GET http://localhost:4000/api/analytics/summary
Response: {
  "totalOrders": 0,
  "totalRevenue": 0,
  "avgOrderValue": 0,
  "maxOrderValue": 0,
  "minOrderValue": 0
}
```

### Test 4: Chart Analytics
```
GET http://localhost:4000/api/analytics/chart/product
Response: [] or [{name: "Product X", value: 5, totalRevenue: 1000}]
```

---

## ⚠️ Troubleshooting

### Charts Show "No data available"
**Cause**: Database has no orders yet
**Solution**: 
1. Open the Orders tab
2. Add some sample orders via the form
3. Refresh the page to see charts populated

### Charts Not Loading / Show Error
**Cause**: Backend not running or database connection failed
**Check**:
```powershell
# Verify backend is running
netstat -ano | findstr :4000

# Verify backend can connect to database
# Check backend/.env credentials match your MySQL setup
```

### Frontend Can't Connect to Backend
**Cause**: Port conflict or wrong proxy configuration
**Check**:
1. `.env` file should have empty `VITE_API_URL`
2. `vite.config.ts` proxy points to `http://localhost:4000`
3. No other services using ports 3000 or 4000

---

## 🔧 Common Configurations to Try

### Configuration 1: Revenue by Product
```javascript
{
  type: 'Pie',
  config: {
    dataField: 'product',
    showLegend: true
  }
}
```

### Configuration 2: Order Status Distribution
```javascript
{
  type: 'Bar',
  config: {
    xAxis: 'status',
    yAxis: 'quantity',
    color: '#ef4444',
    showDataLabel: true
  }
}
```

### Configuration 3: Sales Trend
```javascript
{
  type: 'Line',
  config: {
    xAxis: 'orderDate',
    yAxis: 'totalAmount',
    color: '#06b6d4',
    showDataLabel: false
  }
}
```

---

## 📚 File Structure

```
halleyX-main/
├── backend/
│   ├── index.js          ← Analytics endpoints added here
│   └── .env              ← Database credentials
├── src/
│   ├── api/
│   │   └── orderApi.ts   ← Analytics API methods
│   ├── components/
│   │   └── dashboard/
│   │       └── WidgetRenderer.tsx ← Chart rendering logic
│   ├── store.ts          ← State management
│   └── types.ts          ← TypeScript types
├── .env                  ← API URL configuration
└── vite.config.ts        ← Vite proxy configuration
```

---

## 🎯 Next Steps

1. **Start adding orders** to see charts populate
2. **Create multiple widgets** with different configurations
3. **Use date filters** to analyze trends
4. **Customize colors** and styling in widget configuration

---

## 📞 API Documentation Summary

### Analytics Endpoints

#### 1. Get Analytics by Field
```
GET /api/analytics/chart/:field
Parameters: field - 'product', 'status', 'createdBy', 'city', 'state', 'country'
Response: [{name: string, value: number, totalRevenue: number}]
```

#### 2. Get Time Series
```
GET /api/analytics/timeseries
Response: [{date: string, count: number, revenue: number}]
```

#### 3. Get Summary Stats
```
GET /api/analytics/summary
Response: {
  totalOrders: number,
  totalRevenue: number,
  avgOrderValue: number,
  maxOrderValue: number,
  minOrderValue: number
}
```

#### 4. Get Status Breakdown
```
GET /api/analytics/status
Response: [{name: string, value: number, revenue: number}]
```

---

## ✨ Features Enabled

- ✅ Database-backed chart data
- ✅ Real-time aggregation on backend
- ✅ Multiple chart types (Bar, Line, Pie, Area, Scatter)
- ✅ Date filtering across all charts
- ✅ Customizable colors and labels
- ✅ Loading states and error handling
- ✅ Responsive charts with hover tooltips
- ✅ Fallback to local aggregation if API unavailable

---

**All set! Your chart widgets are now fully functional. Add some orders and start visualizing your data! 🎉**
