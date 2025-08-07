import React, { useState } from "react";
import { JournalPrompt } from "@/types/wellness";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import JournalPromptForm from "./JournalPromptForm";
import { useDeleteJournalPrompt } from "@/hooks/useWellnessAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface JournalPromptManagementListProps {
  prompts: JournalPrompt[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'self_composition':
      return '🎵';
    case 'values':
      return '💎';
    case 'resistance':
      return '💪';
    case 'learning':
      return '📚';
    default:
      return '✍️';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'self_composition':
      return 'Self Composition';
    case 'values':
      return 'Values';
    case 'resistance':
      return 'Resistance';
    case 'learning':
      return 'Learning';
    default:
      return type;
  }
};

const JournalPromptManagementList: React.FC<JournalPromptManagementListProps> = ({ prompts }) => {
  const [editingPrompt, setEditingPrompt] = useState<JournalPrompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<JournalPrompt | null>(null);
  const deletePrompt = useDeleteJournalPrompt();
  const { toast } = useToast();

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;
    
    try {
      await deletePrompt.mutateAsync(promptToDelete.id);
      toast({
        title: "Prompt Deleted",
        description: `"${promptToDelete.title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPromptToDelete(null);
    }
  };

  return (
    <div>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/5">
                      {getTypeIcon(prompt.type)} {getTypeLabel(prompt.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{prompt.duration_minutes} min</TableCell>
                  <TableCell className="max-w-xs truncate">{prompt.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPrompt(prompt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPromptToDelete(prompt)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingPrompt && (
        <JournalPromptForm
          prompt={editingPrompt}
          onClose={() => setEditingPrompt(null)}
          onSuccess={() => {
            setEditingPrompt(null);
            toast({
              title: "Prompt Updated",
              description: "The journal prompt has been updated successfully.",
            });
          }}
        />
      )}

      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{promptToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrompt}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JournalPromptManagementList;