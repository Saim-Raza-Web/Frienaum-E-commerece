'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/TranslationProvider';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  currentImageUrl?: string;
  className?: string;
  disabled?: boolean;
}

export default function ImageUpload({ 
  onImageUpload, 
  onUploadStart,
  onUploadEnd,
  currentImageUrl, 
  className = '',
  disabled = false 
}: ImageUploadProps) {
  const { translate } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit for better reliability)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB for optimal upload performance');
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      console.log('=== IMAGE UPLOAD SUCCESS ===');
      console.log('Cloudinary URL received:', url);
      console.log('Calling onImageUpload with URL:', url);
      onImageUpload(url);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Upload timed out. Please try with a smaller image or check your internet connection.';
        } else if (error.message.includes('size')) {
          errorMessage = 'Image is too large. Please use an image smaller than 10MB.';
        } else if (error.message.includes('format')) {
          errorMessage = 'Invalid image format. Please use JPG, PNG, or GIF.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      alert(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      onUploadEnd?.();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
      
      {previewUrl ? (
        <div className="relative group">
          <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              unoptimized
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`
            w-full h-32 border-2 border-dashed border-gray-300 rounded-lg 
            flex flex-col items-center justify-center cursor-pointer
            hover:border-gray-400 transition-colors
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">{translate('merchant.uploading') || 'Uploading...'}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {translate('merchant.clickToUploadImage') || 'Click to upload image'}
              </p>
              <p className="text-xs text-gray-400">
                {translate('merchant.imageUploadFormat') || 'PNG, JPG, GIF up to 5MB'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
