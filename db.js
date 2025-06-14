// import mysql from "mysql2";
import mysql from "mysql2/promise"; // Use the promise-based API
import dotenv from "dotenv";
dotenv.config();

/**
 * Wenn du möchtest, kann ich dir den db.js so umbauen,
 * dass er direkt ein Pool-Objekt exportiert. Sag einfach Bescheid!
 */

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// db.connect((err) => {
//   if (err) {
//     console.error("Fehler bei der DB-Verbindung:", err.message);
//     process.exit(1);
//   }
//   console.log("✅ Verbunden mit MariaDB");

//   // Optional: Tabelle automatisch erstellen
//   db.query(
//     `CREATE TABLE IF NOT EXISTS todos (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       title TEXT NOT NULL,
//       description TEXT,
//       created BIGINT,
//       updated BIGINT,
//       completed TINYINT
//     )`,
//     (err) => {
//       if (err) {
//         console.error("Fehler beim Erstellen der Tabelle:", err.message);
//       } else {
//         console.log("Tabelle 'todos' ist bereit.");
//       }
//     }
//   );
// });

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
// export { db };
