# HalleyX Dashboard - Troubleshooting Guide

## 🔍 Common Issues & Solutions

### ISSUE 1: "Widgets are not working" / Blank Dashboard

**Symptoms:**
- Dashboard shows just the top bar
- No widgets visible
- Console shows no errors

**Solutions:**

1. **Check if widgets are in store:**
   ```
   DevTools (F12) → Console
   >>> useStore.getState().widgets.length
   Should show: 5 (or more if you added widgets)
   ```

2. **Clear localStorage cache:**
   ```
   DevTools → Application → Storage → Local Storage
   → Find dashboard-storage → Delete
   → Refresh page
   ```

3. **Check if data loaded:**
   ```
   DevTools → Console
   >>> useStore.getState().orders.length
   Should show: > 0
   ```

   **If 0:**
   - Backend not running? Start it:
     ```
     cd backend && npm start
     ```
   - Check backend health:
     ```
     Open: http://localhost:4000/health
     Should return: { status: 'OK' }
     ```

---

### ISSUE 2: "Drag and Resize Not Working"

**Symptoms:**
- Can't drag widgets
- Can't resize corners
- No cursor change when hovering

**Solutions:**

1. **Check Drag Mode Status:**
   - Click the **🎯 Drag** button
   - Should turn green/highlighted when enabled
   - Button shows "Lock" when disabled

2. **Verify CSS is loaded:**
   ```
   DevTools → Sources
   → Find 'index.css'
   → Verify it contains '.react-grid-draghandle'
   ```

3. **Check WidgetWrapper render:**
   ```
   DevTools → Elements
   → Find widget header
   → Should have class: 'react-grid-draghandle'
   ```

4. **Clear CSS Cache:**
   - Ctrl+Shift+R (Hard refresh)
   - Or: DevTools → Network → Disable cache → Refresh

---

### ISSUE 3: "Charts Show 'No Data Available'"

**Symptoms:**
- Widget shows empty state
- Other widgets work fine
- Chart-type widgets particularly affected

**Solutions:**

1. **Check if backend is running:**
   ```
   Open: http://localhost:4000/api/analytics/chart/product
   
   Should return JSON like:
   [{ name: "product1", value: 5 }, ...]
   
   If error/blank: Start backend
   ```

2. **Check database connection:**
   ```
   Open: http://localhost:4000/api/health
   Should show: { status: 'OK', database: 'Connected' }
   ```

3. **Check if orders exist in database:**
   ```
   In MySQL:
   USE halleyx;
   SELECT COUNT(*) FROM orders;
   
   Should be: > 0
   ```

4. **Check console logs:**
   ```
   DevTools → Console
   Look for: [Chart] Generated local data
   This means API failed and using local fallback
   ```

---

### ISSUE 4: "404 Not Found" When Fetching Orders

**Symptoms:**
- Console shows: `failed to fetch orders (404)`
- No orders displayed
- Charts are empty

**Solutions:**

1. **Verify backend is on correct port:**
   ```
   Should be: http://localhost:4000
   
   Check backend/.env or console output
   ```

2. **Start backend if not running:**
   ```
   cd backend
   npm install  # First time only
   npm start
   ```

3. **Check firewall/network:**
   - Ensure port 4000 not blocked
   - Try accessing: http://localhost:4000/health

4. **Check frontend is using correct API URL:**
   ```
   File: .env
   Line: VITE_API_URL=
   Leave empty (it uses Vite proxy)
   ```

---

### ISSUE 5: "Database Connection Failed"

**Symptoms:**
- Backend console: "✗ Database connection failed"
- Can't fetch orders
- Backend starts but doesn't work

**Solutions:**

1. **Verify MySQL is running:**
   ```
   Windows: Services → MySQL80
   Should be: Running
   
   Or from Command Prompt:
   mysql -u root -p
   If fails: MySQL not installed or not running
   ```

2. **Check database credentials:**
   ```
   File: backend/.env
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=     # Your MySQL password
   DB_NAME=halleyx
   ```

3. **Verify database exists:**
   ```
   mysql> SHOW DATABASES;
   Should show: halleyx
   
   If not present:
   mysql> CREATE DATABASE halleyx;
   ```

4. **Create orders table if missing:**
   ```
   Run the SQL from: schema.sql
   Or create manually with proper columns
   ```

---

### ISSUE 6: "Build Fails with TypeScript Errors"

**Symptoms:**
- `npm run build` fails
- Shows "error TS..." messages
- dist/ folder not created

**Solutions:**

1. **Check TypeScript errors:**
   ```
   npm run lint
   This shows specific errors
   ```

2. **Reinstall dependencies:**
   ```
   rm -rf node_modules
   npm install
   npm run build
   ```

3. **Check for type mismatches:**
   - Make sure WidgetType includes all widget types
   - Verify all import paths are correct
   - Check switch statements handle all cases

---

### ISSUE 7: "Frontend Won't Start / Port 3000 in Use"

**Symptoms:**
- `npm run dev` shows port already in use
- Cannot start development server

**Solutions:**

