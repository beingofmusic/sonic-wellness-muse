
import { supabase } from "@/integrations/supabase/client";

/**
 * Log content issues so QA can investigate.
 * issue_type examples:
 * - ROUTINE_NOT_FOUND
 * - NO_BLOCKS
 * - ACCESS_DENIED
 * - BROKEN_LINK
 * - MISMATCHED_ID
 */
export const logContentIssue = async ({
  routine_id,
  page,
  issue_type,
  details,
}: {
  routine_id?: string | null;
  page?: string | null;
  issue_type: string;
  details?: any;
}) => {
  // Best-effort logging; don't throw to avoid interrupting UX
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      routine_id: routine_id ?? null,
      page: page ?? null,
      issue_type,
      details: details ?? {},
      user_id: user?.id ?? null,
    };

    const { error } = await supabase.from("content_issue_logs").insert(payload);
    if (error) {
      console.warn("logContentIssue insert failed:", error);
    }
  } catch (e) {
    console.warn("logContentIssue failed:", e);
  }
};
