
import { LiturgyDay } from '../types';

// Função para remover artefatos de Markdown da API de liturgia
const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^"|"$/g, '').trim();
};

const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

export interface SeasonInfo {
  id: 'lent' | 'easter' | 'advent' | 'christmas' | 'ordinary';
  name: string;
  theme: string;
  // Cor principal (hex) — usada pelo Dashboard e comunidade
  color: string;
  startDate: Date;
  totalDays: number;
  // Campos novos para experiência imersiva
  daysIntoSeason: number;
  daysUntilNext: number;
  colorGradient: string;   // classe Tailwind para gradiente de fundo (LP/KB header)
  colorTailwind: string;   // nome da cor Tailwind (amber, violet, emerald…)
  seasonLabel: string;     // ex: "Tempo Pascal • Dia 31/50"
  nextSeasonName: string;  // ex: "Pentecostes"
  seasonBadge: string;     // texto curto para pill no hero — ex: "Aleluia! Tempo Pascal"
}

const diffDays = (a: Date, b: Date): number =>
  Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export const getSeasonDetailedInfo = (date: Date = new Date()): SeasonInfo => {
  const year = date.getFullYear();
  const now = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const easter     = getEasterDate(year);
  const christmas  = new Date(year, 11, 25);

  // Primeiro domingo do Advento = 4 domingos antes do Natal
  const adventStart = new Date(christmas);
  adventStart.setDate(christmas.getDate() - (christmas.getDay() === 0 ? 28 : 21 + christmas.getDay()));

  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  // Batismo do Senhor (domingo após 6 de janeiro — simplificado para 13 jan)
  const baptismOfLord = new Date(year, 0, 13);

  const buildSeason = (
    id: SeasonInfo['id'],
    name: string,
    theme: string,
    color: string,
    colorGradient: string,
    colorTailwind: string,
    start: Date,
    end: Date,
    nextSeasonName: string,
    seasonBadge: string,
  ): SeasonInfo => {
    const totalDays       = Math.max(1, diffDays(end, start) + 1);
    const daysIntoSeason  = Math.max(1, diffDays(now, start) + 1);
    const daysUntilNext   = Math.max(0, diffDays(end, now));
    const seasonLabel     = totalDays <= 55
      ? `${name} • Dia ${daysIntoSeason}/${totalDays}`
      : name;
    return {
      id, name, theme, color, startDate: start, totalDays,
      daysIntoSeason, daysUntilNext,
      colorGradient, colorTailwind,
      seasonLabel, nextSeasonName, seasonBadge,
    };
  };

  // Tempo do Natal (25/12 até Batismo do Senhor)
  if (now >= christmas || now <= baptismOfLord) {
    const xmasEnd = new Date(now >= christmas ? year + 1 : year, 0, 13);
    return buildSeason(
      'christmas', 'Tempo do Natal', 'Encarnação e Alegria', '#F59E0B',
      'from-yellow-950 via-[#1A1625] to-brand-dark', 'amber',
      christmas, xmasEnd, 'Tempo Comum',
      '🌟 Tempo do Natal',
    );
  }

  // Quaresma (Quarta-feira de Cinzas até Sábado Santo)
  if (now >= ashWednesday && now < easter) {
    const lentEnd = new Date(easter.getTime() - 86400000);
    return buildSeason(
      'lent', 'Quaresma', 'Penitência e Conversão', '#7C3AED',
      'from-purple-950 via-[#1A1625] to-brand-dark', 'violet',
      ashWednesday, lentEnd, 'Tempo Pascal',
      '🕯️ Quaresma',
    );
  }

  // Tempo Pascal (Páscoa até Pentecostes)
  if (now >= easter && now <= pentecost) {
    return buildSeason(
      'easter', 'Tempo Pascal', 'Ressurreição e Vida', '#F59E0B',
      'from-amber-950 via-[#1A1625] to-brand-dark', 'amber',
      easter, pentecost, 'Pentecostes',
      '✨ Aleluia! Tempo Pascal',
    );
  }

  // Advento (1º domingo do Advento até 24/12)
  if (now >= adventStart && now < christmas) {
    const adventEnd = new Date(year, 11, 24);
    return buildSeason(
      'advent', 'Advento', 'Espera e Vigilância', '#6D28D9',
      'from-violet-950 via-[#1A1625] to-brand-dark', 'violet',
      adventStart, adventEnd, 'Natal',
      '🕯️ Advento — Maranatha!',
    );
  }

  // Tempo Comum — calcula próxima fronteira litúrgica
  const nextEaster = getEasterDate(now.getMonth() <= 1 ? year : year + 1);
  const nextAshWed = new Date(nextEaster);
  nextAshWed.setDate(nextEaster.getDate() - 46);

  const nextAdvent = now < adventStart
    ? adventStart
    : (() => {
        const nc = new Date(year + 1, 11, 25);
        const s = new Date(nc);
        s.setDate(nc.getDate() - (nc.getDay() === 0 ? 28 : 21 + nc.getDay()));
        return s;
      })();

  const nextBoundary     = nextAshWed < nextAdvent ? nextAshWed : nextAdvent;
  const nextBoundaryName = nextAshWed < nextAdvent ? 'Quaresma' : 'Advento';

  return buildSeason(
    'ordinary', 'Tempo Comum', 'O Extraordinário no Cotidiano', '#10B981',
    'from-emerald-950 via-[#1A1625] to-brand-dark', 'emerald',
    baptismOfLord, new Date(nextBoundary.getTime() - 86400000), nextBoundaryName,
    '🌿 Tempo Comum',
  );
};

