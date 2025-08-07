import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import AIRoutineCreator from "@/components/practice/AIRoutineCreator";

const AIRoutinePage: React.FC = () => {
  useEffect(() => {
    document.title = "AI Practice Routine Generator | Being of Music";
    const desc = "Generate creative, personalized music practice routines with AI.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
  }, []);
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