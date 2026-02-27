"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.googleCallback = exports.googleAuth = exports.refreshToken = exports.login = exports.verifyOtp = exports.register = void 0;
const AuthService = __importStar(require("../services/auth.service"));
const zod_1 = require("zod");
const user_model_1 = __importDefault(require("../models/user.model"));
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be exactly 6 characters"),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// ── Cookie helper ──────────────────────────────────────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS_ACCESS = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
};
const COOKIE_OPTIONS_REFRESH = {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
};
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, COOKIE_OPTIONS_ACCESS);
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS_REFRESH);
};
const clearAuthCookies = (res) => {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
};
// ── Controllers ────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
    try {
        const { email, name, password } = registerSchema.parse(req.body);
        await AuthService.registerUser(email, name, password);
        res.status(200).json({ message: "OTP sent to email" });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = verifyOtpSchema.parse(req.body);
        const result = await AuthService.verifyOtp(email, otp);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        res.status(200).json({
            message: "Login successful",
            // Include tokens in response body for development (Swagger UI)
            ...(!IS_PRODUCTION && { accessToken: result.accessToken, refreshToken: result.refreshToken }),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const result = await AuthService.loginUser(email, password);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        res.status(200).json({
            message: "Login successful",
            ...(!IS_PRODUCTION && { accessToken: result.accessToken, refreshToken: result.refreshToken }),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        // Read refresh token from cookie (fallback to body for backward compat)
        const token = req.cookies?.refreshToken || req.body.token;
        if (!token)
            throw new Error("Refresh token required");
        const accessToken = await AuthService.refreshAccessToken(token);
        res.cookie("accessToken", accessToken, COOKIE_OPTIONS_ACCESS);
        res.status(200).json({
            message: "Token refreshed",
            ...(!IS_PRODUCTION && { accessToken }),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const googleAuth = async (req, res, next) => {
    try {
        const url = AuthService.getGoogleAuthUrl();
        res.redirect(url);
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuth = googleAuth;
const googleCallback = async (req, res, next) => {
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            throw new Error("Invalid code from Google");
        }
        const result = await AuthService.googleLogin(code);
        setAuthCookies(res, result.accessToken, result.refreshToken);
        res.status(200).json({
            message: "Login successful",
            ...(!IS_PRODUCTION && { accessToken: result.accessToken, refreshToken: result.refreshToken }),
        });
    }
    catch (error) {
        next(error);
    }
};
exports.googleCallback = googleCallback;
const logout = async (_req, res, next) => {
    try {
        clearAuthCookies(res);
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        const user = await user_model_1.default.findById(req.user.userId).select("-password -otp -otpExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
