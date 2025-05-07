
import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useRoutineBuilder } from "@/hooks/useRoutineBuilder";
import RoutineBuilderForm from "@/components/practice/RoutineBuilderForm";
import RoutineBuilderSkeleton from "@/components/practice/RoutineBuilderSkeleton";

const RoutineBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    form,
    isLoading,
    totalDuration,
    formattedDuration,
    handleAddTemplateBlock,
    onSubmit,
    isEditing
  } = useRoutineBuilder(id);

  // If loading and we have an ID, show loading state
  if (isLoading && id) {
    return (
      <Layout>
        <RoutineBuilderSkeleton />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl py-4">
        <RoutineBuilderForm
          form={form}
          onSubmit={onSubmit}
          isLoading={isLoading}
          totalDuration={totalDuration}
          formattedDuration={formattedDuration}
          handleAddTemplateBlock={handleAddTemplateBlock}
          isEditing={isEditing}
        />
      </div>
    </Layout>
  );
};

export default RoutineBuilder;
