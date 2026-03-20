# HalleyX Dashboard - Complete Setup & Run Guide

## 🚀 Quick Start (2 Steps)

### Step 1: Start Backend
```bash
cd backend
npm install  # First time only
npm start
```
Expected output:
```
✓ Database connected successfully
Backend server is running on http://localhost:4000
```

### Step 2: Start Frontend (in new terminal)
```bash
npm install  # First time only
npm run dev
```
Expected: App opens at http://localhost:3000

---

## ✨ Dashboard Features

### Drag & Drop Enabled
- Click **🎯 Drag** button in top-right to enable drag mode
- **Drag widgets** to reorder them
- **Resize** by dragging the corner handles
- **Edit** widgets by clicking the ⚙️ icon
- **Delete** widgets by clicking the 🗑️ icon

### Widget Types

#### 1. **KPI Cards** (3 default)
- Total Orders
- Total Revenue  
- Average Order Value

#### 2. **Charts**
- **Bar Chart**: Orders by Product
- **Pie Chart**: Orders by Status
- **Line Chart**: Trend analysis
- **Area Chart**: Cumulative trends
- **Scatter Chart**: Data distribution

#### 3. **Data Table**
- Sortable columns
- Filterable search
- Pagination support

---

## 📊 Default Dashboard Layout

```
┌─────────────────────────────────────────┐
│ KPI: Total  │ KPI: Revenue │ KPI: Avg   │
├─────────────┴──────────────┴─────────────┤
│       Bar: Orders by Product              │
├──────────────────┬────────────────────────┤
│ Pie: By Status   │ More Charts as needed  │
└──────────────────┴────────────────────────┘
```

---

## 🔧 Configuration

### Frontend Environment
File: `.env`
```
VITE_API_URL=  # Leave empty to use Vite proxy to port 4000
```

### Backend Environment
File: `backend/.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=halleyx
PORT=4000
```

---

## 📋 Database Setup

### Required MySQL Database

```sql
CREATE DATABASE halleyx;
USE halleyx;

CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  customerId VARCHAR(36),
  customerName VARCHAR(255),
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  streetAddress VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postalCode VARCHAR(20),
  country VARCHAR(100),
  product VARCHAR(255),
  quantity INT,
  unitPrice DECIMAL(10,2),
  totalAmount DECIMAL(10,2),
  status ENUM('Pending', 'In progress', 'Completed'),
  createdBy VARCHAR(255),
  orderDate DATETIME,
  INDEX(customerId),
  INDEX(status),
  INDEX(orderDate)
);
```

### Add Sample Data
```sql
INSERT INTO orders (id, customerId, customerName, firstName, lastName, email, phone, 
                   streetAddress, city, state, postalCode, country, product, quantity, 
                   unitPrice, totalAmount, status, createdBy, orderDate)
VALUES (UUID(), 'CUST-123', 'John Doe', 'John', 'Doe', 'john@example.com', '555-0100',
        '123 Main St', 'New York', 'NY', '10001', 'USA', 'Fiber Internet 300 Mbps', 
        2, 99.99, 199.98, 'Completed', 'Mr. Michael Harris', NOW());
```

---

## 🐛 Troubleshooting

### Widgets Not Showing
1. Check backend is running: `http://localhost:4000/health`
2. Check database connection: `http://localhost:4000/api/health`
3. Check browser console for errors (F12)

### Drag/Resize Not Working
1. Click **🎯 Drag** button to enable drag mode
2. Check if "Drag" button shows green color
3. Clear localStorage: DevTools → Application → Clear Storage

### No Data in Charts
1. Verify orders exist in database
2. Check `/api/orders` returns data
3. Check backend analytics endpoints work:
   - `http://localhost:4000/api/analytics/chart/product`
   - `http://localhost:4000/api/analytics/status`

### Backend Connection Issues
1. Verify MySQL is running
2. Check DB credentials in `backend/.env`
3. Test connection: `npm run dev` logs `✓ Database connected`

---

## 🎨 Add New Widgets

1. Click **Add Widget** button (top-right)
2. Select widget type:
   - KPI Card
   - Bar Chart
   - Line Chart
   - Pie Chart
   - Data Table
3. Configure by clicking ⚙️ icon
4. Save changes

---

## 📱 Responsive Breakpoints

The dashboard auto-adjusts for different screen sizes:
- **Desktop (lg)**: 12 columns, full width
- **Tablet (md)**: 10 columns
- **Small (sm)**: 6 columns  
- **Mobile (xs)**: 4 columns
- **Extra Small (xxs)**: 2 columns

---

## 💾 Data Persistence

- **Dashboard Layout**: Saved in browser localStorage
- **Widgets**: Persisted automatically
- **Orders**: Stored in MySQL database
- **Analytics**: Aggregated from database in real-time

---

## 📚 Documentation Files

- `DASHBOARD_QUICKSTART.md` - Dashboard tips
- `DRAG_DROP_IMPLEMENTATION.md` - Technical details
- `API_FIX_GUIDE.md` - API setup guide
- `DEBUGGING_GUIDE.md` - Debug tips

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:4000
- [ ] Frontend running on http://localhost:3000
- [ ] Can see 5 default widgets on dashboard
- [ ] Drag mode toggle button works
- [ ] Can drag widgets to reorder
- [ ] Can resize by dragging corners
- [ ] Can add new widgets
- [ ] Charts show data
- [ ] Date filter works
- [ ] Orders table loads

---

**Need help?** Check the console logs (F12) or existing guide files in the project root.
