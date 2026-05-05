#!/bin/bash
# Script de deploy das Edge Functions do Espiritualizei
# 
# Pré-requisito: npx supabase login
# Uso: RESEND_API_KEY=re_xxx bash deploy-edge-functions.sh

PROJECT_REF="anoqhwpdrztaqmlocnzx"

if [ -z "$RESEND_API_KEY" ]; then
  echo "Erro: defina RESEND_API_KEY antes de executar."
  echo "Exemplo: RESEND_API_KEY=re_xxx bash deploy-edge-functions.sh"
  exit 1
fi

echo "1. Linkando ao projeto Supabase..."
npx supabase link --project-ref $PROJECT_REF

echo "2. Configurando secrets..."
npx supabase secrets set \
  RESEND_API_KEY="$RESEND_API_KEY" \
  GEMINI_API_KEY="$GEMINI_API_KEY" \
  VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" \
  VAPID_PRIVATE_KEY="$VAPID_PRIVATE_KEY" \
  CAKTO_CLIENT_SECRET="$CAKTO_CLIENT_SECRET" \
  --project-ref $PROJECT_REF

echo "3. Deployando Edge Functions..."
npx supabase functions deploy send-email --project-ref $PROJECT_REF
npx supabase functions deploy ai-proxy --project-ref $PROJECT_REF
npx supabase functions deploy cakto-webhook --project-ref $PROJECT_REF
npx supabase functions deploy send-push-notification --project-ref $PROJECT_REF
npx supabase functions deploy scheduled-notifications --project-ref $PROJECT_REF
npx supabase functions deploy admin-data --project-ref $PROJECT_REF

echo "Concluído!"
