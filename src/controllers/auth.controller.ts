import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import User from "../models/user.model";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be exactly 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ── Cookie helper ──────────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS_ACCESS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? ("none" as const) : ("lax" as const),
  maxAge: 15 * 60 * 1000, // 15 minutes
  path: "/",
};

const COOKIE_OPTIONS_REFRESH = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, COOKIE_OPTIONS_ACCESS);
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS_REFRESH);
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

// ── Controllers ────────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);
    await AuthService.registerUser(email, name, password);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error: any) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const result = await AuthService.verifyOtp(email, otp);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json({ message: "Login successful" });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.loginUser(email, password);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json({ message: "Login successful" });
  } catch (error: any) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Read refresh token from cookie (fallback to body for backward compat)
    const token = req.cookies?.refreshToken || req.body.token;
    if (!token) throw new Error("Refresh token required");
    const accessToken = await AuthService.refreshAccessToken(token);
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS_ACCESS);
    res.status(200).json({ message: "Token refreshed" });
  } catch (error: any) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const url = AuthService.getGoogleAuthUrl();
        res.redirect(url); 
    } catch (error: any) {
        next(error);
    }
}

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            throw new Error("Invalid code from Google");
        }
        const result = await AuthService.googleLogin(code);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        res.status(200).json({ message: "Login successful" });
    } catch (error: any) {
        next(error);
    }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.userId).select("-password -otp -otpExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    next(error);
  }
};
