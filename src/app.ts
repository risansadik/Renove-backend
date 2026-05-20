import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./presentation/routes/user.routes.js";
import therapistRoutes from "./presentation/routes/therapist.routes.js";
import adminRoutes from "./presentation/routes/admin.routes.js";
import bookingRoutes from "./presentation/routes/booking.routes.js";
import availabilityRoutes from "./presentation/routes/availability.routes.js";
import paymentRoutes from "./presentation/routes/payment.routes.js";
import walletRoutes from "./presentation/routes/wallet.routes.js";
import { errorHandler, notFoundHandler } from "./presentation/middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = (process.env.CLIENT_URL ?? "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .concat(["http://localhost:5174", "http://localhost:5173", "http://10.10.10.144:5173"]);
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Webhook route must come BEFORE express.json() to allow express.raw() in its own router
app.use("/api/payments", paymentRoutes);


app.use("/uploads", express.static("uploads"));


app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use("/api/user/auth", userRoutes);
app.use("/api/user", userRoutes);
app.use("/api/therapist/auth", therapistRoutes);
app.use("/api/therapist", therapistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/wallet", walletRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export default app;
