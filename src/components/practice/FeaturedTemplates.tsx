
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import PracticeTemplateCard from "./PracticeTemplateCard";
import { featuredTemplates } from "@/data/practiceTemplates";

const FeaturedTemplates: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Featured Templates</h2>
        <Link to="/practice/templates" className="flex items-center gap-1 text-music-primary hover:text-music-secondary transition-colors text-sm">
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredTemplates.map((template) => (
          <PracticeTemplateCard key={template.id} template={template} />
        ))}
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={() => {}} 
          variant="outline" 
          className="text-white/70 hover:text-white/90"
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          onClick={() => {}} 
          variant="outline" 
          className="ml-4 text-white/70 hover:text-white/90"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};

export default FeaturedTemplates;
