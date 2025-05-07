
import React from "react";
import { Layout } from "@/components/Layout";
import FeaturedTemplates from "@/components/practice/FeaturedTemplates";
import CreateRoutineCta from "@/components/practice/CreateRoutineCta";
import MyRoutines from "@/components/practice/MyRoutines";

const Practice: React.FC = () => {
  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Studio</h1>
          <p className="text-white/70">
            Build, customize, and track your practice routines
          </p>
        </div>
        
        <FeaturedTemplates />
        <CreateRoutineCta />
        <MyRoutines />
      </div>
    </Layout>
  );
};

export default Practice;
