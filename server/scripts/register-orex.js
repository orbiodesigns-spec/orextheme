require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function main() {
    console.log("--- Registering Orex Theme ---");

    // Use environment variables for DB connection if available, otherwise fallback (risk of mismatch if not careful)
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'stream_theme_master',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    });

    try {
        const id = 'orex';
        const name = 'Orex Theme';
        const description = 'A premium dark and red theme for professional broadcasts.';
        // Using a gradient similar to the theme colors
        const thumbnail_url = 'linear-gradient(135deg, #27272a 0%, #ef4444 100%)';
        const is_active = true;
        const display_order = 4; // Ensure it appears after others
        const is_featured = true;
        const preview_url = '';

        console.log(`Registering layout: ${name} (${id})...`);

        // Check if table supports these columns. 
        // Based on previous schema inspection, these columns exist.
        const [result] = await pool.query(`
            INSERT INTO layouts (id, name, description, thumbnail_url, preview_url, is_active, is_featured, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name=VALUES(name), 
                description=VALUES(description), 
                thumbnail_url=VALUES(thumbnail_url), 
                is_active=VALUES(is_active),
                is_featured=VALUES(is_featured),
                display_order=VALUES(display_order)
        `, [id, name, description, thumbnail_url, preview_url, is_active, is_featured, display_order]);

        console.log(`✅ Success! Orex Layout registered/updated.`);
        console.log(result);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
}

main();
