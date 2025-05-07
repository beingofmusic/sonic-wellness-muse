
import React from "react";
import { Layout } from "@/components/Layout";
import FeaturedTemplates from "@/components/practice/FeaturedTemplates";
import CreateRoutineCta from "@/components/practice/CreateRoutineCta";
import MyRoutines from "@/components/practice/MyRoutines";

const Practice: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Practice Studio</h1>
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
