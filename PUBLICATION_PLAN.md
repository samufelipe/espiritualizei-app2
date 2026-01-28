# Plano de Publicação: Google Play Store e Apple App Store (Espiritualizei)

Este plano detalha os passos necessários para publicar o aplicativo Espiritualizei em ambas as lojas, garantindo a conformidade com as políticas de pagamento e conteúdo.

## 1. Pré-requisitos (Gerais)

| Item | Status | Ação Necessária |
| :--- | :--- | :--- |
| **Contas de Desenvolvedor** | Pendente | Inscrever-se no **Google Play Console** ($25, taxa única) e no **Apple Developer Program** ($99/ano). |
| **Política de Privacidade** | Concluído | O app já possui páginas legais (`LegalPages.tsx`). Certifique-se de que a política está hospedada em um URL público e menciona a coleta de dados e o uso de IA (Gemini). |
| **Ícone e Screenshots** | Pendente | Criar ícones de alta resolução (diferentes tamanhos para cada loja) e 5-8 screenshots de alta qualidade para cada loja. |
| **Metadados da Loja** | Pendente | Definir nome do app, descrição curta, descrição completa, palavras-chave e categoria. |

## 2. Estratégia de Pagamento e Monetização (CRÍTICO)

A estratégia de pagamento deve ser diferente para cada loja para evitar rejeição.

| Loja | Plataforma de Pagamento | Justificativa |
| :--- | :--- | :--- |
| **Google Play Store (Android)** | **Cakto** (ou Stripe/Mercado Pago) | O Google permite sistemas de pagamento de terceiros para conteúdo digital, desde que o desenvolvedor cumpra certas regras. |
| **Apple App Store (iOS)** | **RevenueCat** (ou In-App Purchase nativo) | A Apple **exige** o uso do seu sistema de In-App Purchase (IAP) para conteúdo digital. O uso da Cakto no iOS resultará em **rejeição imediata**. |

**Ação Imediata:**
*   O código já foi preparado com a função `syncRevenueCatStatus` no `databaseService.ts`.
*   Você deve integrar o **SDK do RevenueCat** (ou o SDK nativo do Apple StoreKit) no seu código mobile (se for um app nativo) ou criar uma camada de *wrapper* para o PWA/Webview.

## 3. Plano de Publicação - Google Play Store (Android)

1.  **Criação do App:** No Google Play Console, crie um novo aplicativo e preencha os metadados.
2.  **Upload do Pacote:** Se o seu app for um PWA, você precisará de um **TWA (Trusted Web Activity)** ou um *wrapper* nativo. Se for um app nativo, faça o upload do arquivo **AAB (Android App Bundle)**.
3.  **Configuração de Pagamento:** Certifique-se de que o link de checkout da Cakto está funcionando e que o Webhook está configurado no Supabase (conforme `CAKTO_WEBHOOK_GUIDE.md`).
4.  **Testes:** Publique para um grupo fechado de testadores (Alpha/Beta) para garantir que o fluxo de pagamento e o acesso Premium funcionem.
5.  **Lançamento:** Envie para revisão do Google.

## 4. Plano de Publicação - Apple App Store (iOS)

1.  **Criação do App:** No App Store Connect, crie um novo aplicativo e preencha os metadados.
2.  **Certificados:** Gere os certificados de distribuição e perfis de provisionamento.
3.  **Upload do Pacote:** Faça o upload do arquivo **IPA** (para apps nativos).
4.  **Configuração de Pagamento (CRÍTICO):** Configure os produtos de In-App Purchase (assinaturas) no App Store Connect. O código do seu app deve usar o RevenueCat para verificar o status da assinatura.
5.  **Revisão:** Na seção de notas para o revisor, **explique** que o app usa o sistema de IAP da Apple para assinaturas.
6.  **Lançamento:** Envie para revisão da Apple.

## 5. Próximos Passos (Resumo)

| Próximo Passo | Responsável | Prazo Estimado |
| :--- | :--- | :--- |
| **1. Finalizar Webhook Cakto** | Você (configuração no Supabase/Cakto) | 1 dia |
| **2. Configurar RevenueCat/IAP** | Você (integração do SDK) | 3-5 dias |
| **3. Criar Ativos Visuais** | Você (ícones, screenshots) | 2 dias |
| **4. Inscrição nas Lojas** | Você (pagamento das taxas) | Imediato |
| **5. Publicar Versão Beta** | Você (upload do pacote) | 1 dia |
