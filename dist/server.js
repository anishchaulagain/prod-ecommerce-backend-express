"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./config/db"));
const admin_seed_1 = require("./seeds/admin.seed");
const startServer = async () => {
    await (0, db_1.default)();
    await (0, admin_seed_1.seedAdmin)();
    app_1.default.listen(env_1.PORT, () => {
        console.log(`🚀 Server running on port ${env_1.PORT}`);
    });
};
startServer();
