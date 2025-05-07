
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PracticeTemplateCard from "./PracticeTemplateCard";
import { fetchTemplates } from "@/services/practiceService";
import { PracticeTemplate } from "@/types/practice";
import { useToast } from "@/hooks/use-toast";

const FeaturedTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchTemplates(3);
        setTemplates(data);
      } catch (error) {
        console.error("Failed to load templates:", error);
        toast({
          title: "Error loading templates",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [toast]);

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Featured Templates</h2>
        <Link to="/practice/templates" className="flex items-center gap-1 text-music-primary hover:text-music-secondary transition-colors text-sm">
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Placeholder loading state
          Array(3).fill(null).map((_, index) => (
            <div 
              key={`loading-${index}`} 
              className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm animate-pulse h-72"
            />
          ))
        ) : templates.length > 0 ? (
          templates.map((template) => (
            <PracticeTemplateCard key={template.id} template={template} />
          ))
        ) : (
          <div className="col-span-3 p-8 text-center text-white/70">
            No practice templates available yet.
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedTemplates;
