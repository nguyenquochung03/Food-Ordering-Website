import express from "express";
import authMiddleware from "../middleware/auth.js";
import { chat } from "../controllers/aiController.js";
import { userChat } from "../controllers/aiUserController.js";

const router = express.Router();

// Protected route — Admin only (dashboard analytics)
router.post("/chat", authMiddleware, chat);

// Public route — User chat (no login required)
router.post("/user-chat", userChat);

export default router;
