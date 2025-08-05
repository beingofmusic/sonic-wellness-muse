import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loopTrainerService } from "@/services/loopTrainerService";
import { LoopTrainerSession, LoopTrainerFormData } from "@/types/loopTrainer";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useLoopTrainer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (sessionData: LoopTrainerFormData) => 
      loopTrainerService.createSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: Partial<LoopTrainerFormData> }) =>
      loopTrainerService.updateSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-sessions"] });
    },
    onError: (error) => {
      toast({
        title: "Error updating session",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => loopTrainerService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-stats"] });
      toast({
        title: "Session deleted",
        description: "Loop trainer session has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting session",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update session stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: ({ sessionId, stats }: { 
      sessionId: string; 
      stats: { loop_count?: number; total_practice_time?: number; session_notes?: string; }
    }) => loopTrainerService.updateSessionStats(sessionId, stats),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["loop-trainer-stats"] });
    }
  });

  return {
    createSession: createSessionMutation.mutateAsync,
    updateSession: updateSessionMutation.mutateAsync,
    deleteSession: deleteSessionMutation.mutateAsync,
    updateSessionStats: updateStatsMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending
  };
};

export const useLoopTrainerSessions = (options: {
  limit?: number;
  offset?: number;
  searchTerm?: string;
} = {}) => {
  const { user } = useAuth();
  const { limit = 20, offset = 0, searchTerm } = options;

  return useQuery({
    queryKey: ["loop-trainer-sessions", user?.id, limit, offset, searchTerm],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (searchTerm) {
        return loopTrainerService.searchSessions(user.id, searchTerm, { limit, offset });
      }
      
      return loopTrainerService.getUserSessions(user.id, { 
        limit, 
        offset,
        orderBy: "created_at",
        orderDirection: "desc"
      });
    },
    enabled: !!user?.id
  });
};

export const useLoopTrainerSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: ["loop-trainer-session", sessionId],
    queryFn: () => {
      if (!sessionId) throw new Error("Session ID required");
      return loopTrainerService.getSessionById(sessionId);
    },
    enabled: !!sessionId
  });
};

export const useLoopTrainerStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["loop-trainer-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      return loopTrainerService.getUserStats(user.id);
    },
    enabled: !!user?.id
  });
};