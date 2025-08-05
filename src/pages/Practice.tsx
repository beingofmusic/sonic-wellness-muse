
import React from "react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import FeaturedTemplates from "@/components/practice/FeaturedTemplates";
import CreateRoutineCta from "@/components/practice/CreateRoutineCta";
import OpenPracticeMode from "@/components/practice/OpenPracticeMode";
import MyRoutines from "@/components/practice/MyRoutines";
import PracticeGoals from "@/components/practice/goals/PracticeGoals";

const Practice: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-1">Practice Studio</h1>
            <p className="text-white/70">
              Build, customize, and track your practice routines
            </p>
          </div>
          
          <Link to="/practice/history">
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>
        
        <FeaturedTemplates />
        <CreateRoutineCta />
        <OpenPracticeMode />
        <MyRoutines />
        <PracticeGoals />
      </div>
    </Layout>
  );
};

export default Practice;
