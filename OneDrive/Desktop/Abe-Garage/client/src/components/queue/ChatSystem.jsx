import React, { useState, useEffect, useRef } from "react";
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaUserTie,
  FaPhone,
  FaVideo,
  FaPaperclip,
  FaSmile,
} from "react-icons/fa";
import socketService from "../../services/socket";

const ChatSystem = ({
  customerId,
  customerName,
  serviceAdvisorId,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Mock chat messages
  useEffect(() => {
    if (isOpen) {
      const mockMessages = [
        {
          id: 1,
          sender: "advisor",
          senderName: "Sarah Johnson",
          message:
            "Hello! Your vehicle is currently in Bay 2. We'll start the service shortly.",
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: "text",
        },
        {
          id: 2,
          sender: "customer",
          senderName: customerName,
          message: "Thank you! How long do you expect the service to take?",
          timestamp: new Date(Date.now() - 8 * 60 * 1000),
          type: "text",
        },
        {
          id: 3,
          sender: "advisor",
          senderName: "Sarah Johnson",
          message:
            "Approximately 45 minutes. I'll keep you updated on our progress.",
          timestamp: new Date(Date.now() - 7 * 60 * 1000),
          type: "text",
        },
      ];
      setMessages(mockMessages);
    }
  }, [isOpen, customerName]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Socket connection for real-time messaging
  useEffect(() => {
    if (isOpen) {
      const socket = socketService.connect();

      socketService.on("chat_message", (data) => {
        setMessages((prev) => [...prev, data]);
      });

      socketService.on("typing_indicator", (data) => {
        setIsTyping(data.isTyping);
      });

      return () => {
        socketService.off("chat_message");
        socketService.off("typing_indicator");
      };
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: "customer",
        senderName: customerName,
        message: newMessage.trim(),
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, message]);
      socketService.emit("send_message", {
        customerId,
        serviceAdvisorId,
        message: message,
      });

      setNewMessage("");
    }
  };

  const handleTyping = () => {
    socketService.emit("typing_start", { customerId, serviceAdvisorId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit("typing_stop", { customerId, serviceAdvisorId });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const quickResponses = [
    "How much longer?",
    "Can I get an update?",
    "Thank you!",
    "I have a question",
  ];

  const emojis = ["😊", "👍", "👌", "❤️", "😄", "🙏", "🔥", "⭐"];

  if (!isOpen) return null;

  return (
    <div className="chat-system">
      <div className="chat-header">
        <div className="chat-title">
          <FaComments />
          <span>Service Chat</span>
        </div>
        <div className="chat-status">
          <div className="status-indicator online">
            <div className="status-dot"></div>
            <span>Advisor Online</span>
          </div>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>

      <div className="chat-content">
        <div className="messages-container">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${
                msg.sender === "customer" ? "customer" : "advisor"
              }`}
            >
              <div className="message-avatar">
                {msg.sender === "customer" ? (
                  <FaUser className="avatar-icon customer" />
                ) : (
                  <FaUserTie className="avatar-icon advisor" />
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">{msg.senderName}</span>
                  <span className="message-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message advisor">
              <div className="message-avatar">
                <FaUserTie className="avatar-icon advisor" />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-responses">
          {quickResponses.map((response, idx) => (
            <button
              key={idx}
              className="quick-response-btn"
              onClick={() => setNewMessage(response)}
            >
              {response}
            </button>
          ))}
        </div>

        <div className="chat-input-container">
          <div className="input-actions">
            <button className="action-btn">
              <FaPaperclip />
            </button>
            <button
              className="action-btn emoji-btn"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <FaSmile />
            </button>
          </div>

          {showEmojiPicker && (
            <div className="emoji-picker">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  className="emoji-btn"
                  onClick={() => setNewMessage((prev) => prev + emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-wrapper">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chat-input"
              rows="1"
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>

          <div className="input-footer">
            <button className="contact-btn">
              <FaPhone />
              Call Service Advisor
            </button>
            <button className="video-btn">
              <FaVideo />
              Video Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
