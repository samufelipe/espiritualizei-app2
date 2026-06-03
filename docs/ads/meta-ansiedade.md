# Kit de Anúncios Meta — Funil de Ansiedade

**Produto:** Diagnóstico Espiritual + Plano de 21 Dias + Novena (R$19,90)
**Avatar:** Mulher católica, 28-50, ansiosa e sobrecarregada, ama Deus mas perdeu a paz e sente culpa por não conseguir rezar.
**Link de destino:** `https://www.espiritualizei.com/quiz?foco=ansiedade`
(o parâmetro `?foco=ansiedade` troca a copy da landing para o ângulo de ansiedade)

**Gatilho central:** "Não é falta de fé, é ansiedade — e existe um caminho católico pra ela."
Remove a culpa (ela acha que é "má cristã") e reposiciona o problema como solucionável.

---

## Regra de ouro do Meta (LER ANTES)

⚠️ O Meta **proíbe** segmentação que implique condição de saúde mental. **NÃO** dá para mirar "ansiedade" como interesse, nem afirmar no anúncio que a pessoa "tem ansiedade" de forma direta/diagnóstica ("Você sofre de ansiedade?"). Isso reprova o anúncio.

✅ Caminho certo:
- Segmentar por **interesses católicos** (abaixo) e deixar o **criativo fazer a auto-seleção** — a mulher ansiosa se reconhece e clica.
- Falar da ansiedade em 1ª pessoa/situação ("quando a mente não desliga", "a paz que some na quarta") em vez de rótulo diagnóstico na 2ª pessoa.

---

## Os 4 ângulos de anúncio

### Ângulo 1 — Remoção de culpa (PRINCIPAL)
- **Headline:** Não é falta de fé.
- **Corpo:** Você ama Deus. Vai à missa. Tenta rezar. Mas a mente não desliga, e bate aquela culpa de não conseguir manter a paz. Talvez o problema não seja a sua fé. Em 3 perguntas, descubra o que está tirando sua paz e receba um caminho católico de 21 dias para reencontrá-la.
- **CTA:** Quero encontrar paz
- **Criativo:** mulher 30-40 sentada à mesa da cozinha de manhã cedo, café na mão, olhar cansado para a janela; luz natural suave; estética real, grain de filme.

### Ângulo 2 — Contraste missa/semana
- **Headline:** A paz da missa de domingo não chega até quarta.
- **Corpo:** No domingo você sai leve. Na segunda a correria volta. Na quarta, já nem lembra daquela paz. Não precisa ser assim. Faça o diagnóstico e descubra um caminho de 21 dias para levar a paz de Deus para dentro da sua semana, no seu ritmo.
- **CTA:** Fazer o diagnóstico
- **Criativo:** duas cenas — interior de igreja em paz / mulher no trânsito ou na correria de casa; contraste de temperatura de cor (quente → frio).

### Ângulo 3 — Mãe sobrecarregada
- **Headline:** Entre o trabalho, os filhos e a casa, você perdeu a paz com Deus.
- **Corpo:** A vida não para. E a sua oração foi ficando pra "quando der" — que nunca vem. Você não está sozinha, e não é sobre fazer mais. É sobre um caminho feito para a sua rotina real. Descubra o seu em 3 perguntas.
- **CTA:** Quero meu caminho
- **Criativo:** mãe brasileira na correria matinal com criança por perto, celular apitando; luz tungstênio quente; documental, real.

### Ângulo 4 — Esperança / transformação
- **Headline:** 21 dias para trocar a mente acelerada por um coração em paz.
- **Corpo:** Imagine começar o dia ancorada em Deus, antes do barulho do mundo. Um passo de cada vez, com uma oração e uma intenção feitas para o seu momento. Comece descobrindo onde você está hoje.
- **CTA:** Começar agora
- **Criativo:** luz da manhã entrando pela janela, mulher em oração tranquila, terço nas mãos; golden hour; sereno.

> Começar com o Ângulo 1 (remoção de culpa) como principal — é o gatilho mais forte e diferenciado. Rodar os 4 e deixar os dados escolherem o vencedor.

---

## Segmentação (Meta Ads)

- **Gênero:** Mulheres
- **Idade:** 28-50
- **Local:** Brasil
- **Interesses (testar em conjuntos separados):**
  - Catolicismo / Igreja Católica
  - Hallow (app), Canção Nova, Padre Reginaldo Manzotti, Padre Fábio de Melo
  - Terço, Novena, Santos, Nossa Senhora Aparecida
  - Comunidade Shalom, EWTN, devoção mariana
- **Abrir 1 conjunto SEM interesse (aberto)** — o algoritmo do Meta acha o público pelo criativo. Muitas vezes ganha.
- **Depois de ~50 compras:** criar **Lookalike 1-3%** de compradores (evento Purchase) e de quem fez o quiz (Lead).

---

## Estrutura de campanha

```
CAMPANHA (CBO) — Objetivo: Vendas
│  Orçamento: R$40-60/dia (fase de teste)
│
├── Conjunto A — Interesses católicos amplos
├── Conjunto B — Interesses específicos (Hallow, padres, novena)
└── Conjunto C — Aberto (sem interesse)
     │
     └── 4 criativos por conjunto (Ângulos 1-4), formato 9:16 (Reels/Stories) + 4:5 (Feed)
```

**Otimização de evento:**
- Início (pouco dado): otimizar por **InitiateCheckout** ou **Lead** — eventos mais frequentes, o pixel aprende rápido.
- Com ~50 Purchase/semana por conjunto: migrar otimização para **Purchase**.

**Métricas-alvo (referência low-ticket R$19,90):**
- CPA-alvo: ≤ R$19,90 no início (empate operacional) buscando ≤ R$12 com otimização → margem
- CTR do criativo: > 1,5% (link)
- Custo por InitiateCheckout: acompanhar para achar gargalo (anúncio vs. página)

**Regra de escala:** o que bater o CPA-alvo por 3 dias seguidos → subir orçamento 20%/dia. O que não performar em ~R$ gastos = 2x o ticket sem venda → pausar.

---

## Pixel / rastreamento (já instalado, sem mudança)
- `PageView` (todas as telas) · `Lead` (e-mail capturado) · `InitiateCheckout` (clique em pagar) · `Purchase` (via Meta CAPI no servidor, com deduplicação por event_id).
- Garantir no Gerenciador de Eventos que o domínio `espiritualizei.com` está verificado e os eventos chegando.

---

## Checklist de lançamento
- [ ] Domínio verificado no Gerenciador de Negócios
- [ ] Eventos do pixel testados (PageView, Lead, InitiateCheckout, Purchase)
- [ ] 4 criativos prontos (9:16 + 4:5) — gerar via `/diretor-criativo` + Higgsfield, estética católica real
- [ ] Link com `?foco=ansiedade` + UTMs em todos os anúncios
- [ ] Campanha CBO com 3 conjuntos, otimizando InitiateCheckout
- [ ] Orçamento R$40-60/dia, acompanhar 3 dias antes de julgar
