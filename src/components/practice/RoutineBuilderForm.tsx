
import React from "react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RoutineBlockForm from "@/components/practice/RoutineBlockForm";
import BlockLibrarySidebar from "@/components/practice/BlockLibrarySidebar";
import { BlockFormValues } from "@/schemas/routineSchema";
import { UseFormReturn } from "react-hook-form";
import { RoutineFormValues } from "@/schemas/routineSchema";
import RoutineHeader from "./RoutineHeader";

interface RoutineBuilderFormProps {
  form: UseFormReturn<RoutineFormValues>;
  onSubmit: (data: RoutineFormValues) => void;
  isLoading: boolean;
  totalDuration: number;
  formattedDuration: string;
  handleAddTemplateBlock: (block: Omit<BlockFormValues, "order_index">) => void;
  isEditing: boolean;
}

const RoutineBuilderForm: React.FC<RoutineBuilderFormProps> = ({
  form,
  onSubmit,
  isLoading,
  totalDuration,
  formattedDuration,
  handleAddTemplateBlock,
  isEditing,
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RoutineHeader 
          title={form.watch("title")}
          isLoading={isLoading}
          totalDuration={totalDuration}
          formattedDuration={formattedDuration}
          isEditing={isEditing}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
          {/* Left Column (Module Bank) */}
          <div className="md:col-span-2 bg-card/70 backdrop-blur-md border-white/10 rounded-xl">
            <BlockLibrarySidebar onAddBlock={handleAddTemplateBlock} />
          </div>
          
          {/* Right Column (Practice Routine Builder) */}
          <div className="md:col-span-3 flex flex-col">
            <div className="bg-card/70 backdrop-blur-md border-white/10 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Routine Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter routine title" 
                          className="text-lg bg-card/80 backdrop-blur-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What's this routine for? What will it help you achieve?" 
                          className="h-20 bg-card/80 backdrop-blur-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="bg-card/70 backdrop-blur-md border-white/10 rounded-xl p-6 flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="mr-2">Your Practice Routine</span>
                  {form.watch("blocks").length > 0 && (
                    <span className="text-white/60 text-sm font-normal">
                      ({form.watch("blocks").length} {form.watch("blocks").length === 1 ? 'block' : 'blocks'})
                    </span>
                  )}
                </h2>
              </div>
              
              {form.watch("blocks").length === 0 ? (
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-white/10 rounded-xl">
                  <p className="text-white/60 text-center">
                    Add modules to create your practice routine
                  </p>
                </div>
              ) : (
                <RoutineBlockForm />
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default RoutineBuilderForm;
