'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';

interface LibraryPhoto {
  id: string;
  fileName: string;
  originalUrl: string;
  width: number;
  height: number;
  createdAt: Date;
}

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

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/photos/library');

      if (!response.ok) {
        throw new Error('Failed to load photo library');
      }

      const data = await response.json();
      setPhotos(data.photos);
    } catch (err) {
      console.error('Error loading photos:', err);
      setError('Failed to load your photo library');
    } finally {
      setLoading(false);
    }
  };

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
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadPhotos}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
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
