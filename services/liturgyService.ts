
import { LiturgyDay } from '../types';

// Algoritmo para calcular a data da Páscoa (Meeus/Jones/Butcher)
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

// Retorna metadados completos da estação atual (Nome, Cor, Data de Início)
export const getSeasonDetailedInfo = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const now = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // Normalize to midnight

  // Datas Chave
  const easter = getEasterDate(year);
  const christmas = new Date(year, 11, 25);
  
  // Advento: Começa 4 domingos antes do Natal
  const adventStart = new Date(christmas);
  adventStart.setDate(christmas.getDate() - (christmas.getDay() === 0 ? 28 : 21 + christmas.getDay()));

  // Quaresma: Começa na Quarta-feira de Cinzas (46 dias antes da Páscoa)
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);

  // Pentecostes: 49 dias após a Páscoa (Fim do Tempo Pascal)
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  // LÓGICA DE DECISÃO DA ESTAÇÃO
  
  // 1. Advento
  if (now >= adventStart && now < christmas) {
    return { 
        id: 'advent',
        name: 'Advento', 
        color: '#7C3AED', // Roxo
        startDate: adventStart,
        totalDays: 24 // Aproximado, varia
    };
  }
  
  // 2. Natal (Oitava e Tempo do Natal até Batismo do Senhor - aprox 12 jan)
  const baptismOfLord = new Date(year + 1, 0, 13); // Simplificação
  if (now >= christmas || now <= baptismOfLord) {
     return { 
        id: 'christmas',
        name: 'Tempo do Natal', 
        color: '#F59E0B', // Branco/Dourado (Usando Amber para UI)
        startDate: christmas,
        totalDays: 20
     };
  }

  // 3. Quaresma
  if (now >= ashWednesday && now < easter) {
    return { 
        id: 'lent',
        name: 'Quaresma', 
        color: '#7C3AED', // Roxo
        startDate: ashWednesday,
        totalDays: 40 // Simbólico (são 46 corridos)
    };
  }

  // 4. Páscoa (Tempo Pascal)
  if (now >= easter && now <= pentecost) {
    return { 
        id: 'easter',
        name: 'Tempo Pascal', 
        color: '#F59E0B', // Branco/Dourado
        startDate: easter,
        totalDays: 50
    };
  }

  // 5. Tempo Comum (Fallback)
  // O Tempo Comum tem duas partes, mas para simplificar a jornada, tratamos como uma contagem contínua ou reiniciada.
  // Vamos definir o início do "bloco atual" de Tempo Comum.
  let ordinaryStart = new Date(year, 0, 14); // Pós batismo
  if (now > pentecost) {
      ordinaryStart = new Date(pentecost); // Pós pentecostes
      ordinaryStart.setDate(pentecost.getDate() + 1);
  }

  return { 
      id: 'ordinary',
      name: 'Tempo Comum', 
      color: '#10B981', // Verde
      startDate: ordinaryStart,
      totalDays: 34 * 7 // Semanas do tempo comum
  };
};

// Calcula o dia atual da jornada (1, 2, 3...) baseado na data de início da estação
export const calculateDayOfSeason = (startDate: Date): number => {
    const now = new Date();
    const start = new Date(startDate);
    
    // Resetar horas para cálculo correto de dias
    now.setHours(0,0,0,0);
    start.setHours(0,0,0,0);

    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays + 1; // Dia 1 é o próprio dia de início
};

// --- REAL API FETCHING (Mantido) ---
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
        secondReading = { ref: data.segundaLeitura.referencia, text: data.segundaLeitura.texto };
    }

    return {
      date: dateString,
      liturgicalColor: data.cor || seasonInfo.color,
      season: data.liturgia || seasonInfo.name,
      saint: saintName,
      readings: {
        first: { ref: data.primeiraLeitura?.referencia || "1ª Leitura", text: data.primeiraLeitura?.texto || "Texto indisponível." },
        psalm: { ref: data.salmo?.referencia || "Salmo", text: (data.salmo?.refrao ? `Refrão: ${data.salmo.refrao}\n\n` : '') + (data.salmo?.texto || "") },
        second: secondReading,
        gospel: { ref: data.evangelho?.referencia || "Evangelho", text: data.evangelho?.texto || "Texto indisponível." }
      }
    };

  } catch (error) {
    return {
      date: dateString,
      liturgicalColor: seasonInfo.color,
      season: seasonInfo.name,
      saint: "Liturgia Diária",
      readings: {
        first: { ref: "Leitura do Dia", text: "Não foi possível carregar a leitura. Verifique sua conexão." },
        psalm: { ref: "Salmo", text: "O Senhor é o pastor que me conduz." },
        gospel: { ref: "Evangelho", text: "Conecte-se à internet para ler o Evangelho do dia." }
      }
    };
  }
};

// Wrapper de compatibilidade
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
