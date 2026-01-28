# Guia de Integração: Webhook Cakto + Supabase (Espiritualizei)

Para que o acesso Premium seja liberado automaticamente após o pagamento, você precisa configurar um Webhook na sua conta da Cakto.

## 1. O que é o Webhook?
É um aviso que a Cakto envia para o seu servidor (Supabase) dizendo: "O usuário X acabou de pagar!".

## 2. Configuração no Supabase (Edge Function)

Você deve criar uma **Edge Function** no Supabase chamada `cakto-webhook`.

### Código Sugerido para a Edge Function:

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  
  // A Cakto envia o ID que passamos no 'external_id'
  const userId = payload.external_id
  const status = payload.status // 'paid', 'approved', etc.

  if (status === 'paid' || status === 'approved') {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabase
      .from('profiles')
      .update({ 
        is_premium: true, 
        subscription_status: 'active',
        payment_provider: 'cakto'
      })
      .eq('id', userId)
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
```

## 3. Configuração na Cakto

1. Acesse o painel da **Cakto**.
2. Vá em **Produtos** -> Selecione o **Espiritualizei**.
3. Procure a aba **Webhooks** ou **Integrações**.
4. Adicione a URL da sua Edge Function do Supabase:
   `https://[SEU-PROJETO].supabase.co/functions/v1/cakto-webhook`
5. Selecione os eventos: **Venda Aprovada** e **Venda Paga**.

## 4. Por que isso é importante?
Sem isso, você terá que ativar o Premium de cada usuário manualmente. Com o Webhook, o app libera o acesso na hora, melhorando a experiência do cliente e evitando reclamações.
