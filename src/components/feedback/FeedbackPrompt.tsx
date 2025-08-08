import React, { useEffect, useMemo, useState } from "react";
import StarRating from "./StarRating";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAddOrUpdateComment, useUpsertRating, useUserRoutineComment, useUserRoutineRating } from "@/hooks/useRoutineFeedback";
import { useToast } from "@/hooks/use-toast";

interface FeedbackPromptProps {
  routineId: string;
}

const FeedbackPrompt: React.FC<FeedbackPromptProps> = ({ routineId }) => {
  const { toast } = useToast();
  const { data: existingRating } = useUserRoutineRating(routineId);
  const { data: existingComment } = useUserRoutineComment(routineId);
  const [rating, setRating] = useState<number>(existingRating ?? 0);
  const [comment, setComment] = useState<string>(existingComment?.comment ?? "");

  const upsertRating = useUpsertRating(routineId);
  const addOrUpdateComment = useAddOrUpdateComment(routineId, existingComment?.id);

  useEffect(() => {
    if (existingRating != null) setRating(existingRating);
  }, [existingRating]);
  useEffect(() => {
    if (existingComment) setComment(existingComment.comment);
  }, [existingComment]);

  const handleSubmit = async () => {
    try {
      if (rating > 0) {
        await upsertRating.mutateAsync(rating);
      }
      if (comment.trim().length > 0) {
        await addOrUpdateComment.mutateAsync(comment.trim());
      }
      toast({ title: "Thanks for the feedback!", description: "Your rating has been saved." });
    } catch (e: any) {
      toast({ title: "Couldn't save feedback", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  const remaining = 280 - comment.length;

  return (
    <section className="w-full max-w-2xl mx-auto mt-2">
      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-white/10 p-5">
        <h2 className="text-lg font-semibold mb-1">How was your session?</h2>
        <p className="text-sm text-muted-foreground mb-3">Rate and optionally leave a short comment to help others discover great routines.</p>
        <StarRating value={rating} onChange={setRating} className="mb-3" />
        <div>
          <label htmlFor="comment" className="sr-only">Leave a comment (optional)</label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => {
              const v = e.target.value;
              if (v.length <= 280) setComment(v);
            }}
            placeholder="Leave a comment (optional)"
            className="bg-background/60"
          />
          <div className="mt-1 text-xs text-muted-foreground flex justify-between">
            <span>{remaining} characters remaining</span>
            {existingComment && <span>Updating your previous comment</span>}
          </div>
        </div>
        <div className="mt-4 flex gap-2 justify-end">
          <Button
            onClick={handleSubmit}
            disabled={upsertRating.isPending || addOrUpdateComment.isPending || rating === 0}
            className="music-button"
          >
            {existingRating ? "Update feedback" : "Submit feedback"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeedbackPrompt;
