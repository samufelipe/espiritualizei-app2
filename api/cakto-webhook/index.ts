
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const caktoSecret = process.env.CAKTO_CLIENT_SECRET || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    console.log('Webhook recebido da Cakto:', JSON.stringify(body, null, 2));

    // 1. Validação de Segurança (Opcional, mas recomendado)
    // Se você configurou o Secret na Cakto, ele vem em fields.secret
    const receivedSecret = body.fields?.secret;
    if (caktoSecret && receivedSecret !== caktoSecret) {
      console.error('Secret inválido recebido');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Extração de Dados
    const eventName = body.event_type || (body.events && body.events[0]?.custom_id) || "";
    const status = (body.status || body.data?.status || eventName || "").toLowerCase();
    const userId = body.external_id || body.data?.external_id || body.ref || body.data?.ref;

    console.log(`Processando: Evento [${eventName}] Status [${status}] para Usuário [${userId}]`);

    // Status de aprovação
    const isApproved = [
      'paid', 'succeeded', 'completed', 'approved', 'payment.succeeded', 'active', 
      'venda_paga', 'venda_aprovada', 'purchase_approved', 'compra_aprovada'
    ].includes(status);

    if (isApproved && userId) {
      // 3. Atualizar o Perfil do Usuário para Premium no Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'premium',
          payment_provider: 'cakto',
          premium_since: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      console.log(`Usuário ${userId} atualizado para PREMIUM com sucesso!`);
      return res.status(200).json({ message: 'Success! User upgraded to premium.' });
    }

    return res.status(200).json({ message: 'Webhook received, but no action taken.' });

  } catch (error: any) {
    console.error('Erro no processamento do Webhook:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
