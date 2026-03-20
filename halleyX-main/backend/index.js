require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'halleyx',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database connected successfully');
    await connection.release();
    return true;
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    console.error('  Check your database credentials in backend/.env');
    console.error('  Connection details:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'halleyx',
    });
    return false;
  }
}


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend server is running', url: `http://localhost:${process.env.PORT || 4000}` });
});

app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.release();
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    console.error('[/api/health] Database check failed:', err.message);
    res.status(503).json({ status: 'Database disconnected', error: err.message });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    console.log('[GET /api/orders] 📋 Request received');
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY orderDate DESC');
    console.log(`[GET /api/orders] ✅ Fetched ${rows.length} orders`);
    res.json(rows);
  } catch (err) {
    console.error('[GET /api/orders] ❌ Error details:', {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      errno: err.errno,
      stack: err.stack.split('\n')[0]
    });
    res.status(500).json({ 
      message: 'Failed to fetch orders',
      error: err.message,
      code: err.code,
      sqlState: err.sqlState
    });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    console.log(`[GET /api/orders/:id] 📄 Fetching order: ${req.params.id}`);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      console.warn(`[GET /api/orders/:id] ⚠️  Order not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log(`[GET /api/orders/:id] ✅ Fetched order: ${req.params.id}`);
    res.json(rows[0]);
  } catch (err) {
    console.error(`[GET /api/orders/:id] ❌ Error details:`, {
      message: err.message,
      code: err.code,
      id: req.params.id
    });
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
});

// Helper function to convert ISO datetime to MySQL DATETIME format
function formatDateForMySQL(isoDate) {
  if (!isoDate) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  try {
    const date = new Date(isoDate);
    // Convert to YYYY-MM-DD HH:MM:SS format
    return date.toISOString().slice(0, 19).replace('T', ' ');
  } catch (e) {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    console.log('[POST /api/orders] 📝 Creating order:', { id: order?.id, product: order?.product });
    
    // Validate required fields
    if (!order.id || !order.firstName || !order.lastName || !order.email) {
      const missing = { id: !!order.id, firstName: !!order.firstName, lastName: !!order.lastName, email: !!order.email };
      console.warn('[POST /api/orders] ⚠️  Missing required fields:', missing);
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: missing
      });
    }

    const columns = [
      'id', 'customerId', 'customerName', 'firstName', 'lastName', 'email', 'phone',
      'streetAddress', 'city', 'state', 'postalCode', 'country', 'product',
      'quantity', 'unitPrice', 'totalAmount', 'status', 'createdBy', 'orderDate'
    ];
    
    // Format values and convert orderDate to MySQL format
    const values = columns.map((c) => {
      if (c === 'orderDate') {
        return formatDateForMySQL(order[c]);
      }
      return order[c];
    });

    console.log('[POST /api/orders] 🔧 Inserting into database...');
    await pool.query(
      `INSERT INTO orders (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`,
      values,
    );

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [order.id]);
    console.log('[POST /api/orders] ✅ Order created:', order.id);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[POST /api/orders] ❌ Error details:', {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      errno: err.errno,
      sql: err.sql ? err.sql.substring(0, 100) : undefined
    });
    res.status(500).json({ 
      message: 'Failed to create order',
      error: err.message,
      code: err.code,
      sqlState: err.sqlState
    });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updateFields = req.body;
    const keys = Object.keys(updateFields);
    if (!keys.length) return res.status(400).json({ message: 'No fields to update' });

    const setClause = keys.map((key) => `${key} = ?`).join(', ');
    
    // Format values and convert orderDate if present
    const values = keys.map((key) => {
      if (key === 'orderDate') {
        return formatDateForMySQL(updateFields[key]);
      }
      return updateFields[key];
    });
    values.push(orderId);

    console.log(`✏️  Updating order: ${orderId}`, { fields: keys });

    await pool.query(`UPDATE orders SET ${setClause} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!rows.length) {
      console.warn(`⚠️  Order not found after update: ${orderId}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log(`✓ Order updated: ${orderId}`);
    res.json(rows[0]);
  } catch (err) {
    console.error('✗ Error updating order:', err.message);
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      console.warn(`⚠️  Order not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log(`🗑️  Order deleted: ${req.params.id}`);
    res.status(204).end();
  } catch (err) {
    console.error('✗ Error deleting order:', err.message);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
});

// Analytics Endpoints for Charts

// Get chart data aggregated by field (for Pie, Bar, Line charts)
app.get('/api/analytics/chart/:field', async (req, res) => {
  try {
    const field = req.params.field;
    const allowedFields = ['product', 'status', 'createdBy', 'city', 'state', 'country'];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field for analytics' });
    }

    const query = `
      SELECT ${field} as name, COUNT(*) as value, SUM(totalAmount) as totalRevenue
      FROM orders
      GROUP BY ${field}
      ORDER BY value DESC
    `;
    
    const [rows] = await pool.query(query);
    console.log(`📊 Analytics chart by ${field}: ${rows.length} groups`);
    res.json(rows);
  } catch (err) {
    console.error(`✗ Error fetching chart analytics for ${req.params.field}:`, err.message);
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
});

// Get time series data (for Line, Area charts)
app.get('/api/analytics/timeseries', async (req, res) => {
  try {
    const query = `
      SELECT DATE(orderDate) as date, COUNT(*) as count, SUM(totalAmount) as revenue
      FROM orders
      GROUP BY DATE(orderDate)
      ORDER BY date ASC
    `;
    
    const [rows] = await pool.query(query);
    const formattedData = rows.map(row => ({
      date: row.date ? new Date(row.date).toLocaleDateString() : 'Unknown',
      count: Number(row.count),
      revenue: Number(row.revenue)
    }));
    
    console.log(`📈 Fetched time series data: ${formattedData.length} days`);
    res.json(formattedData);
  } catch (err) {
    console.error('✗ Error fetching time series analytics:', err.message);
    res.status(500).json({ message: 'Failed to fetch time series', error: err.message });
  }
});

// Get summary statistics
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as totalOrders,
        SUM(totalAmount) as totalRevenue,
        AVG(totalAmount) as avgOrderValue,
        MAX(totalAmount) as maxOrderValue,
        MIN(totalAmount) as minOrderValue
      FROM orders
    `;
    
    const [rows] = await pool.query(query);
    const stats = rows[0];
    
    const formattedStats = {
      totalOrders: Number(stats.totalOrders),
      totalRevenue: Number(stats.totalRevenue),
      avgOrderValue: Number(stats.avgOrderValue),
      maxOrderValue: Number(stats.maxOrderValue),
      minOrderValue: Number(stats.minOrderValue)
    };
    
    console.log('📋 Fetched summary statistics');
    res.json(formattedStats);
  } catch (err) {
    console.error('✗ Error fetching summary analytics:', err.message);
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});

// Get status breakdown
app.get('/api/analytics/status', async (req, res) => {
  try {
    const query = `
      SELECT status, COUNT(*) as count, SUM(totalAmount) as revenue
      FROM orders
      GROUP BY status
    `;
    
    const [rows] = await pool.query(query);
    console.log('📊 Fetched status breakdown');
    res.json(rows.map(row => ({
      name: row.status,
      value: Number(row.count),
      revenue: Number(row.revenue)
    })));
  } catch (err) {
    console.error('✗ Error fetching status analytics:', err.message);
    res.status(500).json({ message: 'Failed to fetch status analytics', error: err.message });
  }
});

const startPort = Number(process.env.PORT || 4000);
const maxAttempts = 5;

function startServer(port, attempt = 1) {
  const server = app.listen(port, async () => {
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Backend server started on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`📊 API health: http://localhost:${port}/api/health`);
    console.log('='.repeat(60) + '\n');
    
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('\n' + '!'.repeat(60));
      console.error('⚠️  CRITICAL: Database connection failed!');
      console.error('❌ Make sure MySQL is running and .env credentials are correct:');
      console.error(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   DB_PORT: ${process.env.DB_PORT || 3306}`);
      console.error(`   DB_USER: ${process.env.DB_USER || 'root'}`);
      console.error(`   DB_NAME: ${process.env.DB_NAME || 'halleyx'}`);
      console.error('❌ API calls will return 500 errors until fixed!');
      console.error('!'.repeat(60) + '\n');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is in use. Trying ${nextPort} (attempt ${attempt + 1}/${maxAttempts})...`);
      setTimeout(() => startServer(nextPort, attempt + 1), 200);
    } else {
      console.error('❌ Failed to start backend server:', err);
      process.exit(1);
    }
  });
}

startServer(startPort);
