"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { fetchPhotoLibrary } from "@/lib/api/photos";
import { logger } from "@/lib/logger";
import type { LibraryPhoto } from "@contracts/photo";

interface PhotoLibraryModalProps {
  onSelect: (photo: LibraryPhoto) => void;
  onCancel: () => void;
}

export const PhotoLibraryModal: React.FC<PhotoLibraryModalProps> = ({
  onSelect,
  onCancel,
}) => {
  const [photos, setPhotos] = useState<LibraryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      const photos = await fetchPhotoLibrary();
      setPhotos(photos);
    } catch (err) {
      logger.error(
        "Error loading photos",
        err instanceof Error ? err : undefined
      );
      setError('Failed to load your photo library');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPhotos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPhotos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold">Photo Library</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select a photo to use in your resume
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#DB4B2E]" size={32} />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadPhotos}
                className="mt-4 px-4 py-2 text-sm bg-[#DB4B2E] text-white rounded-lg hover:bg-[#C03E22]"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && photos.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No photos in your library yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Upload a photo to get started
              </p>
            </div>
          )}

          {!loading && !error && photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => onSelect(photo)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#DB4B2E] transition-all focus:outline-none focus:ring-2 focus:ring-[#DB4B2E]/45"
                >
                  <img
                    src={photo.originalUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs font-medium truncate">{photo.fileName}</p>
                      <p className="text-xs text-gray-300">
                        {photo.width} × {photo.height}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
