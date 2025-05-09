
import React, { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false 
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without shift key for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex items-end gap-2 bg-card/80 p-3 border-t border-white/10">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="min-h-[60px] max-h-[120px] bg-white/5 border-white/10 resize-none flex-1"
        disabled={disabled}
      />
      <Button 
        onClick={onSubmit} 
        disabled={!value.trim() || disabled}
        className="music-button h-10 px-4"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">Send</span>
      </Button>
    </div>
  );
};

export default ChatInput;
