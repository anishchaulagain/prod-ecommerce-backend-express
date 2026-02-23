"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_CALLBACK_URL = exports.GOOGLE_CLIENT_SECRET = exports.GOOGLE_CLIENT_ID = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.JWT_REFRESH_SECRET = exports.JWT_SECRET = exports.MONGODB_URI = exports.PORT = exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default("8000"),
    MONGODB_URI: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    JWT_REFRESH_SECRET: zod_1.z.string(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().default("http://localhost:8000/api/v1/auth/google/callback"),
});
exports.env = envSchema.parse(process.env);
exports.PORT = exports.env.PORT;
exports.MONGODB_URI = exports.env.MONGODB_URI;
exports.JWT_SECRET = exports.env.JWT_SECRET;
exports.JWT_REFRESH_SECRET = exports.env.JWT_REFRESH_SECRET;
exports.SMTP_HOST = exports.env.SMTP_HOST;
exports.SMTP_PORT = exports.env.SMTP_PORT;
exports.SMTP_USER = exports.env.SMTP_USER;
exports.SMTP_PASS = exports.env.SMTP_PASS;
exports.GOOGLE_CLIENT_ID = exports.env.GOOGLE_CLIENT_ID;
exports.GOOGLE_CLIENT_SECRET = exports.env.GOOGLE_CLIENT_SECRET;
exports.GOOGLE_CALLBACK_URL = exports.env.GOOGLE_CALLBACK_URL;
