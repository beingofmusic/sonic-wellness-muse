
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  // Redirect to the user profile page with the user's ID
  return <Navigate to={`/users/${user.id}`} />;
};

export default Profile;
