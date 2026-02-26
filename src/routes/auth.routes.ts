import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Validation error or User exists
 */
router.post("/register", AuthController.register);

/**
 * @swagger
 * /api/v1/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and create account/login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, tokens set as HTTP-only cookies
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-otp", AuthController.verifyOtp);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, tokens set as HTTP-only cookies
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token (reads refresh token from cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token set as HTTP-only cookie
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout and clear auth cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", AuthController.logout);

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     summary: Initiate Google OAuth Login
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google Login
 */
router.get("/google", AuthController.googleAuth);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Login successful, tokens set as HTTP-only cookies
 *       400:
 *         description: Invalid code or login failed
 */
router.get("/google/callback", AuthController.googleCallback);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current authenticated user (fresh from DB)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, AuthController.getMe);

export default router;
