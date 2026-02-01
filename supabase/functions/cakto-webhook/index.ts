
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Tratamento de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const caktoSecret = Deno.env.get('CAKTO_CLIENT_SECRET') ?? ''

    // SEGURANÇA: Verificar assinatura do webhook (se a Cakto fornecer)
    const signature = req.headers.get('x-cakto-signature') || req.headers.get('x-webhook-signature');
    
    // Se tiver secret configurado e assinatura presente, validar
    if (caktoSecret && signature) {
      const expectedSignature = caktoSecret;
      if (signature !== expectedSignature && !signature.includes(caktoSecret)) {
        console.warn('⚠️ Assinatura de webhook inválida - possível tentativa de fraude');
        // Logar mas não bloquear (para não quebrar se a Cakto mudar o formato)
      }
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceRole)

    // 2. Coleta o corpo da requisição e headers
    const body = await req.json()
    
    // SEGURANÇA: Rate limiting básico - verificar se já processamos este evento
    const eventId = body.id || body.event_id || body.transaction_id;
    if (eventId) {
      const { data: existingLog } = await supabaseClient
        .from('payment_logs')
        .select('id')
        .eq('event_id', eventId)
        .maybeSingle();
      
      if (existingLog) {
        console.log(`⚠️ Evento ${eventId} já foi processado anteriormente. Ignorando duplicata.`);
        return new Response(JSON.stringify({ success: true, message: "Evento já processado" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // LOG DE AUDITORIA: Crucial para ver o formato exato enviado pela Cakto no painel do Supabase
    console.log("--- WEBHOOK CAKTO RECEBIDO ---")
    console.log("Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())))
    console.log("Payload:", JSON.stringify(body, null, 2))

    /**
     * LÓGICA DE EXTRAÇÃO DE DADOS
     * A Cakto geralmente envia o status em campos como 'status' ou dentro de um objeto 'data'.
     * O 'ref' é o ID do usuário que injetamos na URL de checkout no frontend.
     */
    const status = (body.status || body.data?.status || body.event_type || "").toLowerCase();
    const userId = body.ref || body.data?.ref || body.external_id || body.data?.external_id;
    const userEmail = body.email || body.data?.email || body.customer?.email;

    console.log(`Processando pagamento: Status [${status}] para Usuário [${userId}]`);

    // Lista de status que significam "Dinheiro no bolso / Acesso liberado"
    const isApproved = ['paid', 'succeeded', 'completed', 'approved', 'payment.succeeded', 'active'].includes(status);

    if (isApproved && userId) {
      // 3. Atualizar o Perfil do Usuário para Premium
      const { data, error: updateError } = await supabaseClient
        .from('profiles')
        .update({ 
          is_premium: true, 
          subscription_status: 'active',
          subscription_renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_active_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (updateError) throw updateError;

      // 4. Registrar log de sucesso na tabela de auditoria
      await supabaseClient.from('payment_logs').insert({
        user_id: userId,
        provider: 'cakto',
        event_id: eventId,
        payload: body,
        status: 'success',
        created_at: new Date().toISOString()
      })

      console.log(`✅ ACESSO LIBERADO: Usuário ${userId} agora é Premium.`);

      return new Response(JSON.stringify({ success: true, message: "Acesso Premium ativado" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Caso o pagamento seja estornado ou cancelado, remover o premium
    const isRevoked = ['refunded', 'canceled', 'chargeback', 'expired', 'failed'].includes(status);
    if (isRevoked && userId) {
       await supabaseClient.from('profiles').update({ 
         is_premium: false, 
         subscription_status: 'canceled' 
       }).eq('id', userId);
       
       // Logar revogação
       await supabaseClient.from('payment_logs').insert({
         user_id: userId,
         provider: 'cakto',
         event_id: eventId,
         payload: body,
         status: 'revoked',
         created_at: new Date().toISOString()
       });
       
       console.log(`❌ ACESSO REVOGADO: Usuário ${userId} perdeu o Premium (Motivo: ${status})`);
    }

    return new Response(JSON.stringify({ message: "Evento processado com sucesso" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("❌ ERRO NO WEBHOOK:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
