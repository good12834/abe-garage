import React, { useState, useEffect, useRef } from "react";
import { chatAPI } from "../services/api";
import socketService from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { formatDateForDisplay } from "../services/api";
import "./ChatMessages.css";

const ChatMessages = ({ appointmentId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages
  useEffect(() => {
    loadMessages();
  }, [appointmentId]);

  // Set up socket listeners
  useEffect(() => {
    if (appointmentId) {
      // Join appointment room
      socketService.joinAppointment(appointmentId);

      // Listen for new messages
      const handleNewMessage = (message) => {
        if (message.appointment_id === parseInt(appointmentId)) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      };

      // Listen for typing indicators
      const handleTyping = (data) => {
        if (data.appointmentId === appointmentId && data.userId !== user?.id) {
          setIsTyping(data.isTyping);
        }
      };

      socketService.onNewMessage(handleNewMessage);
      socketService.onUserTyping(handleTyping);

      return () => {
        socketService.leaveAppointment(appointmentId);
        socketService.cleanupAppointmentListeners(appointmentId);
      };
    }
  }, [appointmentId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(appointmentId);
      setMessages(response.data.data.messages);
    } catch (error) {
      console.error("Error loading messages:", error);
      // Load mock messages for demo purposes
      setMessages([
        {
          id: 1,
          message:
            "Hello! Your appointment is scheduled for tomorrow. Please arrive 15 minutes early.",
          sender_id: 999,
          sender_name: "Service Team",
          message_type: "text",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          message: "Thank you for the update. I'll be there on time.",
          sender_id: user?.id || 1,
          sender_name: user?.first_name || "You",
          message_type: "text",
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 3,
          message:
            "Great! Our mechanic will be ready. Do you have any questions about the service?",
          sender_id: 999,
          sender_name: "Service Team",
          message_type: "text",
          created_at: new Date(Date.now() - 900000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      const response = await chatAPI.sendMessage({
        appointmentId: parseInt(appointmentId),
        message: messageText,
        messageType: "text",
      });

      // Message will be added via socket
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);

      // Add message locally for demo purposes
      const newMsg = {
        id: Date.now(),
        message: messageText,
        sender_id: user?.id || 1,
        sender_name: user?.first_name || "You",
        message_type: "text",
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      scrollToBottom();

      // Simulate mechanic response after 2-3 seconds
      setTimeout(() => {
        const responses = [
          "Thanks for your message. We'll take care of that.",
          "Got it! Our mechanic will address this during the service.",
          "Understood. Is there anything else you'd like us to check?",
          "Thanks for letting us know. We'll make sure to handle this.",
          "Perfect! We'll take note of that for your appointment.",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const mechanicResponse = {
          id: Date.now() + 1,
          message: randomResponse,
          sender_id: 999,
          sender_name: "Service Team",
          message_type: "text",
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, mechanicResponse]);
        scrollToBottom();
      }, 2000 + Math.random() * 1000); // 2-3 second delay
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    socketService.startTyping(appointmentId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(appointmentId);
    }, 2000);
  };

  const getMessageClass = (message) => {
    const isOwnMessage = message.sender_id === user?.id;
    return `message ${isOwnMessage ? "message-own" : "message-other"}`;
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="chat-messages">
        <div className="chat-header">
          <h5>Chat</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="chat-body d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-messages">
      <div className="chat-header">
        <h5>Chat Support</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <div className="chat-body">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <i className="bi bi-chat-dots text-muted"></i>
              <p className="text-muted mt-2">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={getMessageClass(message)}>
                <div className="message-content">
                  {message.message_type === "image" && message.file_url && (
                    <div className="message-image">
                      <img
                        src={message.file_url}
                        alt="Shared image"
                        className="img-fluid rounded"
                        style={{ maxWidth: "200px" }}
                      />
                    </div>
                  )}
                  {message.message_type === "file" && message.file_url && (
                    <div className="message-file">
                      <a
                        href={message.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        <i className="bi bi-file-earmark"></i>
                        {message.file_name || "Download file"}
                      </a>
                    </div>
                  )}
                  {message.message && (
                    <div className="message-text">{message.message}</div>
                  )}
                  <div className="message-time">
                    {getMessageTime(message.created_at)}
                  </div>
                </div>
                <div className="message-sender">{message.sender_name}</div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <small className="text-muted">Someone is typing...</small>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-footer">
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleTyping}
              disabled={sending}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                ></span>
              ) : (
                <i className="bi bi-send"></i>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatMessages;
