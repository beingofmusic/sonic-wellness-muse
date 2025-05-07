
import React, { useState } from "react";
import { BlockFormValues } from "@/schemas/routineSchema";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import BlockLibraryContent from "./BlockLibraryContent";
import CategoryTabs from "./CategoryTabs";

interface BlockLibrarySidebarProps {
  onAddBlock: (block: Omit<BlockFormValues, "order_index">) => void;
}

const BlockLibrarySidebar: React.FC<BlockLibrarySidebarProps> = ({ onAddBlock }) => {
  const [activeTab, setActiveTab] = useState("warmup");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 pb-2">
        <h2 className="text-lg font-semibold mb-1">Module Bank</h2>
        <p className="text-sm text-white/60 mb-3">Add modules to your routine</p>
        
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search modules..." 
            className="pl-9 bg-card/80 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs 
        defaultValue="warmup" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1"
      >
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <BlockLibraryContent
          searchQuery={searchQuery}
          activeTab={activeTab}
          onAddBlock={onAddBlock}
        />
      </Tabs>
    </div>
  );
};

export default BlockLibrarySidebar;
