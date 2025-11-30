'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { X, Check, Loader2 } from 'lucide-react';
import { getPhotoAspectRatio, getPhotoFrameSize } from '@/lib/template-config';

interface PhotoCropModalProps {
  imageUrl: string;
  onSave: (cropData: { x: number; y: number; width: number; height: number; zoom: number }) => Promise<void>;
  onCancel: () => void;
  templateId: string;
  initialCropData?: { x: number; y: number; width: number; height: number; zoom?: number };
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  imageUrl,
  onSave,
  onCancel,
  templateId,
  initialCropData,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialCropData?.zoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const aspectRatio = getPhotoAspectRatio(templateId);
  const frameSize = getPhotoFrameSize(templateId);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setSaving(true);
    try {
      await onSave({
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
        zoom,
      });
    } catch (error) {
      console.error('Error saving crop:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold">Crop Photo</h3>
            <p className="text-sm text-gray-500 mt-1">
              Adjust the crop area for {templateId} template ({frameSize.width}×{frameSize.height}px)
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zoom: {zoom.toFixed(1)}x
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            disabled={saving}
            className="w-full"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
