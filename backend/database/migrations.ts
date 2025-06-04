import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";

export async function runMigrations() {
  // Users table
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS users_v1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS tasks_v1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT FALSE,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users_v1 (id) ON DELETE CASCADE
    )
  `);

  // Sessions table for simple token management
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS sessions_v1 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users_v1 (id) ON DELETE CASCADE
    )
  `);

  console.log("Database migrations completed successfully");
}