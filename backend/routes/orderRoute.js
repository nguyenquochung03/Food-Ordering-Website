import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  listStatusOrders,
  order,
  getOrderById,
  getRevenueStats,
  getOrderCountByStatuses,
  calculateIncome,
  getTotalOrdersByMonth,
  getTotalOrders,
  getTotalOrdersByYear,
  getMonthlyOrderTotals,
  hasOrderedFood,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/order", authMiddleware, order);
orderRouter.post("/verify", authMiddleware, verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/get", getOrderById);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.get("/listStatus", listStatusOrders);
orderRouter.get("/getRevenueStats", getRevenueStats);
orderRouter.get("/getOrderCountByStatuses", getOrderCountByStatuses);
orderRouter.get("/calculateIncome", calculateIncome);
orderRouter.get("/getTotalOrdersByMonth", getTotalOrdersByMonth);
orderRouter.get("/getTotalOrders", getTotalOrders);
orderRouter.get("/getTotalOrdersByYear", getTotalOrdersByYear);
orderRouter.get("/getMonthlyOrderTotals", getMonthlyOrderTotals);
orderRouter.post("/hasOrderedFood", authMiddleware, hasOrderedFood);

export default orderRouter;
