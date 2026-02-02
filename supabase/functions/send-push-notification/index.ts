/**
 * ESPIRITUALIZEI - EDGE FUNCTION PARA PUSH NOTIFICATIONS
 * Envia notificações push para usuários via Web Push API
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chaves VAPID (mesmas do frontend)
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

interface PushPayload {
  user_id?: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  send_to_all?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    
    // Validar payload
    if (!payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'title e body são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar subscriptions
    let query = supabase.from('push_subscriptions').select('*');
    
    if (payload.user_id && !payload.send_to_all) {
      query = query.eq('user_id', payload.user_id);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erro ao buscar subscriptions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar subscriptions', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma subscription encontrada', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Preparar payload da notificação
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      data: payload.data || {}
    });

    // Enviar para cada subscription
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          // Usar web-push via fetch para Deno
          const response = await sendWebPush(
            sub.endpoint,
            sub.p256dh,
            sub.auth,
            notificationPayload
          );
          return { user_id: sub.user_id, success: true };
        } catch (e) {
          console.error(`Erro ao enviar para ${sub.user_id}:`, e);
          
          // Se a subscription expirou, remover
          if (e.message?.includes('410') || e.message?.includes('expired')) {
            await supabase.from('push_subscriptions').delete().eq('user_id', sub.user_id);
          }
          
          return { user_id: sub.user_id, success: false, error: e.message };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

    // Registrar na fila de notificações
    await supabase.from('notification_queue').insert({
      user_id: payload.user_id || 'broadcast',
      title: payload.title,
      body: payload.body,
      type: payload.data?.type || 'general',
      status: 'sent',
      sent_count: successful,
      failed_count: failed,
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        message: 'Notificações enviadas',
        sent: successful,
        failed: failed,
        total: subscriptions.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Envia Web Push usando fetch (compatível com Deno)
 */
async function sendWebPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string
): Promise<Response> {
  // Nota: Para uma implementação completa, você precisaria usar
  // a biblioteca web-push ou implementar a criptografia ECDH manualmente.
  // Por simplicidade, estamos usando uma abordagem que funciona com
  // serviços de push que aceitam payloads não criptografados.
  
  // Para produção, recomendo usar um serviço como OneSignal, Firebase Cloud Messaging,
  // ou implementar a criptografia completa.
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TTL': '86400', // 24 horas
    },
    body: payload
  });

  if (!response.ok) {
    throw new Error(`Push failed: ${response.status} ${response.statusText}`);
  }

  return response;
}
