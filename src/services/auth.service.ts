import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../config/env";
import { sendEmail } from "./email.service";
import { getOtpEmailTemplate } from "./email.templates";

// Helper to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const registerUser = async (email: string, name: string, password?: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.isVerified) {
    throw new Error("User already exists");
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let user = existingUser;
  if (!user) {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false,
    });
  } else {
    // Resend OTP for unverified user
    user.otp = otp;
    user.otpExpires = otpExpires;
    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }
    user.name = name;
    await user.save();
  }

  // Send OTP Email
  const emailContent = getOtpEmailTemplate(otp, name);
  await sendEmail(
    email,
    emailContent.subject,
    emailContent.text,
    emailContent.html
  );

  return user;
};

export const verifyOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
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

export const loginUser = async (email: string, password?: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isVerified) {
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();

      const emailContent = getOtpEmailTemplate(otp, user.name);
      await sendEmail(
        email,
        emailContent.subject,
        emailContent.text,
        emailContent.html
      );
     throw new Error("Account not verified. A new OTP has been sent to your email.");
  }

  // If password based login
  if (password) {
      if(!user.password) throw new Error("Invalid credentials (no password set)");
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         throw new Error("Invalid credentials");
      }
  }

  return generateTokens(user);
};

const generateTokens = (user: IUser) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};

export const refreshAccessToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET!) as { userId: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isVerified) {
      throw new Error("User not verified");
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET!,
      { expiresIn: "15m" }
    );

    return accessToken;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

// Google Auth
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } from "../config/env";

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL);

export const getGoogleAuthUrl = () => {
    return client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
    });
};

export const googleLogin = async (code: string) => {
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
        throw new Error("Invalid Google Token");
    }

    const { email, name, sub } = payload;
    let user = await User.findOne({ email });

    if (!user) {
        // Create new user
        // Generate a random password since they use Google
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        user = await User.create({
            name: name || "Google User",
            email,
            password: hashedPassword,
            googleId: sub,
            isVerified: true, // Google emails are verified
        });
    } else {
        // Update existing user with googleId if not present
        if (!user.googleId) {
            user.googleId = sub;
            user.isVerified = true; // Trust Google verification
            await user.save();
        }
    }

    return generateTokens(user);
};
