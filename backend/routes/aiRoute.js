import express from "express";
import authMiddleware from "../middleware/auth.js";
import { chat } from "../controllers/aiController.js";

const router = express.Router();

// Protected route — only authenticated users with Admin role (checked in controller)
router.post("/chat", authMiddleware, chat);

export default router;
