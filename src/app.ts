import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";
import connectDB from "./config/db";

const app = express();

app.use(cors(
    {
        origin: true, 
        credentials: true
    }
));
app.use(express.json());
app.use(cookieParser());

// Ensure MongoDB is connected before handling requests (critical for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed" });
  }
});

const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss:
      '.swagger-ui .topbar { display: none } .scheme-container { background: #fafafa; padding: 20px }',
    customCssUrl: CSS_URL,
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js",
    ],
    customSiteTitle: "Shop Us API Documentation",
  })
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Returns Backend Running
 *     responses:
 *       200:
 *         description: Backend Health
 */
app.get("/health", (req, res) =>{
    res.send("Health is good. Backend Running")
})

app.use("/api/v1", routes);

// Error handling middleware should be last
app.use(errorHandler);

export default app;