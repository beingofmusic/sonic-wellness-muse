
import React from "react";
import MusicLogo from "@/components/MusicLogo";

const FormHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-6">
      <MusicLogo size="lg" withText />
      <h1 className="text-2xl font-semibold mt-4">Welcome Back</h1>
      <p className="text-white/70 text-sm">Sign in to continue your musical journey</p>
    </div>
  );
};

export default FormHeader;
