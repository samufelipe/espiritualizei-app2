#!/bin/bash
# Script para deploy das Edge Functions do Espiritualizei
# Execute APÓS: npx supabase login
# Substitua RESEND_API_KEY_NOVA pela nova chave gerada no resend.com

PROJECT_REF="anoqhwpdrztaqmlocnzx"
RESEND_API_KEY_NOVA="re_COLOQUE_SUA_NOVA_CHAVE_AQUI"

echo "1. Linkando ao projeto Supabase..."
npx supabase link --project-ref $PROJECT_REF

echo "2. Configurando secrets das Edge Functions..."
npx supabase secrets set \
  GEMINI_API_KEY=AIzaSyD73XUZr_CmH8ePid9ve-rx2GNbM0Griy8 \
  RESEND_API_KEY=$RESEND_API_KEY_NOVA \
  VAPID_PUBLIC_KEY=_n8jAjYQe7d2xIWsINKXDLjRPr36mRADf6L2dRT959Q_d8CAolUIA6JBs901ppKEl0ACJYvmfWoFs3RJxLpYBWA \
  VAPID_PRIVATE_KEY=mmoR83Y_-HZWxHPLWlCzBeFrNKPk5POJmDfP8yNEmnc \
  CAKTO_CLIENT_SECRET=8a67e42d-08b9-4987-9f40-0fe7bfd15a5a \
  --project-ref $PROJECT_REF

echo "3. Deployando Edge Functions..."
npx supabase functions deploy send-email --project-ref $PROJECT_REF
npx supabase functions deploy ai-proxy --project-ref $PROJECT_REF
npx supabase functions deploy cakto-webhook --project-ref $PROJECT_REF
npx supabase functions deploy send-push-notification --project-ref $PROJECT_REF
npx supabase functions deploy scheduled-notifications --project-ref $PROJECT_REF
npx supabase functions deploy admin-data --project-ref $PROJECT_REF

echo ""
echo "CONCLUIDO! Acesse: https://espiritualizei.com"
