
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchWellnessPracticeById } from '@/services/wellnessService';
import { useCompleteWellnessSession } from '@/hooks/useWellness';

const WellnessPractice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isPracticing, setIsPracticing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const completePractice = useCompleteWellnessSession();

  // Fetch practice details
  const { data: practice, isLoading, error } = useQuery({
    queryKey: ['wellness-practice', id],
    queryFn: () => fetchWellnessPracticeById(id || ''),
    enabled: !!id,
  });

  useEffect(() => {
    if (practice && isPracticing && !isCompleted) {
      setTimeRemaining(practice.duration_minutes * 60);
      
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [practice, isPracticing, isCompleted]);

  const handleStartPractice = () => {
    setIsPracticing(true);
  };

  const handleCompletePractice = () => {
    if (!practice) return;
    
    completePractice.mutate({
      practiceId: practice.id,
      durationMinutes: practice.duration_minutes
    }, {
      onSuccess: () => {
        setTimeout(() => {
          navigate('/wellness');
        }, 2000);
      }
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!practice || timeRemaining === null) return 0;
    
    const totalSeconds = practice.duration_minutes * 60;
    const elapsedSeconds = totalSeconds - timeRemaining;
    return Math.min(Math.round((elapsedSeconds / totalSeconds) * 100), 100);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-60 bg-white/10 rounded"></div>
            <div className="h-40 w-full bg-white/10 rounded"></div>
            <div className="h-12 w-40 bg-white/10 rounded mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !practice) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Practice not found</h2>
            <Button className="mt-4" onClick={() => navigate('/wellness')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wellness Hub
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {!isPracticing ? (
          <div className="space-y-8">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/wellness')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Wellness Hub
              </Button>
              
              <h1 className="text-3xl font-bold mb-2">
                {practice.title}
              </h1>
              
              <div className="flex items-center mb-6 text-white/70">
                <Clock className="h-4 w-4 mr-1" />
                <span>{practice.duration_minutes} minute practice</span>
              </div>
              
              <p className="text-lg text-white/80 mb-6">
                {practice.description}
              </p>
            </div>
            
            <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <p className="whitespace-pre-wrap">{practice.content}</p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-music-primary hover:bg-music-primary/80"
                onClick={handleStartPractice}
              >
                Begin Practice
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-10 py-10">
            <h1 className="text-3xl font-bold">
              {isCompleted ? 'Practice Complete' : practice.title}
            </h1>
            
            {!isCompleted ? (
              <>
                <div className="flex flex-col items-center justify-center">
                  {timeRemaining !== null && (
                    <div className="text-5xl font-semibold mb-4">
                      {formatTime(timeRemaining)}
                    </div>
                  )}
                  <Progress 
                    value={getProgress()} 
                    className="w-full max-w-md h-3"
                  />
                </div>
                
                <div className="bg-card/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="whitespace-pre-wrap text-left">
                    {practice.content}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 bg-green-900/20 rounded-full">
                    <Check className="h-16 w-16 text-green-400" />
                  </div>
                </div>
                
                <p className="text-xl">Well done! You've completed this practice.</p>
                
                {completePractice.isPending ? (
                  <p className="text-white/70">Saving your progress...</p>
                ) : (
                  <Button 
                    size="lg"
                    className="bg-music-primary hover:bg-music-primary/80"
                    onClick={handleCompletePractice}
                  >
                    Complete & Return to Wellness Hub
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WellnessPractice;
