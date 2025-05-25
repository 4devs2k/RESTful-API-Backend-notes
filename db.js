import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Fehler bei der DB-Verbindung:", err.message);
    process.exit(1);
  }
  console.log("✅ Verbunden mit MariaDB");

  // Optional: Tabelle automatisch erstellen
  db.query(
    `CREATE TABLE IF NOT EXISTS todos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      created BIGINT,
      updated BIGINT,
      completed TINYINT
    )`,
    (err) => {
      if (err) {
        console.error("Fehler beim Erstellen der Tabelle:", err.message);
      } else {
        console.log("Tabelle 'todos' ist bereit.");
      }
    }
  );
});

export { db };
