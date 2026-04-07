import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import AIChartRenderer from "../AIChartRenderer/AIChartRenderer";
import ReactMarkdown from "react-markdown";
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
      const history = messages.map((m) => {
        // Format đúng định dạng OpenAI, chỉ gửi text content, không gửi các thuộc tính khác như chartData
        let content = m.text;
        
        // Nếu đây là tin nhắn từ assistant và có chartData, chỉ gửi text thôi, không gửi cả JSON
        if (m.role === 'assistant' && m.chartData) {
          // Chỉ lấy text content để gửi vào history, không gửi metadata chart
          content = m.text;
          if (m.insight) {
            content += '\n' + m.insight;
          }
        }
        
        return { role: m.role, content };
      });
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
      {!isOpen && (
        <button className="ai-chat-toggle-btn" onClick={() => setIsOpen((s) => !s)}>
          🤖
        </button>
      )}
      
      {isOpen && (
        <div className="ai-chat-fullscreen">
          <div className="ai-chat-header">
            <div>AI Assistant</div>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>
          
          {/* Chat Messages Area */}
          <div className="ai-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.role === "user" ? "message-row-user" : "message-row-ai"}`}>
                <div className={`message-bubble ${m.role === "user" ? "message-bubble-user" : "message-bubble-ai"}`}>
                  {m.role === "assistant" && (
                    <div className="message-avatar">
                      <span>🤖</span>
                    </div>
                  )}
                  <div className="message-content">
                    <div className="message-text">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                    {m.chartData && m.chartType && (
                      <div className="message-chart">
                        <AIChartRenderer chartType={m.chartType} chartData={m.chartData} chartTitle={m.chartTitle} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-row message-row-ai">
                <div className="message-bubble message-bubble-ai">
                  <div className="message-avatar">
                    <span>🤖</span>
                  </div>
                  <div className="ai-loading">
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                    <span className="loading-dot"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Suggested Questions - Only show when no messages or few messages */}
          {messages.length <= 2 && (
            <div className="ai-chat-suggestions">
              <div className="suggestions-scroll-container">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => send(q)} className="ai-suggestion-chip">
                    <span className="suggestion-icon">💡</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="ai-chat-input">
            <div className="input-wrapper">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                disabled={isLoading} 
                placeholder="Nhập câu hỏi..." 
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)} 
              />
            </div>
            <button 
              onClick={() => send(input)} 
              disabled={isLoading || !input.trim()}
              className="send-button"
            >
              <span>Gửi</span>
              <span className="send-icon">▶</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}