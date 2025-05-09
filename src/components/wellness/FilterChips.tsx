
import React from 'react';
import { Button } from "@/components/ui/button";

interface FilterChipsProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const FilterChips: React.FC<FilterChipsProps> = ({ 
  options, 
  selectedValue, 
  onChange 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {options.map((option) => (
        <Button
          key={option.value}
          variant={selectedValue === option.value ? "secondary" : "outline"}
          size="sm"
          className={
            selectedValue === option.value
              ? "bg-music-primary/20 text-music-primary border-music-primary/40"
              : "bg-transparent hover:bg-white/5"
          }
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterChips;
