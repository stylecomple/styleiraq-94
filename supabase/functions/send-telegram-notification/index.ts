
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotificationRequest {
  orderId: string;
  chatId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, chatId } = await req.json() as OrderNotificationRequest;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // جلب تفاصيل الطلب
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          products (name, cover_image)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw orderError;
    }

    // تنسيق رسالة Telegram
    const formatPrice = (price: number) => `${price.toLocaleString('ar-IQ')} د.ع`;
    
    let message = `🛒 *طلب جديد!*\n\n`;
    message += `📋 *رقم الطلب:* ${order.id.slice(0, 8)}...\n`;
    message += `💰 *المبلغ الإجمالي:* ${formatPrice(order.total_amount)}\n`;
    message += `📞 *رقم الهاتف:* ${order.phone || 'غير محدد'}\n`;
    message += `📍 *عنوان التوصيل:* ${order.shipping_address || 'غير محدد'}\n`;
    message += `📅 *تاريخ الطلب:* ${new Date(order.created_at).toLocaleDateString('ar-IQ')}\n\n`;
    
    if (order.order_items && order.order_items.length > 0) {
      message += `📦 *المنتجات:*\n`;
      order.order_items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.products?.name || 'منتج غير معروف'}\n`;
        message += `   الكمية: ${item.quantity} × ${formatPrice(item.price)}\n`;
      });
    }

    // إرسال الرسالة إلى Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    // إذا لم يتم تحديد chatId، استخدم chat id افتراضي
    const defaultChatId = chatId || '@your_channel_or_chat_id'; // يجب تحديث هذا
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: defaultChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API Error:', telegramResult);
      throw new Error(`Telegram API Error: ${telegramResult.description}`);
    }

    console.log('Telegram notification sent successfully:', telegramResult);

    return new Response(
      JSON.stringify({ success: true, telegramResult }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending telegram notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
