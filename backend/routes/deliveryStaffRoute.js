import express from "express";
import {
  addDeliveryStaff,
  deleteDeliveryStaff,
  getDeliveryStaff,
  getDeliveryStaffById,
  updateDeliveryStaff,
  updateDeliveryStaffStatus,
} from "../controllers/deliveryStaffController.js";

const deliveryStaffRoute = express.Router();

deliveryStaffRoute.post("/add", addDeliveryStaff);
deliveryStaffRoute.post("/update", updateDeliveryStaff);
deliveryStaffRoute.post("/delete", deleteDeliveryStaff);
deliveryStaffRoute.get("/getAll", getDeliveryStaff);
deliveryStaffRoute.get("/getById/:id", getDeliveryStaffById);
deliveryStaffRoute.put("/updateDeliveryStaffStatus", updateDeliveryStaffStatus);

export default deliveryStaffRoute;
