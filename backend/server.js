import express from "express";
import cors from "cors";
import "dotenv/config";

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

// middleware
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

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

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
});
