
import React from "react";
import { Layout } from "@/components/Layout";

const Community: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Community</h1>
        <p className="text-white/70 mb-4">
          Connect with fellow musicians and share your musical journey.
        </p>
        
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-white/70">
            Our community features are being developed. Check back soon to connect with other musicians!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
