# ── setup-stripe-webhook.ps1 ──────────────────────────────────────────────────
# Cria o endpoint de webhook no Stripe e configura o Signing Secret no Supabase.
# Execute: powershell -ExecutionPolicy Bypass -File scripts\setup-stripe-webhook.ps1
# ─────────────────────────────────────────────────────────────────────────────

$PROJECT_REF = "anoqhwpdrztaqmlocnzx"
$FUNCTION_URL = "https://$PROJECT_REF.supabase.co/functions/v1/stripe-assessment-webhook"

Write-Host ""
Write-Host "=== Setup Stripe Webhook ===" -ForegroundColor Cyan
Write-Host "Endpoint que sera criado:"
Write-Host "  $FUNCTION_URL" -ForegroundColor Yellow
Write-Host ""

# Pede a chave de forma segura (nao aparece na tela)
$secureKey = Read-Host "Cole sua Stripe Secret Key (sk_live_ ou sk_test_)" -AsSecureString
$STRIPE_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
)

if (-not $STRIPE_KEY.StartsWith("sk_")) {
    Write-Host "Chave invalida. Deve comecar com sk_live_ ou sk_test_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Criando webhook no Stripe..." -ForegroundColor Cyan

# Chamar API do Stripe para criar o webhook
try {
    $body = "url=$([System.Uri]::EscapeDataString($FUNCTION_URL))&enabled_events[]=checkout.session.completed"

    $response = Invoke-RestMethod `
        -Uri "https://api.stripe.com/v1/webhook_endpoints" `
        -Method POST `
        -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
        -ContentType "application/x-www-form-urlencoded" `
        -Body $body

    $webhookId     = $response.id
    $signingSecret = $response.secret

    Write-Host "Webhook criado com sucesso!" -ForegroundColor Green
    Write-Host "  ID: $webhookId"
    Write-Host "  URL: $($response.url)"
    Write-Host "  Status: $($response.status)"
    Write-Host ""
} catch {
    Write-Host "Erro ao criar webhook no Stripe:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host "Configurando STRIPE_WEBHOOK_SECRET no Supabase..." -ForegroundColor Cyan

# Configurar o signing secret no Supabase
$supabaseCmd = "npx supabase secrets set STRIPE_WEBHOOK_SECRET=$signingSecret --project-ref $PROJECT_REF"
Invoke-Expression $supabaseCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Tudo configurado!" -ForegroundColor Green
    Write-Host "Proximo passo: va ao Stripe Dashboard e desative o endpoint antigo:" -ForegroundColor Yellow
    Write-Host "  https://icqhgmcbdyapiyhgsisd.supabase.co/functions/v1/stripe-assessment-webhook"
    Write-Host ""
    Write-Host "Para testar, acesse:"
    Write-Host "  https://dashboard.stripe.com/webhooks/$webhookId"
    Write-Host "  e clique em 'Send test webhook' -> checkout.session.completed"
} else {
    Write-Host "Erro ao configurar secret no Supabase." -ForegroundColor Red
    Write-Host "Rode manualmente:"
    Write-Host "  npx supabase secrets set STRIPE_WEBHOOK_SECRET=$signingSecret --project-ref $PROJECT_REF"
}