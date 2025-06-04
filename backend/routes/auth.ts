import { Hono } from "https://esm.sh/hono@3.11.7";
import { getCookie, setCookie, deleteCookie } from "https://esm.sh/hono@3.11.7/cookie";
import type { AuthRequest, AuthResponse } from "../../shared/types.ts";
import {
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  createSession,
  getSessionByToken,
  deleteSession
} from "../database/queries.ts";

const auth = new Hono();

// Simple password hashing (in production, use bcrypt or similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt_secret_key");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

function generateToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36);
}

// Register endpoint
auth.post("/register", async (c) => {
  try {
    const body: AuthRequest = await c.req.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return c.json<AuthResponse>({
        success: false,
        message: "Username, email, and password are required"
      }, 400);
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return c.json<AuthResponse>({
        success: false,
        message: "Username already exists"
      }, 400);
    }

    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return c.json<AuthResponse>({
        success: false,
        message: "Email already registered"
      }, 400);
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const user = await createUser(username, email, passwordHash);

    if (!user) {
      return c.json<AuthResponse>({
        success: false,
        message: "Failed to create user"
      }, 500);
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await createSession(user.id, token, expiresAt);

    // Set cookie
    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return c.json<AuthResponse>({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json<AuthResponse>({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Login endpoint
auth.post("/login", async (c) => {
  try {
    const body: AuthRequest = await c.req.json();
    const { username, password } = body;

    if (!username || !password) {
      return c.json<AuthResponse>({
        success: false,
        message: "Username and password are required"
      }, 400);
    }

    // Get user
    const user = await getUserByUsername(username);
    if (!user) {
      return c.json<AuthResponse>({
        success: false,
        message: "Invalid username or password"
      }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json<AuthResponse>({
        success: false,
        message: "Invalid username or password"
      }, 401);
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await createSession(user.id, token, expiresAt);

    // Set cookie
    setCookie(c, "auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return c.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json<AuthResponse>({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Logout endpoint
auth.post("/logout", async (c) => {
  try {
    const token = getCookie(c, "auth_token");
    if (token) {
      await deleteSession(token);
    }
    
    deleteCookie(c, "auth_token");
    
    return c.json<AuthResponse>({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json<AuthResponse>({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

// Get current user endpoint
auth.get("/me", async (c) => {
  try {
    const token = getCookie(c, "auth_token");
    if (!token) {
      return c.json<AuthResponse>({
        success: false,
        message: "Not authenticated"
      }, 401);
    }

    const session = await getSessionByToken(token);
    if (!session) {
      deleteCookie(c, "auth_token");
      return c.json<AuthResponse>({
        success: false,
        message: "Invalid or expired session"
      }, 401);
    }

    const user = await getUserById(session.user_id);
    if (!user) {
      return c.json<AuthResponse>({
        success: false,
        message: "User not found"
      }, 404);
    }

    return c.json<AuthResponse>({
      success: true,
      message: "User authenticated",
      user
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return c.json<AuthResponse>({
      success: false,
      message: "Internal server error"
    }, 500);
  }
});

export default auth;