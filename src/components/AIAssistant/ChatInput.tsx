
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [message]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    onSendMessage(message);
    setMessage("");
  };

  // Handle pressing Enter (send message) but Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Ask me anything about music..."
        className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg py-3 px-4 pr-12 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-music-primary focus:border-music-primary transition-all"
        rows={1}
        style={{ minHeight: "44px", maxHeight: "100px" }}
      />
      <motion.button
        type="submit"
        disabled={!message.trim() || isLoading}
        whileTap={{ scale: 0.9 }}
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-music-primary rounded-full text-white ${
          !message.trim() || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-music-secondary"
        }`}
        aria-label="Send message"
      >
        <Send size={16} />
      </motion.button>
    </form>
  );
};

export default ChatInput;
