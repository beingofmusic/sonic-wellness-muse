import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addComment,
  deleteComment,
  getRatingSummary,
  getUserRating,
  getUserComment,
  listComments,
  toggleLikeComment,
  upsertRating,
  updateComment,
} from "@/services/feedbackService";

export const useRatingSummary = (routineId?: string) => {
  return useQuery({
    queryKey: ["rating-summary", routineId],
    queryFn: () => getRatingSummary(routineId as string),
    enabled: !!routineId,
    staleTime: 60_000,
  });
};

export const useUserRoutineRating = (routineId?: string) => {
  return useQuery({
    queryKey: ["user-rating", routineId],
    queryFn: () => getUserRating(routineId as string),
    enabled: !!routineId,
  });
};

export const useUserRoutineComment = (routineId?: string) => {
  return useQuery({
    queryKey: ["user-comment", routineId],
    queryFn: () => getUserComment(routineId as string),
    enabled: !!routineId,
  });
};

export const useUpsertRating = (routineId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rating: number) => upsertRating(routineId, rating),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rating-summary", routineId] });
      qc.invalidateQueries({ queryKey: ["user-rating", routineId] });
    },
  });
};

export const useComments = (routineId?: string, limit = 10) => {
  return useQuery({
    queryKey: ["routine-comments", routineId, limit],
    queryFn: () => listComments(routineId as string, limit, 0),
    enabled: !!routineId,
  });
};

export const useAddOrUpdateComment = (routineId: string, existingId?: string | null) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => existingId ? updateComment(existingId, text) : addComment(routineId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routine-comments", routineId] });
      qc.invalidateQueries({ queryKey: ["user-comment", routineId] });
    },
  });
};

export const useDeleteComment = (routineId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routine-comments", routineId] });
      qc.invalidateQueries({ queryKey: ["user-comment", routineId] });
    },
  });
};

export const useToggleLike = (routineId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => toggleLikeComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routine-comments", routineId] });
    },
  });
};
