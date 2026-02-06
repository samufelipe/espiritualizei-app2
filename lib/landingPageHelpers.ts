/**
 * HELPERS PARA GATILHOS CONTEXTUAIS DA LANDING PAGE
 * Sistema inteligente que adapta títulos e CTAs baseado em:
 * - Período litúrgico atual
 * - Proximidade de datas importantes
 * - Contexto temporal (início de ano, mês novo, etc.)
 */

interface HeroContent {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  cta: string;
}

/**
 * Detecta o período litúrgico atual
 */
export const getCurrentLiturgicalSeason = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Quaresma (aproximadamente fev-mar/abril)
  if ((month === 2 && day >= 14) || month === 3 || (month === 4 && day <= 10)) {
    return 'lent';
  }

  // Advento (4 domingos antes do Natal - aproximadamente dezembro)
  if (month === 12 && day >= 1 && day <= 24) {
    return 'advent';
  }

  // Tempo Pascal (50 dias após Páscoa - aproximadamente abril/maio/junho)
  if ((month === 4 && day >= 11) || month === 5 || (month === 6 && day <= 10)) {
    return 'easter';
  }

  // Tempo do Natal (25 dez até início de janeiro)
  if ((month === 12 && day >= 25) || (month === 1 && day <= 6)) {
    return 'christmas';
  }

  // Tempo Comum
  return 'ordinary';
};

/**
 * Detecta se estamos em início de ano (janeiro/fevereiro)
 */
export const isNewYearPeriod = (): boolean => {
  const month = new Date().getMonth() + 1;
  return month === 1 || month === 2;
};

/**
 * Detecta se estamos em início de mês (primeiros 7 dias)
 */
export const isMonthStart = (): boolean => {
  const day = new Date().getDate();
  return day <= 7;
};

/**
 * Retorna conteúdo da hero adaptado ao contexto
 */
export const getContextualHeroContent = (): HeroContent => {
  const season = getCurrentLiturgicalSeason();
  const isNewYear = isNewYearPeriod();
  const isMonthBeginning = isMonthStart();

  // QUARESMA - Foco em penitência, profundidade e renovação
  if (season === 'lent') {
    return {
      eyebrow: 'Viva uma Quaresma transformadora',
      title: 'Quaresma com profundidade,',
      titleHighlight: 'não com culpa.',
      subtitle: 'Ciclos de 30 dias que se renovam automaticamente para acompanhar sua jornada. Cada dia com rotinas práticas, comunidade ativa e direcionamento espiritual adaptado à sua realidade.',
      cta: 'Começar Minha Quaresma'
    };
  }

  // ADVENTO - Foco em preparação e expectativa
  if (season === 'advent') {
    return {
      eyebrow: 'Prepare seu coração para o Natal',
      title: 'Advento com sentido,',
      titleHighlight: 'não com correria.',
      subtitle: 'Ciclos de 30 dias que se adaptam à sua rotina. Prepare-se para o Natal com práticas diárias, comunidade que reza junto e um caminho claro rumo à presença de Deus.',
      cta: 'Começar Meu Advento'
    };
  }

  // TEMPO PASCAL - Foco em alegria e ressurreição
  if (season === 'easter') {
    return {
      eyebrow: 'Viva a alegria da Ressurreição',
      title: 'Páscoa que transforma,',
      titleHighlight: 'não que passa.',
      subtitle: 'Ciclos de 30 dias que renovam sua fé. Viva a alegria pascal com rotinas práticas, uma comunidade viva e um caminho espiritual que se adapta ao seu dia a dia.',
      cta: 'Começar Minha Jornada Pascal'
    };
  }

  // TEMPO DO NATAL - Foco em intimidade e contemplação
  if (season === 'christmas') {
    return {
      eyebrow: 'Celebre o Natal com intimidade',
      title: 'Natal no coração,',
      titleHighlight: 'não só no calendário.',
      subtitle: 'Ciclos de 30 dias que se renovam para você. Viva o Natal com profundidade através de rotinas diárias, comunidade acolhedora e um caminho adaptado à sua realidade.',
      cta: 'Começar Meu Natal Interior'
    };
  }

  // ANO NOVO (Janeiro/Fevereiro) - Foco em recomeço e propósitos
  if (isNewYear) {
    return {
      eyebrow: 'Ano novo, vida espiritual renovada',
      title: 'Pare de recomeçar',
      titleHighlight: 'toda segunda-feira.',
      subtitle: 'Ciclos de 30 dias que se renovam automaticamente. Comece o ano com rotinas práticas, uma comunidade que caminha junto e um sistema que se adapta à sua realidade para que você nunca mais abandone sua vida de oração.',
      cta: 'Começar Meu Ano Novo Espiritual'
    };
  }

  // INÍCIO DE MÊS - Foco em novo ciclo
  if (isMonthBeginning) {
    return {
      eyebrow: 'Novo ciclo, nova oportunidade',
      title: 'Ciclos de 30 dias',
      titleHighlight: 'que se adaptam a você.',
      subtitle: 'Não importa quando você começar. O Espiritualizei cria ciclos personalizados de 30 dias que se renovam automaticamente, com rotinas práticas, comunidade ativa e direcionamento adaptado à sua vida real.',
      cta: 'Começar Meu Ciclo Agora'
    };
  }

  // TEMPO COMUM - Mensagem padrão com foco em constância
  return {
    eyebrow: 'Sua alma merece paz, não mais cansaço',
    title: 'Pare de recomeçar',
    titleHighlight: 'toda segunda-feira.',
    subtitle: 'A vida espiritual não precisa ser um fardo pesado. Ciclos de 30 dias que se renovam automaticamente, com rotinas práticas adaptadas à sua realidade, comunidade que reza junto e um caminho claro para que a oração seja seu verdadeiro porto seguro.',
    cta: 'Organizar Minha Vida Espiritual'
  };
};
