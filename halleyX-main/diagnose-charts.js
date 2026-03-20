#!/usr/bin/env node

/**
 * Diagnostic script to check why charts aren't working
 */

import http from 'http';

const API_URL = 'http://localhost:4001'; // Changed from 4000 since backend started on 4001

function checkEndpoint(path) {
  return new Promise((resolve) => {
    http.get(`${API_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runDiagnostics() {
  console.log('\n📊 HalleyX Charts Diagnostic\n');
  console.log('='.repeat(60));
  
  // Check API health
  console.log('\n1️⃣  Checking Backend Health...');
  let result = await checkEndpoint('/health');
  if (result.error) {
    console.log('❌ Backend not responding. Make sure it\'s running on port 4001');
    return;
  } else if (result.status === 200) {
    console.log('✅ Backend is running:', result.data);
  }
  
  // Check database health
  console.log('\n2️⃣  Checking Database Connection...');
  result = await checkEndpoint('/api/health');
  if (result.status === 200) {
    console.log('✅ Database connected:', result.data);
  } else {
    console.log('❌ Database not connected:', result.data);
    console.log('   Check backend/.env for database credentials');
    return;
  }
  
  // Check orders data
  console.log('\n3️⃣  Checking Orders Data...');
  result = await checkEndpoint('/api/orders');
  if (result.status === 200) {
    console.log(`✅ Orders endpoint working. Found ${result.data.length} orders`);
    if (result.data.length === 0) {
      console.log('⚠️  WARNING: Database has NO orders!');
      console.log('   Charts need data to display. Add some test orders.');
    } else {
      console.log('   Sample order:', {
        id: result.data[0].id,
        product: result.data[0].product,
        status: result.data[0].status,
        totalAmount: result.data[0].totalAmount
      });
    }
  } else {
    console.log('❌ Orders endpoint failed:', result.data);
  }
  
  // Check analytics endpoints
  console.log('\n4️⃣  Checking Analytics Endpoints...');
  
  // Chart data
  result = await checkEndpoint('/api/analytics/chart/product');
  if (result.status === 200) {
    console.log(`✅ Chart analytics working. Data points: ${result.data.length}`);
    if (result.data.length > 0) {
      console.log('   Sample:', result.data[0]);
    }
  } else {
    console.log('❌ Chart analytics failed:', result.data?.message || result.error);
  }
  
  // Status breakdown
  result = await checkEndpoint('/api/analytics/status');
  if (result.status === 200) {
    console.log(`✅ Status analytics working. Data points: ${result.data.length}`);
  } else {
    console.log('❌ Status analytics failed');
  }
  
  // Summary stats
  result = await checkEndpoint('/api/analytics/summary');
  if (result.status === 200) {
    console.log('✅ Summary stats working:', {
      totalOrders: result.data.totalOrders,
      totalRevenue: result.data.totalRevenue
    });
  } else {
    console.log('❌ Summary stats failed');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnostic Complete\n');
  console.log('🔧 Next Steps:');
  console.log('1. Start frontend: npm run dev');
  console.log('2. Open http://localhost:3000');
  console.log('3. Check browser console (F12) for any errors');
  console.log('4. If charts still don\'t work, database may be missing data\n');
}

runDiagnostics();
