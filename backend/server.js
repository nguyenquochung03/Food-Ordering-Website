import express from "express";
import cors from "cors";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";

import { connectDB } from "./config/db.js";

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import deliveryStaffRoute from "./routes/deliveryStaffRoute.js";
import deliveryStaffOrderRoute from "./routes/deliveryStaffOrderRoute.js";
import commentRouter from "./routes/commentRoute.js";
import visitRoute from "./routes/visitRoute.js";
import operatingRouter from "./routes/operatingRoute.js";

// app config
const app = express();
const port = 4000;

// Rate limiter config
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: "You have sent too many requests, please try again later.",
});

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(limiter);
app.use(compression());
app.use(morgan("combined"));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// DB connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/deliveryStaff", deliveryStaffRoute);
app.use("/api/deliveryStaffOrder", deliveryStaffOrderRoute);
app.use("/api/comment", commentRouter);
app.use("/api/visit", visitRoute);
app.use("/api/operating", operatingRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    errorMessage: "The page you are looking for does not exist!",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { errorMessage: "Something went wrong!" });
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
