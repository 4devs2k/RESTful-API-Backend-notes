import express from "express";
import { db } from "./db.js";
import cors from "cors";

const app = express();
const HTTP_PORT = process.env.PORT || 3000;

// Middleware muss ZUERST kommen!
app.use(express.json());

/**
 * CORS Middleware
 * Erlaubt den Zugriff von anderen Domains (z.B. localhost:5500)
 */
app.use(cors());

// Routes
app.get("/api", (req, res) => {
  res.json({ message: "Willkommen bei deiner RESTful API!" });
});

// =================================================================================

// GET all todos
app.get("/api/todos", (req, res) => {
  db.all("SELECT * FROM todos ORDER BY completed ASC, updated DESC", [], (err, rows) => {
  // db.all("SELECT * FROM todos", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET single todo
app.get("/api/todos/:id", (req, res) => {
  db.get("SELECT * FROM todos WHERE id = ?", [req.params.id], (err, row) => {
    // Hier wird die Datenbank abgefragt!
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "Todo nicht gefunden" });
    }
    res.json(row);
  });
});

// =================================================================================

app.post("/api/todos", (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push("Titel ist erforderlich");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const data = {
    title: req.body.title,
    description: req.body.description || "", // Fallback für leere Beschreibung
    created: Date.now(),
    updated: Date.now(),
    completed: req.body.completed || 0, // Default auf 0 (nicht erledigt)
  };

  const sql = `INSERT INTO todos (title, description, created, updated, completed) VALUES (?, ?, ?, ?, ?)`;

  /**
   * Diese Änderung wird persistent gespeichert:
   */
  db.run(
    sql,
    [data.title, data.description, data.created, data.updated, data.completed],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: this.lastID,
        ...data,
        message: "Todo erfolgreich erstellt",
      });
    }
  );
});

// =================================================================================

/**
 * PATCH update todo
 */
app.patch("/api/todos/:id", (req, res) => {
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
  params.push(Date.now(), req.params.id);

  const sql = `UPDATE todos SET ${updates.join(", ")} WHERE id = ?`;

  /**
   * Diese Änderung wird persistent gespeichert:
   */
  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ message: "Todo nicht gefunden" });
    res.json({ message: "Todo aktualisiert", changes: this.changes });
  });
});

// =================================================================================

/**
 * DELETE /api/todos/:id
 * Löscht ein Todo anhand der ID
 */
app.delete("/api/todos/:id", (req, res) => {
  db.run("DELETE FROM todos WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({
        error: "Datenbankfehler: " + err.message,
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({
        message: "Todo mit ID " + req.params.id + " nicht gefunden",
      });
    }
    res.json({
      message: "Todo erfolgreich gelöscht",
      deletedId: req.params.id,
      changes: this.changes,
    });
  });
});

// =================================================================================

// 404 Handler (muss ZULETZT kommen!)
app.use((req, res) => {
  res.status(404).json({
    message: "Route nicht gefunden",
  });
});

// Server starten bzw. Browser öffnen zugriff auf localhost:3000
app.listen(HTTP_PORT, () => {
  console.log(`Server läuft auf Port ${HTTP_PORT}`);
});
