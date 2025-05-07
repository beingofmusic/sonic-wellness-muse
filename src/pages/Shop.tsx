
import React from "react";
import { Layout } from "@/components/Layout";

const Shop: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Shop</h1>
        <p className="text-white/70 mb-4">
          Browse and purchase musical merchandise and resources.
        </p>
        
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-white/70">
            Our shop is being developed. Check back soon for musical merchandise and resources!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Shop;
