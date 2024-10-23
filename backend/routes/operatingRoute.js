import express from "express";
import {
  getOperatingData,
  saveOperatingData,
} from "../controllers/operatingController.js";

const operatingRouter = express.Router();

operatingRouter.post("/saveOperatingData", saveOperatingData);
operatingRouter.get("/getOperatingData", getOperatingData);

export default operatingRouter;
