
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

    // Fetch all active Telegram users
    const { data: telegramUsers, error: usersError } = await supabase
      .from('telegram_users')
      .select('chat_id, first_name')
      .eq('is_active', true);

    if (usersError) {
      console.error('❌ Error fetching telegram users:', usersError);
      throw usersError;
    }

    if (!telegramUsers || telegramUsers.length === 0) {
      console.log('⚠️ No active Telegram users found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active Telegram users to notify',
          notified_count: 0
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`👥 Found ${telegramUsers.length} active users to notify`);

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

    console.log('📝 Message formatted for broadcast');

    // Send to all users
    const telegramApiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    let successCount = 0;
    let failureCount = 0;

    for (const user of telegramUsers) {
      try {
        console.log(`📤 Sending to user: ${user.first_name} (${user.chat_id})`);
        
        const response = await fetch(telegramApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: user.chat_id,
            text: message,
            parse_mode: 'HTML',
          }),
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.error(`❌ Failed to send to ${user.chat_id}:`, result);
          
          // If user blocked the bot or chat not found, mark as inactive
          if (result.error_code === 403 || result.error_code === 400) {
            await supabase
              .from('telegram_users')
              .update({ is_active: false })
              .eq('chat_id', user.chat_id);
            console.log(`🚫 Marked user ${user.chat_id} as inactive`);
          }
          
          failureCount++;
        } else {
          console.log(`✅ Successfully sent to ${user.first_name}`);
          successCount++;
        }
        
        // Small delay between messages to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`💥 Error sending to ${user.chat_id}:`, error);
        failureCount++;
      }
    }

    console.log(`📊 Notification summary: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent to all active users',
        notified_count: successCount,
        failed_count: failureCount,
        total_users: telegramUsers.length
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
