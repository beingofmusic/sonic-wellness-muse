import React, { useState } from "react";
import { WellnessPractice } from "@/types/wellness";
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
import { formatDistanceToNow } from "date-fns";
import WellnessPracticeForm from "./WellnessPracticeForm";
import { useDeleteWellnessPractice } from "@/hooks/useWellnessAdmin";
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

interface WellnessPracticeManagementListProps {
  practices: WellnessPractice[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'meditation':
      return '🧘';
    case 'breathwork':
      return '🌬️';
    case 'yoga_fitness':
      return '🧘‍♀️';
    default:
      return '💚';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'meditation':
      return 'Meditation';
    case 'breathwork':
      return 'Breathwork';
    case 'yoga_fitness':
      return 'Yoga & Fitness';
    default:
      return type;
  }
};

const WellnessPracticeManagementList: React.FC<WellnessPracticeManagementListProps> = ({ practices }) => {
  const [editingPractice, setEditingPractice] = useState<WellnessPractice | null>(null);
  const [practiceToDelete, setPracticeToDelete] = useState<WellnessPractice | null>(null);
  const deletePractice = useDeleteWellnessPractice();
  const { toast } = useToast();

  const handleDeletePractice = async () => {
    if (!practiceToDelete) return;
    
    try {
      await deletePractice.mutateAsync(practiceToDelete.id);
      toast({
        title: "Practice Deleted",
        description: `"${practiceToDelete.title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the practice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPracticeToDelete(null);
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
              {practices.map((practice) => (
                <TableRow key={practice.id}>
                  <TableCell className="font-medium">{practice.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white/5">
                      {getTypeIcon(practice.type)} {getTypeLabel(practice.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{practice.duration_minutes} min</TableCell>
                  <TableCell className="max-w-xs truncate">{practice.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPractice(practice)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPracticeToDelete(practice)}
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

      {editingPractice && (
        <WellnessPracticeForm
          practice={editingPractice}
          onClose={() => setEditingPractice(null)}
          onSuccess={() => {
            setEditingPractice(null);
            toast({
              title: "Practice Updated",
              description: "The wellness practice has been updated successfully.",
            });
          }}
        />
      )}

      <AlertDialog open={!!practiceToDelete} onOpenChange={(open) => !open && setPracticeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Wellness Practice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{practiceToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePractice}
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

export default WellnessPracticeManagementList;