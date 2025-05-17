
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarEvent, EventType } from "@/types/calendar";
import { useUserRoutines } from "@/hooks/useUserRoutines";
import { eventFormSchema, EventFormData } from "@/schemas/calendarEventSchema";
import EventFormFields from "./EventFormFields";
import EventDeleteDialog from "./EventDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onSave: (data: EventFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const EventModal: React.FC<EventModalProps> = ({
  open, 
  onOpenChange, 
  event, 
  onSave,
  onDelete
}) => {
  const { routines } = useUserRoutines();
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      event_type: "practice" as EventType,
      event_date: new Date(),
      event_time: format(new Date(), "HH:mm"),
      duration_minutes: 30,
      location: "",
      description: "",
      routine_id: undefined,
      visibility: "private",
      zoom_link: ""
    }
  });

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        event_type: event.event_type as EventType,
        event_date: new Date(event.event_date),
        event_time: event.event_time.substring(0, 5), // Format HH:MM
        duration_minutes: event.duration_minutes,
        location: event.location || "",
        description: event.description || "",
        routine_id: event.routine_id,
        visibility: event.visibility || "private",
        zoom_link: event.zoom_link || ""
      });
    } else {
      form.reset({
        title: "",
        event_type: "practice" as EventType,
        event_date: new Date(),
        event_time: format(new Date(), "HH:mm"),
        duration_minutes: 30,
        location: "",
        description: "",
        routine_id: undefined,
        visibility: "private",
        zoom_link: ""
      });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormData) => {
    await onSave(data);
  };

  const handleDelete = async () => {
    if (event) {
      await onDelete(event.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4 -mr-4 max-h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <EventFormFields form={form} routines={routines} />
            </form>
          </Form>
        </ScrollArea>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4 flex-wrap">
          {event && (
            <EventDeleteDialog onDelete={handleDelete} />
          )}
          
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            {event ? "Update Event" : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
