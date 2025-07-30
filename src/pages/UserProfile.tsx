import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import Profile from './Profile';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  
  // If no userId provided, redirect to not found
  if (!userId) {
    return <Navigate to="/404" replace />;
  }
  
  // If viewing own profile, redirect to /profile
  if (user && userId === user.id) {
    return <Navigate to="/profile" replace />;
  }
  
  return (
    <Layout>
      <Profile viewingUserId={userId} />
    </Layout>
  );
};

export default UserProfile;