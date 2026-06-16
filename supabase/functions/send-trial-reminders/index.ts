import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

declare const Deno: any

const APP_URL      = 'https://www.espiritualizei.com'
const RESEND_URL   = 'https://api.resend.com/emails'
const FROM_ADDRESS = 'Espiritualizei <nao-responda@espiritualizei.com>'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string, resendKey: string) {
  const res = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
  return res.json()
}

function firstName(name: string): string {
  return (name || 'Amigo(a)').split(' ')[0]
}

// ── Email templates ───────────────────────────────────────────────────────────

function baseLayout(content: string, preview: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#fff;">
<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:28px;">
    <svg width="34" height="34" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.55);font-size:10px;letter-spacing:2.5px;margin:5px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>
  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">
    ${content}
  </div>
  <p style="font-size:11px;color:rgba(255,255,255,.18);margin-top:24px;text-align:center;">
    Você recebe este e-mail porque possui o Diagnostico Espiritual do Espiritualizei.<br>
    <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails" style="color:rgba(167,139,250,.4);">Cancelar e-mails</a>
  </p>
</div>
</body>
</html>`
}

function ctaButton(url: string, label: string): string {
  return `<div style="text-align:center;margin:24px 0 8px;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#A78BFA,#7C3AED);color:#fff;font-size:14px;font-weight:800;padding:14px 32px;border-radius:50px;text-decoration:none;letter-spacing:.2px;">${label}</a>
  </div>`
}

// ── Day 5 (2 dias restantes) ──────────────────────────────────────────────────
function buildDay5Email(name: string): { subject: string; html: string } {
  const first = firstName(name)
  const subject = `${first}, faltam 2 dias do seu acesso gratuito`
  const preview = `Aproveite ao maximo o que ainda resta do seu periodo gratuito no Espiritualizei.`
  const content = `
    <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#fff;text-align:center;">
      ${first}, faltam apenas 2 dias.
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Seu periodo gratuito no app Espiritualizei encerra em 2 dias. Se a caminhada valeu, e hora de tornar isso permanente.
    </p>
    <div style="background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.2);border-radius:14px;padding:18px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(167,139,250,.7);margin:0 0 10px;">O que voce nao vai querer perder</p>
      <div style="font-size:13px;color:rgba(255,255,255,.75);line-height:2.1;">
        <div>&#x2728;&nbsp; Rotina espiritual diaria personalizada</div>
        <div>&#x1F4C6;&nbsp; Plano de 21 Dias ativo</div>
        <div>&#x1F91D;&nbsp; Comunidade rezando por voce todos os dias</div>
        <div>&#x1F4DA;&nbsp; Biblioteca com formacao e santos</div>
        <div>&#x1F3C6;&nbsp; Ranking e desafios espirituais</div>
      </div>
    </div>
    ${ctaButton(`${APP_URL}/?assinar=1`, 'Continuar minha caminhada')}
    <p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-top:12px;">
      Menos de R$1 por dia. Cancele quando quiser.
    </p>`
  return { subject, html: baseLayout(content, preview) }
}

// ── Day 7 (expira hoje) ────────────────────────────────────────────────────────
function buildDay7Email(name: string): { subject: string; html: string } {
  const first = firstName(name)
  const subject = `${first}, seu acesso gratuito encerra hoje`
  const preview = `Hoje e o ultimo dia do seu periodo gratuito. Nao pare no meio do caminho.`
  const content = `
    <div style="text-align:center;margin-bottom:20px;">
      <span style="display:inline-block;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.3);color:#F59E0B;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:6px 14px;border-radius:999px;">Hoje e o ultimo dia</span>
    </div>
    <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#fff;text-align:center;">
      Nao deixe apagar o que voce acendeu.
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      ${first}, voce passou os ultimos 7 dias construindo algo real. Uma chama que nao merece apagar so porque o calendario virou.
    </p>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Seu Diagnostico, seu Plano de 21 Dias, sua Novena, tudo segue disponivel. Mas a rotina diaria, a comunidade e a formacao precisam de um passo seu agora.
    </p>
    ${ctaButton(`${APP_URL}/?assinar=1`, 'Garantir meu acesso permanente')}
    <p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-top:12px;">
      Menos de R$1 por dia. Cancele quando quiser.
    </p>`
  return { subject, html: baseLayout(content, preview) }
}

// ── Day 8 (1 dia apos expirar) ────────────────────────────────────────────────
function buildDay8Email(name: string): { subject: string; html: string } {
  const first = firstName(name)
  const subject = `${first}, seu acesso expirou ontem`
  const preview = `O que voce perde ao ficar sem o Espiritualizei. Ainda da para recuperar.`
  const content = `
    <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#fff;text-align:center;">
      ${first}, a porta ainda esta aberta.
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Seu periodo gratuito encerrou ontem. Mas o que voce construiu nao desaparece. Seus materiais continuam disponiveis.
    </p>
    <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 20px;margin-bottom:24px;">
      <p style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);margin:0 0 10px;">O que fica pausado sem assinatura</p>
      <div style="font-size:13px;color:rgba(255,255,255,.55);line-height:2.1;">
        <div style="text-decoration:line-through;">&#x274C;&nbsp; Rotina espiritual diaria</div>
        <div style="text-decoration:line-through;">&#x274C;&nbsp; Comunidade e oracoes coletivas</div>
        <div style="text-decoration:line-through;">&#x274C;&nbsp; Biblioteca e formacao</div>
        <div style="text-decoration:line-through;">&#x274C;&nbsp; Ranking e desafios mensais</div>
      </div>
    </div>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Voce ja fez o mais dificil: comecar. So falta um passo para nao perder o ritmo.
    </p>
    ${ctaButton(`${APP_URL}/?assinar=1`, 'Reativar meu acesso agora')}
    <p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-top:12px;">
      Menos de R$1 por dia. Cancele quando quiser.
    </p>`
  return { subject, html: baseLayout(content, preview) }
}

// ── Day 10 (ultima chance) ────────────────────────────────────────────────────
function buildDay10Email(name: string): { subject: string; html: string } {
  const first = firstName(name)
  const subject = `${first}, ultima mensagem sobre seu acesso`
  const preview = `Nao vou insistir alem disso. Mas antes de ir, quero te lembrar do que esta esperando.`
  const content = `
    <h1 style="font-size:22px;font-weight:800;margin:0 0 12px;color:#fff;text-align:center;">
      ${first}, uma ultima palavra.
    </h1>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Nao vou ficar mandando e-mails repetidos. Mas antes de encerrar, quero te lembrar de uma coisa simples:
    </p>
    <div style="background:rgba(167,139,250,.08);border-left:3px solid #A78BFA;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:15px;font-weight:700;color:#fff;margin:0;line-height:1.7;font-style:italic;">
        "A constancia na oracao nao e um talento. E uma escolha feita todo dia. E voce ja mostrou que sabe fazer essa escolha."
      </p>
    </div>
    <p style="font-size:14px;color:rgba(255,255,255,.65);line-height:1.8;margin:0 0 22px;text-align:center;">
      Seu Diagnostico e seus materiais continuam disponiveis. Se quiser voltar a ter a rotina completa, a comunidade e a formacao, e so um clique.
    </p>
    ${ctaButton(`${APP_URL}/?assinar=1`, 'Quero continuar minha caminhada')}
    <p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;margin-top:12px;">
      Menos de R$1 por dia. Cancele quando quiser.
    </p>`
  return { subject, html: baseLayout(content, preview) }
}

// ── Main handler ──────────────────────────────────────────────────────────────

serve(async () => {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
  const serviceKey     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const resendKey      = Deno.env.get('RESEND_API_KEY')
  const supabase       = createClient(supabaseUrl, serviceKey)

  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY ausente' }), { status: 500 })
  }

  const now = new Date()

  // ── Janelas de tempo (baseadas em subscription_renewal_at) ─────────────────
  // Cada janela tem ±12h para garantir que o cron diario nao perca o disparo.
  const windows = [
    {
      type:  'day5',
      label: 'day5 (2 dias restantes)',
      from:  new Date(now.getTime() + 1.5 * 86400000).toISOString(), // now + 1.5d
      to:    new Date(now.getTime() + 2.5 * 86400000).toISOString(), // now + 2.5d
      build: (name: string) => buildDay5Email(name),
    },
    {
      type:  'day7',
      label: 'day7 (expira hoje)',
      from:  new Date(now.getTime() - 12 * 3600000).toISOString(),   // now - 12h
      to:    new Date(now.getTime() + 12 * 3600000).toISOString(),   // now + 12h
      build: (name: string) => buildDay7Email(name),
    },
    {
      type:  'day8',
      label: 'day8 (1 dia apos expirar)',
      from:  new Date(now.getTime() - 36 * 3600000).toISOString(),
      to:    new Date(now.getTime() - 12 * 3600000).toISOString(),
      build: (name: string) => buildDay8Email(name),
    },
    {
      type:  'day10',
      label: 'day10 (3 dias apos expirar)',
      from:  new Date(now.getTime() - 84 * 3600000).toISOString(),
      to:    new Date(now.getTime() - 60 * 3600000).toISOString(),
      build: (name: string) => buildDay10Email(name),
    },
  ]

  const summary: Record<string, { sent: number; errors: number }> = {}

  for (const window of windows) {
    summary[window.type] = { sent: 0, errors: 0 }

    // Buscar usuarios nesta janela de tempo
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, subscription_renewal_at')
      .not('is_premium', 'eq', true)
      .gte('subscription_renewal_at', window.from)
      .lte('subscription_renewal_at', window.to)
      .not('email', 'is', null)

    if (error) {
      console.error(`[trial-reminders] Erro ao buscar ${window.label}:`, error.message)
      summary[window.type].errors++
      continue
    }

    if (!profiles || profiles.length === 0) {
      console.log(`[trial-reminders] ${window.label}: nenhum usuario`)
      continue
    }

    console.log(`[trial-reminders] ${window.label}: ${profiles.length} usuarios`)

    for (const profile of profiles) {
      try {
        const { subject, html } = window.build(profile.full_name || '')
        await sendEmail(profile.email, subject, html, resendKey)
        summary[window.type].sent++
        console.log(`[trial-reminders] ${window.type} enviado para ${profile.email}`)
      } catch (e: any) {
        summary[window.type].errors++
        console.error(`[trial-reminders] Erro ao enviar ${window.type} para ${profile.email}:`, e.message)
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
