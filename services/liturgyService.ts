
// Algoritmo para calcular a data da Páscoa (Meeus/Jones/Butcher)
// Necessário porque o calendário litúrgico gira em torno da Páscoa e do Natal.

export type LiturgicalSeason = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary';

export interface LiturgicalInfo {
  season: LiturgicalSeason;
  seasonName: string;
  color: string;
  week: number;
  isFeast: boolean;
}

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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

export const getLiturgicalInfo = (date: Date = new Date()): LiturgicalInfo => {
  const year = date.getFullYear();
  const easter = getEasterDate(year);
  
  // Datas Chave
  const christmas = new Date(year, 11, 25); // Dez 25
  
  // Advento (4 domingos antes do Natal)
  const adventStart = new Date(christmas);
  adventStart.setDate(christmas.getDate() - (christmas.getDay() === 0 ? 28 : 21 + christmas.getDay())); // Aproximação simplificada

  // Quaresma (46 dias antes da Páscoa - Quarta de Cinzas)
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  // Pentecostes (50 dias após Páscoa)
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  const now = date.getTime();

  // Lógica de Estações
  if (now >= adventStart.getTime() && now < christmas.getTime()) {
    return { season: 'advent', seasonName: 'Advento', color: '#7C3AED', week: 1, isFeast: false }; // Roxo
  }
  
  if (now >= christmas.getTime() && now <= new Date(year + 1, 0, 6).getTime()) {
    return { season: 'christmas', seasonName: 'Tempo do Natal', color: '#F59E0B', week: 1, isFeast: true }; // Branco/Dourado (Amber)
  }

  if (now >= ashWednesday.getTime() && now < easter.getTime()) {
    return { season: 'lent', seasonName: 'Quaresma', color: '#7C3AED', week: 1, isFeast: false }; // Roxo
  }

  if (now >= easter.getTime() && now <= pentecost.getTime()) {
    return { season: 'easter', seasonName: 'Tempo Pascal', color: '#F59E0B', week: 1, isFeast: true }; // Branco/Dourado
  }

  // Tempo Comum (Default)
  return { season: 'ordinary', seasonName: 'Tempo Comum', color: '#10B981', week: 1, isFeast: false }; // Verde
};
