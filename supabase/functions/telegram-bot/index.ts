
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🤖 Telegram bot function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const functionSecret = Deno.env.get('FUNCTION_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!telegramToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not found');
    }

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not found');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the secret parameter for webhook security
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    
    if (functionSecret && secret !== functionSecret) {
      console.log('❌ Invalid secret provided');
      return new Response('Unauthorized', { status: 401 });
    }

    const update: TelegramUpdate = await req.json();
    console.log('📨 Received update:', JSON.stringify(update, null, 2));
    
    if (!update.message || !update.message.text) {
      console.log('⚠️ No message or text in update');
      return new Response('OK', { status: 200 });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const userName = message.from.first_name;
    const username = message.from.username;

    console.log(`💬 Message from ${userName}: ${text}`);

    // Store or update user in database
    try {
      const { error: upsertError } = await supabase
        .from('telegram_users')
        .upsert({
          chat_id: chatId,
          first_name: userName,
          username: username || null,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chat_id'
        });

      if (upsertError) {
        console.error('❌ Error storing user:', upsertError);
      } else {
        console.log('✅ User stored/updated successfully');
      }
    } catch (error) {
      console.error('❌ Database error:', error);
    }

    // Simple bot responses
    let responseText = '';
    
    if (text.toLowerCase().includes('/start')) {
      responseText = `مرحباً ${userName}! 👋\nأهلاً بك في بوت ستايل العامرية. سوف تحصل على إشعارات بالطلبات الجديدة.\n\nكيف يمكنني مساعدتك؟`;
    } else if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('مرحبا')) {
      responseText = `مرحباً ${userName}! 😊 كيف حالك؟`;
    } else if (text.toLowerCase().includes('order') || text.toLowerCase().includes('طلب')) {
      responseText = 'يمكنك تصفح منتجاتنا وتقديم طلبك من خلال موقعنا الإلكتروني. هل تحتاج مساعدة في شيء معين؟ 🛍️';
    } else if (text.toLowerCase().includes('help') || text.toLowerCase().includes('مساعدة')) {
      responseText = `${userName}، يمكنني مساعدتك في:\n\n🛍️ معلومات عن المنتجات\n📦 تتبع الطلبات\n📞 التواصل مع خدمة العملاء\n🔔 إشعارات الطلبات الجديدة\n\nما الذي تريد معرفته؟`;
    } else {
      responseText = `شكراً لك ${userName} على رسالتك! 💐\nفريق خدمة العملاء سيتواصل معك قريباً. أو يمكنك زيارة موقعنا لتصفح المنتجات.\n\nستحصل على إشعارات بالطلبات الجديدة تلقائياً.`;
    }

    // Send response back to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseText,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Telegram API Error:', result);
      throw new Error(`Telegram API Error: ${result.description}`);
    }

    console.log('✅ Response sent successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('💥 Error in telegram bot:', error);
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
