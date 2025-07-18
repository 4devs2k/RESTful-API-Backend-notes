import mysql from "mysql2/promise"; // Use the promise-based API
import dotenv from "dotenv";
dotenv.config();
console.log("👉 Aktive DB_HOST:", process.env.DB_HOST);

// Debug-Log: Zeige geladene DB-Konfiguration
console.log("» Lese DB-Konfig aus env:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection and create table if needed
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Verbunden mit MariaDB");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created BIGINT,
        updated BIGINT,
        completed TINYINT
      )
    `);
    console.log("Tabelle 'todos' ist bereit.");
  } catch (err) {
    console.error("Datenbankfehler:", err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

initializeDatabase();

export { pool };
