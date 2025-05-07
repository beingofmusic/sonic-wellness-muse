
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to the Landing page on mount
  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  // Return the Landing component as a fallback
  return <Landing />;
};

export default Index;
