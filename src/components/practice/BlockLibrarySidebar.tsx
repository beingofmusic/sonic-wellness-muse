
import React, { useState } from "react";
import { getTemplatesByCategory } from "@/data/blockTemplates";
import { BlockFormValues } from "@/schemas/routineSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Guitar, Headphones, Mic, MicOff, Drum, Clock, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockLibrarySidebarProps {
  onAddBlock: (block: Omit<BlockFormValues, "order_index">) => void;
}

const CATEGORIES = [
  { id: "warmup", name: "Warm-up", icon: <Mic className="h-4 w-4 text-orange-400" /> },
  { id: "technique", name: "Technique", icon: <Guitar className="h-4 w-4 text-music-primary" /> },
  { id: "mindfulness", name: "Mindfulness", icon: <Headphones className="h-4 w-4 text-blue-400" /> },
  { id: "creative", name: "Creative", icon: <Drum className="h-4 w-4 text-green-400" /> },
  { id: "cooldown", name: "Cool-down", icon: <MicOff className="h-4 w-4 text-purple-400" /> },
];

const getCategoryColorClass = (category: string): string => {
  switch (category) {
    case "warmup": return "border-l-orange-400 from-orange-500/5 to-orange-500/10";
    case "technique": return "border-l-music-primary from-music-primary/5 to-music-primary/10";
    case "mindfulness": return "border-l-blue-400 from-blue-500/5 to-blue-500/10";
    case "creative": return "border-l-green-400 from-green-500/5 to-green-500/10";
    case "cooldown": return "border-l-purple-400 from-purple-500/5 to-purple-500/10";
    default: return "border-l-gray-400";
  }
};

const getCategoryIcon = (category: string) => {
  const categoryConfig = CATEGORIES.find(c => c.id === category);
  return categoryConfig?.icon || null;
};

const BlockTemplateCard: React.FC<{
  title: string;
  type: string;
  content: string;
  duration: number;
  onAdd: () => void;
}> = ({ title, type, content, duration, onAdd }) => {
  return (
    <Card className={cn(
      "mb-3 overflow-hidden transition-all hover:shadow-md",
      "bg-gradient-to-r border-l-4",
      getCategoryColorClass(type)
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(type)}
            <h3 className="font-medium text-sm">{title}</h3>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <Clock className="h-3 w-3" />
            <span>{duration} min</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{content}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-1 border-dashed group hover:border-music-primary hover:bg-music-primary/5"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5 mr-1 group-hover:scale-110 transition-transform" />
          Add to Routine
        </Button>
      </CardContent>
    </Card>
  );
};

const BlockLibrarySidebar: React.FC<BlockLibrarySidebarProps> = ({ onAddBlock }) => {
  const [activeTab, setActiveTab] = useState("warmup");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter templates based on search query
  const filteredTemplates = searchQuery 
    ? getTemplatesByCategory(activeTab).filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        template.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getTemplatesByCategory(activeTab);

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
        
        <div className="px-4 pb-6 overflow-y-auto h-full">
          {CATEGORIES.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-0">
              <div className="my-2">
                {filteredTemplates.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No modules match your search
                  </p>
                ) : (
                  filteredTemplates.map(template => (
                    <BlockTemplateCard
                      key={template.id}
                      title={template.title}
                      type={template.type}
                      content={template.content}
                      duration={template.duration}
                      onAdd={() => onAddBlock({
                        type: template.type,
                        content: template.content,
                        duration: template.duration,
                      })}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default BlockLibrarySidebar;
