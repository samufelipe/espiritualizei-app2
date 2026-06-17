const SUPABASE_URL  = 'https://anoqhwpdrztaqmlocnzx.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3Fod3Bkcnp0YXFtbG9jbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM3OTQsImV4cCI6MjA3OTI1OTc5NH0.eUg9hLctWst7nolKxk5OUgka6s8xUaaBNH3dP6kCduY'

export default async function handler(req, res) {
  const { paymentId } = req.query

  if (!paymentId) {
    return res.status(400).json({ error: 'paymentId obrigatorio' })
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/check-pix-status?paymentId=${encodeURIComponent(paymentId)}`,
      {
        headers: {
          'apikey':        SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_ANON}`,
        },
      }
    )

    const data = await response.json().catch(() => ({}))
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('[pix-status proxy]', error.message)
    return res.status(500).json({ error: 'Erro ao verificar status PIX' })
  }
}
