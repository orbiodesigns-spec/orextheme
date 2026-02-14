const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('DB_PASS Loaded:', process.env.DB_PASS ? 'YES (' + process.env.DB_PASS.length + ' chars)' : 'NO');
const mysql = require('mysql2/promise');
const axios = require('axios'); // I'll use axios if available, or fetch
const bcrypt = require('bcryptjs');

// Configuration
const TEST_PORT = 5001;
const API_URL = `http://127.0.0.1:${TEST_PORT}/api`;
console.log("Node Version:", process.version);
const ADMIN_CREDENTIALS = { username: 'test_admin', password: 'password123' };
const USER_CREDENTIALS = { email: 'test_user@example.com', password: 'password123' };

// Database Config from env or hardcoded fallback for local dev
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'stream_theme_master'
};

async function setupData() {
    console.log("Setting up test data...");
    console.log("DB Config:", { ...dbConfig, password: '***' });
    try {
        const conn = await mysql.createConnection(dbConfig);
        console.log("Connected to DB!");

        // 1. Setup Admin
        const adminHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);
        await conn.query(`DELETE FROM admins WHERE username = ?`, [ADMIN_CREDENTIALS.username]);
        await conn.query(`INSERT INTO admins (username, password_hash) VALUES (?, ?)`, [ADMIN_CREDENTIALS.username, adminHash]);

        // 2. Setup User
        const userHash = await bcrypt.hash(USER_CREDENTIALS.password, 10);
        await conn.query(`DELETE FROM users WHERE email = ?`, [USER_CREDENTIALS.email]);
        // Create verified user
        await conn.query(`INSERT INTO users (full_name, email, password_hash, is_email_verified) VALUES (?, ?, ?, ?)`,
            ['Test User', USER_CREDENTIALS.email, userHash, true]);

        // 3. Ensure Products and Plans exist for testing
        // Checks if specific IDs exist or insert them
        await conn.query(`INSERT IGNORE INTO subscription_plans (id, name, price, duration_months) VALUES ('test_plan', 'Test Plan', 1000.00, 1)`);
        await conn.query(`INSERT IGNORE INTO products (id, name, price, file_url) VALUES (999, 'Test Product', 500.00, 'http://test.com')`);

        // 4. Clean previous coupons
        await conn.query(`DELETE FROM coupons WHERE code IN ('TEST_PLAN_50', 'TEST_PROD_100')`);

        await conn.end();
        console.log("Test data setup complete.");
    } catch (err) {
        console.error("Setup Data Failed:", err);
        process.exit(1);
    }
}

async function runTests() {
    // Start Server
    process.env.PORT = TEST_PORT;
    console.log("Starting Server on port " + TEST_PORT + "...");
    try {
        const server = require('./server');
    } catch (e) {
        console.error("Failed to require server:", e);
        process.exit(1);
    }

    // Wait for server to start
    console.log("Waiting 5s for server...");
    await new Promise(r => setTimeout(r, 5000));

    try {
        console.log("\n--- STARTING TESTS ---\n");

        // 0. Health Check
        console.log("0. Health Check...");
        try {
            const healthRes = await fetch(`${API_URL}/health`);
            console.log("   Health Status:", healthRes.status);
            if (!healthRes.ok) console.log("   Health body:", await healthRes.text());
        } catch (e) {
            console.error("   Health Check Connection Failed:", e.message);
            throw new Error("Server not reachable");
        }

        // 1. Admin Login
        console.log("1. Admin Login...");
        const adminRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ADMIN_CREDENTIALS)
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminData)}`);
        const adminToken = adminData.token;
        console.log("   Admin logged in.");

        // 2. Create Coupons
        console.log("2. Creating Coupons...");

        // Plan Coupon: 50% Off 'test_plan'
        const c1 = await fetch(`${API_URL}/admin/coupons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                code: 'TEST_PLAN_50',
                discount_type: 'PERCENT',
                discount_value: 50,
                plan_id: 'test_plan'
            })
        });
        if (!c1.ok) throw new Error(`Failed to create plan coupon`);

        // Product Coupon: 100 OFF '999' (Product)
        const c2 = await fetch(`${API_URL}/admin/coupons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                code: 'TEST_PROD_100',
                discount_type: 'FIXED',
                discount_value: 100,
                product_id: 999
            })
        });
        if (!c2.ok) throw new Error(`Failed to create product coupon`);
        console.log("   Coupons created.");

        // 3. User Login
        console.log("3. User Login...");
        const userRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(USER_CREDENTIALS)
        });
        const userData = await userRes.json();
        if (!userRes.ok) throw new Error(`User login failed: ${JSON.stringify(userData)}`);
        const userToken = userData.token;
        // Cookie is set but we use token in headers for simplicity if supported, or we need to manage cookies.
        // The middleware checks 'Authorization: Bearer' OR cookie.
        const authHeader = { 'Authorization': `Bearer ${userToken}`, 'Content-Type': 'application/json' };
        console.log("   User logged in.");

        // 4. Verify Plan Coupon
        console.log("4. Verifying Plan Coupon...");
        const v1 = await fetch(`${API_URL}/coupons/verify`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({ code: 'TEST_PLAN_50', planId: 'test_plan' })
        });
        const v1Data = await v1.json();
        if (!v1Data.discount_value || v1Data.discount_value !== 50) throw new Error(`Plan coupon verification failed: ${JSON.stringify(v1Data)}`);
        console.log("   Plan coupon verified: 50% off");

        // 5. Create Order (Plan)
        console.log("5. Creating Subscription Order with Coupon...");
        const o1 = await fetch(`${API_URL}/payment/create-order`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({
                planId: 'test_plan',
                customerPhone: '1234567890',
                couponCode: 'TEST_PLAN_50'
            })
        });
        const o1Data = await o1.json();
        // Price was 1000. 50% off -> 500. Razorpay expects paise -> 50000.
        if (o1Data.amount !== 50000) throw new Error(`Order amount incorrect. Expected 50000, got ${o1Data.amount}`);
        console.log("   Order created with correct discounted amount (500.00).");

        // 6. Verify Product Coupon
        console.log("6. Verifying Product Coupon...");
        const v2 = await fetch(`${API_URL}/coupons/verify`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({ code: 'TEST_PROD_100', productId: 999 })
        });
        const v2Data = await v2.json();
        if (v2Data.discount_value !== 100) throw new Error(`Product coupon verification failed`);
        console.log("   Product coupon verified: 100 OFF");

        // 7. Create Order (Product)
        console.log("7. Creating Product Order with Coupon...");
        const o2 = await fetch(`${API_URL}/payment/create-product-order`, {
            method: 'POST',
            headers: authHeader,
            body: JSON.stringify({
                productId: 999,
                contact: '1234567890',
                couponCode: 'TEST_PROD_100'
            })
        });
        const o2Data = await o2.json();
        // Price was 500. 100 off -> 400. Razorpay -> 40000.
        if (o2Data.amount !== 40000) throw new Error(`Product Order amount incorrect. Expected 40000, got ${o2Data.amount}`);
        console.log("   Product Order created with correct discounted amount (400.00).");

        console.log("\n✅ ALL TESTS PASSED SUCCESSFULLY! ✅");

    } catch (err) {
        console.error("\n❌ TEST FAILED ❌");
        console.error(err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run
setupData().then(runTests).catch(console.error);
