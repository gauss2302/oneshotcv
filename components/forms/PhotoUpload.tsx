"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Crop, Loader2, ImageIcon } from "lucide-react";
import { useCVStore } from "@/store/useCVStore";
import { PhotoCropModal } from "./PhotoCropModal";
import { PhotoLibraryModal } from "./PhotoLibraryModal";
import { templateSupportsPhoto } from "@/lib/template-config";

interface LibraryPhoto {
  id: string;
  fileName: string;
  originalUrl: string;
  width: number;
  height: number;
}

interface CropSelection {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export const PhotoUpload: React.FC = () => {
  const { personalInfo, updatePersonal, selectedTemplate, resumeId } =
    useCVStore();
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempPhoto, setTempPhoto] = useState<LibraryPhoto | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (type: "error" | "success", text: string) => {
    setStatusMessage({ type, text });
  };

  const clearStatus = () => setStatusMessage(null);

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "";

  const resetTempState = () => {
    setTempPhoto(null);
    if (tempImageUrl && tempImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(tempImageUrl);
    }
    setTempImageUrl(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearStatus();

    // Validate
    if (file.size > 10 * 1024 * 1024) {
      showStatus("error", "File too large. Maximum size is 10MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showStatus(
        "error",
        "Invalid file type. Please upload JPEG, PNG, or WebP."
      );
      return;
    }

    // Upload to library first
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      // Create temp photo object and show cropper
      const imageUrl = URL.createObjectURL(file);
      setTempImageUrl(imageUrl);
      setTempPhoto({
        id: data.photo.id,
        fileName: data.photo.fileName,
        originalUrl: imageUrl,
        width: data.photo.width,
        height: data.photo.height,
      });
      setShowCropper(true);
    } catch (error) {
      console.error("Upload error:", error);
      const message = getErrorMessage(error);
      showStatus("error", message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLibrarySelect = (photo: LibraryPhoto) => {
    clearStatus();
    setTempPhoto(photo);
    setTempImageUrl(photo.originalUrl);
    setShowLibrary(false);
    setShowCropper(true);
  };

  const handleCropSave = async (cropData: CropSelection) => {
    if (!tempPhoto || !resumeId) {
      showStatus(
        "error",
        "Resume ID not found. Please save your resume first."
      );
      return;
    }

    // Check if template supports photos before attempting to attach
    if (!selectedTemplate || !templateSupportsPhoto(selectedTemplate)) {
      showStatus(
        "error",
        `The "${
          selectedTemplate || "current"
        }" template does not support profile photos. Please switch to a template that supports photos (sidebar, modern, creative, designer, or executive).`
      );
      return;
    }

    try {
      const response = await fetch("/api/photos/attach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: tempPhoto.id,
          resumeId,
          cropData,
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to attach photo";
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Update store with photo info
      updatePersonal({
        photo: {
          id: data.resumePhoto.photoId,
          resumePhotoId: data.resumePhoto.id,
          url: data.resumePhoto.url,
          fileName: tempPhoto.fileName,
          fileSize: 0, // We don't have this from attach endpoint
          mimeType: "image/webp",
          cropData: data.resumePhoto.cropData,
        },
      });

      setShowCropper(false);
      resetTempState();
      showStatus("success", "Photo updated successfully.");
    } catch (error) {
      console.error("Error attaching photo:", error);
      showStatus("error", "Failed to attach photo. Please try again.");
    }
  };

  const handleRemove = async () => {
    if (!personalInfo.photo || !resumeId) {
      setConfirmingRemove(false);
      showStatus("error", "Cannot remove photo right now.");
      return;
    }

    try {
      setRemoving(true);
      const payload: {
        resumeId: string;
        resumePhotoId?: string;
        photoId?: string;
      } = {
        resumeId,
      };

      if (personalInfo.photo.resumePhotoId) {
        payload.resumePhotoId = personalInfo.photo.resumePhotoId;
      }
      if (personalInfo.photo.id) {
        payload.photoId = personalInfo.photo.id;
      }

      const response = await fetch("/api/photos/detach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to remove photo");
      }

      updatePersonal({ photo: undefined });
      resetTempState();
      showStatus("success", "Photo removed from resume.");
    } catch (error) {
      console.error("Remove error:", error);
      showStatus("error", "Failed to remove photo. Please try again.");
    } finally {
      setRemoving(false);
      setConfirmingRemove(false);
    }
  };

  const handleReCrop = () => {
    if (!personalInfo.photo) return;
    clearStatus();

    // Set up for re-cropping
    setTempImageUrl(personalInfo.photo.url);
    setTempPhoto({
      id: personalInfo.photo.id,
      fileName: personalInfo.photo.fileName,
      originalUrl: personalInfo.photo.url,
      width: 0,
      height: 0,
    });
    setShowCropper(true);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profile Photo
      </label>
      {statusMessage && (
        <div
          className={`text-sm px-3 py-2 rounded-md border ${
            statusMessage.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {!personalInfo.photo ? (
        <div className="space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
            )}
            <span className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Upload new photo"}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              Max 10MB (JPEG, PNG, WebP)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            Select from Library
          </button>
        </div>
      ) : (
        <div className="relative w-40 h-40">
          <img
            src={personalInfo.photo.url}
            alt="Profile"
            className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={() => setConfirmingRemove(true)}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            title="Remove photo"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={handleReCrop}
            className="absolute -bottom-2 -right-2 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
            title="Re-crop photo"
          >
            <Crop size={16} />
          </button>
        </div>
      )}

      {showLibrary && (
        <PhotoLibraryModal
          onSelect={handleLibrarySelect}
          onCancel={() => setShowLibrary(false)}
        />
      )}

      {showCropper && tempImageUrl && (
        <PhotoCropModal
          imageUrl={tempImageUrl}
          templateId={selectedTemplate}
          onSave={handleCropSave}
          onCancel={() => {
            setShowCropper(false);
            resetTempState();
          }}
          initialCropData={personalInfo.photo?.cropData}
        />
      )}

      {confirmingRemove && personalInfo.photo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Remove photo?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              This will detach the selected photo from your resume. You can
              upload or select a new one afterward.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                disabled={removing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-60"
              >
                {removing ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
