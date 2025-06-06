
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
    
    console.log('Processing order notification for:', orderId);
    
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
        ),
        profiles (full_name, email)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    console.log('Order data fetched successfully:', order);

    // تنسيق رسالة Telegram
    const formatPrice = (price: number) => `${price.toLocaleString('ar-IQ')} د.ع`;
    
    let message = `🛒 *طلب جديد!*\n\n`;
    message += `📋 *رقم الطلب:* \`${order.id.slice(0, 8)}...\`\n`;
    message += `👤 *العميل:* ${order.profiles?.full_name || 'غير محدد'}\n`;
    message += `💰 *المبلغ الإجمالي:* ${formatPrice(order.total_amount)}\n`;
    message += `📞 *رقم الهاتف:* ${order.phone || 'غير محدد'}\n`;
    message += `📍 *عنوان التوصيل:* ${order.shipping_address || 'غير محدد'}\n`;
    message += `📅 *تاريخ الطلب:* ${new Date(order.created_at).toLocaleDateString('ar-IQ')}\n\n`;
    
    if (order.order_items && order.order_items.length > 0) {
      message += `📦 *المنتجات:*\n`;
      order.order_items.forEach((item: any, index: number) => {
        message += `${index + 1}\\. ${item.products?.name || 'منتج غير معروف'}\n`;
        message += `   الكمية: ${item.quantity} × ${formatPrice(item.price)}\n`;
      });
    }

    // استخدام معرف القناة الخاص بك
    const channelId = '@styleafchannel'; // يمكنك تغيير هذا إلى معرف القناة الصحيح
    
    console.log('Sending message to Telegram channel:', channelId);

    // إرسال الرسالة إلى Telegram
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'MarkdownV2',
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    console.log('Telegram API response:', telegramResult);
    
    if (!telegramResponse.ok) {
      console.error('Telegram API Error:', telegramResult);
      
      // إذا فشل MarkdownV2، جرب بدون تنسيق
      const plainMessage = message.replace(/[_*\[\]()~`>#+\-=|{}.!\\]/g, '');
      const fallbackResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: channelId,
          text: plainMessage,
        }),
      });
      
      const fallbackResult = await fallbackResponse.json();
      console.log('Fallback response:', fallbackResult);
      
      if (!fallbackResponse.ok) {
        throw new Error(`Telegram API Error: ${fallbackResult.description}`);
      }
      
      return new Response(
        JSON.stringify({ success: true, result: fallbackResult }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Telegram notification sent successfully');

    return new Response(
      JSON.stringify({ success: true, result: telegramResult }),
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
