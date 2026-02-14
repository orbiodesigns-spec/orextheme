const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// 21. GET LAYOUTS (Public)
router.get('/layouts', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, description, thumbnail_url FROM layouts WHERE is_active = TRUE ORDER BY display_order");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUBLIC: Submit Support Query
router.post('/support', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        await db.query(
            "INSERT INTO support_queries (name, email, subject, message) VALUES (?, ?, ?, ?)",
            [name, email, subject, message]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: Get Subscription Plans (Public)
router.get('/subscription-plans', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, description, duration_months, price, display_order FROM subscription_plans WHERE is_active = TRUE ORDER BY display_order"
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUBLIC: Get All Active Products
router.get('/products', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, description, price, thumbnail_url, file_type, created_at FROM products WHERE is_active = TRUE ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUBLIC: Get Single Product
router.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT id, name, description, price, thumbnail_url, file_type, created_at FROM products WHERE id = ? AND is_active = TRUE", [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 24. PUBLIC LAYOUT VIEW (OBS)
router.get('/public/:token', async (req, res) => {
    const { token } = req.params;
    const { sessionId } = req.query;

    try {
        let layoutId, userId, isExpired = false;

        // 1. Check Subscriptions (Paid Access)
        const [subs] = await db.query(
            "SELECT * FROM subscriptions WHERE public_token = ? AND status = 'ACTIVE'",
            [token]
        );

        if (subs.length > 0) {
            const sub = subs[0];
            layoutId = sub.layout_id;
            userId = sub.user_id;

            if (new Date(sub.expiry_date) < new Date()) {
                return res.json({ isExpired: true });
            }
        } else {
            // 2. Check Customizations (Trial Access)
            const [themes] = await db.query("SELECT * FROM theme_customizations WHERE public_token = ?", [token]);

            if (themes.length === 0) {
                return res.status(404).json({ error: 'Layout invalid or expired' });
            }

            const theme = themes[0];
            layoutId = theme.layout_id;
            userId = theme.user_id;

            // Verify User Trial/Access
            /* 
            // BYPASS for Dev/Testing: Allow access if Config exists
            const [users] = await db.query("SELECT trial_expiry FROM users WHERE id = ?", [userId]);
            const user = users[0];
            const trialActive = user.trial_expiry && new Date(user.trial_expiry) > new Date();

            if (!trialActive) {
                const [activeSubs] = await db.query(
                    "SELECT * FROM subscriptions WHERE user_id = ? AND layout_id = ? AND status='ACTIVE' AND expiry_date > NOW()",
                    [userId, layoutId]
                );
                if (activeSubs.length === 0) {
                    return res.json({ isExpired: true });
                }
            }
            */
        }

        // 3. Get Configuration & Handle Session
        const [configs] = await db.query(
            "SELECT config, active_session_id FROM theme_customizations WHERE user_id = ? AND layout_id = ?",
            [userId, layoutId]
        );

        let config = null;
        if (configs.length > 0) {
            config = configs[0].config;

            // Session Lock Logic
            if (sessionId) {
                await db.query(
                    "UPDATE theme_customizations SET active_session_id = ?, last_heartbeat = NOW() WHERE user_id = ? AND layout_id = ?",
                    [sessionId, userId, layoutId]
                );
            }
        }

        res.json({
            layoutId: layoutId,
            config: config,
            isExpired: false
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/public/heartbeat', async (req, res) => {
    const { token, sessionId } = req.body;
    try {
        const [subs] = await db.query("SELECT user_id, layout_id FROM subscriptions WHERE public_token = ?", [token]);
        if (subs.length > 0) {
            await db.query(
                "UPDATE theme_customizations SET last_heartbeat = NOW() WHERE user_id = ? AND layout_id = ? AND active_session_id = ?",
                [subs[0].user_id, subs[0].layout_id, sessionId]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUBLIC: Get Global Settings
router.get('/settings', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM settings");
        const settings = {};
        rows.forEach(row => {
            settings[row.key_name] = row.value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUBLIC: Get Installation Videos
router.get('/installation-videos', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM installation_videos ORDER BY display_order");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: Verify Coupon
router.post('/coupons/verify', async (req, res) => {
    const { code, productId, planId, layoutId } = req.body;
    try {
        const [coupons] = await db.query("SELECT * FROM coupons WHERE code = ?", [code]);
        if (coupons.length === 0) return res.status(404).json({ error: 'Invalid coupon code' });

        const coupon = coupons[0];

        // Check Expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ error: 'Coupon expired' });
        }

        // Check Max Uses
        if (coupon.max_uses !== -1 && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        // Check Applicability
        let isValid = true;

        // 1. If coupon is restricted to a Specific Layout
        if (coupon.layout_id && coupon.layout_id !== layoutId) {
            // If the request is for a plan/product, this layout coupon might not apply unless we handle that logic users side
            // But strictly, if coupon has layout_id, it only works for that layout.
            // If we are buying a PLAN/PRODUCT, layout_id coupon shouldn't work.
            if (layoutId) isValid = false; // Mismatch
            else isValid = false; // Buying something else
        }

        // 2. If coupon is restricted to a Specific Plan
        if (coupon.plan_id && coupon.plan_id !== planId) {
            isValid = false;
        }

        // 3. If coupon is restricted to a Specific Product
        if (coupon.product_id && Number(coupon.product_id) !== Number(productId)) {
            isValid = false;
        }

        if (!isValid) {
            return res.status(400).json({ error: 'Coupon not applicable to this item' });
        }

        res.json({
            success: true,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            code: coupon.code
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
