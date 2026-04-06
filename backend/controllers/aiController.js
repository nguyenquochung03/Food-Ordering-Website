import authMiddleware from "../middleware/auth.js";
import userModel from "../models/userModel.js";
import * as analyticsService from "../services/analyticsService.js";
import aiService from "../services/aiService.js";

export async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required", data: null });
    }

    // Require authenticated user
    const userId = req.body.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Not authorized", data: null });

    const user = await userModel.findById(userId).lean();
    if (!user) return res.status(401).json({ success: false, message: "User not found", data: null });

    // Only Admin role allowed
    if (user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admins only", data: null });
    }

    const limitedHistory = Array.isArray(history) ? history.slice(-10) : [];

    const dashboardContext = await analyticsService.buildDashboardContext();

    const aiResult = await aiService.askAI(message, limitedHistory, dashboardContext);

    return res.json({ success: true, data: aiResult });
  } catch (error) {
    console.error("aiController.chat error", error);
    // Only treat as service-unavailable when aiService signals AI_UNAVAILABLE
    if (error && error.name === "AI_UNAVAILABLE") {
      return res.status(503).json({ success: false, message: "Tất cả model AI hiện tại đang quá tải. Vui lòng thử lại sau.", data: null, errors: error.toString() });
    }

    // Otherwise return generic 500
    return res.status(500).json({ success: false, message: "Internal server error", data: null, errors: error.toString() });
  }
}

export default { chat };
