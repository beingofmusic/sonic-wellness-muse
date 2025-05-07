
import React from "react";
import { Layout } from "@/components/Layout";

const Calendar: React.FC = () => {
  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
        <p className="text-white/70 mb-4">
          Schedule and manage your musical activities and practice sessions.
        </p>
        
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-white/70">
            Our calendar features are being developed. Check back soon to organize your musical journey!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;
