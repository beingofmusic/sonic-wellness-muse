import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWellnessPractices, useJournalPrompts } from "@/hooks/useWellness";
import WellnessPracticeManagementList from "@/components/wellness/admin/WellnessPracticeManagementList";
import JournalPromptManagementList from "@/components/wellness/admin/JournalPromptManagementList";
import WellnessPracticeForm from "@/components/wellness/admin/WellnessPracticeForm";
import JournalPromptForm from "@/components/wellness/admin/JournalPromptForm";
import PermissionRoute from "@/components/PermissionRoute";
import { useToast } from "@/hooks/use-toast";

const WellnessManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPractice, setIsAddingPractice] = useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState("practices");
  
  const { data: practices = [], isLoading: practicesLoading, refetch: refetchPractices } = useWellnessPractices();
  const { data: prompts = [], isLoading: promptsLoading, refetch: refetchPrompts } = useJournalPrompts();
  const { toast } = useToast();

  const filteredPractices = practices.filter(
    (practice) =>
      practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      practice.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePracticeSuccess = () => {
    setIsAddingPractice(false);
    refetchPractices();
    toast({
      title: "Practice Updated",
      description: "The wellness practice has been updated successfully.",
    });
  };

  const handlePromptSuccess = () => {
    setIsAddingPrompt(false);
    refetchPrompts();
    toast({
      title: "Prompt Updated", 
      description: "The journal prompt has been updated successfully.",
    });
  };

  return (
    <Layout>
      <PermissionRoute permission="manage_courses">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Wellness Management</h1>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            <Input
              placeholder="Search by title, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="practices">Guided Practices</TabsTrigger>
                <TabsTrigger value="prompts">Journal Prompts</TabsTrigger>
              </TabsList>
              
              <Button
                onClick={() => {
                  if (activeTab === "practices") {
                    setIsAddingPractice(true);
                  } else {
                    setIsAddingPrompt(true);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {activeTab === "practices" ? "New Practice" : "New Prompt"}
              </Button>
            </div>

            <TabsContent value="practices">
              {practicesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-20 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filteredPractices.length === 0 ? (
                <div className="p-6 text-center rounded-lg border border-white/10 bg-card/30">
                  <h3 className="text-lg font-medium mb-2">No Practices Found</h3>
                  <p className="text-white/70">
                    {searchQuery ? "No practices match your search criteria." : "There are no wellness practices yet. Create your first practice!"}
                  </p>
                </div>
              ) : (
                <WellnessPracticeManagementList practices={filteredPractices} />
              )}
            </TabsContent>

            <TabsContent value="prompts">
              {promptsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-20 rounded-lg bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="p-6 text-center rounded-lg border border-white/10 bg-card/30">
                  <h3 className="text-lg font-medium mb-2">No Prompts Found</h3>
                  <p className="text-white/70">
                    {searchQuery ? "No prompts match your search criteria." : "There are no journal prompts yet. Create your first prompt!"}
                  </p>
                </div>
              ) : (
                <JournalPromptManagementList prompts={filteredPrompts} />
              )}
            </TabsContent>
          </Tabs>

          {isAddingPractice && (
            <WellnessPracticeForm
              onClose={() => setIsAddingPractice(false)}
              onSuccess={handlePracticeSuccess}
            />
          )}

          {isAddingPrompt && (
            <JournalPromptForm
              onClose={() => setIsAddingPrompt(false)}
              onSuccess={handlePromptSuccess}
            />
          )}
        </div>
      </PermissionRoute>
    </Layout>
  );
};

export default WellnessManagement;