
import React, { useEffect, useState } from "react";
import { fetchUserRoutines } from "@/services/practiceService";
import { PracticeRoutine } from "@/types/practice";
import MyRoutineCard from "./MyRoutineCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const MyRoutines: React.FC = () => {
  const [routines, setRoutines] = useState<PracticeRoutine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadRoutines = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await fetchUserRoutines();
        setRoutines(data);
      } catch (error) {
        console.error("Failed to load routines:", error);
        toast({
          title: "Error loading your routines",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutines();
  }, [user, toast]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">My Routines</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(null).map((_, index) => (
            <div 
              key={`loading-${index}`} 
              className="p-5 rounded-xl border border-white/10 bg-card/80 backdrop-blur-sm animate-pulse h-48"
            />
          ))}
        </div>
      ) : routines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <MyRoutineCard key={routine.id} routine={routine} />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-white/10 bg-card/50 text-center">
          <p className="text-white/70">
            You haven't created any practice routines yet. Create your first routine to get started!
          </p>
        </div>
      )}
    </section>
  );
};

export default MyRoutines;
