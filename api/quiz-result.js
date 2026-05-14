// Vercel serverless proxy: recebe chamada same-origin do browser e
// repassa server-side ao Supabase — elimina CORS e "Failed to fetch"
const SUPABASE_URL  = 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/get-quiz-result`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        },
        body: JSON.stringify(req.body),
      }
    )

    const data = await response.json().catch(() => ({}))
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('[quiz-result proxy]', error.message)
    return res.status(500).json({ error: 'Servidor indisponível. Tente novamente.' })
  }
}