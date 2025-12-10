// components/inventory/ImageUploader.jsx
import React from "react";
import { Label } from "@/components/ui/label";
import ImagePreview from "@/components/ui/image-preview";
import { X } from "lucide-react";

const ImageUploader = ({ 
  savedImageUrl, 
  formData, 
  handleFileChange, 
  handleRemoveImage 
}) => {
  const hasImage = savedImageUrl || formData.image;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Image</Label>
      <div className="flex flex-col items-center space-y-4">
        {hasImage ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {savedImageUrl ? (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <img
                    src={savedImageUrl}
                    alt="Saved item"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ) : (
                <ImagePreview 
                  file={formData.image} 
                  onChange={handleFileChange}
                  size="lg"
                />
              )}
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {savedImageUrl 
                ? "Click the remove button to delete the image" 
                : "Click the image to change or use remove button above"
              }
            </p>
            {savedImageUrl && (
              <div className="text-center">
                <ImagePreview 
                  file={formData.image} 
                  onChange={handleFileChange}
                  size="md"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Or click above to upload a new image
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors w-full max-w-md">
            <ImagePreview 
              file={formData.image} 
              onChange={handleFileChange}
              size="lg"
            />
            <div className="mt-4">
              <p className="text-sm text-gray-600">Click to upload item image</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;