1. **Kill process using port 3000:**
   ```
   Windows (PowerShell):
   Get-Process -Name node | Stop-Process -Force
   
   Windows (CMD):
   netstat -ano | findstr :3000
   taskkill /PID [PID_NUMBER] /F
   ```

2. **Use different port:**
   ```
   npm run dev -- --port 3001
   Then open: http://localhost:3001
   ```

3. **Wait for process to release:**
   - Wait 30 seconds
   - Try again

---

### ISSUE 8: "Widget Positions Reset After Refresh"

**Symptoms:**
- Customize widget layout
- Refresh page
- Widgets back to default positions

**Solutions:**

1. **Check localStorage is enabled:**
   ```
   DevTools → Application → Local Storage
   Should show: dashboard-storage
   ```

2. **Verify layouts are being updated:**
   ```
   DevTools → Console
   >>> useStore.getState().layouts
   Should show: { lg: [...], md: [...], sm: [...] }
   ```

3. **Ensure Zustand persist middleware works:**
   - Check if store initialization has persist()
   - See src/store.ts
   - Should include: `persist((set, get) => ({...}))`

4. **Check for JavaScript errors:**
   - DevTools → Console
   - Look for red error messages
   - Might prevent store save

---

### ISSUE 9: "Responsive Layout Not Working Properly"

**Symptoms:**
- Widgets don't resize on window resize
- Mobile view looks broken
- Layout changes unpredictably

**Solutions:**

1. **Check ResponsiveGridLayout breakpoints:**
   ```
   Verify in ModernDashboard.tsx:
   - lg: 1200px
   - md: 996px
   - sm: 768px
   - xs: 480px
   ```

2. **Test at specific widths:**
   - DevTools → Device Toolbar
   - Try: Desktop, Tablet, Mobile sizes
   - Refresh page after resizing

3. **Ensure layouts exist for all breakpoints:**
   ```
   >>> useStore.getState().layouts
   Should have: lg, md, sm
   Not: lg only
   ```

---

### ISSUE 10: "Memory Leak / Page Slow After Time"

**Symptoms:**
- Page starts fast
- Slows down after 5-10 minutes
- CPU usage high

**Solutions:**

1. **Check for infinite re-renders:**
   ```
   DevTools → Profiler
   Record for 5 seconds
   Look for components re-rendering constantly
   ```

2. **Clear console logs:**
   - Many console.log statements for debugging
   - May accumulate in memory
   - Disable logs in production build

3. **Check for memory leaks in useEffects:**
   - Ensure all useEffect have cleanup functions
   - Check for missing dependencies

4. **Restart if persists:**
   ```
   Clear browser cache:
   Ctrl+Shift+Delete
   Select "All time"
   ```

---

## 🛠️ Diagnostic Checklist

**When reporting an issue, please check:**

- [ ] Backend is running on :4000
- [ ] Frontend is running on :3000
- [ ] Can access http://localhost:4000/health
- [ ] Can access http://localhost:4000/api/orders
- [ ] Database shows in logs: "✓ Database connected"
- [ ] Browser shows no red errors (DevTools → Console)
- [ ] Page has loaded more than 2 seconds
- [ ] Not running from localhost:5173 (wrong port)

---

## 📋 Debug Mode Checklist

**To fully debug an issue:**

1. Open DevTools (F12)
2. Go to Console tab
3. Run these commands:

```javascript
// Check app state
const state = useStore.getState();
console.log('Widgets:', state.widgets.length);
console.log('Layouts:', state.layouts);
console.log('Orders:', state.orders.length);
console.log('Current date filter:', state.dateFilter);

// Check API connectivity
fetch('http://localhost:4000/health').then(r => r.json()).then(console.log);

// Check database
fetch('http://localhost:4000/api/health').then(r => r.json()).then(console.log);

// Check orders data
fetch('http://localhost:4000/api/orders').then(r => r.json()).then(d => console.log('Orders:', d.length));

// Check analytics
fetch('http://localhost:4000/api/analytics/chart/product').then(r => r.json()).then(console.log);
```

---

## 🆘 Still Stuck?

Try these in order:

1. **Restart both servers:**
   ```
   Kill all Node processes
   Restart backend: cd backend && npm start
   Restart frontend: npm run dev
   ```

2. **Clear everything:**
   ```
   - Clear browser cache (Ctrl+Shift+Delete)
   - Clear localStorage (DevTools → Storage)
   - Delete dist/ folder
   - npm run build
   ```

3. **Reinstall dependencies:**
   ```
   rm -rf node_modules backend/node_modules
   npm install
   cd backend && npm install
   ```

4. **Check existing documentation:**
   - DASHBOARD_QUICKSTART.md
   - DASHBOARD_IMPLEMENTATION_COMPLETE.md
   - SOLUTION_SUMMARY.md

5. **Review console output:**
   - Frontend logs start with [AppName]
   - Backend logs show request handling
   - Look for ✗ error markers

---

**Still need help?** Look at the detailed logs in:
- Browser Console (F12)
- Backend terminal output
- Check for specific error messages starting with `[` that indicate data source

Most issues are one of:
1. Backend not running
2. Database not connected
3. Browser cache/localStorage corrupted
4. Port already in use
5. CSS not loaded properly
