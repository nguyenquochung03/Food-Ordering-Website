import aiService from "../services/aiUserService.js";

export async function userChat(req, res) {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required", data: null });
    }

    const limitedHistory = Array.isArray(history) ? history.slice(-10) : [];
    const aiResult = await aiService.askUserAI(message, limitedHistory);

    return res.json({ success: true, data: aiResult });
  } catch (error) {
    console.error("aiUserController.userChat error", error);
    if (error && error.name === "AI_UNAVAILABLE") {
      return res.status(503).json({
        success: false,
        message: "AI đang quá tải, vui lòng thử lại sau.",
        data: null,
      });
    }
    return res.status(500).json({ success: false, message: "Internal server error", data: null });
  }
}

export default { userChat };
