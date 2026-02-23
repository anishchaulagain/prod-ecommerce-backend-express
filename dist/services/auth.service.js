"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.getGoogleAuthUrl = exports.refreshAccessToken = exports.loginUser = exports.verifyOtp = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const env_1 = require("../config/env");
const email_service_1 = require("./email.service");
const email_templates_1 = require("./email.templates");
// Helper to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
const registerUser = async (email, name, password) => {
    const existingUser = await user_model_1.default.findOne({ email });
    if (existingUser && existingUser.isVerified) {
        throw new Error("User already exists");
    }
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    let user = existingUser;
    if (!user) {
        const hashedPassword = password ? await bcryptjs_1.default.hash(password, 10) : undefined;
        user = await user_model_1.default.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpires,
            isVerified: false,
        });
    }
    else {
        // Resend OTP for unverified user
        user.otp = otp;
        user.otpExpires = otpExpires;
        if (password) {
            user.password = await bcryptjs_1.default.hash(password, 10);
        }
        user.name = name;
        await user.save();
    }
    // Send OTP Email
    const emailContent = (0, email_templates_1.getOtpEmailTemplate)(otp, name);
    await (0, email_service_1.sendEmail)(email, emailContent.subject, emailContent.text, emailContent.html);
    return user;
};
exports.registerUser = registerUser;
const verifyOtp = async (email, otp) => {
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.otp !== otp) {
        throw new Error("Invalid OTP");
    }
    if (user.otpExpires && user.otpExpires < new Date()) {
        throw new Error("OTP expired");
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return generateTokens(user);
};
exports.verifyOtp = verifyOtp;
const loginUser = async (email, password) => {
    const user = await user_model_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.isVerified) {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();
        const emailContent = (0, email_templates_1.getOtpEmailTemplate)(otp, user.name);
        await (0, email_service_1.sendEmail)(email, emailContent.subject, emailContent.text, emailContent.html);
        throw new Error("Account not verified. A new OTP has been sent to your email.");
    }
    // If password based login
    if (password) {
        if (!user.password)
            throw new Error("Invalid credentials (no password set)");
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }
    }
    return generateTokens(user);
};
exports.loginUser = loginUser;
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, env_1.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken, user };
};
const refreshAccessToken = async (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.JWT_REFRESH_SECRET);
        const user = await user_model_1.default.findById(decoded.userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isVerified) {
            throw new Error("User not verified");
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, env_1.JWT_SECRET, { expiresIn: "15m" });
        return accessToken;
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new Error("Refresh token expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw new Error("Invalid refresh token");
        }
        throw error;
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Google Auth
const google_auth_library_1 = require("google-auth-library");
const env_2 = require("../config/env");
const client = new google_auth_library_1.OAuth2Client(env_2.GOOGLE_CLIENT_ID, env_2.GOOGLE_CLIENT_SECRET, env_2.GOOGLE_CALLBACK_URL);
const getGoogleAuthUrl = () => {
    return client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
    });
};
exports.getGoogleAuthUrl = getGoogleAuthUrl;
const googleLogin = async (code) => {
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env_2.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error("Invalid Google Token");
    }
    const { email, name, sub } = payload;
    let user = await user_model_1.default.findOne({ email });
    if (!user) {
        // Create new user
        // Generate a random password since they use Google
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 10);
        user = await user_model_1.default.create({
            name: name || "Google User",
            email,
            password: hashedPassword,
            googleId: sub,
            isVerified: true, // Google emails are verified
        });
    }
    else {
        // Update existing user with googleId if not present
        if (!user.googleId) {
            user.googleId = sub;
            user.isVerified = true; // Trust Google verification
            await user.save();
        }
    }
    return generateTokens(user);
};
exports.googleLogin = googleLogin;
