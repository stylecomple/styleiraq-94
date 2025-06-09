
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order } = await req.json()
    console.log('Sending Telegram notification for order:', order)

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not configured')
      return new Response('Bot token not configured', { status: 500 })
    }

    // Get bot updates to find available chats
    const updatesResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=-1`)
    const updates = await updatesResponse.json()
    
    const chatIds = new Set()
    if (updates.ok && updates.result) {
      updates.result.forEach((update: any) => {
        if (update.message?.chat?.id) {
          chatIds.add(update.message.chat.id)
        }
        if (update.my_chat_member?.chat?.id) {
          chatIds.add(update.my_chat_member.chat.id)
        }
      })
    }

    console.log(`Found ${chatIds.size} chat IDs for notification`)

    if (chatIds.size === 0) {
      // Try to send to a default chat ID if configured
      const DEFAULT_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')
      if (DEFAULT_CHAT_ID) {
        chatIds.add(DEFAULT_CHAT_ID)
      } else {
        console.log('No chat IDs found and no default configured')
        return new Response('No chats available', { status: 200 })
      }
    }

    const message = `🛍️ *طلب جديد وصل!*

📋 *رقم الطلب:* \`${order.id}\`
💰 *المبلغ الإجمالي:* ${order.total_amount?.toLocaleString()} د.ع
📱 *رقم الهاتف:* ${order.phone || 'غير محدد'}
🏛️ *المحافظة:* ${order.governorate || 'غير محددة'}
📍 *العنوان:* ${order.shipping_address || 'غير محدد'}
💳 *طريقة الدفع:* ${order.payment_method || 'غير محددة'}
📅 *تاريخ الطلب:* ${new Date(order.created_at || Date.now()).toLocaleString('ar-IQ')}

✅ يرجى مراجعة لوحة الإدارة لمعالجة الطلب`

    // Send to all available chats
    const sendPromises = Array.from(chatIds).map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        })

        const result = await response.json()
        console.log(`Notification sent to chat ${chatId}:`, result.ok)
        return result.ok
      } catch (error) {
        console.error(`Failed to send to chat ${chatId}:`, error)
        return false
      }
    })

    const results = await Promise.allSettled(sendPromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent to ${successCount}/${chatIds.size} chats` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
