
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

    // Fetch order details with items, products, and selected colors
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          selected_color,
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

    console.log(`👥 Found ${telegramUsers?.length || 0} active users to notify`);

    // Format the message with payment method and colors
    const formatPrice = (price: number) => `${price.toLocaleString('ar-IQ')} د.ع`;
    
    const paymentMethodLabels = {
      cash_on_delivery: 'الدفع عند الاستلام',
      zain_cash: 'زين كاش',
      visa_card: 'فيزا كارد'
    };
    
    let message = `🛒 طلب جديد!\n\n`;
    message += `📋 رقم الطلب: ${order.id.slice(0, 8)}...\n`;
    message += `💰 المبلغ الإجمالي: ${formatPrice(order.total_amount)}\n`;
    message += `📞 رقم الهاتف: ${order.phone || 'غير محدد'}\n`;
    
    if (order.governorate) {
      message += `🏛️ المحافظة: ${order.governorate}\n`;
    }
    
    message += `📍 عنوان التوصيل: ${order.shipping_address || 'غير محدد'}\n`;
    
    if (order.payment_method) {
      const paymentLabel = paymentMethodLabels[order.payment_method as keyof typeof paymentMethodLabels] || order.payment_method;
      message += `💳 طريقة الدفع: ${paymentLabel}\n`;
    }
    
    message += `📅 تاريخ الطلب: ${new Date(order.created_at).toLocaleDateString('ar-IQ')}\n\n`;
    
    if (order.order_items && order.order_items.length > 0) {
      message += `📦 المنتجات:\n`;
      order.order_items.forEach((item: any, index: number) => {
        message += `${index + 1}. ${item.products?.name || 'منتج غير معروف'}\n`;
        message += `   الكمية: ${item.quantity} × ${formatPrice(item.price)}\n`;
        if (item.selected_color) {
          message += `   اللون: ${item.selected_color}\n`;
        }
      });
    }

    console.log('📝 Message formatted for broadcast');

    const telegramApiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    let successCount = 0;
    let failureCount = 0;

    // List of channels/groups to notify
    const channelsAndGroups = [];

    // Get bot updates to find channels/groups
    try {
      console.log('🔍 Checking for channels and groups...');
      
      const updatesResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates?limit=100`);
      const updatesData = await updatesResponse.json();
      
      if (updatesData.ok && updatesData.result) {
        const uniqueChats = new Set();
        
        updatesData.result.forEach((update: any) => {
          if (update.message?.chat?.type === 'group' || 
              update.message?.chat?.type === 'supergroup' || 
              update.message?.chat?.type === 'channel') {
            uniqueChats.add(update.message.chat.id);
          }
          
          if (update.my_chat_member?.chat?.type === 'group' || 
              update.my_chat_member?.chat?.type === 'supergroup' || 
              update.my_chat_member?.chat?.type === 'channel') {
            if (update.my_chat_member.new_chat_member?.status === 'administrator' ||
                update.my_chat_member.new_chat_member?.status === 'member') {
              uniqueChats.add(update.my_chat_member.chat.id);
            }
          }
        });
        
        uniqueChats.forEach(chatId => {
          if (!channelsAndGroups.includes(chatId)) {
            channelsAndGroups.push(chatId);
          }
        });
        
        console.log(`🔍 Found ${uniqueChats.size} channels/groups from updates`);
      }
    } catch (error) {
      console.error('⚠️ Error fetching updates for channels:', error);
    }

    // Send to all channels and groups first
    if (channelsAndGroups.length > 0) {
      console.log(`📢 Sending to ${channelsAndGroups.length} channels/groups...`);
      
      for (const chatId of channelsAndGroups) {
        try {
          console.log(`📤 Sending to channel/group: ${chatId}`);
          
          const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: 'HTML',
            }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            console.error(`❌ Failed to send to channel/group ${chatId}:`, result);
            failureCount++;
          } else {
            console.log(`✅ Successfully sent to channel/group ${chatId}`);
            successCount++;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`💥 Error sending to channel/group ${chatId}:`, error);
          failureCount++;
        }
      }
    } else {
      console.log('ℹ️ No channels/groups found to notify');
    }

    // Send to all individual users
    if (telegramUsers && telegramUsers.length > 0) {
      console.log(`👤 Sending to ${telegramUsers.length} individual users...`);
      
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
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`💥 Error sending to ${user.chat_id}:`, error);
          failureCount++;
        }
      }
    } else {
      console.log('ℹ️ No individual users found to notify');
    }

    console.log(`📊 Notification summary: ${successCount} success, ${failureCount} failures`);
    console.log(`📈 Sent to ${channelsAndGroups.length} channels/groups and ${telegramUsers?.length || 0} individual users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent to all recipients',
        notified_count: successCount,
        failed_count: failureCount,
        channels_count: channelsAndGroups.length,
        users_count: telegramUsers?.length || 0,
        total_recipients: channelsAndGroups.length + (telegramUsers?.length || 0)
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
