/**
 * ESPIRITUALIZEI - NOTIFICAÇÕES AGENDADAS
 * Edge Function para enviar notificações diárias via cron
 * Configure no Supabase: cron job para executar esta função
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inspirações diárias
const DAILY_INSPIRATIONS = [
  { title: "Luz para Hoje ✨", body: "Confiai no Senhor de todo o coração e não vos apoieis na vossa própria inteligência. (Pr 3,5)" },
  { title: "Palavra do Dia 📖", body: "O Senhor é meu pastor, nada me faltará. (Sl 23,1)" },
  { title: "Reflexão Matinal 🌅", body: "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão dadas por acréscimo. (Mt 6,33)" },
  { title: "Força para Hoje 💪", body: "Eu sou a luz do mundo. Quem me segue não andará nas trevas, mas terá a luz da vida. (Jo 8,12)" },
  { title: "Coragem 🦁", body: "Tudo posso naquele que me fortalece. (Fl 4,13)" },
  { title: "Paz Interior 🕊️", body: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. (Jo 14,27)" },
  { title: "Esperança 🌈", body: "Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz, e não de mal. (Jr 29,11)" },
];

// Lembretes de rotina
const ROUTINE_REMINDERS = {
  morning: { title: "Bom Dia! ☀️", body: "Que tal começar o dia com sua rotina espiritual no Espiritualizei?" },
  afternoon: { title: "Pausa para Deus 🙏", body: "No meio do dia, um momento de paz com o Senhor te espera." },
  evening: { title: "Boa Noite 🌙", body: "Encerre o dia em paz com sua rotina espiritual." }
};

// Títulos temáticos para notificação de novo ciclo de desafio
const CHALLENGE_CYCLE_MESSAGES = [
  { title: "Novo Desafio Comunitário 🕊️", body: "Um novo ciclo de 3 dias começou! A comunidade inteira está unida neste gesto de amor. Venha participar!" },
  { title: "Jornada Litúrgica Renovada ✨", body: "Novo desafio disponível! Santos e irmãos de fé caminham com você nestes próximos 3 dias." },
  { title: "A Comunidade Te Espera 🙏", body: "Começa hoje um novo ciclo de gestos concretos de santidade. Unidos na mesma jornada!" },
  { title: "Missão de 3 Dias 🔥", body: "Novo desafio litúrgico disponível. Junte-se à comunidade e transforme seu cotidiano em oração." },
];

/** Verifica se hoje é o 1º dia de um novo ciclo de 3 dias */
const isNewChallengeCycle = (): boolean => {
  const daysSinceEpoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  return daysSinceEpoch % 3 === 0;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determinar tipo de notificação baseado na hora
    const now = new Date();
    const hour = now.getUTCHours() - 3; // Ajustar para horário de Brasília
    
    let notificationType: 'inspiration' | 'morning' | 'afternoon' | 'evening';
    let notification: { title: string; body: string };

    if (hour >= 7 && hour < 8 && isNewChallengeCycle()) {
      // Notificação de novo ciclo de desafio (7h, apenas no 1º dia do ciclo)
      notificationType = 'inspiration';
      const daysSinceEpoch = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
      notification = CHALLENGE_CYCLE_MESSAGES[Math.floor(daysSinceEpoch / 3) % CHALLENGE_CYCLE_MESSAGES.length];
    } else if (hour >= 6 && hour < 8) {
      // Inspiração diária (6h-8h)
      notificationType = 'inspiration';
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
      notification = DAILY_INSPIRATIONS[dayOfYear % DAILY_INSPIRATIONS.length];
    } else if (hour >= 7 && hour < 9) {
      // Lembrete manhã (7h-9h)
      notificationType = 'morning';
      notification = ROUTINE_REMINDERS.morning;
    } else if (hour >= 11 && hour < 13) {
      // Lembrete tarde (11h-13h)
      notificationType = 'afternoon';
      notification = ROUTINE_REMINDERS.afternoon;
    } else if (hour >= 19 && hour < 21) {
      // Lembrete noite (19h-21h)
      notificationType = 'evening';
      notification = ROUTINE_REMINDERS.evening;
    } else {
      return new Response(
        JSON.stringify({ message: 'Fora do horário de notificações', hour }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar usuários com notificações habilitadas
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('user_id')
      .eq(notificationType === 'inspiration' ? 'daily_inspiration' : 'routine_reminders', true);

    if (prefError) {
      console.error('Erro ao buscar preferências:', prefError);
    }

    // Buscar todas as subscriptions (ou filtrar por preferências)
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (subError) {
      console.error('Erro ao buscar subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Nenhuma subscription encontrada', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filtrar por preferências se disponível
    let targetSubscriptions = subscriptions;
    if (preferences && preferences.length > 0) {
      const userIds = preferences.map(p => p.user_id);
      targetSubscriptions = subscriptions.filter(s => userIds.includes(s.user_id));
    }

    // Enviar notificações
    let sent = 0;
    let failed = 0;

    for (const sub of targetSubscriptions) {
      try {
        // Aqui você chamaria a função de envio de push
        // Por enquanto, apenas registramos na fila
        await supabase.from('notification_queue').insert({
          user_id: sub.user_id,
          title: notification.title,
          body: notification.body,
          type: notificationType,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        sent++;
      } catch (e) {
        failed++;
        console.error(`Erro ao enviar para ${sub.user_id}:`, e);
      }
    }

    // Também enviar por e-mail para usuários que preferem
    await sendEmailNotifications(supabase, notification, notificationType);

    return new Response(
      JSON.stringify({ 
        message: 'Notificações agendadas processadas',
        type: notificationType,
        sent,
        failed,
        total: targetSubscriptions.length
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
 * Enviar notificações por e-mail
 */
async function sendEmailNotifications(
  supabase: any,
  notification: { title: string; body: string },
  type: string
) {
  try {
    // Buscar usuários que preferem e-mail
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, name')
      .not('email', 'is', null);

    if (!users || users.length === 0) return;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.log('RESEND_API_KEY não configurada, pulando e-mails');
      return;
    }

    // Enviar e-mail para cada usuário (limitado a 10 por execução)
    const batch = users.slice(0, 10);
    
    for (const user of batch) {
      if (!user.email) continue;

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Espiritualizei <contato@espiritualizei.com>',
            to: user.email,
            subject: notification.title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://espiritualizei.com/icons/icon-192x192.png" alt="Espiritualizei" style="width: 60px; height: 60px;">
                </div>
                <h2 style="color: #7c3aed; text-align: center;">${notification.title}</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                  ${notification.body}
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://espiritualizei.com" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Abrir Espiritualizei
                  </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                  Você está recebendo este e-mail porque habilitou as notificações no Espiritualizei.
                </p>
              </div>
            `
          })
        });
      } catch (e) {
        console.error(`Erro ao enviar e-mail para ${user.email}:`, e);
      }
    }
  } catch (e) {
    console.error('Erro ao enviar e-mails:', e);
  }
}
