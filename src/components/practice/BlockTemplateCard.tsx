
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlockTemplateCardProps {
  title: string;
  type: string;
  content: string;
  duration: number;
  onAdd: () => void;
  categoryColor: string;
  categoryIcon: React.ReactNode;
}

const BlockTemplateCard: React.FC<BlockTemplateCardProps> = ({
  title,
  type,
  content,
  duration,
  onAdd,
  categoryColor,
  categoryIcon
}) => {
  return (
    <Card className={cn(
      "mb-3 overflow-hidden transition-all hover:shadow-md",
      "bg-gradient-to-r border-l-4",
      categoryColor
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {categoryIcon}
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

export default BlockTemplateCard;
