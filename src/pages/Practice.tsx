
import React from "react";
import { Layout } from "@/components/Layout";

const Practice: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Practice</h1>
        <p className="text-white/70 mb-4">
          Your personalized practice routines and tools will appear here.
        </p>
        
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-white/70">
            The practice module is currently under development. Check back soon for new features!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
