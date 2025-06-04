import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";
import type { User, Task } from "../../shared/types.ts";

// User queries
export async function createUser(username: string, email: string, passwordHash: string): Promise<User | null> {
  try {
    const result = await sqlite.execute(
      `INSERT INTO users_v1 (username, email, password_hash) VALUES (?, ?, ?) RETURNING *`,
      [username, email, passwordHash]
    );
    return result.rows[0] as User;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  try {
    const result = await sqlite.execute(
      `SELECT * FROM users_v1 WHERE username = ?`,
      [username]
    );
    return result.rows[0] as (User & { password_hash: string }) || null;
  } catch (error) {
    console.error("Error getting user by username:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sqlite.execute(
      `SELECT id, username, email, created_at FROM users_v1 WHERE email = ?`,
      [email]
    );
    return result.rows[0] as User || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await sqlite.execute(
      `SELECT id, username, email, created_at FROM users_v1 WHERE id = ?`,
      [id]
    );
    return result.rows[0] as User || null;
  } catch (error) {
    console.error("Error getting user by id:", error);
    return null;
  }
}

// Session queries
export async function createSession(userId: number, token: string, expiresAt: string): Promise<boolean> {
  try {
    await sqlite.execute(
      `INSERT INTO sessions_v1 (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, token, expiresAt]
    );
    return true;
  } catch (error) {
    console.error("Error creating session:", error);
    return false;
  }
}

export async function getSessionByToken(token: string): Promise<{ user_id: number; expires_at: string } | null> {
  try {
    const result = await sqlite.execute(
      `SELECT user_id, expires_at FROM sessions_v1 WHERE token = ? AND expires_at > datetime('now')`,
      [token]
    );
    return result.rows[0] as { user_id: number; expires_at: string } || null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    await sqlite.execute(`DELETE FROM sessions_v1 WHERE token = ?`, [token]);
    return true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
}

// Task queries
export async function createTask(userId: number, title: string, description: string, priority: string): Promise<Task | null> {
  try {
    const result = await sqlite.execute(
      `INSERT INTO tasks_v1 (user_id, title, description, priority) VALUES (?, ?, ?, ?) RETURNING *`,
      [userId, title, description, priority]
    );
    return result.rows[0] as Task;
  } catch (error) {
    console.error("Error creating task:", error);
    return null;
  }
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  try {
    const result = await sqlite.execute(
      `SELECT * FROM tasks_v1 WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows as Task[];
  } catch (error) {
    console.error("Error getting tasks:", error);
    return [];
  }
}

export async function updateTaskCompletion(taskId: number, userId: number, completed: boolean): Promise<boolean> {
  try {
    await sqlite.execute(
      `UPDATE tasks_v1 SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
      [completed, taskId, userId]
    );
    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    return false;
  }
}

export async function deleteTask(taskId: number, userId: number): Promise<boolean> {
  try {
    await sqlite.execute(
      `DELETE FROM tasks_v1 WHERE id = ? AND user_id = ?`,
      [taskId, userId]
    );
    return true;
  } catch (error) {
    console.error("Error deleting task:", error);
    return false;
  }
}