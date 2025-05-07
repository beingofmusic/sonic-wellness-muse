
import React from "react";
import { Layout } from "@/components/Layout";

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <p className="text-white/70 mb-4">
          Customize your account preferences and application settings.
        </p>
        
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-white/70">
            Additional settings options are being developed. Check back soon for more customization!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
