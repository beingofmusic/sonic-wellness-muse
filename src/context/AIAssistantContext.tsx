import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define message type
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Define position type
interface Position {
  x: number;
  y: number;
}

// Define context type
interface AIAssistantContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  isOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
  openChat: () => void;
  isLoading: boolean;
  position: Position;
  setPosition: (position: Position) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  resetChat: () => void;
}

// Create context
const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

// Define provider props
interface AIAssistantProviderProps {
  children: React.ReactNode;
}

// Local storage keys
const CHAT_POSITION_KEY = "ai_assistant_position";
const CHAT_SOUND_KEY = "ai_assistant_sound";
const CHAT_MESSAGES_KEY = "ai_assistant_messages";

export const AIAssistantProvider: React.FC<AIAssistantProviderProps> = ({ children }) => {
  // State variables
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPositionState] = useState<Position>({ x: 0, y: 0 });
  const [isSoundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(CHAT_SOUND_KEY);
    return saved !== null ? JSON.parse(saved) : false;
  });

  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();

  // Load saved position
  useEffect(() => {
    const savedPosition = localStorage.getItem(CHAT_POSITION_KEY);
    if (savedPosition) {
      try {
        setPositionState(JSON.parse(savedPosition));
      } catch (error) {
        console.error("Error parsing saved position:", error);
      }
    } else {
      // Default position (bottom right)
      setPositionState({
        x: window.innerWidth - 100,
        y: window.innerHeight - 100,
      });
    }
    
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio("/ambient-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
  }, []);

  // Load chat history
  useEffect(() => {
    if (user) {
      // Load from Supabase if user is logged in
      loadUserChatHistory();
    } else {
      // Load from localStorage if guest
      loadLocalChatHistory();
    }
  }, [user]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem(CHAT_POSITION_KEY, JSON.stringify(position));
  }, [position]);

  // Manage sound
  useEffect(() => {
    localStorage.setItem(CHAT_SOUND_KEY, JSON.stringify(isSoundEnabled));

    if (audioRef.current) {
      if (isSoundEnabled && isOpen) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isSoundEnabled, isOpen]);

  // Save local chat history for guest users
  useEffect(() => {
    if (!user && messages.length > 0) {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Load user chat history from Supabase
  const loadUserChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_assistant_conversations")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const formattedMessages: ChatMessage[] = data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      } else {
        // Add welcome message if no history
        addWelcomeMessage();
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
      // Add welcome message as fallback
      addWelcomeMessage();
    }
  };

  // Load local chat history for guest users
  const loadLocalChatHistory = () => {
    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const formattedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error parsing saved messages:", error);
        addWelcomeMessage();
      }
    } else {
      addWelcomeMessage();
    }
  };

  // Add welcome message
  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: "Hello! I'm your Being of Music assistant. How can I help with your musical journey today?",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // Update position
  const setPosition = (newPosition: Position) => {
    setPositionState(newPosition);
  };

  // Toggle chat open/closed
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Close chat
  const closeChat = () => {
    setIsOpen(false);
  };

  // Open chat
  const openChat = () => {
    setIsOpen(true);
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!isSoundEnabled);
  };

  // Reset chat
  const resetChat = () => {
    if (user) {
      // For logged in users, we'll keep the data in the database
      // but clear the local state
      setMessages([]);
      addWelcomeMessage();
    } else {
      // For guests, clear localStorage too
      localStorage.removeItem(CHAT_MESSAGES_KEY);
      setMessages([]);
      addWelcomeMessage();
    }
    
    toast({
      title: "Chat Reset",
      description: "Your conversation has been reset",
    });
  };

  // Send message
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      // Create user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };

      // Update state with user message
      setMessages((prev) => [...prev, userMessage]);
      
      // Set loading state
      setIsLoading(true);

      // Prepare conversation history for context
      const conversationHistory = messages.slice(-10).map((msg) => ({
        content: msg.content,
        isUser: msg.isUser,
      }));

      // Call Supabase Edge Function
      const response = await fetch("https://epiiamkvbyudknjgkohm.functions.supabase.co/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication header if user is logged in
          ...(user?.id && { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }),
        },
        body: JSON.stringify({
          message,
          userId: user?.id || null,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      // Update state with AI response
      setMessages((prev) => [...prev, aiMessage]);

      // If user is not logged in, save to localStorage
      if (!user) {
        const updatedMessages = [...messages, userMessage, aiMessage];
        localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(updatedMessages));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIAssistantContext.Provider
      value={{
        messages,
        sendMessage,
        isOpen,
        toggleChat,
        closeChat,
        openChat,
        isLoading,
        position,
        setPosition,
        isSoundEnabled,
        toggleSound,
        resetChat,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
};
