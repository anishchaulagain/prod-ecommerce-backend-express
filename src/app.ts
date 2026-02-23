import express from "express";
import cors from "cors";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

app.use(cors(
    {
        origin: true, 
        credentials: true
    }
));
app.use(express.json());

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