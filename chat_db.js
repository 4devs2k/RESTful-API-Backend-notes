import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

// Core-Pool ohne Datenbank, für DDL-Zwecke
export const corePool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
});

// Map zum Speichern der Pools pro Guest-ID
export const guestPools = {};

// Initialisierung: Core-Pool testen (optional)
(async function testCoreConnection() {
  try {
    const conn = await corePool.getConnection();
    console.log("✅ Core-Pool verbunden mit MariaDB (DDL-Pool)");
    conn.release();
  } catch (err) {
    console.error("❌ Core-Pool Verbindungsfehler:", err);
    process.exit(1);
  }
})();

