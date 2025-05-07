
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { BlockFormValues } from "@/schemas/routineSchema";
import { getTemplatesByCategory } from "@/data/blockTemplates";
import BlockTemplateCard from "./BlockTemplateCard";
import { getCategoryColorClass, getCategoryIcon, CATEGORIES } from "./CategoryConfig";

interface BlockLibraryContentProps {
  searchQuery: string;
  activeTab: string;
  onAddBlock: (block: Omit<BlockFormValues, "order_index">) => void;
}

const BlockLibraryContent: React.FC<BlockLibraryContentProps> = ({ 
  searchQuery, 
  activeTab, 
  onAddBlock 
}) => {
  return (
    <div className="px-4 pb-6 overflow-y-auto h-full">
      {CATEGORIES.map(category => {
        const filteredTemplates = searchQuery 
          ? getTemplatesByCategory(category.id).filter(template => 
              template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              template.content.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : getTemplatesByCategory(category.id);

        return (
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
                    categoryColor={getCategoryColorClass(template.type)}
                    categoryIcon={getCategoryIcon(template.type)}
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
        );
      })}
    </div>
  );
};

export default BlockLibraryContent;
