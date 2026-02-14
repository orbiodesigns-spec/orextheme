const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuration
const TEST_PORT = 5001;
const API_URL = `http://127.0.0.1:${TEST_PORT}/api`;
const ADMIN_CREDENTIALS = { username: 'test_admin', password: 'password123' };

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'stream_theme_master'
};

async function runDebug() {
    process.env.PORT = TEST_PORT;
    const server = require('./server');
    await new Promise(r => setTimeout(r, 2000)); // Wait for server

    console.log("--- DEBUGGING PLAN COUPON ---");

    try {
        // 1. Login Admin
        const adminRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            body: JSON.stringify(ADMIN_CREDENTIALS),
            headers: { 'Content-Type': 'application/json' }
        });
        const { token } = await adminRes.json();
        console.log("Admin Token:", token ? "OK" : "FAILED");

        // 2. Clear Old Coupon
        const conn = await mysql.createConnection(dbConfig);
        await conn.query("DELETE FROM coupons WHERE code='DEBUG_MONTHLY'");
        await conn.end();

        // 3. Create Plan Coupon
        // Assuming 'monthly' plan exists (from schema seed)
        console.log("Creating Coupon 'DEBUG_MONTHLY' for plan_id='monthly'...");
        const createRes = await fetch(`${API_URL}/admin/coupons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                code: 'DEBUG_MONTHLY',
                discount_type: 'PERCENT',
                discount_value: 50,
                plan_id: 'monthly'
            })
        });
        console.log("Create Status:", createRes.status, await createRes.text());

        // 4. Verify Coupon
        console.log("Verifying 'DEBUG_MONTHLY' with planId='monthly'...");
        const verifyRes = await fetch(`${API_URL}/coupons/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: 'DEBUG_MONTHLY',
                planId: 'monthly'
            })
        });
        const verifyJson = await verifyRes.json();
        console.log("Verify Result:", JSON.stringify(verifyJson, null, 2));

        if (!verifyJson.success) throw new Error("Verification Failed");

        console.log("SUCCESS: Backend logic handles plan coupons correctly.");

    } catch (e) {
        console.error("DEBUG FAILED:", e);
    } finally {
        process.exit(0);
    }
}

runDebug();
