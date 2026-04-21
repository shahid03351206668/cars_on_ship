import React, { useState, useRef } from 'react';
import { Upload, X, GripVertical, Loader2 } from 'lucide-react';

interface ImageEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
  editing: boolean;
}

export default function ImageEditor({ images, onChange, editing }: ImageEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newImageUrls: string[] = [];

      for (const file of files) {
        // Convert file to base64 or data URL
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            newImageUrls.push(result);
            resolve(null);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      onChange([...images, ...newImageUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (!editing) {
    // View mode - just show image thumbnails
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <div key={i} className="relative overflow-hidden bg-gray-100 rounded-lg aspect-square">
            <img
              src={img}
              alt={`Car image ${i + 1}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80';
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Edit mode - with drag, reorder, and delete
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="relative border-2 border-dashed border-orange-300 rounded-lg p-6 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = Array.from(e.dataTransfer.files);
          if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            droppedFiles.forEach((file) => dataTransfer.items.add(file));
            fileInputRef.current.files = dataTransfer.files;
            handleFileSelect({
              target: fileInputRef.current,
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
              <p className="text-sm font-medium text-gray-700">Uploading images...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-orange-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 10MB each</p>
            </>
          )}
        </div>
      </div>

      {/* Images Grid - Draggable */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`relative overflow-hidden bg-gray-100 rounded-lg aspect-square group cursor-move transition-all ${
                draggedIndex === i ? 'opacity-50 ring-2 ring-orange-500' : ''
              }`}
            >
              <img
                src={img}
                alt={`Car image ${i + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80';
                }}
              />

              {/* Overlay with icons */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-1.5 bg-white/90 rounded-full text-gray-700">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Counter */}
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-white text-[10px] font-semibold rounded">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-600">
        {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder • Click X to remove
      </p>
    </div>
  );
}