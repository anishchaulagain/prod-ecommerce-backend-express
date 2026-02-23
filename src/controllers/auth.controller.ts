import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import { z } from "zod";

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
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await AuthService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new Error("Token required");
    const accessToken = await AuthService.refreshAccessToken(token);
    res.status(200).json({ accessToken });
  } catch (error: any) {
    next(error);
  }
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const url = AuthService.getGoogleAuthUrl();
        // Redirect the user to Google's consent page
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
        // For now return tokens in JSON. 
        // In a real app, you might redirect to frontend with tokens in URL params or Set-Cookie
        res.status(200).json(result);
    } catch (error: any) {
        next(error);
    }
}
