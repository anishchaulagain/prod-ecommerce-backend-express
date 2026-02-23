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
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = exports.refreshToken = exports.login = exports.verifyOtp = exports.register = void 0;
const AuthService = __importStar(require("../services/auth.service"));
const zod_1 = require("zod");
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
        res.status(200).json(result);
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
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token)
            throw new Error("Token required");
        const accessToken = await AuthService.refreshAccessToken(token);
        res.status(200).json({ accessToken });
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const googleAuth = async (req, res, next) => {
    try {
        const url = AuthService.getGoogleAuthUrl();
        // Redirect the user to Google's consent page
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
        // For now return tokens in JSON. 
        // In a real app, you might redirect to frontend with tokens in URL params or Set-Cookie
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.googleCallback = googleCallback;
