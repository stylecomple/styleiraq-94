
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderNotificationRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Telegram notification function started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json() as OrderNotificationRequest;
    console.log('📋 Processing notification for order:', orderId);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    
    if (!telegramToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not found in environment variables');
    }
    
    console.log('🔑 Environment variables loaded successfully');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
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
      console.error('❌ Error fetching order:', orderError);
      throw orderError;
    }

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('✅ Order fetched successfully:', order.id);

    // Format the message
    const formatPrice = (price: number) => `${price.toLocaleString('ar-IQ')} د.ع`;
    
    let message = `🛒 طلب جديد!\n\n`;
    message += `📋 رقم الطلب: ${order.id.slice(0, 8)}...\n`;
    message += `💰 المبلغ الإجمالي: ${formatPrice(order.total_amount)}\n`;
    message += `📞 رقم الهاتف: ${order.phone || 'غير محدد'}\n`;
    message += `📍 عنوان التوصيل: ${order.shipping_address || 'غير محدد'}\n`;
    message += `📅 تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString('ar-IQ')}\n\n`;
    
    if (order.order_items && order.order_items.length > 0) {
      message += `📦 المنتجات:\n`;
      order.order_items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.products?.name || 'منتج غير معروف'}\n`;
        message += `   الكمية: ${item.quantity} × ${formatPrice(item.price)}\n`;
      });
    }

    console.log('📝 Message formatted:', message);

    // Send to Telegram
    const channelId = '@styleafchannel';
    const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    console.log('📡 Sending to Telegram channel:', channelId);

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const telegramResult = await telegramResponse.json();
    
    console.log('📨 Telegram API response:', telegramResult);
    
    if (!telegramResponse.ok) {
      console.error('❌ Telegram API Error:', telegramResult);
      throw new Error(`Telegram API Error: ${telegramResult.description || 'Unknown error'}`);
    }

    console.log('✅ Telegram notification sent successfully!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification sent successfully',
        result: telegramResult 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('💥 Error in telegram notification:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
