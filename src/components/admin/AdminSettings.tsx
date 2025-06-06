
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Volume2, Store } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { settings, loading, saveSettings } = useAdminSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Create storage bucket if it doesn't exist
  useEffect(() => {
    const createBucketIfNeeded = async () => {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'admin-files');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('admin-files', {
          public: true,
          allowedMimeTypes: ['audio/mpeg', 'audio/mp3'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
        }
      }
    };

    createBucketIfNeeded();
  }, []);

  const handleSoundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is MP3
    if (!file.type.includes('audio/mpeg') && !file.name.toLowerCase().endsWith('.mp3')) {
      toast({
        title: "خطأ",
        description: "يجب أن يكون الملف من نوع MP3",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `notification-sound-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('admin-files')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ في رفع الملف",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('admin-files')
        .getPublicUrl(data.path);

      // Save the URL to settings
      await saveSettings({
        notification_sound_url: publicUrl
      });

    } catch (error) {
      console.error('Error uploading sound file:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في رفع الملف",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const testNotificationSound = () => {
    if (settings.notification_sound_url) {
      const audio = new Audio(settings.notification_sound_url);
      audio.volume = 0.8;
      audio.play().catch(error => {
        console.error('Error playing test sound:', error);
        toast({
          title: "خطأ",
          description: "لا يمكن تشغيل الصوت",
          variant: "destructive",
        });
      });
    }
  };

  const handleStoreStatusChange = async (isOpen: boolean) => {
    await saveSettings({
      is_store_open: isOpen
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            حالة المتجر
          </CardTitle>
          <CardDescription>
            تحكم في حالة المتجر (مفتوح/مغلق)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="store-status" className="text-base font-medium">
                المتجر {settings.is_store_open ? 'مفتوح' : 'مغلق'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {settings.is_store_open 
                  ? 'العملاء يمكنهم تقديم طلبات جديدة' 
                  : 'العملاء لا يمكنهم تقديم طلبات جديدة'
                }
              </p>
            </div>
            <Switch
              id="store-status"
              checked={settings.is_store_open}
              onCheckedChange={handleStoreStatusChange}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            صوت التنبيه
          </CardTitle>
          <CardDescription>
            رفع ملف صوتي مخصص للتنبيهات (MP3 فقط، أقل من 5 ميجابايت)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sound-upload" className="text-sm font-medium">
              ملف الصوت
            </Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="sound-upload"
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={handleSoundUpload}
                disabled={uploading || loading}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={testNotificationSound}
                disabled={!settings.notification_sound_url || loading}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                تجربة
              </Button>
            </div>
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">
                جاري رفع الملف...
              </p>
            )}
            {settings.notification_sound_url && (
              <p className="text-sm text-green-600 mt-2">
                ✓ تم رفع ملف صوتي مخصص
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
