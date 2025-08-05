import React from "react";
import { Layout } from "@/components/Layout";
import AIRoutineCreator from "@/components/practice/AIRoutineCreator";

const AIRoutinePage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Practice Routine Generator</h1>
          <p className="text-white/70">
            Let AI create a personalized practice routine based on your goals and preferences
          </p>
        </div>
        <AIRoutineCreator />
      </div>
    </Layout>
  );
};

export default AIRoutinePage;