export const calculateDayOfSeason = (startDate: Date): number => {
  const now = new Date();
  const start = new Date(startDate);
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const fetchRealDailyLiturgy = async (): Promise<LiturgyDay> => {
  const dateObj = new Date();
  const dateString = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const seasonInfo = getSeasonDetailedInfo(dateObj);

  try {
    const response = await fetch('https://liturgia.up.railway.app/');
    if (!response.ok) throw new Error('API Liturgia offline');
    const data = await response.json();

    let saintName = data.santo;
    if (!saintName || saintName.toLowerCase().includes("ferial") || saintName.toLowerCase().includes("semana")) {
      saintName = "";
    }

    let secondReading = undefined;
    if (data.segundaLeitura && data.segundaLeitura.texto && data.segundaLeitura.texto.length > 20) {
      secondReading = { ref: data.segundaLeitura.referencia, text: cleanText(data.segundaLeitura.texto) };
    }

    return {
      date: dateString,
      liturgicalColor: data.cor || seasonInfo.color,
      season: data.liturgia || seasonInfo.name,
      saint: cleanText(saintName),
      readings: {
        first:  { ref: data.primeiraLeitura?.referencia || "1ª Leitura", text: cleanText(data.primeiraLeitura?.texto || "") },
        psalm:  { ref: data.salmo?.referencia || "Salmo", text: (data.salmo?.refrao ? `Refrão: ${data.salmo.refrao}\n\n` : '') + cleanText(data.salmo?.texto || "") },
        second: secondReading,
        gospel: { ref: data.evangelho?.referencia || "Evangelho", text: cleanText(data.evangelho?.texto || "") }
      }
    };
  } catch {
    return {
      date: dateString,
      liturgicalColor: seasonInfo.color,
      season: seasonInfo.name,
      saint: "Liturgia Diária",
      readings: {
        first:  { ref: "Leitura do Dia", text: "Não foi possível carregar a leitura." },
        psalm:  { ref: "Salmo", text: "O Senhor é o pastor que me conduz." },
        gospel: { ref: "Evangelho", text: "Conecte-se à internet para ler o Evangelho do dia." }
      }
    };
  }
};