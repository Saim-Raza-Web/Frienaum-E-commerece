'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import SmartImage from '@/components/SmartImage';

interface MultipleImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  currentImages?: string[];
  className?: string;
  disabled?: boolean;
  maxImages?: number;
}

export default function MultipleImageUpload({ 
  onImagesChange, 
  onUploadStart,
  onUploadEnd,
  currentImages = [], 
  className = '',
  disabled = false,
  maxImages = 10
}: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>(currentImages || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setImages(currentImages || []);
  }, [currentImages]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max
    if (images.length + files.length > maxImages) {
      alert(`Sie können maximal ${maxImages} Bilder hochladen. Bitte entfernen Sie einige Bilder zuerst.`);
      return;
    }

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Bitte wählen Sie nur Bilddateien aus');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Die Dateigröße muss kleiner als 5MB sein');
        return;
      }
    }

    setIsUploading(true);
    onUploadStart?.();

    try {
      const newImageUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadingIndex(i);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload fehlgeschlagen');
        }

        const { url } = await response.json();
        // Validate that we received a valid Cloudinary URL
        if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
          newImageUrls.push(url);
        } else {
          throw new Error('Ungültige URL von Cloudinary erhalten');
        }
      }

      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Hochladen der Bilder. Bitte versuchen Sie es erneut.');
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      onUploadEnd?.();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleClick = () => {
    if (!disabled && !isUploading && images.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length || fromIndex === toIndex) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
    onImagesChange(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading || images.length >= maxImages}
      />
      
      {/* Display existing images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 sm:h-40 rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden">
                <SmartImage
                  src={url}
                  alt={`Produktbild ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover"
                  fallbackSrc="/images/placeholder.jpg"
                />
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Bild entfernen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!disabled && images.length > 1 && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    disabled={index === 0}
                    className={`flex-1 inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium shadow-sm transition-colors ${
                      index === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    title="Nach links verschieben"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    disabled={index === images.length - 1}
                    className={`flex-1 inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium shadow-sm transition-colors ${
                      index === images.length - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                    title="Nach rechts verschieben"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              {uploadingIndex === index && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < maxImages && (
        <div
          onClick={handleClick}
          className={`
            w-full h-32 border-2 border-dashed border-gray-400 rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-500 hover:bg-gray-50 transition-colors
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              <p className="mt-2 text-sm font-medium text-gray-700">Wird hochgeladen...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-600" />
              <p className="mt-2 text-sm font-semibold text-gray-900">
                Bilder hinzufügen ({images.length}/{maxImages})
              </p>
              <p className="text-xs text-gray-600 mt-1">
                PNG, JPG, GIF bis zu 5MB
              </p>
            </>
          )}
        </div>
      )}

      {images.length >= maxImages && (
        <p className="text-sm text-gray-600 font-medium">
          Maximale Anzahl von {maxImages} Bildern erreicht
        </p>
      )}
    </div>
  );
}

