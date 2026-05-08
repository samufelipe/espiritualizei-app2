import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (fs.existsSync(path.join(__dirname, '.env'))) {
  const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  })
}

const BUFFER_TOKEN     = process.env.BUFFER_TOKEN
const BUFFER_PROFILE_ID = process.env.BUFFER_PROFILE_ID

async function uploadImageToBuffer(imagePath) {
  const imageData = fs.readFileSync(imagePath)
  const base64 = imageData.toString('base64')
  const mimeType = 'image/png'

  const res = await fetch('https://api.bufferapp.com/1/media/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BUFFER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: `data:${mimeType};base64,${base64}` }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Buffer upload error: ${err}`)
  }

  const data = await res.json()
  return data.media?.picture || null
}

async function schedulePost(imagePath, caption, scheduledAt) {
  if (!BUFFER_TOKEN || !BUFFER_PROFILE_ID) {
    console.error('Defina BUFFER_TOKEN e BUFFER_PROFILE_ID no .env')
    console.log('Saiba mais: https://buffer.com/developers/api')
    return
  }

  console.log(`Enviando imagem para o Buffer: ${imagePath}`)
  const mediaUrl = await uploadImageToBuffer(imagePath)

  const scheduledTimestamp = scheduledAt
    ? Math.floor(new Date(scheduledAt).getTime() / 1000)
    : Math.floor(Date.now() / 1000) + 3600

  const body = new URLSearchParams({
    'access_token': BUFFER_TOKEN,
    'profile_ids[]': BUFFER_PROFILE_ID,
    'text': caption,
    'scheduled_at': scheduledTimestamp.toString(),
  })

  if (mediaUrl) body.append('media[picture]', mediaUrl)

  const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Buffer schedule error: ${err}`)
  }

  const data = await res.json()
  console.log('Post agendado com sucesso!')
  console.log('Buffer ID:', data.updates?.[0]?.id)
  console.log('Agendado para:', new Date(scheduledTimestamp * 1000).toLocaleString('pt-BR'))
  return data
}

async function main() {
  const date = new Date().toISOString().slice(0, 10)
  const postType = process.argv[2] || 'quote-card'
  const metaPath = path.join(__dirname, 'output', `${date}-${postType}.json`)

  if (!fs.existsSync(metaPath)) {
    console.error(`Metadata não encontrada: ${metaPath}`)
    console.error('Execute generate-post.js primeiro.')
    process.exit(1)
  }

  const { pngPath, caption } = JSON.parse(fs.readFileSync(metaPath, 'utf8'))

  const scheduledAt = process.argv[3] || null

  await schedulePost(pngPath, caption, scheduledAt)
}

main().catch(console.error)