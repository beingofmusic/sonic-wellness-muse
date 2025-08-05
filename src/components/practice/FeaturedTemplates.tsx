import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import PracticeTemplateCard from "./PracticeTemplateCard";
import { fetchTemplates } from "@/services/practiceService";
import { PracticeTemplate } from "@/types/practice";
import { useToast } from "@/hooks/use-toast";
const FeaturedTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    toast
  } = useToast();
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
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, [toast]);
  return <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Practice Options</h2>
        <Link to="/practice/templates" className="flex items-center gap-1 text-music-primary hover:text-music-secondary transition-colors text-sm">
          See all templates <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Practice Option */}
        <div className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-200">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🌀</span>
            <span className="text-sm text-white/60">Unstructured</span>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Open Practice</h3>
          <p className="text-white/70 text-sm mb-3">Start an unstructured session without a routine. Ideal for creative exploration, jamming, or warming up without a set plan.</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 rounded-md bg-white/10 text-xs">Freestyle</span>
            <span className="px-2 py-1 rounded-md bg-white/10 text-xs">Creative</span>
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1 text-xs text-white/50">
              <span>Counts toward streaks</span>
            </div>
            
            <Link to="/practice/routine/open-practice">
              <Button className="bg-music-primary hover:bg-music-secondary text-white">
                <Play className="w-4 h-4 mr-1" />
                Start Practice
              </Button>
            </Link>
          </div>
        </div>
        {isLoading ?
      // Placeholder loading state
      Array(3).fill(null).map((_, index) => <div key={`loading-${index}`} className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm animate-pulse h-72" />) : templates.length > 0 ? templates.map(template => <PracticeTemplateCard key={template.id} template={template} />) : <div className="col-span-3 p-8 text-center text-white/70">
            No practice templates available yet.
          </div>}
      </div>
    </section>;
};
export default FeaturedTemplates;