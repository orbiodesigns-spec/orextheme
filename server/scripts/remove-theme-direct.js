require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function main() {
    console.log("--- Removing Theme from Database ---");

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
        console.log(`Deleting layout: ${id}...`);

        const [result] = await pool.query(`DELETE FROM layouts WHERE id = ?`, [id]);

        console.log(`✅ Success! Layout deleted.`);
        console.log(result);

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await pool.end();
    }
}

main();
