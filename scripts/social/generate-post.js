import Anthropic from '@anthropic-ai/sdk'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Carregar variáveis de ambiente
if (fs.existsSync(path.join(__dirname, '.env'))) {
  const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BRAND_PROMPT = fs.readFileSync(
  path.join(__dirname, 'brand-prompt.md'),
  'utf8'
)

const POST_TYPES = {
  'quote-card':  { w: 1080, h: 1080, label: 'Quote Card' },
  'carousel':    { w: 1080, h: 1080, label: 'Carrossel' },
  'devotional':  { w: 1080, h: 1350, label: 'Devocional' },
  'story':       { w: 1080, h: 1920, label: 'Story' },
}

async function fetchDailyVerse() {
  try {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '/')
    const res = await fetch(`https://liturgia.up.railway.app/api/${date}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.evangelho?.texto || null
  } catch {
    return null
  }
}

function extractHtml(text) {
  const match = text.match(/```html\n?([\s\S]*?)```/) ||
                text.match(/<html[\s\S]*<\/html>/i) ||
                text.match(/<!DOCTYPE[\s\S]*<\/html>/i)
  if (match) return match[1] || match[0]

  const divMatch = text.match(/<div[\s\S]*<\/div>/i)
  return divMatch ? wrapHtml(divMatch[0]) : null
}

function wrapHtml(content) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>* { margin:0; padding:0; box-sizing:border-box; } body { width:1080px; overflow:hidden; }</style>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body>${content}</body>
</html>`
}

async function generatePost(postType, extraContext = '') {
  const { w, h, label } = POST_TYPES[postType] || POST_TYPES['quote-card']

  const dailyVerse = await fetchDailyVerse()
  const verseContext = dailyVerse
    ? `\n\nEvangelho do dia: "${dailyVerse.slice(0, 300)}..."`
    : ''

  const prompt = `Crie um post para Instagram do Espiritualizei no formato ${label} (${w}x${h}px).

${extraContext}${verseContext}

Retorne APENAS o HTML completo do post — sem explicações, sem markdown extra.
O HTML deve:
- Ter width:${w}px e height:${h}px fixos no body/container principal
- Importar Inter do Google Fonts
- Usar exatamente as cores, logo e padrões da identidade visual descrita acima
- Ser auto-suficiente (sem dependências externas exceto Google Fonts)
- Ter o logo coração SVG e "@espiritualizeiapp" visíveis
- Estar pronto para screenshot sem scroll`

  console.log(`Gerando ${label}...`)

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: BRAND_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const rawText = response.content[0].text
  const html = extractHtml(rawText)

  if (!html) {
    console.error('Nenhum HTML encontrado na resposta')
    console.log('Resposta bruta:', rawText.slice(0, 500))
    return null
  }

  return { html, w, h, postType }
}

async function screenshotPost({ html, w, h, postType }) {
  const date = new Date().toISOString().slice(0, 10)
  const outputDir = path.join(__dirname, 'output')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const htmlPath = path.join(outputDir, `${date}-${postType}.html`)
  const pngPath  = path.join(outputDir, `${date}-${postType}.png`)

  fs.writeFileSync(htmlPath, html)
  console.log(`HTML salvo em: ${htmlPath}`)

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  await page.setViewport({ width: w, height: h, deviceScaleFactor: 2 })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await page.waitForTimeout(1000)

  await page.screenshot({ path: pngPath, fullPage: false, clip: { x: 0, y: 0, width: w, height: h } })
  await browser.close()

  console.log(`PNG salvo em: ${pngPath}`)
  return pngPath
}

async function generateCaption(postType, postContext = '') {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `${BRAND_PROMPT}\n\nVocê escreve legendas para Instagram. Seja conciso, empático, termine com 5 hashtags relevantes. Nunca use "—".`,
    messages: [{
      role: 'user',
      content: `Escreva uma legenda para Instagram para um post do tipo "${postType}". Contexto: ${postContext || 'conteúdo espiritual diário'}. Max 150 palavras.`,
    }],
  })
  return response.content[0].text
}

async function main() {
  const postType = process.argv[2] || 'quote-card'
  const context  = process.argv[3] || ''

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Defina ANTHROPIC_API_KEY no arquivo .env')
    process.exit(1)
  }

  const post = await generatePost(postType, context)
  if (!post) process.exit(1)

  const pngPath = await screenshotPost(post)
  const caption = await generateCaption(postType, context)

  const date = new Date().toISOString().slice(0, 10)
  const metaPath = path.join(__dirname, 'output', `${date}-${postType}.json`)
  fs.writeFileSync(metaPath, JSON.stringify({ pngPath, caption, postType, date }, null, 2))

  console.log('\nLegenda gerada:\n')
  console.log(caption)
  console.log(`\nMetadata salva em: ${metaPath}`)
}

main().catch(console.error)