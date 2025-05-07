
import React from "react";
import { myRoutines } from "@/data/practiceRoutines";
import MyRoutineCard from "./MyRoutineCard";

const MyRoutines: React.FC = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">My Routines</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myRoutines.map((routine) => (
          <MyRoutineCard key={routine.id} routine={routine} />
        ))}
      </div>
      
      {myRoutines.length === 0 && (
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
