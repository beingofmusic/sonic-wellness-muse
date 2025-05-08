
import { useState, useCallback } from "react";

export const useFocusMode = () => {
  const [focusMode, setFocusMode] = useState(false);
  
  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);
  
  return { focusMode, toggleFocusMode };
};
