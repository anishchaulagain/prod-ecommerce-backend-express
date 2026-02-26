"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const path_1 = __importDefault(require("path"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Shop Us API',
            version: '1.0.0',
            description: 'API documentation for Shop Us Ecommerce Platform',
        },
        servers: [
            {
                url: "http://localhost:8000",
                description: 'Development server',
            },
            {
                url: process.env.BASE_URL,
                description: 'Production server',
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    // Supporting both development (src) and production (dist)
    apis: [
        path_1.default.join(__dirname, '../routes/*.{ts,js}'),
        path_1.default.join(__dirname, '../app.{ts,js}')
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
