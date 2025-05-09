
import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "@/context/AIAssistantContext";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 ${message.isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div 
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.isUser 
            ? "bg-white/10" 
            : "bg-gradient-to-r from-music-primary to-music-secondary"
        }`}
      >
        {message.isUser ? <User size={16} /> : <Bot size={16} className="text-white" />}
      </div>
      
      {/* Message content */}
      <div 
        className={`max-w-[85%] p-3 rounded-lg ${
          message.isUser 
            ? "bg-white/10 text-white ml-auto" 
            : "bg-music-primary/20 border border-music-primary/30"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className="text-[10px] text-white/50 mt-1 text-right">
          {format(message.timestamp, "h:mm a")}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
