import React from "react";

const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Shimmer className="h-6 w-40" />
      <Shimmer className="h-8 w-28 rounded-md" />
    </div>

    {/* Form fields */}
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Shimmer className="h-4 w-20 mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
        <div>
          <Shimmer className="h-4 w-24 mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Shimmer className="h-4 w-16 mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
        <div>
          <Shimmer className="h-4 w-20 mb-2" />
          <Shimmer className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div>
        <Shimmer className="h-4 w-32 mb-2" />
        <Shimmer className="h-24 w-full rounded-md" />
      </div>
    </div>
  </div>
);

export const PreviewSkeleton: React.FC = () => (
  <div className="flex items-center justify-center h-full bg-gray-100 p-8">
    <div
      className="bg-white shadow-lg rounded-sm"
      style={{ width: "210mm", height: "297mm", padding: "20mm" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Shimmer className="h-10 w-64 mx-auto mb-3" />
        <Shimmer className="h-6 w-48 mx-auto mb-4" />
        <div className="flex justify-center gap-4">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-4 w-36" />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <Shimmer className="h-6 w-48 mb-3" />
        <Shimmer className="h-4 w-full mb-2" />
        <Shimmer className="h-4 w-full mb-2" />
        <Shimmer className="h-4 w-3/4" />
      </div>

      {/* Experience */}
      <div className="mb-8">
        <Shimmer className="h-6 w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border-l-2 border-gray-200 pl-4">
              <Shimmer className="h-5 w-48 mb-2" />
              <Shimmer className="h-4 w-36 mb-2" />
              <Shimmer className="h-4 w-full mb-1" />
              <Shimmer className="h-4 w-full mb-1" />
              <Shimmer className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div>
        <Shimmer className="h-6 w-32 mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Shimmer key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const EditorSkeleton: React.FC = () => (
  <div className="flex flex-col bg-white border-r border-gray-200">
    {/* Tabs */}
    <div className="flex border-b border-gray-200">
      {["Personal", "Education", "Experience", "Skills"].map((tab, i) => (
        <div key={tab} className="px-6 py-4">
          <Shimmer className={`h-5 ${i === 0 ? "w-20" : "w-24"}`} />
        </div>
      ))}
    </div>

    {/* Form content */}
    <div className="p-6 bg-gray-50/30">
      <div className="max-w-2xl mx-auto">
        <FormSkeleton />
      </div>
    </div>
  </div>
);
