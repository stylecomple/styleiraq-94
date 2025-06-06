
import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Crop as CropIcon } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageUploadCropProps {
  onImageUploaded: (url: string) => void;
  onRemove?: () => void;
  currentImage?: string;
  label: string;
}

const ImageUploadCrop = ({ onImageUploaded, onRemove, currentImage, label }: ImageUploadCropProps) => {
  const { toast } = useToast();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState('');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropDialog(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          resolve(blob);
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const uploadCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار منطقة للقص',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      const fileName = `product-${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, croppedImageBlob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      onImageUploaded(publicUrl);
      setShowCropDialog(false);
      setImgSrc('');
      
      toast({
        title: 'تم رفع الصورة',
        description: 'تم رفع الصورة بنجاح',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Product" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={onRemove}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="w-32 h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs">اختر صورة</span>
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />
        </div>
      )}

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>قص الصورة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                minWidth={100}
                minHeight={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  style={{ maxHeight: '400px', maxWidth: '100%' }}
                />
              </ReactCrop>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCropDialog(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={uploadCroppedImage}
                disabled={uploading}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <CropIcon className="w-4 h-4 mr-2" />
                {uploading ? 'جاري الرفع...' : 'قص ورفع'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploadCrop;
