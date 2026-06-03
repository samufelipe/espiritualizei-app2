/**
 * api/generate-novena-pdf — Gera o PDF da Novena personalizada (dias 1-9 do plano)
 *
 * Fluxo:
 *   GET /api/generate-novena-pdf?session=STRIPE_SESSION_ID
 *     → valida pagamento + busca plano via get-quiz-result (Supabase)
 *     → monta HTML da novena (capa + 9 dias)
 *     → renderiza PDF com puppeteer-core + @sparticuz/chromium
 *     → devolve application/pdf como download
 *
 * Requer (já no package.json): @sparticuz/chromium, puppeteer-core
 */

import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const SUPABASE_URL  = 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'

const NOVENA_NAMES = {
  anxiety:   'Novena da Paz Interior',
  laziness:  'Novena da Constância',
  dryness:   'Novena do Reencontro',
  ignorance: 'Novena da Luz na Fé',
  pride:     'Novena do Esvaziamento',
  lust:      'Novena da Libertação',
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function parseVerse(raw) {
  if (!raw) return { ref: '', text: '' }
  const sep = raw.includes(' — ') ? ' — ' : raw.includes(' - ') ? ' - ' : null
  if (sep) { const i = raw.indexOf(sep); return { ref: raw.slice(0, i).trim(), text: raw.slice(i + sep.length).trim() } }
  const c = raw.indexOf(': ')
  if (c !== -1 && c < 15) return { ref: raw.slice(0, c).trim(), text: raw.slice(c + 2).trim() }
  return { ref: '', text: raw }
}

function buildNovenaHtml(name, challenge, days) {
  const novenaName = NOVENA_NAMES[challenge] || 'Novena Personalizada'
  const firstName  = (name || 'Caminhante').split(' ')[0]

  const dayPages = days.slice(0, 9).map((d, i) => {
    const n = i + 1
    const v = parseVerse(d.verse)
    const oracaoSteps = Array.isArray(d.prayer_steps) && d.prayer_steps.length
      ? `<ol class="steps">${d.prayer_steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`
      : ''
    return `
    <section class="day">
      <div class="day-head">
        <span class="day-kicker">NOVENA &middot; DIA ${n} DE 9</span>
        <h2>${esc(d.prayer || `Dia ${n}`)}</h2>
      </div>

      <div class="intention">
        <p class="label">INTENÇÃO DO DIA</p>
        <p class="intention-text">&ldquo;${esc(d.intention || '')}&rdquo;</p>
      </div>

      ${oracaoSteps ? `<div class="block"><p class="label">COMO REZAR</p>${oracaoSteps}</div>` : ''}

      ${d.task ? `<div class="block"><p class="label">PRÁTICA DO DIA</p><p class="body">${esc(d.task)}</p></div>` : ''}

      ${(v.text || d.verse) ? `
      <div class="verse">
        ${v.ref ? `<p class="verse-ref">${esc(v.ref)}</p>` : ''}
        <p class="verse-text">&ldquo;${esc(v.text || d.verse)}&rdquo;</p>
      </div>` : ''}

      <div class="day-footer">Espiritualizei &middot; ${esc(novenaName)}</div>
    </section>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a2530; }

  .cover {
    height: 297mm; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 40mm 30mm; page-break-after: always;
    background: #1A2530; color: #fff;
  }
  .cover .heart { font-size: 48px; color: #A78BFA; margin-bottom: 24px; }
  .cover .brand { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #A78BFA; margin-bottom: 40px; }
  .cover h1 { font-size: 38px; font-weight: 700; line-height: 1.2; margin-bottom: 20px; }
  .cover .for-name { font-size: 18px; font-style: italic; color: rgba(255,255,255,.7); margin-bottom: 8px; }
  .cover .sub { font-size: 14px; color: rgba(255,255,255,.45); margin-top: 32px; line-height: 1.6; }

  .day {
    min-height: 297mm; padding: 28mm 26mm; page-break-after: always;
    display: flex; flex-direction: column;
  }
  .day-kicker { font-size: 10px; letter-spacing: 3px; color: #A78BFA; font-family: Arial, sans-serif; font-weight: 700; }
  .day-head { border-bottom: 2px solid #A78BFA; padding-bottom: 16px; margin-bottom: 28px; }
  .day-head h2 { font-size: 28px; font-weight: 700; margin-top: 8px; color: #1A2530; }

  .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #A78BFA; font-family: Arial, sans-serif; font-weight: 700; margin-bottom: 10px; }
  .intention { background: #f5f3ff; border-left: 3px solid #A78BFA; border-radius: 0 8px 8px 0; padding: 18px 20px; margin-bottom: 24px; }
  .intention-text { font-size: 18px; font-style: italic; line-height: 1.6; color: #2d2540; }

  .block { margin-bottom: 24px; }
  .body { font-size: 14px; line-height: 1.7; color: #333; }
  .steps { margin-left: 18px; }
  .steps li { font-size: 14px; line-height: 1.7; color: #333; margin-bottom: 8px; }

  .verse { margin-top: auto; border-top: 1px solid #e5e0f0; padding-top: 20px; }
  .verse-ref { font-size: 12px; font-weight: 700; color: #A78BFA; font-family: Arial, sans-serif; margin-bottom: 6px; }
  .verse-text { font-size: 15px; font-style: italic; line-height: 1.6; color: #555; }

  .day-footer { font-size: 9px; color: #b8b0c8; font-family: Arial, sans-serif; letter-spacing: 1px; text-align: center; margin-top: 24px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="heart">&#9829;</div>
    <div class="brand">Espiritualizei</div>
    <h1>${esc(novenaName)}</h1>
    <p class="for-name">preparada com amor para ${esc(firstName)}</p>
    <p class="sub">Nove dias de oração para o seu momento.<br>Reze um dia de cada vez, no seu ritmo.</p>
  </div>
  ${dayPages}
</body>
</html>`
}

export default async function handler(req, res) {
  const sessionId = req.query.session || (req.body && req.body.session)
  if (!sessionId) {
    return res.status(400).json({ error: 'Parâmetro session é obrigatório' })
  }

  try {
    // 1. Validar pagamento + obter plano
    const r = await fetch(`${SUPABASE_URL}/functions/v1/get-quiz-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      body: JSON.stringify({ stripe_session_id: sessionId }),
    })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) return res.status(r.status).json({ error: data.error || 'Não foi possível validar o acesso.' })

    const quizData  = data.quizData || {}
    const plan      = data.plan || {}
    const name      = quizData.name || 'Caminhante'
    const challenge = quizData?.answers?.challenge || 'anxiety'

    // Dias 1-9 = primeira semana do plano
    const days = (plan?.weeks?.[0]?.days || []).slice(0, 9)
    if (!days.length) return res.status(404).json({ error: 'Plano ainda não disponível. Tente novamente em instantes.' })

    const html = buildNovenaHtml(name, challenge, days)

    // 2. Renderizar PDF
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    const fileName = `Novena-Espiritualizei-${name.split(' ')[0]}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(Buffer.from(pdf))

  } catch (e) {
    console.error('[generate-novena-pdf]', e.message)
    return res.status(500).json({ error: 'Não foi possível gerar o PDF agora. Tente novamente.' })
  }
}
