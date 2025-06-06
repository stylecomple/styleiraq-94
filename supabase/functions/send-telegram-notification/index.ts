
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

    // Get bot updates to find all groups and channels the bot has been added to
    const channelsAndGroups: number[] = [];

    try {
      console.log('🔍 Getting bot updates to find groups and channels...');
      
      // Get recent updates to find chat IDs
      const updatesResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getUpdates?limit=100&offset=-100`);
      const updatesData = await updatesResponse.json();
      
      if (updatesData.ok && updatesData.result) {
        const uniqueChats = new Set<number>();
        
        // Extract chat IDs from messages and member updates
        updatesData.result.forEach((update: any) => {
          // From regular messages
          if (update.message?.chat) {
            const chat = update.message.chat;
            if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
              uniqueChats.add(chat.id);
              console.log(`📍 Found ${chat.type}: ${chat.title || chat.id} (${chat.id})`);
            }
          }
          
          // From chat member updates (when bot is added/removed)
          if (update.my_chat_member?.chat) {
            const chat = update.my_chat_member.chat;
            const memberStatus = update.my_chat_member.new_chat_member?.status;
            
            if ((chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') &&
                (memberStatus === 'administrator' || memberStatus === 'member')) {
              uniqueChats.add(chat.id);
              console.log(`📍 Found ${chat.type} from member update: ${chat.title || chat.id} (${chat.id})`);
            }
          }
        });
        
        uniqueChats.forEach(chatId => {
          channelsAndGroups.push(chatId);
        });
        
        console.log(`🔍 Found ${uniqueChats.size} total groups/channels from updates`);
      }
    } catch (error) {
      console.error('⚠️ Error fetching updates:', error);
    }

    // If no chats found from updates, try some common methods to get chat info
    if (channelsAndGroups.length === 0) {
      console.log('ℹ️ No chats found in recent updates. Bot might need to be added to groups/channels first.');
    }

    // Send to all discovered channels and groups
    if (channelsAndGroups.length > 0) {
      console.log(`📢 Sending to ${channelsAndGroups.length} groups/channels...`);
      
      for (const chatId of channelsAndGroups) {
        try {
          console.log(`📤 Sending to chat: ${chatId}`);
          
          // First, try to get chat info to verify bot has access
          const chatInfoResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getChat?chat_id=${chatId}`);
          const chatInfo = await chatInfoResponse.json();
          
          if (!chatInfo.ok) {
            console.log(`⚠️ Cannot access chat ${chatId}: ${chatInfo.description}`);
            failureCount++;
            continue;
          }
          
          console.log(`✅ Chat accessible: ${chatInfo.result.title || chatInfo.result.first_name || chatId}`);
          
          // Send the message
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
            console.error(`❌ Failed to send to ${chatId}:`, result);
            failureCount++;
          } else {
            console.log(`✅ Successfully sent to ${chatInfo.result.title || chatInfo.result.first_name || chatId}`);
            successCount++;
          }
          
          // Small delay between messages to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`💥 Error sending to chat ${chatId}:`, error);
          failureCount++;
        }
      }
    } else {
      console.log('ℹ️ No groups/channels found. Make sure the bot has been added to at least one group or channel.');
      
      // Try to send a test message to see if there are any active chats
      try {
        const getMeResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getMe`);
        const getMeData = await getMeResponse.json();
        
        if (getMeData.ok) {
          console.log(`🤖 Bot info: @${getMeData.result.username} (${getMeData.result.first_name})`);
          console.log('💡 To receive notifications, add this bot to your groups/channels and make sure it has permission to send messages.');
        }
      } catch (error) {
        console.error('❌ Error getting bot info:', error);
      }
    }

    const totalRecipients = channelsAndGroups.length;
    
    console.log(`📊 Notification summary: ${successCount} success, ${failureCount} failures`);
    console.log(`📈 Attempted to send to ${totalRecipients} groups/channels`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: totalRecipients > 0 ? 
          `Notifications sent to discovered groups/channels` : 
          'No groups/channels found. Bot needs to be added to groups/channels first.',
        notified_count: successCount,
        failed_count: failureCount,
        total_discovered: totalRecipients,
        note: totalRecipients === 0 ? 
          'Add the bot to your groups/channels to receive notifications' : 
          undefined
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
