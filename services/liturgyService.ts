
import { LiturgyDay } from '../types';

// Função para remover artefatos de Markdown da API de liturgia
const cleanText = (text: string): string => {
  if (!text) return "";
  // Remove asteriscos e aspas desnecessárias vindas da API
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

export const getSeasonDetailedInfo = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const now = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const easter = getEasterDate(year);
  const christmas = new Date(year, 11, 25);
  
  const adventStart = new Date(christmas);
  adventStart.setDate(christmas.getDate() - (christmas.getDay() === 0 ? 28 : 21 + christmas.getDay()));

  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  if (now >= adventStart && now < christmas) {
    return { id: 'advent', name: 'Advento', color: '#7C3AED', startDate: adventStart, totalDays: 24 };
  }
  
  const baptismOfLord = new Date(year + 1, 0, 13);
  if (now >= christmas || now <= baptismOfLord) {
     return { id: 'christmas', name: 'Tempo do Natal', color: '#F59E0B', startDate: christmas, totalDays: 20 };
  }

  if (now >= ashWednesday && now < easter) {
    return { id: 'lent', name: 'Quaresma', color: '#7C3AED', startDate: ashWednesday, totalDays: 40 };
  }

  if (now >= easter && now <= pentecost) {
    return { id: 'easter', name: 'Tempo Pascal', color: '#F59E0B', startDate: easter, totalDays: 50 };
  }

  let ordinaryStart = new Date(year, 0, 14);
  if (now > pentecost) {
      ordinaryStart = new Date(pentecost);
      ordinaryStart.setDate(pentecost.getDate() + 1);
  }

  return { id: 'ordinary', name: 'Tempo Comum', color: '#10B981', startDate: ordinaryStart, totalDays: 34 * 7 };
};

export const calculateDayOfSeason = (startDate: Date): number => {
    const now = new Date();
    const start = new Date(startDate);
    now.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
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
        first: { ref: data.primeiraLeitura?.referencia || "1ª Leitura", text: cleanText(data.primeiraLeitura?.texto || "") },
        psalm: { ref: data.salmo?.referencia || "Salmo", text: (data.salmo?.refrao ? `Refrão: ${data.salmo.refrao}\n\n` : '') + cleanText(data.salmo?.texto || "") },
        second: secondReading,
        gospel: { ref: data.evangelho?.referencia || "Evangelho", text: cleanText(data.evangelho?.texto || "") }
      }
    };

  } catch (error) {
    return {
      date: dateString,
      liturgicalColor: seasonInfo.color,
      season: seasonInfo.name,
      saint: "Liturgia Diária",
      readings: {
        first: { ref: "Leitura do Dia", text: "Não foi possível carregar a leitura." },
        psalm: { ref: "Salmo", text: "O Senhor é o pastor que me conduz." },
        gospel: { ref: "Evangelho", text: "Conecte-se à internet para ler o Evangelho do dia." }
      }
    };
  }
};

export const getLiturgicalInfo = (date: Date = new Date()) => {
    const info = getSeasonDetailedInfo(date);
    return {
        season: info.id,
        seasonName: info.name,
        color: info.color,
        week: Math.ceil(calculateDayOfSeason(info.startDate) / 7),
        isFeast: false
    };
}
