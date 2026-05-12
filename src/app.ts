import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./presentation/routes/user.routes.js";
// import therapistRoutes from "./presentation/routes/therapist.routes";
// import adminRoutes from "./presentation/routes/admin.routes";
import { errorHandler, notFoundHandler } from "./presentation/middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use("/api/user/auth", userRoutes);
// app.use("/api/therapist/auth", therapistRoutes);
// app.use("/api/admin", adminRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
