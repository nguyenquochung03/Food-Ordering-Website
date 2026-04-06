import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "./UserAIChat.css";

const SUGGESTED_QUESTIONS = [
  "Menu hôm nay có món nào ngon?",
  "Món ăn phổ biến nhất là gì?",
  "Làm sao để đặt hàng?",
  "Phí ship là bao nhiêu?",
  "Có khuyến mãi gì không?",
  "Thời gian giao hàng bao lâu?",
];

export default function UserAIChat({ url = "http://localhost:4000" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", text: "Xin chào! 👋 Tôi là trợ lý AI của nhà hàng, tôi có thể giúp gì cho bạn hôm nay?" }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  const send = async (text) => {
    if (!text || !text.trim()) return;
    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const res = await axios.post(
        `${url}/api/ai/user-chat`,
        { message: text, history }
      );

      if (res.data && res.data.success) {
        setMessages((m) => [...m, { role: "assistant", text: res.data.data.text }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", text: res.data?.message || "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau." }]);
      }
    } catch (error) {
      setMessages((m) => [...m, { role: "assistant", text: "Xin lỗi, tôi không thể kết nối được lúc này. Bạn vui lòng thử lại sau nhé! 😊" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="ai-user-toggle-btn" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-user-chat-window">
          {/* Header */}
          <div className="ai-user-chat-header">
            <div className="header-title">
              <span>🤖</span>
              <span>Trợ lý AI</span>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          {/* Messages */}
          <div className="ai-user-chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.role === "user" ? "user" : "ai"}`}>
                <div className={`message-bubble ${m.role === "user" ? "user" : "ai"}`}>
                  {m.role === "user" ? (
                    m.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                        // Disable all other markdown elements for safety
                        h1: ({ children }) => <span>{children}</span>,
                        h2: ({ children }) => <span>{children}</span>,
                        h3: ({ children }) => <span>{children}</span>,
                        a: ({ children }) => <span>{children}</span>,
                        img: () => null,
                        code: ({ children }) => <span>{children}</span>,
                        pre: ({ children }) => <span>{children}</span>,
                        blockquote: ({ children }) => <span>{children}</span>,
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-row ai">
                <div className="message-bubble ai loading">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && (
            <div className="ai-user-suggestions">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => send(q)} className="suggestion-chip">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-user-chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Nhắn tin..."
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <button
              onClick={() => send(input)}
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
