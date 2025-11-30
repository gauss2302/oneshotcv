"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, ChevronDown, Trash2 } from "lucide-react";
import ResumeHeader from "@/components/layout/Header";
import { useCVStore } from "@/store/useCVStore";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { createEmptyCVState } from "@/lib/resume/defaultCvState";

interface ResumeVersion {
  id: string;
  title: string;
  updatedAt: string | null;
}

const templateOptions = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "creative", label: "Creative" },
  { id: "minimalist", label: "Minimalist" },
  { id: "professional", label: "Professional" },
  { id: "bold", label: "Bold" },
  { id: "sidebar", label: "Sidebar" },
  { id: "designer", label: "Designer" },
] as const;

export default function Dashboard() {
  const { setTemplate } = useCVStore();
  const router = useRouter();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTemplate, setCreateTemplate] = useState<string>(
    templateOptions[0].id
  );
  const [createTitle, setCreateTitle] = useState("New Resume");
  const [createError, setCreateError] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeVersion | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVersions = useCallback(async (selectedId?: string | null) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/resume/list", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setVersions(data.resumes ?? []);
      setSelectedVersionId(selectedId ?? data.resumes?.[0]?.id ?? null);
    } catch (error) {
      console.error("Failed to load resumes", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const startCreateFlow = (templateId?: string, name?: string) => {
    setCreateTemplate(templateId ?? templateOptions[0].id);
    setCreateTitle(name ?? "New Resume");
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!createTitle.trim()) {
      setCreateError("Please provide a name for your CV.");
      return;
    }
    setIsCreateModalOpen(false);
    await createResumeVersion(createTemplate, createTitle.trim());
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  const handleSelectVersion = (resumeId: string) => {
    setSelectedVersionId(resumeId);
    router.push(`/editor?resumeId=${resumeId}`);
  };

  const createResumeVersion = useCallback(
    async (templateId: string, title: string) => {
      try {
        setIsCreating(true);
        setTemplate(templateId);
        const initialState = createEmptyCVState();
        const payload = {
          content: {
            ...initialState,
            selectedTemplate: templateId,
          },
          title: title || "New Resume",
          createNew: true,
        };
        const response = await fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create resume");
        const result = await response.json();
        await fetchVersions(result.id);
        router.push(`/editor?resumeId=${result.id}`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    },
    [fetchVersions, router, setTemplate]
  );

  const requestDeleteVersion = (version: ResumeVersion) => {
    setResumeToDelete(version);
  };

  const handleDeleteVersion = async () => {
    if (!resumeToDelete) return;
    try {
      setIsDeleting(true);
      const response = await fetch("/api/resume", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resumeToDelete.id }),
      });
      if (!response.ok) throw new Error("Failed to delete resume");
      const nextSelected =
        resumeToDelete.id === selectedVersionId ? null : selectedVersionId;
      await fetchVersions(nextSelected);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
        <DashboardSidebar
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={handleSelectVersion}
          onCreateVersion={() => startCreateFlow()}
          onDeleteVersion={requestDeleteVersion}
          isLoading={isLoading}
          isCreating={isCreating}
        />

        <div className="flex-1 flex flex-col">
          <ResumeHeader />
          <main className="px-6 lg:px-10 py-10 flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Resume Builder
                </h1>
                <p className="text-gray-500 text-lg">
                  Create and manage your CV versions
                </p>
              </div>
              <button
                onClick={() => startCreateFlow("classic", "New Resume")}
                disabled={isCreating}
                className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#FFA239]/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                <Plus size={20} />
                {isCreating ? "Creating..." : "New Resume"}
              </button>
            </div>

            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    My CV Versions
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Quickly switch between saved resumes to tailor them for
                    different roles.
                  </p>
                </div>
                <button
                  onClick={() => fetchVersions(selectedVersionId)}
                  className="text-sm text-gray-500 hover:text-[#FF5656] transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading
                  ? Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    ))
                  : versions.map((version) => {
                      const isActive = version.id === selectedVersionId;
                      return (
                        <div
                          key={version.id}
                          className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 ${
                            isActive ? "border-[#FFA239]" : "border-gray-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {version.title}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Updated{" "}
                                {version.updatedAt
                                  ? new Date(version.updatedAt).toLocaleString()
                                  : "Not yet"}
                              </p>
                            </div>
                            <button
                              onClick={() => requestDeleteVersion(version)}
                              className="p-2 rounded-full text-gray-400 hover:text-[#FF5656] hover:bg-red-50 transition"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelectVersion(version.id)}
                              className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                            >
                              Continue Editing
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/editor?resumeId=${version.id}`)
                              }
                              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      );
                    })}
              </div>
            </section>

            <div className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Sample Resume
                </h2>
                <button className="text-[#FFA239] font-medium hover:text-[#FF5656] hover:underline flex items-center gap-1 transition-colors">
                  See All <ChevronDown className="-rotate-90" size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Create Blank Card */}
                <div
                  onClick={() => startCreateFlow("classic", "Classic Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 h-[340px] flex flex-col items-center justify-center hover:border-[#FFA239] hover:bg-[#FFA239]/5 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#FFA239]/10 group-hover:text-[#FFA239] transition-colors mb-4">
                      <Plus size={24} />
                    </div>
                    <span className="font-semibold text-gray-600 group-hover:text-[#FFA239]">
                      Create Blank Resume
                    </span>
                  </div>
                </div>

                {/* Template 1: Classic */}
                <div
                  onClick={() => startCreateFlow("classic", "Classic Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      {/* Mockup of a resume */}
                      <div className="absolute inset-2 bg-white shadow-sm p-2 text-[4px] text-gray-400 overflow-hidden">
                        <div className="flex gap-1">
                          <div className="w-1/3 bg-[#FF5656] h-full"></div>
                          <div className="w-2/3 p-1">
                            <div className="w-20 h-2 bg-[#FF5656] mb-1"></div>
                            <div className="w-full h-1 bg-gray-200 mb-0.5"></div>
                            <div className="w-full h-1 bg-gray-200 mb-0.5"></div>
                            <div className="w-3/4 h-1 bg-gray-200 mb-0.5"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Investment Banking Model
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Template 2: Modern */}
                <div
                  onClick={() => startCreateFlow("modern", "Modern Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm p-2 text-[4px] text-gray-400 overflow-hidden">
                        <div className="text-center mb-2">
                          <div className="w-20 h-2 bg-[#8CE4FF] mx-auto mb-1"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="h-20 bg-gray-50"></div>
                          <div className="h-20 bg-gray-50"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Creative Portfolio
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Template 3: Creative */}
                <div
                  onClick={() => startCreateFlow("creative", "Creative Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm p-2 text-[4px] text-gray-400 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                          <div className="w-20 h-2 bg-gray-800"></div>
                        </div>
                        <div className="flex-1 bg-gray-50"></div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Creative Portfolio
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Template 4: Minimalist (ATS) */}
                <div
                  onClick={() => startCreateFlow("minimalist", "Minimalist Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm p-4 text-[4px] text-gray-600 overflow-hidden flex flex-col">
                        <div className="w-full text-center mb-2">
                          <div className="w-24 h-2 bg-black mx-auto mb-1"></div>
                          <div className="w-32 h-1 bg-gray-400 mx-auto"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-3/4 h-1 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Minimalist (ATS)
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          ATS Friendly
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 5: Professional (ATS) */}
                <div
                  onClick={() => startCreateFlow("professional", "Professional Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm p-4 text-[4px] text-gray-600 overflow-hidden flex flex-col">
                        <div className="w-full border-b border-gray-300 pb-1 mb-2">
                          <div className="w-24 h-2 bg-[#FFA239] mb-1"></div>
                          <div className="w-24 h-2 bg-[#FFA239] mb-1"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-16 h-1.5 bg-[#FFA239] mb-1"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Professional (ATS)
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          ATS Friendly
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 6: Modern Minimalist */}
                <div
                  onClick={() => startCreateFlow("modern-minimalist", "Modern Minimalist Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm p-4 text-[4px] text-gray-600 overflow-hidden flex flex-col">
                        <div className="w-full mb-2">
                          <div className="w-24 h-2 bg-[#8CE4FF] mb-1"></div>
                          <div className="w-20 h-1 bg-gray-400"></div>
                        </div>
                        <div className="flex gap-1 mb-2">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-3/4 h-1 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Modern Minimalist
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-[#8CE4FF]/10 text-[#8CE4FF] rounded-full font-medium">
                          Clean
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 7: Bold */}
                <div
                  onClick={() => startCreateFlow("bold", "Bold Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm overflow-hidden flex flex-col">
                        <div className="w-full h-24 bg-gradient-to-r from-[#FFA239] to-[#FF5656] p-4 flex flex-col justify-center items-center mb-2">
                          <div className="w-32 h-3 bg-white mb-1"></div>
                          <div className="w-20 h-1 bg-white opacity-70"></div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-center gap-1 mb-2">
                            <div className="w-8 h-2 rounded-full border border-[#FFA239]"></div>
                            <div className="w-8 h-2 rounded-full border border-[#FFA239]"></div>
                          </div>
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Bold Creative
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-[#FF5656]/10 text-[#FF5656] rounded-full font-medium">
                          Impactful
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 8: Sidebar */}
                <div
                  onClick={() => startCreateFlow("sidebar", "Sidebar Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm overflow-hidden flex">
                        {/* Sidebar */}
                        <div className="w-1/3 h-full bg-[#1e293b] p-2 flex flex-col">
                          <div className="w-8 h-8 rounded-full bg-white/20 mb-2"></div>
                          <div className="w-full h-1 bg-white/40 mb-1"></div>
                          <div className="w-2/3 h-1 bg-white/40 mb-4"></div>
                          <div className="w-full h-1 bg-white/20 mb-1"></div>
                          <div className="w-full h-1 bg-white/20 mb-1"></div>
                        </div>
                        {/* Main Content */}
                        <div className="w-2/3 p-2 space-y-2">
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-full h-1 bg-gray-300"></div>
                          <div className="w-3/4 h-1 bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Sidebar Modern
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          Professional
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Template 9: Designer */}
                <div
                  onClick={() => startCreateFlow("designer", "Designer Resume")}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-[340px] relative transition-shadow hover:shadow-md">
                    <div className="h-[260px] bg-gray-100 overflow-hidden relative">
                      <div className="absolute inset-2 bg-white shadow-sm overflow-hidden flex">
                        {/* Sidebar */}
                        <div className="w-1/3 h-full bg-[#F9F5F0] p-2 flex flex-col">
                          <div className="w-8 h-8 rounded-full bg-gray-300 mb-2 border-2 border-white"></div>
                          <div className="w-full h-1 bg-gray-400 mb-1"></div>
                          <div className="w-2/3 h-1 bg-gray-400 mb-4"></div>
                          <div className="w-full h-1 bg-gray-300 mb-1"></div>
                          <div className="w-full h-1 bg-gray-300 mb-1"></div>
                        </div>
                        {/* Main Content */}
                        <div className="w-2/3 flex flex-col">
                          {/* Header */}
                          <div className="h-12 bg-[#E0B656] w-full mb-2 flex flex-col justify-center items-end px-2">
                            <div className="w-16 h-2 bg-white mb-1"></div>
                            <div className="w-10 h-1 bg-white/80"></div>
                          </div>
                          <div className="p-2 space-y-2">
                            <div className="w-full h-1 bg-gray-300"></div>
                            <div className="w-full h-1 bg-gray-300"></div>
                            <div className="w-3/4 h-1 bg-gray-300"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Designer Profile
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                          Creative
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </main>
        </div>
      </div>
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Create New CV
              </h3>
              <p className="text-sm text-gray-500">
                Choose a template and give your resume a name.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Resume Name
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FFA239]"
                  placeholder="e.g. Product Manager CV"
                />
                {createError && (
                  <p className="text-sm text-red-500 mt-1">{createError}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Template
                </label>
                <select
                  value={createTemplate}
                  onChange={(e) => setCreateTemplate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFA239]"
                >
                  {templateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white font-semibold shadow hover:opacity-90 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {resumeToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Delete CV
              </h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {resumeToDelete.title || "Untitled Resume"}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResumeToDelete(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVersion}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
