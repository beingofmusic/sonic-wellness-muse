
import React from "react";
import { getTemplatesByCategory } from "@/data/blockTemplates";
import { BlockFormValues } from "@/schemas/routineSchema";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Guitar, Headphones, Mic, MicOff, Drum, Clock, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface BlockLibrarySidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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
      "mb-3 overflow-hidden transition-all hover:shadow-md cursor-pointer",
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
          onClick={(e) => {
            e.preventDefault();
            onAdd();
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1 group-hover:scale-110 transition-transform" />
          Add to Routine
        </Button>
      </CardContent>
    </Card>
  );
};

const DesktopLibrary: React.FC<BlockLibrarySidebarProps> = ({ isOpen, setIsOpen, onAddBlock }) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[350px] sm:w-[400px] p-0 overflow-y-auto">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="flex items-center gap-2">
            <span>Block Library</span>
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Add pre-made blocks to your routine
          </p>
        </SheetHeader>
        
        <div className="px-6 pb-16">
          <Tabs defaultValue="warmup" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-5 h-auto">
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
            
            {CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="my-4">
                  {getTemplatesByCategory(category.id).map(template => (
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
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MobileLibrary: React.FC<BlockLibrarySidebarProps> = ({ isOpen, setIsOpen, onAddBlock }) => {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            Block Library
          </DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Add pre-made blocks to your routine
          </p>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto">
          <Tabs defaultValue="warmup" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-5 h-auto">
              {CATEGORIES.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="flex flex-col items-center py-2 gap-1"
                >
                  {cat.icon}
                  <span className="text-xs">{cat.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="my-4">
                  {getTemplatesByCategory(category.id).map(template => (
                    <BlockTemplateCard
                      key={template.id}
                      title={template.title}
                      type={template.type}
                      content={template.content}
                      duration={template.duration}
                      onAdd={() => {
                        onAddBlock({
                          type: template.type,
                          content: template.content,
                          duration: template.duration,
                        });
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

const BlockLibrarySidebar: React.FC<BlockLibrarySidebarProps> = (props) => {
  const isMobile = useIsMobile();
  
  return isMobile 
    ? <MobileLibrary {...props} /> 
    : <DesktopLibrary {...props} />;
};

export default BlockLibrarySidebar;
