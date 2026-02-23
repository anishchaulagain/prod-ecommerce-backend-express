"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const zodFormatter_1 = require("../utils/zodFormatter");
const errorHandler = (err, req, res, next) => {
    console.error("Error encountered:", err);
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: (0, zodFormatter_1.formatZodError)(err),
        });
    }
    // Handle Mongoose Duplicate Key Errors (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            errors: {
                [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
            },
        });
    }
    // Handle Mongoose Validation Errors (if any reach here)
    if (err.name === "ValidationError") {
        const errors = {};
        Object.keys(err.errors).forEach((key) => {
            errors[key] = err.errors[key].message;
        });
        return res.status(400).json({
            message: "Validation failed",
            errors,
        });
    }
    // Handle Mongoose CastError (invalid ObjectId)
    if (err.name === "CastError") {
        return res.status(400).json({
            message: `Invalid ${err.path}: ${err.value}`,
            errors: {
                [err.path]: `Invalid ${err.path} format`,
            },
        });
    }
    // Handle other errors
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
