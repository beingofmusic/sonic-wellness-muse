import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ReactionPickerProps {
  onPick: (emoji: string) => void;
  trigger?: React.ReactNode;
}

const COMMON: string[] = [
  "👍","❤️","😂","🎶","🙌","👏","🔥","😍","😅","😎",
  "😮","😢","🤔","🙏","🫶","💯","🎉","🧠","🫡","😴",
  "🤘","🥳","🤝","✨","🕊️"
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onPick, trigger }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? <button className="px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10">+</button>}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 bg-card border-white/10">
        <div className="grid grid-cols-6 gap-1">
          {COMMON.map((e) => (
            <button
              key={e}
              type="button"
              aria-label={`Add ${e} reaction`}
              className="h-8 w-8 text-lg hover:bg-white/10 rounded-md"
              onClick={() => onPick(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReactionPicker;
