"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.SMTP_HOST,
    port: parseInt(env_1.SMTP_PORT || "465"),
    secure: parseInt(env_1.SMTP_PORT || "465") === 465, // true for 465, false for other ports
    auth: {
        user: env_1.SMTP_USER,
        pass: env_1.SMTP_PASS,
    },
});
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Vape & Smoke Shop" <${env_1.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Error sending email: ", error);
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
