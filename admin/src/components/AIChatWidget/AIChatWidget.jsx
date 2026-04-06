import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import AIChartRenderer from "../AIChartRenderer/AIChartRenderer";
import "./AIChatWidget.css";

const SUGGESTED_QUESTIONS = [
  "Tóm tắt tình hình kinh doanh tháng này",
  "Sản lượng tháng này tăng hay giảm?",
  "Top 5 khách hàng mua nhiều nhất",
  "Tại sao doanh thu thay đổi?",
  "Mặt hàng nào đang tồn kho nhiều nhất?",
  "So sánh doanh thu tháng này và tháng trước",
];

export default function AIChatWidget({ url = "http://localhost:4000" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", text: "Xin chào! Tôi có thể giúp gì?" }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  const send = async (text) => {
    if (!text || !text.trim()) return;
    const token = localStorage.getItem("token");
    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await axios.post(
        `${url}/api/ai/chat`,
        { message: text, history },
        { headers: { token } }
      );

      if (res.data && res.data.success) {
        const data = res.data.data;
        const assistantMsg = { role: "assistant", text: data.text, chartData: data.chartData, chartType: data.chartType, chartTitle: data.chartTitle };
        setMessages((m) => [...m, assistantMsg]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: res.data?.message || "Lỗi từ server" }]);
      }
    } catch (error) {
      setMessages((m) => [...m, { role: "assistant", text: "Lỗi khi kết nối AI. Vui lòng thử lại." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button className="ai-chat-toggle-btn" onClick={() => setIsOpen((s) => !s)}>
        🤖
      </button>

      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div>AI Assistant</div>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "user-message" : "ai-message"}>
                <div>{m.text}</div>
                {m.chartData && m.chartType && (
                  <div style={{ marginTop: 8 }}>
                    <AIChartRenderer chartType={m.chartType} chartData={m.chartData} chartTitle={m.chartTitle} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="ai-loading">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="ai-chat-suggestions">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)} className="ai-suggestion-chip">
                {q}
              </button>
            ))}
          </div>

          <div className="ai-chat-input">
            <input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} placeholder="Nhập câu hỏi..." onKeyDown={(e) => e.key === "Enter" && send(input)} />
            <button onClick={() => send(input)} disabled={isLoading}>Gửi ▶</button>
          </div>
        </div>
      )}
    </>
  );
}
