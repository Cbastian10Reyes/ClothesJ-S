const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes/index.routes");

const errorMiddleware = require("./middlewares/error.middleware");
const notFoundMiddleware = require("./middlewares/not-found.middleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

app.use(express.json());

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "API running successfully",
  });
});

app.use("/api", routes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

module.exports = app;