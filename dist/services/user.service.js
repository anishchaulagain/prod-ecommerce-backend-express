"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const getAllUsers = async () => {
    return await user_model_1.default.find({ role: "user" }).select("-password -otp -otpExpires");
};
exports.getAllUsers = getAllUsers;
const deleteUser = async (userId) => {
    const user = await user_model_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (user.role !== "user") {
        throw new Error("Cannot delete non-user roles");
    }
    await user_model_1.default.findByIdAndDelete(userId);
    return { message: "User deleted successfully" };
};
exports.deleteUser = deleteUser;
