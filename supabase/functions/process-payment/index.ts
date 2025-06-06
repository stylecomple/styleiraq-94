
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { paymentMethod, paymentData, orderData } = await req.json();

    console.log('Processing payment:', { paymentMethod, orderId: orderData.orderId, amount: orderData.totalAmount });

    // Get admin payment configurations
    const { data: adminSettings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('visa_card_config, zain_cash_config')
      .single();

    if (settingsError) {
      console.error('Error fetching admin settings:', settingsError);
      return new Response(
        JSON.stringify({ success: false, message: 'Configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate payment method is enabled
    if (paymentMethod === 'visa_card' && !adminSettings.visa_card_config?.enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Visa Card payment is not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (paymentMethod === 'zain_cash' && !adminSettings.zain_cash_config?.enabled) {
      return new Response(
        JSON.stringify({ success: false, message: 'Zain Cash payment is not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security validations
    const currentTime = new Date();
    const paymentTime = new Date(paymentData.timestamp);
    const timeDiff = Math.abs(currentTime.getTime() - paymentTime.getTime());
    
    // Reject requests older than 5 minutes (replay attack protection)
    if (timeDiff > 5 * 60 * 1000) {
      console.log('Payment request expired');
      return new Response(
        JSON.stringify({ success: false, message: 'Payment request expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate order exists and is pending
    const { data: existingOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, status, total_amount')
      .eq('id', orderData.orderId)
      .single();

    if (orderError || !existingOrder) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ success: false, message: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingOrder.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, message: 'Order already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount matches
    if (Math.abs(existingOrder.total_amount - orderData.totalAmount) > 0.01) {
      console.error('Amount mismatch:', { expected: existingOrder.total_amount, received: orderData.totalAmount });
      return new Response(
        JSON.stringify({ success: false, message: 'Amount mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paymentResult = { success: false, transactionId: null };

    // Process payment based on method
    if (paymentMethod === 'visa_card') {
      paymentResult = await processVisaCardPayment(paymentData, orderData, adminSettings.visa_card_config);
    } else if (paymentMethod === 'zain_cash') {
      paymentResult = await processZainCashPayment(paymentData, orderData, adminSettings.zain_cash_config);
    }

    if (paymentResult.success) {
      // Update order status to paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'processing',
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderData.orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        return new Response(
          JSON.stringify({ success: false, message: 'Payment successful but order update failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Payment processed successfully:', { orderId: orderData.orderId, transactionId: paymentResult.transactionId });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Payment processed successfully',
          transactionId: paymentResult.transactionId 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Payment failed:', paymentResult);
      return new Response(
        JSON.stringify({ success: false, message: 'Payment failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processVisaCardPayment(paymentData: any, orderData: any, config: any) {
  console.log('Processing Visa Card payment...');
  
  // Basic validation (in real implementation, you would integrate with actual payment gateway)
  if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardholderName) {
    return { success: false, transactionId: null };
  }

  // Simulate payment processing with validation
  const cardNumber = paymentData.cardNumber.replace(/\s/g, '');
  
  // Basic card number validation (Luhn algorithm would be used in real implementation)
  if (cardNumber.length < 16 || !/^\d+$/.test(cardNumber)) {
    return { success: false, transactionId: null };
  }

  // Simulate successful payment (replace with real gateway integration)
  const transactionId = `visa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In real implementation, you would:
  // 1. Call the actual Visa payment gateway API
  // 2. Use the merchant_id, api_key, and terminal_id from config
  // 3. Handle real payment processing and validation
  
  return { success: true, transactionId };
}

async function processZainCashPayment(paymentData: any, orderData: any, config: any) {
  console.log('Processing Zain Cash payment...');
  
  // Basic validation (in real implementation, you would integrate with actual payment gateway)
  if (!paymentData.phoneNumber || !paymentData.pin) {
    return { success: false, transactionId: null };
  }

  // Validate Iraqi phone number format
  const phoneNumber = paymentData.phoneNumber;
  if (!/^07\d{9}$/.test(phoneNumber)) {
    return { success: false, transactionId: null };
  }

  // Simulate successful payment (replace with real gateway integration)
  const transactionId = `zain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In real implementation, you would:
  // 1. Call the actual Zain Cash payment gateway API
  // 2. Use the merchant_code, api_key, and service_type from config
  // 3. Handle real payment processing and validation
  
  return { success: true, transactionId };
}
