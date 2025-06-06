
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { Separator } from '@/components/ui/separator';

interface PaymentConfig {
  enabled: boolean;
  merchant_id?: string;
  api_key?: string;
  secret_key?: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading, updateSettings } = useAdminSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions to safely cast payment configs
  const getVisaConfig = (): PaymentConfig => {
    if (!settings?.visa_card_config) return { enabled: false };
    return settings.visa_card_config as unknown as PaymentConfig;
  };

  const getZainConfig = (): PaymentConfig => {
    if (!settings?.zain_cash_config) return { enabled: false };
    return settings.zain_cash_config as unknown as PaymentConfig;
  };

  // Local state for form data
  const [storeOpen, setStoreOpen] = useState(settings?.is_store_open ?? true);
  
  // Visa Card Configuration
  const visaConfig = getVisaConfig();
  const [visaEnabled, setVisaEnabled] = useState(visaConfig.enabled);
  const [visaMerchantId, setVisaMerchantId] = useState(visaConfig.merchant_id ?? '');
  const [visaApiKey, setVisaApiKey] = useState(visaConfig.api_key ?? '');
  const [visaSecretKey, setVisaSecretKey] = useState(visaConfig.secret_key ?? '');
  
  // Zain Cash Configuration
  const zainConfig = getZainConfig();
  const [zainEnabled, setZainEnabled] = useState(zainConfig.enabled);
  const [zainMerchantId, setZainMerchantId] = useState(zainConfig.merchant_id ?? '');
  const [zainApiKey, setZainApiKey] = useState(zainConfig.api_key ?? '');
  const [zainSecretKey, setZainSecretKey] = useState(zainConfig.secret_key ?? '');

  // Update local state when settings change
  React.useEffect(() => {
    if (settings) {
      setStoreOpen(settings.is_store_open ?? true);
      
      // Visa Card settings
      const visa = getVisaConfig();
      setVisaEnabled(visa.enabled);
      setVisaMerchantId(visa.merchant_id ?? '');
      setVisaApiKey(visa.api_key ?? '');
      setVisaSecretKey(visa.secret_key ?? '');
      
      // Zain Cash settings
      const zain = getZainConfig();
      setZainEnabled(zain.enabled);
      setZainMerchantId(zain.merchant_id ?? '');
      setZainApiKey(zain.api_key ?? '');
      setZainSecretKey(zain.secret_key ?? '');
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    
    try {
      const updatedSettings = {
        is_store_open: storeOpen,
        visa_card_config: {
          enabled: visaEnabled,
          merchant_id: visaMerchantId,
          api_key: visaApiKey,
          secret_key: visaSecretKey
        },
        zain_cash_config: {
          enabled: zainEnabled,
          merchant_id: zainMerchantId,
          api_key: zainApiKey,
          secret_key: zainSecretKey
        }
      };

      await updateSettings(updatedSettings);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Store Status */}
      <Card>
        <CardHeader>
          <CardTitle>حالة المتجر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="store-status">المتجر مفتوح</Label>
              <p className="text-sm text-muted-foreground">
                عند إغلاق المتجر، لن يتمكن العملاء من إجراء طلبات جديدة
              </p>
            </div>
            <Switch
              id="store-status"
              checked={storeOpen}
              onCheckedChange={setStoreOpen}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visa Card Payment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الدفع بالفيزا كارد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visa-enabled">تفعيل الدفع بالفيزا كارد</Label>
              <p className="text-sm text-muted-foreground">
                السماح للعملاء بالدفع باستخدام بطاقات الفيزا
              </p>
            </div>
            <Switch
              id="visa-enabled"
              checked={visaEnabled}
              onCheckedChange={setVisaEnabled}
            />
          </div>

          {visaEnabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visa-merchant-id">معرف التاجر (Merchant ID)</Label>
                  <Input
                    id="visa-merchant-id"
                    type="text"
                    value={visaMerchantId}
                    onChange={(e) => setVisaMerchantId(e.target.value)}
                    placeholder="أدخل معرف التاجر"
                  />
                </div>
                <div>
                  <Label htmlFor="visa-api-key">مفتاح API</Label>
                  <Input
                    id="visa-api-key"
                    type="text"
                    value={visaApiKey}
                    onChange={(e) => setVisaApiKey(e.target.value)}
                    placeholder="أدخل مفتاح API"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="visa-secret-key">المفتاح السري</Label>
                <Input
                  id="visa-secret-key"
                  type="password"
                  value={visaSecretKey}
                  onChange={(e) => setVisaSecretKey(e.target.value)}
                  placeholder="أدخل المفتاح السري"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Zain Cash Payment Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الدفع بزين كاش</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="zain-enabled">تفعيل الدفع بزين كاش</Label>
              <p className="text-sm text-muted-foreground">
                السماح للعملاء بالدفع باستخدام زين كاش
              </p>
            </div>
            <Switch
              id="zain-enabled"
              checked={zainEnabled}
              onCheckedChange={setZainEnabled}
            />
          </div>

          {zainEnabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zain-merchant-id">معرف التاجر (Merchant ID)</Label>
                  <Input
                    id="zain-merchant-id"
                    type="text"
                    value={zainMerchantId}
                    onChange={(e) => setZainMerchantId(e.target.value)}
                    placeholder="أدخل معرف التاجر"
                  />
                </div>
                <div>
                  <Label htmlFor="zain-api-key">مفتاح API</Label>
                  <Input
                    id="zain-api-key"
                    type="text"
                    value={zainApiKey}
                    onChange={(e) => setZainApiKey(e.target.value)}
                    placeholder="أدخل مفتاح API"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zain-secret-key">المفتاح السري</Label>
                <Input
                  id="zain-secret-key"
                  type="password"
                  value={zainSecretKey}
                  onChange={(e) => setZainSecretKey(e.target.value)}
                  placeholder="أدخل المفتاح السري"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
