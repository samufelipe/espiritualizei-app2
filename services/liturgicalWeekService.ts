/**
 * Serviço de Organização Semanal Litúrgica
 * 
 * Organiza a experiência do usuário por semanas, considerando:
 * - Domingo como fim de semana
 * - Segunda-feira como início da semana
 * - Mensagens contextualizadas por dia da semana
 * - Rotinas e desafios organizados semanalmente
 */

export interface WeekInfo {
  weekNumber: number; // Número da semana no ano
  weekStart: Date; // Segunda-feira
  weekEnd: Date; // Domingo
  currentDay: number; // 0 = Segunda, 6 = Domingo
  dayName: string;
  liturgicalMessage: string;
  weeklyTheme: string;
}

/**
 * Obtém informações da semana atual
 */
export const getCurrentWeekInfo = (): WeekInfo => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  
  // Converter para nossa lógica: 0 = Segunda, 6 = Domingo
  const currentDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Calcular início da semana (segunda-feira)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - currentDay);
  weekStart.setHours(0, 0, 0, 0);
  
  // Calcular fim da semana (domingo)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // Calcular número da semana no ano
  const weekNumber = getWeekNumber(now);
  
  const dayName = getDayName(currentDay);
  const liturgicalMessage = getLiturgicalMessage(currentDay);
  const weeklyTheme = getWeeklyTheme(weekNumber);
  
  return {
    weekNumber,
    weekStart,
    weekEnd,
    currentDay,
    dayName,
    liturgicalMessage,
    weeklyTheme
  };
};

/**
 * Calcula o número da semana no ano
 */
const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

/**
 * Retorna o nome do dia
 */
const getDayName = (day: number): string => {
  const days = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];
  return days[day];
};

/**
 * Retorna mensagem litúrgica contextualizada por dia
 */
const getLiturgicalMessage = (day: number): string => {
  const messages = [
    // Segunda-feira - Início da semana
    '🌅 Início de uma nova semana! Que o Espírito Santo guie seus passos e renove suas forças para os dias que virão.',
    
    // Terça-feira
    '✨ Persevere na oração e mantenha-se firme na fé. Deus está trabalhando em sua vida, mesmo quando não vemos.',
    
    // Quarta-feira
    '🙏 Metade da semana! Momento de renovar o compromisso com sua jornada espiritual. Não desanime, continue firme!',
    
    // Quinta-feira
    '💪 Continue forte! Cada passo dado em fé é uma vitória. Deus está com você nesta caminhada.',
    
    // Sexta-feira
    '✝️ Dia de reflexão sobre o sacrifício de Cristo. Que possamos carregar nossa cruz com amor e esperança.',
    
    // Sábado
    '🌟 Prepare seu coração para o Dia do Senhor. Descanse, reflita e renove-se para celebrar amanhã.',
    
    // Domingo - Dia do Senhor
    '⛪ Dia do Senhor! Celebre a ressurreição de Cristo e agradeça pelas bênçãos desta semana. Renove suas forças para a próxima!'
  ];
  
  return messages[day];
};

/**
 * Retorna tema semanal baseado no tempo litúrgico
 */
const getWeeklyTheme = (weekNumber: number): string => {
  // Simplificado - pode ser expandido com calendário litúrgico real
  const themes = [
    'Renovação e Esperança',
    'Fé e Perseverança',
    'Amor e Caridade',
    'Oração e Contemplação',
    'Perdão e Reconciliação',
    'Gratidão e Louvor',
    'Serviço e Missão',
    'Paz e Harmonia'
  ];
  
  return themes[weekNumber % themes.length];
};

/**
 * Verifica se é início de semana (segunda-feira)
 */
export const isStartOfWeek = (): boolean => {
  const now = new Date();
  return now.getDay() === 1; // 1 = Segunda-feira
};

/**
 * Verifica se é fim de semana (domingo)
 */
export const isEndOfWeek = (): boolean => {
  const now = new Date();
  return now.getDay() === 0; // 0 = Domingo
};

/**
 * Retorna mensagem de saudação baseada no dia da semana
 */
export const getWeeklyGreeting = (userName: string): string => {
  const weekInfo = getCurrentWeekInfo();
  
  if (weekInfo.currentDay === 0) {
    // Segunda-feira
    return `Bom dia, ${userName}! 🌅 Que esta nova semana seja abençoada e cheia de propósito!`;
  } else if (weekInfo.currentDay === 6) {
    // Domingo
    return `Feliz Domingo, ${userName}! ⛪ Que o Dia do Senhor traga paz e renovação ao seu coração!`;
  } else {
    return `Paz e bem, ${userName}! ${weekInfo.liturgicalMessage}`;
  }
};

/**
 * Retorna progresso da semana (0-100%)
 */
export const getWeekProgress = (): number => {
  const weekInfo = getCurrentWeekInfo();
  return Math.round(((weekInfo.currentDay + 1) / 7) * 100);
};
