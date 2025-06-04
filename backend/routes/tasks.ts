import { Hono } from "https://esm.sh/hono@3.11.7";
import { getCookie } from "https://esm.sh/hono@3.11.7/cookie";
import type { TaskRequest, ApiResponse, Task } from "../../shared/types.ts";
import {
  getSessionByToken,
  createTask,
  getTasksByUserId,
  updateTaskCompletion,
  deleteTask
} from "../database/queries.ts";

const tasks = new Hono();

// Middleware to check authentication
async function requireAuth(c: any, next: any) {
  const token = getCookie(c, "auth_token");
  if (!token) {
    return c.json<ApiResponse>({
      success: false,
      message: "Authentication required"
    }, 401);
  }

  const session = await getSessionByToken(token);
  if (!session) {
    return c.json<ApiResponse>({
      success: false,
      message: "Invalid or expired session"
    }, 401);
  }

  c.set("userId", session.user_id);
  await next();
}

// Apply auth middleware to all routes
tasks.use("*", requireAuth);

// Get all tasks for the authenticated user
tasks.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const userTasks = await getTasksByUserId(userId);

    return c.json<ApiResponse<Task[]>>({
      success: true,
      message: "Tasks retrieved successfully",
      data: userTasks
    });
  } catch (error) {
    console.error("Error getting tasks:", error);
    return c.json<ApiResponse>({
      success: false,
      message: "Failed to retrieve tasks"
    }, 500);
  }
});

// Create a new task
tasks.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body: TaskRequest = await c.req.json();
    const { title, description = "", priority = "medium" } = body;

    if (!title || title.trim() === "") {
      return c.json<ApiResponse>({
        success: false,
        message: "Task title is required"
      }, 400);
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return c.json<ApiResponse>({
        success: false,
        message: "Priority must be low, medium, or high"
      }, 400);
    }

    const task = await createTask(userId, title.trim(), description.trim(), priority);
    if (!task) {
      return c.json<ApiResponse>({
        success: false,
        message: "Failed to create task"
      }, 500);
    }

    return c.json<ApiResponse<Task>>({
      success: true,
      message: "Task created successfully",
      data: task
    }, 201);
  } catch (error) {
    console.error("Error creating task:", error);
    return c.json<ApiResponse>({
      success: false,
      message: "Failed to create task"
    }, 500);
  }
});

// Update task completion status
tasks.patch("/:id/complete", async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = parseInt(c.req.param("id"));
    const { completed } = await c.req.json();

    if (isNaN(taskId)) {
      return c.json<ApiResponse>({
        success: false,
        message: "Invalid task ID"
      }, 400);
    }

    if (typeof completed !== "boolean") {
      return c.json<ApiResponse>({
        success: false,
        message: "Completed status must be a boolean"
      }, 400);
    }

    const success = await updateTaskCompletion(taskId, userId, completed);
    if (!success) {
      return c.json<ApiResponse>({
        success: false,
        message: "Failed to update task or task not found"
      }, 404);
    }

    return c.json<ApiResponse>({
      success: true,
      message: "Task updated successfully"
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return c.json<ApiResponse>({
      success: false,
      message: "Failed to update task"
    }, 500);
  }
});

// Delete a task
tasks.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const taskId = parseInt(c.req.param("id"));

    if (isNaN(taskId)) {
      return c.json<ApiResponse>({
        success: false,
        message: "Invalid task ID"
      }, 400);
    }

    const success = await deleteTask(taskId, userId);
    if (!success) {
      return c.json<ApiResponse>({
        success: false,
        message: "Failed to delete task or task not found"
      }, 404);
    }

    return c.json<ApiResponse>({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return c.json<ApiResponse>({
      success: false,
      message: "Failed to delete task"
    }, 500);
  }
});

export default tasks;