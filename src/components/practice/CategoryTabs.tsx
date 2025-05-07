
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "./CategoryConfig";

interface CategoryTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <TabsList className="w-full mb-4 grid grid-cols-5 h-auto px-4">
      {CATEGORIES.map(cat => (
        <TabsTrigger 
          key={cat.id} 
          value={cat.id}
          className="flex flex-col items-center py-2 gap-1 data-[state=active]:bg-sidebar-accent"
        >
          {cat.icon}
          <span className="text-xs">{cat.name}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default CategoryTabs;
