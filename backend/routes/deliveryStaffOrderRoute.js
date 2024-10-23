import express from "express";
import {
  confirmOrderDelivered,
  confirmOrderDeliveredSuccessfully,
  getDeliveryStaffOrdersByDeliver,
  getNameDeliveryStaffFromOrderId,
  getOrdersByStaff,
  setDeliveryStaffOrder,
} from "../controllers/deliveryStaffOrderController.js";

const deliveryStaffOrderRoute = express.Router();

deliveryStaffOrderRoute.post("/setDeliveryStaffOrder", setDeliveryStaffOrder);
deliveryStaffOrderRoute.get(
  "/ConfirmOrderDeliveredSuccessfully/:token",
  confirmOrderDeliveredSuccessfully
);
deliveryStaffOrderRoute.post(
  "/ConfirmOrderDeliveredSuccessfully/:token",
  confirmOrderDelivered
);
deliveryStaffOrderRoute.post(
  "/getNameDeliveryStaffFromOrderId",
  getNameDeliveryStaffFromOrderId
);
deliveryStaffOrderRoute.get("/getOrdersByStaff", getOrdersByStaff);
deliveryStaffOrderRoute.get(
  "/getDeliveryStaffOrdersByDeliver",
  getDeliveryStaffOrdersByDeliver
);

export default deliveryStaffOrderRoute;
