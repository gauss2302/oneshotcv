import React, { useEffect } from "react";
import { useCVStore } from "@/store/useCVStore";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhotoUpload } from "./PhotoUpload";
import { templateSupportsPhoto } from "@/lib/template-config";

const personalSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  title: z.string().min(1, "Professional title is required"),
  summary: z.string().optional(),
});

type PersonalFormData = z.infer<typeof personalSchema>;

export const PersonalForm: React.FC = () => {
  const {
    personalInfo,
    updatePersonal,
    selectedTemplate,
    dataVersion,
    isLoading,
  } = useCVStore();

  const {
    register,
    control,
    reset,
    formState: { errors },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address: personalInfo.address,
      title: personalInfo.title,
      summary: personalInfo.summary,
    },
    mode: "onChange",
  });

  // Reset form when dataVersion changes (new resume loaded)
  useEffect(() => {
    reset({
      fullName: personalInfo.fullName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      address: personalInfo.address,
      title: personalInfo.title,
      summary: personalInfo.summary,
    });
  }, [
    dataVersion,
    reset,
    personalInfo.fullName,
    personalInfo.email,
    personalInfo.phone,
    personalInfo.address,
    personalInfo.title,
    personalInfo.summary,
  ]);

  // Watch all fields
  const watchedValues = useWatch({ control });

  // Sync with store whenever form values change
  useEffect(() => {
    if (watchedValues && !isLoading) {
      updatePersonal(watchedValues as Partial<PersonalFormData>);
    }
  }, [watchedValues, updatePersonal, isLoading]);

  return (
    <form className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            {...register("fullName")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Title
          </label>
          <input
            {...register("title")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Software Engineer"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            {...register("phone")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="+1 234 567 890"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            {...register("address")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="City, Country"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Professional Summary
          </label>
          <textarea
            {...register("summary")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Brief summary of your career and goals..."
          />
        </div>

        {templateSupportsPhoto(selectedTemplate) && (
          <div className="md:col-span-2">
            <PhotoUpload />
          </div>
        )}
      </div>
    </form>
  );
};
