import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import MyRoutines from "@/components/practice/MyRoutines";

const MyRoutinesPage: React.FC = () => {
  useEffect(() => {
    document.title = "My Saved Practice Routines | Being of Music";
    const desc = "Access and manage your saved practice routines in one place.";
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
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">My Saved Practice Routines</h1>
          <p className="text-white/70">Continue, edit, and manage your routines</p>
        </div>
        <MyRoutines />
      </div>
    </Layout>
  );
};

export default MyRoutinesPage;
