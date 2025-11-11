import { Request, Response } from "express";
import { AuthService } from "@services/auth/auth.service";

export class AuthController {
  /**
   * Login/Register endpoint - creates a new user or returns existing user tokens
   * POST /auth/login
   *
   * If userId is provided in body and exists, returns tokens for that user.
   * Otherwise creates a new user with a funny name and returns tokens.
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      // Get existing user or create new one
      const user = AuthService.getOrCreateUser(userId);

      // Generate tokens
      const { accessToken, refreshToken } = AuthService.generateTokens(user);

      // Set refresh token as httpOnly cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod", // Use secure in production (HTTPS)
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return access token and user info
      res.json({
        accessToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Refresh access token using refresh token from cookie
   * POST /auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: "Refresh token not found" });
        return;
      }

      // Verify refresh token
      const decoded = AuthService.verifyRefreshToken(refreshToken);

      if (!decoded) {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }

      // Get user
      const user = AuthService.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Generate new access token
      const accessToken = AuthService.generateAccessToken(user);

      // Return new access token
      res.json({
        accessToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Logout endpoint - invalidates refresh token
   * POST /auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        // Invalidate refresh token
        AuthService.invalidateRefreshToken(refreshToken);
      }

      // Clear cookie
      res.clearCookie("refreshToken");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Verify access token
   * GET /auth/verify
   * Headers: Authorization: Bearer <accessToken>
   */
  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "No token provided" });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = AuthService.verifyAccessToken(token);

      if (!decoded) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      // Get user
      const user = AuthService.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Return user info
      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Verify error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  /**
   * Get current user info from refresh token
   * GET /auth/me
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      // Verify refresh token
      const decoded = AuthService.verifyRefreshToken(refreshToken);

      if (!decoded) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }

      // Get user
      const user = AuthService.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Generate new access token
      const accessToken = AuthService.generateAccessToken(user);

      // Return user info and new access token
      res.json({
        accessToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Me error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
