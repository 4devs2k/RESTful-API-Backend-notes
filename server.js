import express from "express";
import { pool } from "./db.js";
// import { db } from "./db.js";
import cors from "cors";

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(express.json()); // JSON-Daten verarbeiten
app.use(cors()); // Cross-Origin Resource Sharing aktivieren
// app.use(cors({
//   origin: 'https://restful-api-notes.dev2k.org',
//   methods: ['GET','POST','PUT','DELETE']
// }));

// ==================== BASISROUTE ====================
app.get("/api", (req, res) => {
  res.json({ message: "Willkommen bei deiner RESTful API!" });
});

// ==================== ALLE TODOS LADEN ====================
app.get("/api/todos", async (req, res) => {
  try {
    const sql = `SELECT * FROM todos ORDER BY completed ASC, updated DESC`;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EINZELNES TODO LADEN ====================
app.get("/api/todos/:id", async (req, res) => {
  try {
    const sql = `SELECT * FROM todos WHERE id = ?`;
    const [rows] = await pool.query(sql, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Noch die Input Validierung machen,
 * z. B. per Middleware (z. B. express-validator)
 * aktuell wird alles ungefiltert in die DB geschrieben.
 * 
 * created und updated als BIGINT:
 * Das ist in Ordnung, aber überlege, ob DATETIME oder TIMESTAMP
 * für spätere Auswertungen praktischer wäre. Aktuell verwendest du Unix-Timestamps mit Date.now().
 */

// ==================== TODO ERSTELLEN ====================
app.post("/api/todos", async (req, res) => {
  const { title, description = "", completed = 0 } = req.body;
  const timestamp = Date.now();

  try {
    const sql = `INSERT INTO todos (title, description, created, updated, completed) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.query(
      sql,
      [title, description, timestamp, timestamp, completed]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      description,
      created: timestamp,
      updated: timestamp,
      completed,
      message: "Todo erfolgreich erstellt",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// app.post("/api/todos", (req, res) => {
//   const { title, description = "", completed = 0 } = req.body;
//   const timestamp = Date.now();

//   const sql = `INSERT INTO todos (title, description, created, updated, completed) VALUES (?, ?, ?, ?, ?)`;
//   db.query(
//     sql,
//     [title, description, timestamp, timestamp, completed],
//     (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });

//       res.status(201).json({
//         id: result.insertId,
//         title,
//         description,
//         created: timestamp,
//         updated: timestamp,
//         completed,
//         message: "Todo erfolgreich erstellt",
//       });
//     }
//   );
// });

// ==================== TODO AKTUALISIEREN (PATCH) ====================
app.patch("/api/todos/:id", async (req, res) => {
  const { title, description, completed } = req.body;
  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push("title = COALESCE(?, title)");
    params.push(title);
  }
  if (description !== undefined) {
    updates.push("description = COALESCE(?, description)");
    params.push(description);
  }
  if (completed !== undefined) {
    updates.push("completed = COALESCE(?, completed)");
    params.push(completed);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Keine Update-Daten" });
  }

  updates.push("updated = ?");
  params.push(Date.now());

  params.push(req.params.id); // für WHERE-Klausel

  const sql = `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`;

  try {
    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }

    res.json({ message: "Todo aktualisiert", changes: result.affectedRows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TODO LÖSCHEN ====================
app.delete("/api/todos/:id", async (req, res) => {
  const sql = `DELETE FROM todos WHERE id = ?`;

  try {
    const [result] = await pool.query(sql, [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Todo mit ID " + req.params.id + " nicht gefunden",
      });
    }

    res.json({
      message: "Todo erfolgreich gelöscht",
      deletedId: req.params.id,
      changes: result.affectedRows,
    });
  } catch (err) {
    res.status(500).json({
      error: "Datenbankfehler: " + err.message,
    });
  }
});

// ==================== 404-FEHLERBEHANDLUNG ====================
app.use((req, res) => {
  res.status(404).json({
    message: "Route nicht gefunden",
  });
});

// ==================== SERVER STARTEN ====================
app.listen(HTTP_PORT, () => {
  console.log(`✅ Server läuft auf Port ${HTTP_PORT}`);
});
