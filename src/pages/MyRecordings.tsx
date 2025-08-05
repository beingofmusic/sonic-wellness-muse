import React from 'react';
import { Layout } from '@/components/Layout';
import RecordingsList from '@/components/practice/recording/RecordingsList';

const MyRecordings: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Practice Recordings</h1>
          <p className="text-white/70">
            Listen to your past practice sessions and track your progress over time
          </p>
        </div>

        <RecordingsList />
      </div>
    </Layout>
  );
};

export default MyRecordings;