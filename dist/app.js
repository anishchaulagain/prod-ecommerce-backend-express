"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const error_middleware_1 = require("./middlewares/error.middleware");
const db_1 = __importDefault(require("./config/db"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Ensure MongoDB is connected before handling requests (critical for Vercel serverless)
app.use(async (req, res, next) => {
    try {
        await (0, db_1.default)();
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Database connection failed" });
    }
});
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, {
    customCss: '.swagger-ui .topbar { display: none } .scheme-container { background: #fafafa; padding: 20px }',
    customCssUrl: CSS_URL,
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
    customSiteTitle: "Shop Us API Documentation",
    swaggerOptions: {
        withCredentials: true,
    },
}));
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Returns Backend Running
 *     responses:
 *       200:
 *         description: Backend Health
 */
app.get("/health", (req, res) => {
    res.send("Health is good. Backend Running");
});
app.use("/api/v1", routes_1.default);
// Error handling middleware should be last
app.use(error_middleware_1.errorHandler);
exports.default = app;
