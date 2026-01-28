
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando variáveis de ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Inicializa o cliente Supabase fora do handler para performance
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: any, res: any) {
  // Log inicial para debug na Vercel
  console.log('--- NOVO WEBHOOK RECEBIDO ---');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Log do corpo da requisição para identificar a estrutura real da Cakto
    console.log('Payload:', JSON.stringify(body));

    // 1. Extração de Dados com Fallbacks (Evita erro de undefined)
    // A Cakto pode enviar o evento em diferentes lugares
    const eventName = body.event_type || (body.events && body.events[0]?.custom_id) || body.status || "";
    const status = String(eventName).toLowerCase();
    
    // O external_id é onde injetamos o ID do usuário no checkout
    const userId = body.external_id || body.data?.external_id || body.ref || body.data?.ref || (body.customer && body.customer.external_id);

    console.log(`Evento: ${status} | Usuário: ${userId}`);

    // 2. Verificação de Aprovação
    const approvedStatus = [
      'paid', 'succeeded', 'completed', 'approved', 'payment.succeeded', 
      'active', 'venda_paga', 'venda_aprovada', 'purchase_approved', 'compra_aprovada'
    ];
    
    const isApproved = approvedStatus.some(s => status.includes(s));

    if (isApproved && userId) {
      console.log(`Iniciando upgrade para PREMIUM do usuário: ${userId}`);
      
      // 3. Atualizar o Perfil no Supabase
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'premium',
          payment_provider: 'cakto',
          premium_since: new Date().toISOString()
        })
        .eq('id', userId)
        .select();

      if (updateError) {
        console.error('Erro Supabase:', updateError.message);
        return res.status(200).json({ error: 'Database update failed', details: updateError.message });
      }

      console.log('Upgrade concluído com sucesso!');
      return res.status(200).json({ 
        message: 'Success! User upgraded to premium.',
        user: userId,
        updated: data ? data.length > 0 : false
      });
    }

    console.log('Webhook processado, mas nenhuma ação de upgrade necessária.');
    return res.status(200).json({ message: 'Received', status, userId });

  } catch (error: any) {
    // NUNCA retorna 500 para a Cakto para evitar retentativas infinitas se o erro for de lógica
    console.error('ERRO CRÍTICO NO WEBHOOK:', error.message);
    return res.status(200).json({ error: 'Internal processing error', message: error.message });
  }
}
