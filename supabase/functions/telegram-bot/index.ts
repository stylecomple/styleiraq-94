
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
  console.log('📝 Request method:', req.method);
  console.log('📝 Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!telegramToken) {
      console.error('❌ TELEGRAM_BOT_TOKEN not found');
      throw new Error('TELEGRAM_BOT_TOKEN not found');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables not found');
      throw new Error('Supabase environment variables not found');
    }

    console.log('✅ Environment variables loaded');

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let update: TelegramUpdate;
    try {
      const requestText = await req.text();
      console.log('📝 Raw request body:', requestText);
      
      if (!requestText) {
        console.log('⚠️ Empty request body');
        return new Response('Empty request body', { status: 400 });
      }
      
      update = JSON.parse(requestText);
      console.log('📨 Parsed update:', JSON.stringify(update, null, 2));
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      return new Response('Invalid JSON', { status: 400 });
    }
    
    if (!update.message || !update.message.text) {
      console.log('⚠️ No message or text in update');
      return new Response('OK', { status: 200 });
    }

    const { message } = update;
    const chatId = message.chat.id;
    const text = message.text;
    const userName = message.from.first_name;
    const username = message.from.username;

    console.log(`💬 Message from ${userName} (@${username || 'no_username'}) (${chatId}): ${text}`);

    // Store or update user in database EVERY TIME they send a message
    try {
      console.log('💾 Storing/updating user in database...');
      console.log(`📊 User data: chat_id=${chatId}, first_name=${userName}, username=${username || 'null'}`);
      
      const { data, error: upsertError } = await supabase
        .from('telegram_users')
        .upsert({
          chat_id: chatId,
          first_name: userName,
          username: username || null,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chat_id'
        })
        .select();

      if (upsertError) {
        console.error('❌ Error storing user:', upsertError);
        console.error('❌ Error details:', JSON.stringify(upsertError, null, 2));
      } else {
        console.log('✅ User stored/updated successfully:', data);
        
        // Verify the user was actually stored
        const { data: verifyData, error: verifyError } = await supabase
          .from('telegram_users')
          .select('*')
          .eq('chat_id', chatId);
          
        if (verifyError) {
          console.error('❌ Error verifying user:', verifyError);
        } else {
          console.log('✅ User verification result:', verifyData);
        }
      }
    } catch (error) {
      console.error('❌ Database error:', error);
      console.error('❌ Full error details:', JSON.stringify(error, null, 2));
    }

    // Simple bot responses
    let responseText = '';
    
    if (text.toLowerCase().includes('/start')) {
      responseText = `مرحباً ${userName}! 👋\nأهلاً بك في بوت ستايل العامرية. سوف تحصل على إشعارات بالطلبات الجديدة.\n\nتم تسجيلك بنجاح! ✅\n\nكيف يمكنني مساعدتك؟`;
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
    
    console.log('📤 Sending response to Telegram...');
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

    console.log('✅ Response sent successfully to Telegram');

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
