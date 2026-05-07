/**
 * HELPERS PARA GATILHOS CONTEXTUAIS DA LANDING PAGE
 * Usa o algoritmo canônico da liturgyService (Computus) em vez de datas hardcoded.
 * Funciona corretamente para qualquer ano - sem manutenção manual.
 */

import { getSeasonDetailedInfo } from '../services/liturgyService';

interface HeroContent {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  cta: string;
  seasonBadge: string;
  colorGradient: string;
}

export const getCurrentLiturgicalSeason = (): string =>
  getSeasonDetailedInfo().id;

export const isNewYearPeriod = (): boolean => {
  const month = new Date().getMonth() + 1;
  return month === 1 || month === 2;
};

export const isMonthStart = (): boolean => new Date().getDate() <= 7;

export const getContextualHeroContent = (): HeroContent => {
  const season = getSeasonDetailedInfo();
  const isNewYear = isNewYearPeriod();
  const isMonthBeginning = isMonthStart();

  // QUARESMA - Penitência, profundidade e renovação
  if (season.id === 'lent') {
    return {
      eyebrow: 'Viva uma Quaresma transformadora',
      title: 'Quaresma com profundidade,',
      titleHighlight: 'não com culpa.',
      subtitle: 'Ciclos de 30 dias que se renovam automaticamente para acompanhar sua jornada. Cada dia com rotinas práticas, comunidade ativa e direcionamento espiritual adaptado à sua realidade.',
      cta: 'Começar Minha Quaresma',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // TEMPO PASCAL - Alegria da Ressurreição (50 dias)
  if (season.id === 'easter') {
    return {
      eyebrow: 'Viva a alegria da Ressurreição',
      title: 'Páscoa que transforma,',
      titleHighlight: 'não que passa.',
      subtitle: `Ainda estamos no ${season.seasonLabel}. Viva a alegria pascal com rotinas práticas, uma comunidade viva e um caminho espiritual que se adapta ao seu dia a dia.`,
      cta: 'Começar Minha Jornada Pascal',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // ADVENTO - Preparação e expectativa
  if (season.id === 'advent') {
    return {
      eyebrow: 'Prepare seu coração para o Natal',
      title: 'Advento com sentido,',
      titleHighlight: 'não com correria.',
      subtitle: 'Ciclos de 30 dias que se adaptam à sua rotina. Prepare-se para o Natal com práticas diárias, comunidade que reza junto e um caminho claro rumo à presença de Deus.',
      cta: 'Começar Meu Advento',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // TEMPO DO NATAL - Intimidade e contemplação
  if (season.id === 'christmas') {
    return {
      eyebrow: 'Celebre o Natal com intimidade',
      title: 'Natal no coração,',
      titleHighlight: 'não só no calendário.',
      subtitle: 'Ciclos de 30 dias que se renovam para você. Viva o Natal com profundidade através de rotinas diárias, comunidade acolhedora e um caminho adaptado à sua realidade.',
      cta: 'Começar Meu Natal Interior',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // ANO NOVO (Janeiro/Fevereiro) - Recomeço
  if (isNewYear) {
    return {
      eyebrow: 'Ano novo, vida espiritual renovada',
      title: 'Pare de recomeçar',
      titleHighlight: 'toda segunda-feira.',
      subtitle: 'Ciclos de 30 dias que se renovam automaticamente. Comece o ano com rotinas práticas, uma comunidade que caminha junto e um sistema que se adapta à sua realidade.',
      cta: 'Começar Meu Ano Novo Espiritual',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // INÍCIO DE MÊS - Novo ciclo
  if (isMonthBeginning) {
    return {
      eyebrow: 'Novo ciclo, nova oportunidade',
      title: 'Ciclos de 30 dias',
      titleHighlight: 'que se adaptam a você.',
      subtitle: 'Não importa quando você começar. O Espiritualizei cria ciclos personalizados de 30 dias que se renovam automaticamente, com rotinas práticas, comunidade ativa e direcionamento adaptado à sua vida real.',
      cta: 'Começar Meu Ciclo Agora',
      seasonBadge: season.seasonBadge,
      colorGradient: season.colorGradient,
    };
  }

  // TEMPO COMUM - Constância no ordinário
  return {
    eyebrow: 'Sua alma merece paz, não mais cansaço',
    title: 'Pare de recomeçar',
    titleHighlight: 'toda segunda-feira.',
    subtitle: 'A vida espiritual não precisa ser um fardo pesado. Ciclos de 30 dias que se renovam automaticamente, com rotinas práticas adaptadas à sua realidade, comunidade que reza junto e um caminho claro para que a oração seja seu verdadeiro porto seguro.',
    cta: 'Organizar Minha Vida Espiritual',
    seasonBadge: season.seasonBadge,
    colorGradient: season.colorGradient,
  };
};