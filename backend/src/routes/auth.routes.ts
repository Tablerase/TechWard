import { Router } from "express";
import { AuthController } from "@controllers/auth.controller";

const router = Router();

/**
 * POST /auth/login
 * Login or create a new user
 * Body: { userId?: string }
 */
router.post("/login", AuthController.login);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token from cookie
 */
router.post("/refresh", AuthController.refresh);

/**
 * POST /auth/logout
 * Logout and invalidate refresh token
 */
router.post("/logout", AuthController.logout);

/**
 * GET /auth/verify
 * Verify access token
 * Headers: Authorization: Bearer <accessToken>
 */
router.get("/verify", AuthController.verify);

/**
 * GET /auth/me
 * Get current user info and new access token from refresh token
 */
router.get("/me", AuthController.me);

export default router;
