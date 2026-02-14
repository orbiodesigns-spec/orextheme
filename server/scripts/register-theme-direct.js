require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function main() {
    console.log("--- Direct Theme Registration (Fixed Schema) ---");

    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '12345678',
        database: 'stream_theme_master',
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0
    });

    try {
        const id = 'news-theme';
        const name = 'News Room Live';
        const description = 'Professional news ticker theme. Breaking news style.';
        const thumbnail_url = 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)';
        const is_active = true;
        const display_order = 3;
        const is_featured = false;
        const preview_url = '';

        console.log(`Registering layout: ${name} (${id})...`);

        // Removed base_price as it does not exist in the table
        const [result] = await pool.query(`
            INSERT INTO layouts (id, name, description, thumbnail_url, preview_url, is_active, is_featured, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                name=VALUES(name), 
                description=VALUES(description), 
                thumbnail_url=VALUES(thumbnail_url), 
                is_active=VALUES(is_active),
                display_order=VALUES(display_order)
        `, [id, name, description, thumbnail_url, preview_url, is_active, is_featured, display_order]);

        console.log(`✅ Success! Layout registered/updated.`);
        console.log(result);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
}

main();
