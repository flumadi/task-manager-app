import { Hono } from "https://esm.sh/hono@3.11.7";
import { readFile, serveFile } from "https://esm.town/v/std/utils@85-main/index.ts";
import { runMigrations } from "./database/migrations.ts";
import auth from "./routes/auth.ts";
import tasks from "./routes/tasks.ts";

const app = new Hono();

// Unwrap Hono errors to see original error details
app.onError((err, c) => {
  throw err;
});

// Initialize database
await runMigrations();

// API routes
app.route("/api/auth", auth);
app.route("/api/tasks", tasks);

// Serve static files
app.get("/frontend/*", c => serveFile(c.req.path, import.meta.url));
app.get("/shared/*", c => serveFile(c.req.path, import.meta.url));

// Serve main page
app.get("/", async c => {
  let html = await readFile("/frontend/index.html", import.meta.url);
  return c.html(html);
});

// Catch-all for SPA routing
app.get("*", async c => {
  let html = await readFile("/frontend/index.html", import.meta.url);
  return c.html(html);
});

export default app.fetch;