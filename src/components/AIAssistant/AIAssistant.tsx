
import React, { useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Bot, X, Maximize2, Minimize2, Volume2, VolumeX, Trash } from "lucide-react";
import { useAIAssistant } from "@/context/AIAssistantContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const AIAssistant: React.FC = () => {
  const {
    messages,
    sendMessage,
    isOpen,
    toggleChat,
    isLoading,
    position,
    setPosition,
    isSoundEnabled,
    toggleSound,
    resetChat,
  } = useAIAssistant();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Handle drag start
  const onDragStart = (event: React.PointerEvent) => {
    dragControls.start(event);
  };

  // Handle drag end
  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    // Update position after drag
    setPosition({
      x: info.point.x,
      y: info.point.y,
    });
  };

  return (
    <>
      {/* Avatar Button */}
      <motion.div
        drag
        dragControls={dragControls}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        dragMomentum={false}
        initial={position}
        animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`fixed z-50 ${isOpen ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
        style={{ left: position.x - 30, top: position.y - 30 }} // Adjust for button size
      >
        <button
          onClick={toggleChat}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-music-primary to-music-secondary flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 relative"
        >
          <Bot size={28} />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.3, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </button>
      </motion.div>

      {/* Chat Window */}
      <motion.div
        className="fixed z-50 bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl flex flex-col w-80 md:w-96"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={
          isOpen
            ? { opacity: 1, y: 0, scale: 1, x: position.x - 320, bottom: window.innerHeight - position.y + 30 }
            : { opacity: 0, y: 20, scale: 0.95, x: position.x - 320, bottom: window.innerHeight - position.y + 30 }
        }
        transition={{ duration: 0.3 }}
        style={{ 
          maxHeight: "80vh",
          display: isOpen ? "flex" : "none",
        }}
        drag
        dragControls={dragControls}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        dragMomentum={false}
      >
        {/* Chat Header */}
        <div 
          className="flex items-center justify-between p-3 border-b border-white/10 cursor-grab active:cursor-grabbing"
          onPointerDown={onDragStart}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-music-primary to-music-secondary flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <h3 className="font-medium text-white">Music Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
              title={isSoundEnabled ? "Disable sound" : "Enable sound"}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={resetChat}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Reset chat"
              title="Reset chat"
            >
              <Trash size={16} />
            </button>
            <button
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
          style={{ maxHeight: "50vh" }}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-center py-2">
              <motion.div
                className="flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-2 h-2 bg-music-primary rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-music-primary rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3, delay: 0.1 }}
                />
                <motion.div
                  className="w-2 h-2 bg-music-primary rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.4, delay: 0.2 }}
                />
              </motion.div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-3 border-t border-white/10">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </motion.div>
    </>
  );
};

export default AIAssistant;
