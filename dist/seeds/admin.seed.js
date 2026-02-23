"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const existingAdmin = await user_model_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(" Admin user already exists.");
            return;
        }
        if (!adminEmail || !process.env.ADMIN_PASSWORD) {
            console.log(" Admin email or password not found in environment variables.");
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(process.env.ADMIN_PASSWORD, 10);
        const adminUser = new user_model_1.default({
            name: "Admin User",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await adminUser.save();
        console.log("Admin user seeded successfully.");
    }
    catch (error) {
        console.error("Error seeding admin user:", error);
    }
};
exports.seedAdmin = seedAdmin;
