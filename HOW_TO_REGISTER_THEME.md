# How to Register a New Theme (Direct Database Method)

This guide explains how to use the `register-orex-direct.js` script to add a new theme to your StreamTheme website. This script connects directly to your database to insert the theme details.

## 1. Prerequisites

- **Node.js**: Ensure Node.js is installed (you already have it).
- **Database**: Your MySQL server must be running (XAMPP/WAMP or local service).
- **Credentials**: The script calculates the database password. Ensure `server/database/schema.sql` or `.env` has the correct `DB_PASS`.

## 2. Using the Script

### Step A: Configure the Script
1. Open the file `server/scripts/register-orex-direct.js` in VS Code.
2. Locate the **Configuration Section** (lines 17-25):
   ```javascript
   const id = 'orex';          // Unique ID (lowercase, no spaces) -> MUST MATCH folder name in client/src/themes/
   const name = 'Orex';        // Display Name
   const description = '...';  // Short description
   // ...
   ```
3. Change these values for your **New Theme**.
   - **Important**: The `id` must exactly match the `id` in your `client/src/themes/[ThemeName]/index.ts` file.

### Step B: Run the Script
1. Open a terminal (Powershell or Command Prompt).
2. Navigate to the `server` directory:
   ```powershell
   cd 'c:\Users\Himanshu\Desktop\New folder\B22 Final Uploaded React\server'
   ```
3. Run the script using `node`:
   ```powershell
   node scripts/register-orex-direct.js
   ```

### Step C: Verify
1. Look for the "✅ Success!" message in the terminal.
2. Go to your **Admin Dashboard** in the browser.
3. Refresh the page. Your new theme should appear in the list!

---

## 3. Recommended Tutorials & Learning Resources

To understand how this script works and build your own, here are the best resources for the technologies used:

### 🟢 Node.js (The Runtime)
This script runs on Node.js.
- **Official Guide**: [Node.js Introduction](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- **YouTube Tutorial**: "Node.js Crash Course" by implementation channels like *Traversy Media* or *Net Ninja*.

### 🐬 MySQL & SQL (The Database)
The script uses SQL commands (`INSERT INTO layouts...`) to save data.
- **Concept**: Learn about `INSERT`, `UPDATE`, and `SELECT` statements.
- **Tutorial**: [W3Schools SQL Tutorial](https://www.w3schools.com/sql/) (Beginner friendly)
- **Library Used**: This script uses `mysql2`. Read the [mysql2 documentation](https://www.npmjs.com/package/mysql2) to see how to query a database from JavaScript.

### 💻 Command Line (The Interface)
- **Skill**: Navigating folders (`cd`), listing files (`ls` or `dir`), running programs (`node filename`).
- **Tutorial**: [Command Line for Beginners](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Understanding_client-side_tools/Command_line)

## 4. Troubleshooting common errors

- **"Module not found"**:
  - Solution: Run `npm install` in the `server` folder to install dependencies like `mysql2` and `dotenv`.
- **"Access denied for user 'root'@'localhost'"**:
  - Solution: Check your database password in the script (line 10) matches your actual MySQL password.
- **"Unknown column 'base_price'"**:
  - The script has been updated to remove `base_price` because your specific database schema doesn't use it. If you add it back, ensure the column exists in your database.
