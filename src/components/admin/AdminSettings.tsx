import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Volume2, Store, Mail, CreditCard, Smartphone } from 'lucide-react';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { settings, loading, saveSettings } = useAdminSettings();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [emailReceiver, setEmailReceiver] = useState('');
  const [visaCardConfig, setVisaCardConfig] = useState({
    enabled: false,
    merchant_id: '',
    api_key: '',
    terminal_id: ''
  });
  const [zainCashConfig, setZainCashConfig] = useState({
    enabled: false,
    merchant_code: '',
    api_key: '',
    service_type: ''
  });

  // Update local states when settings change
  useEffect(() => {
    if (settings.email_receiver) {
      setEmailReceiver(settings.email_receiver);
    }
    if (settings.visa_card_config) {
      setVisaCardConfig(settings.visa_card_config);
    }
    if (settings.zain_cash_config) {
      setZainCashConfig(settings.zain_cash_config);
    }
  }, [settings]);

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

  const handleEmailReceiverSave = async () => {
    if (!emailReceiver.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان بريد إلكتروني صالح",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailReceiver)) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان بريد إلكتروني صالح",
        variant: "destructive",
      });
      return;
    }

    await saveSettings({
      email_receiver: emailReceiver
    });
  };

  const handleVisaCardConfigSave = async () => {
    if (visaCardConfig.enabled && (!visaCardConfig.merchant_id || !visaCardConfig.api_key || !visaCardConfig.terminal_id)) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول إعدادات فيزا كارد",
        variant: "destructive",
      });
      return;
    }

    await saveSettings({
      visa_card_config: visaCardConfig
    });
  };

  const handleZainCashConfigSave = async () => {
    if (zainCashConfig.enabled && (!zainCashConfig.merchant_code || !zainCashConfig.api_key || !zainCashConfig.service_type)) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول إعدادات زين كاش",
        variant: "destructive",
      });
      return;
    }

    await saveSettings({
      zain_cash_config: zainCashConfig
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
            <Mail className="w-5 h-5" />
            إعدادات البريد الإلكتروني
          </CardTitle>
          <CardDescription>
            تحديد البريد الإلكتروني الذي سيتم إرسال إشعارات الطلبات إليه
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email-receiver" className="text-sm font-medium">
              البريد الإلكتروني المستقبل
            </Label>
            <div className="mt-2 flex items-center gap-4">
              <Input
                id="email-receiver"
                type="email"
                value={emailReceiver}
                onChange={(e) => setEmailReceiver(e.target.value)}
                placeholder="example@gmail.com"
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleEmailReceiverSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                حفظ
              </Button>
            </div>
            {settings.email_receiver && (
              <p className="text-sm text-green-600 mt-2">
                ✓ البريد الحالي: {settings.email_receiver}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            إعدادات فيزا كارد
          </CardTitle>
          <CardDescription>
            تكوين بوابة الدفع لفيزا كارد
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visa-enabled" className="text-base font-medium">
                تفعيل فيزا كارد
              </Label>
              <p className="text-sm text-muted-foreground">
                السماح للعملاء بالدفع باستخدام فيزا كارد
              </p>
            </div>
            <Switch
              id="visa-enabled"
              checked={visaCardConfig.enabled}
              onCheckedChange={(checked) => setVisaCardConfig(prev => ({ ...prev, enabled: checked }))}
              disabled={loading}
            />
          </div>

          {visaCardConfig.enabled && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="visa-merchant-id" className="text-sm font-medium">
                  رقم التاجر (Merchant ID)
                </Label>
                <Input
                  id="visa-merchant-id"
                  type="text"
                  value={visaCardConfig.merchant_id}
                  onChange={(e) => setVisaCardConfig(prev => ({ ...prev, merchant_id: e.target.value }))}
                  placeholder="أدخل رقم التاجر"
                  disabled={loading}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="visa-api-key" className="text-sm font-medium">
                  مفتاح API
                </Label>
                <Input
                  id="visa-api-key"
                  type="password"
                  value={visaCardConfig.api_key}
                  onChange={(e) => setVisaCardConfig(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="أدخل مفتاح API"
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="visa-terminal-id" className="text-sm font-medium">
                  رقم المحطة (Terminal ID)
                </Label>
                <Input
                  id="visa-terminal-id"
                  type="text"
                  value={visaCardConfig.terminal_id}
                  onChange={(e) => setVisaCardConfig(prev => ({ ...prev, terminal_id: e.target.value }))}
                  placeholder="أدخل رقم المحطة"
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleVisaCardConfigSave}
                disabled={loading}
                className="w-full"
              >
                حفظ إعدادات فيزا كارد
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            إعدادات زين كاش
          </CardTitle>
          <CardDescription>
            تكوين بوابة الدفع لزين كاش
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="zain-enabled" className="text-base font-medium">
                تفعيل زين كاش
              </Label>
              <p className="text-sm text-muted-foreground">
                السماح للعملاء بالدفع باستخدام زين كاش
              </p>
            </div>
            <Switch
              id="zain-enabled"
              checked={zainCashConfig.enabled}
              onCheckedChange={(checked) => setZainCashConfig(prev => ({ ...prev, enabled: checked }))}
              disabled={loading}
            />
          </div>

          {zainCashConfig.enabled && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="zain-merchant-code" className="text-sm font-medium">
                  كود التاجر (Merchant Code)
                </Label>
                <Input
                  id="zain-merchant-code"
                  type="text"
                  value={zainCashConfig.merchant_code}
                  onChange={(e) => setZainCashConfig(prev => ({ ...prev, merchant_code: e.target.value }))}
                  placeholder="أدخل كود التاجر"
                  disabled={loading}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="zain-api-key" className="text-sm font-medium">
                  مفتاح API
                </Label>
                <Input
                  id="zain-api-key"
                  type="password"
                  value={zainCashConfig.api_key}
                  onChange={(e) => setZainCashConfig(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="أدخل مفتاح API"
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="zain-service-type" className="text-sm font-medium">
                  نوع الخدمة
                </Label>
                <Input
                  id="zain-service-type"
                  type="text"
                  value={zainCashConfig.service_type}
                  onChange={(e) => setZainCashConfig(prev => ({ ...prev, service_type: e.target.value }))}
                  placeholder="أدخل نوع الخدمة"
                  disabled={loading}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleZainCashConfigSave}
                disabled={loading}
                className="w-full"
              >
                حفظ إعدادات زين كاش
              </Button>
            </div>
          )}
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
