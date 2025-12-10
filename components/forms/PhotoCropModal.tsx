"use client";

import React, { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { X, Check, Loader2 } from "lucide-react";

// Mock functions for demo
const getPhotoAspectRatio = (templateId: string) => 1;
const getPhotoFrameSize = (templateId: string) => ({ width: 400, height: 400 });

interface PhotoCropModalProps {
  imageUrl: string;
  onSave: (cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom: number;
  }) => Promise<void>;
  onCancel: () => void;
  templateId: string;
  initialCropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom?: number;
  };
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

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

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
      console.error("Error saving crop:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-2xl mx-4 border border-gray-200">
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">Crop Photo</h3>
            <p className="text-sm text-gray-500">
              Adjust the crop area for {templateId} template ({frameSize.width}×
              {frameSize.height}px)
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 rounded-sm hover:bg-gray-100 p-1 -mr-1 -mt-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative w-full h-96 bg-gray-50 rounded-md overflow-hidden border border-gray-200">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Zoom</label>
              <span className="text-sm text-gray-500 font-mono">
                {zoom.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={saving}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 
                [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                [&::-webkit-slider-thumb]:hover:bg-gray-700 [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:border-0 
                [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-all
                [&::-moz-range-thumb]:hover:bg-gray-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50/50">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Save Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo
export default function Demo() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Open Crop Modal
      </button>

      {showModal && (
        <PhotoCropModal
          imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
          onSave={async (cropData) => {
            console.log("Saved crop:", cropData);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setShowModal(false);
          }}
          onCancel={() => setShowModal(false)}
          templateId="professional"
          initialCropData={{ x: 0, y: 0, width: 400, height: 400, zoom: 1 }}
        />
      )}
    </div>
  );
}
