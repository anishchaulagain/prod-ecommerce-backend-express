import { start } from "repl";
import app from "./app";
import { PORT } from "./config/env";
import connectDB from "./config/db";
import { seedAdmin } from "./seeds/admin.seed";

const startServer = async () => {
    await connectDB();
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();
