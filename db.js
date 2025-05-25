// import sqlite3 from "sqlite3";

// // Daten werden in die Datei "todo.db" persistiert
// const db = new sqlite3.Database("todo.db", (err) => { // ← Hier wird die Datei verwendet
//   if (err) {
//     throw err;
//   }

//   console.log("Connected to the SQLite database.");

//   // Tabelle erstellen (falls nicht vorhanden)
//   db.run(
//     `CREATE TABLE IF NOT EXISTS todos (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       description TEXT,
//       created INTEGER,
//       updated INTEGER,
//       completed INTEGER
//     )`,
//     (err) => {
//       if (err) {
//         return console.error("Error creating table:", err.message);
//       }
//       console.log("Table 'todos' ready");

//       // Prüfen ob die Tabelle leer ist
//       db.get("SELECT COUNT(*) AS count FROM todos", (err, row) => {
//         if (err) {
//           return console.error("Error checking table count:", err.message);
//         }

//         // Nur einfügen wenn keine Einträge vorhanden sind
//         if (row.count === 0) {
//           const insert = `
//             INSERT INTO todos
//             (title, description, created, updated, completed)
//             VALUES (?, ?, ?, ?, ?)
//           `;

//           const defaultTodos = [
//             {
//               title: "Einkaufen gehen",
//               description: "Wir brauchen unbedingt mehr Gurken.",
//               completed: 1,
//             },
//             {
//               title: "Haus putzen",
//               description: "Der Rasen muss weg.",
//               completed: 0,
//             },
//             {
//               title: "Arbeit finden",
//               description: "Besser werden und bewerben.",
//               completed: 1,
//             },
//           ];

//           defaultTodos.forEach((todo, index) => {
//             const timestamp = Date.now();
//             db.run(
//               insert,
//               [
//                 todo.title,
//                 todo.description,
//                 timestamp,
//                 timestamp,
//                 todo.completed,
//               ],
//               (err) => {
//                 if (err) {
//                   console.error(
//                     `Error inserting todo ${index + 1}:`,
//                     err.message
//                   );
//                 } else {
//                   console.log(`Inserted default todo: "${todo.title}"`);
//                 }
//               }
//             );
//           });
//         } else {
//           console.log("Table already contains data - skipping default inserts");
//         }
//       });
//     }
//   );
// });

// // Sauberes Schließen der DB beim Beenden
// process.on("SIGINT", () => {
//   db.close((err) => {
//     if (err) {
//       console.error("Error closing database:", err.message);
//     } else {
//       console.log("Database connection closed");
//     }
//     process.exit(0);
//   });
// });

// export { db };

import sqlite3 from "sqlite3";

// Daten werden in die Datei "todo.db" persistiert
const db = new sqlite3.Database("todo.db", (err) => {
  if (err) {
    throw err;
  }

  console.log("Connected to the SQLite database.");

  // Tabelle erstellen (falls nicht vorhanden)
  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created INTEGER,
      updated INTEGER,
      completed INTEGER
    )`,
    (err) => {
      if (err) {
        return console.error("Error creating table:", err.message);
      }
      console.log("Table 'todos' ready");
    }
  );
});

// Sauberes Schließen der DB beim Beenden
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed");
    }
    process.exit(0);
  });
});

export { db };
