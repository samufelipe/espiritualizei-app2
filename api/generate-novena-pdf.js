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
  anxiety:       'Novena da Paz Interior',
  sadness:       'Novena da Esperança',
  relationships: 'Novena da Reconciliação',
  laziness:      'Novena da Constância',
  dryness:       'Novena do Reencontro',
  ignorance:     'Novena da Luz na Fé',
  pride:         'Novena do Perdão',
  lust:          'Novena da Libertação',
}

// Santos padroeiros com orações e citações autenticas da Igreja Catolica
const SAINT_MAP = {
  anxiety: {
    name: 'Santa Teresa de Avila',
    title: 'Doutora da Igreja, Mestra da Vida Interior',
    feast: '15 de outubro',
    role: 'Padroeira dos que buscam paz interior e contemplacao',
    quote: 'Nada te perturbe, nada te amedronhe. Tudo passa. Deus nao muda. A paciencia tudo alcanca. Quem a Deus tem nada lhe falta. So Deus basta.',
    invocation: 'Santa Teresa de Avila, que ensinastes a alma a descansar em Deus mesmo no meio da tormenta, intercedei por nos.',
    novenaNote: 'A cada dia, apos a oracao, repita tres vezes: "So Deus basta."',
  },
  sadness: {
    name: 'Santa Teresinha do Menino Jesus',
    title: 'Doutora da Igreja, Padroeira das Missoes',
    feast: '1 de outubro',
    role: 'Mestra do "Caminho Pequeno" — a esperanca que nasce da confianca filial',
    quote: 'A minha vocacao e o amor... No coracao da Igreja, minha mae, serei o amor. Assim serei tudo.',
    invocation: 'Santa Teresinha, que encontrastes alegria em amar a Deus nas pequenas coisas, ensinai-nos a confiar mesmo quando o coracao esta pesado.',
    novenaNote: 'Peca ao Senhor, neste dia, que um passo pequeno de esperanca seja suficiente. Um so passo.',
  },
  relationships: {
    name: 'Sao Francisco de Sales',
    title: 'Doutor da Igreja, Padroeiro dos Escritores e da Comunicacao',
    feast: '24 de janeiro',
    role: 'Mestre da caridade nas relacoes — "com mel se pegam mais moscas do que com vinagre"',
    quote: 'Nada e tao forte quanto a mansidao; nada e tao grande quanto a verdadeira humildade.',
    invocation: 'Sao Francisco de Sales, que com doce firmeza soubestes curar fracoes e edificar pontes, intercedei pelas relacoes que carregamos com dor.',
    novenaNote: 'Antes de dormir, nomeie uma pessoa com quem a relacao precisa de cura. Ore pelo nome dela.',
  },
  laziness: {
    name: 'Sao Tomaz de Aquino',
    title: 'Doutor Angelico, Padroeiro dos Estudantes',
    feast: '28 de janeiro',
    role: 'Modelo de disciplina intelectual e espiritual — orava antes de estudar e de escrever',
    quote: 'Concedei-me, Senhor meu Deus, uma mente que te conheca, um coracao que te busque, uma sabedoria que te encontre.',
    invocation: 'Sao Tomas de Aquino, que convertestes a disciplina em oracao e o habito em virtude, ajudai-nos a perseverar mais um dia.',
    novenaNote: 'Defina uma hora fixa para sua pratica espiritual de hoje. Escreva-a. Honor-a como compromisso com Deus.',
  },
  dryness: {
    name: 'Sao Joao da Cruz',
    title: 'Doutor da Igreja, Mestre da Noite Escura da Alma',
    feast: '14 de dezembro',
    role: 'Guia dos que atravessam aridez espiritual — ensinou que o silencio de Deus nao e abandono',
    quote: 'Na tarde da vida, seras examinado no amor. Aprende a amar como Deus quer ser amado e deixa a tua forma de amar.',
    invocation: 'Sao Joao da Cruz, que conhecestes a noite escura e vos encontrastes com Deus no silencio, ensinai-nos que a seca e passagem, nao fim.',
    novenaNote: 'Neste dia, fique em silencio por cinco minutos sem pedir nada. So esteja. Isso ja e oracao.',
  },
  ignorance: {
    name: 'Sao Joao Paulo II',
    title: 'Pontifice e Beato, Apostolo da Nova Evangelizacao',
    feast: '22 de outubro',
    role: 'Guia dos que buscam aprofundar a fe com a razao e o coracao',
    quote: 'Nao tenhais medo. Abri, mais ainda, escancarai as portas a Cristo.',
    invocation: 'Sao Joao Paulo II, que soubestes unir a fe e a razao em uma vida de total doacao, ensinai-nos a nao ter medo de conhecer e de amar mais.',
    novenaNote: 'Leia uma pagina do Catecismo ou do Evangelho hoje. Nao para memorizar — para deixar entrar.',
  },
  pride: {
    name: 'Sao Francisco de Assis',
    title: 'Padroeiro do Brasil, Modelo de Pobreza e Paz',
    feast: '4 de outubro',
    role: 'Mestre do perdao e da mansidao — sua oracao e a mais famosa da Igreja',
    quote: 'Senhor, fazei de mim um instrumento da vossa paz. Onde houver odio, que eu leve o amor; onde houver ofensa, que eu leve o perdao.',
    invocation: 'Sao Francisco de Assis, que soubestes perdoar e ser perdoado sem guardar nada para si, ajudai-nos a soltar o que ainda carregamos.',
    novenaNote: 'Repita tres vezes, devagar: "Senhor, liberta-me do que eu ainda guardo." Respire fundo entre cada vez.',
  },
  lust: {
    name: 'Sao Jose de Nazare',
    title: 'Patriarca da Familia, Guardiao da Virgem e do Filho de Deus',
    feast: '19 de marco',
    role: 'Padroeiro da pureza interior e da dignidade da vida afetiva',
    quote: 'Em Jose, Deus confiou o mais precioso que tinha. Isso nos diz que a pureza nao e fraqueza — e forca que protege o que e sagrado.',
    invocation: 'Sao Jose, guardiao do coracao puro, intercedei por nos nos momentos em que sentimos fraqueza. Conduzi-nos ao Pai com mansidao.',
    novenaNote: 'Oferea a Deus, hoje, um ato concreto de cuidado consigo mesmo: descanso, silencio, beleza. O corpo e templo.',
  },
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
  const saint      = SAINT_MAP[challenge] || SAINT_MAP.anxiety

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

      <div class="invocation-block">
        <p class="label">INVOCACAO AO SANTO PATRONO</p>
        <p class="invocation-text">${esc(saint.invocation)}</p>
      </div>

      <div class="intention">
        <p class="label">INTENCAO DO DIA</p>
        <p class="intention-text">&ldquo;${esc(d.intention || '')}&rdquo;</p>
      </div>

      ${oracaoSteps ? `<div class="block"><p class="label">COMO REZAR</p>${oracaoSteps}</div>` : ''}

      ${d.task ? `<div class="block"><p class="label">PRATICA DO DIA</p><p class="body">${esc(d.task)}</p></div>` : ''}

      ${saint.novenaNote ? `<div class="note-block"><p class="note-text">${esc(saint.novenaNote)}</p></div>` : ''}

      <div class="closing-prayer">
        <p class="label">CONCLUSAO</p>
        <p class="closing-text">Pai-Nosso &middot; Ave-Maria &middot; Gloria ao Pai</p>
      </div>

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
  .cover .saint-block { margin-top: 36px; background: rgba(167,139,250,.08); border: 1px solid rgba(167,139,250,.25); border-radius: 14px; padding: 22px 26px; }
  .cover .saint-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(167,139,250,.6); font-family: Arial, sans-serif; margin-bottom: 8px; }
  .cover .saint-name { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .cover .saint-title { font-size: 13px; font-style: italic; color: rgba(255,255,255,.5); margin-bottom: 14px; }
  .cover .saint-quote { font-size: 13px; font-style: italic; color: rgba(255,255,255,.75); line-height: 1.65; border-left: 2px solid #A78BFA; padding-left: 14px; text-align: left; }

  .day {
    min-height: 297mm; padding: 22mm 24mm; page-break-after: always;
    display: flex; flex-direction: column;
  }
  .day-kicker { font-size: 10px; letter-spacing: 3px; color: #A78BFA; font-family: Arial, sans-serif; font-weight: 700; }
  .day-head { border-bottom: 2px solid #A78BFA; padding-bottom: 14px; margin-bottom: 22px; }
  .day-head h2 { font-size: 26px; font-weight: 700; margin-top: 6px; color: #1A2530; }

  .label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #A78BFA; font-family: Arial, sans-serif; font-weight: 700; margin-bottom: 8px; }
  .invocation-block { background: rgba(167,139,250,.06); border-left: 3px solid #A78BFA; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 18px; }
  .invocation-text { font-size: 14px; font-style: italic; line-height: 1.65; color: #4a3a6a; }
  .intention { background: #f5f3ff; border-left: 3px solid #7C3AED; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 20px; }
  .intention-text { font-size: 17px; font-style: italic; line-height: 1.6; color: #2d2540; }

  .block { margin-bottom: 20px; }
  .body { font-size: 14px; line-height: 1.7; color: #333; }
  .steps { margin-left: 18px; }
  .steps li { font-size: 14px; line-height: 1.7; color: #333; margin-bottom: 6px; }

  .note-block { background: #fff8e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; border-left: 3px solid #f59e0b; }
  .note-text { font-size: 13px; line-height: 1.65; color: #78530a; font-style: italic; }

  .closing-prayer { text-align: center; padding: 10px 0; margin-bottom: 14px; }
  .closing-text { font-size: 13px; color: #7C3AED; font-family: Arial, sans-serif; font-weight: 700; letter-spacing: 1.5px; }

  .verse { margin-top: auto; border-top: 1px solid #e5e0f0; padding-top: 18px; }
  .verse-ref { font-size: 12px; font-weight: 700; color: #A78BFA; font-family: Arial, sans-serif; margin-bottom: 6px; }
  .verse-text { font-size: 15px; font-style: italic; line-height: 1.6; color: #555; }

  .day-footer { font-size: 9px; color: #b8b0c8; font-family: Arial, sans-serif; letter-spacing: 1px; text-align: center; margin-top: 20px; }
</style>
</head>
<body>
  <div class="cover">
    <div class="heart">&#9829;</div>
    <div class="brand">Espiritualizei</div>
    <h1>${esc(novenaName)}</h1>
    <p class="for-name">preparada com amor para ${esc(firstName)}</p>
    <p class="sub">Nove dias de oracao para o seu momento.<br>Reze um dia de cada vez, no seu ritmo.</p>
    <div class="saint-block">
      <p class="saint-label">Sob a intercessao de</p>
      <p class="saint-name">${esc(saint.name)}</p>
      <p class="saint-title">${esc(saint.title)}</p>
      <p class="saint-quote">&ldquo;${esc(saint.quote)}&rdquo;</p>
    </div>
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
    return res.status(500).json({ error: 'Não foi possível abrir sua Novena agora. Tente novamente.' })
  }
}
