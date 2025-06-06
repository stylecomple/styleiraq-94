
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ImageUploadCrop from './ImageUploadCrop';
import { Plus } from 'lucide-react';

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const MultiImageUpload = ({ images, onImagesChange, maxImages = 5 }: MultiImageUploadProps) => {
  const { toast } = useToast();

  const addImage = (url: string) => {
    if (images.length >= maxImages) {
      toast({
        title: 'تجاوز الحد الأقصى',
        description: `يمكنك إضافة ${maxImages} صور كحد أقصى`,
        variant: 'destructive',
      });
      return;
    }
    onImagesChange([...images, url]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <ImageUploadCrop
            key={index}
            currentImage={image}
            onImageUploaded={(url) => {
              const newImages = [...images];
              newImages[index] = url;
              onImagesChange(newImages);
            }}
            onRemove={() => removeImage(index)}
            label=""
          />
        ))}
        
        {images.length < maxImages && (
          <ImageUploadCrop
            onImageUploaded={addImage}
            label=""
          />
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        يمكنك إضافة حتى {maxImages} صور. ({images.length}/{maxImages})
      </p>
    </div>
  );
};

export default MultiImageUpload;
