import { SUPABASE_URL, SUPABASE_KEY } from './authService';
import { UserProfile, OnboardingData, RoutineItem, MonthlyReviewData } from '../types';

export const cleanAIOutput = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '').replace(/__/g, '').replace(/\*/g, '')
    .replace(/_/g, '').replace(/#/g, '').replace(/`/g, '')
    .replace(/—/g, '-').trim();
};

async function callAiProxy(action: string, payload: Record<string, any>): Promise<any> {
  if (!SUPABASE_URL) throw new Error('Supabase não configurado');

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
    },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json();
  if (!data.success) throw new Error(data.error ?? 'Erro no AI proxy');
  return data;
}

export const sendMessageToAssistant = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Padroeiro: ${user.patronSaint}.`
      : "Um irmão em busca de orientação.";
    const data = await callAiProxy('sendMessage', { message, userContext });
    return cleanAIOutput(data.text || "Deus te abençoe, meu irmão.");
  } catch {
    return "Um momento de oração silenciosa. Em breve voltaremos a conversar.";
  }
};

export const generateDailyTheme = async (gospelText: string): Promise<string> => {
  try {
    const data = await callAiProxy('generateTheme', { gospelText });
    return cleanAIOutput(data.text || "Caminhando na luz de Cristo.");
  } catch {
    return "Buscai as coisas do alto.";
  }
};

export const generateDailyReflection = async (todaySaint: string): Promise<string> => {
  try {
    const data = await callAiProxy('generateReflection', { saint: todaySaint });
    return cleanAIOutput(data.text || "O Senhor é o meu pastor.");
  } catch {
    return "A paz de Cristo esteja convosco.";
  }
};

export const sendMessageToGuide = async (message: string): Promise<string> => {
  try {
    const data = await callAiProxy('sendMessageToGuide', { message });
    return data.text || "";
  } catch (error) {
    console.error("AI Guide Error:", error);
    return "";
  }
};

const FALLBACK_ROUTINE: RoutineItem[] = [
  { id: 'f1', title: 'Oração da Manhã', description: 'Oferta do dia', xpReward: 20, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
  { id: 'f2', title: 'Santa Missa', description: 'Dia do Senhor', xpReward: 50, completed: false, icon: 'cross', timeOfDay: 'morning', dayOfWeek: [0], actionLink: 'OPEN_SOCIAL' },
  { id: 'f3', title: 'Estudo da Fé', description: 'Doutrina Católica', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'afternoon', dayOfWeek: [1], actionLink: 'READ_KNOWLEDGE' },
  { id: 'f4', title: 'Anjo da Guarda', description: 'Combate Espiritual', xpReward: 30, completed: false, icon: 'shield', timeOfDay: 'morning', dayOfWeek: [2], actionLink: 'READ_LITURGY' },
  { id: 'f5', title: 'Gesto de Caridade', description: 'Exemplo de São José', xpReward: 30, completed: false, icon: 'heart', timeOfDay: 'afternoon', dayOfWeek: [3], actionLink: 'OPEN_COMMUNITY' },
  { id: 'f6', title: 'Adoração Espiritual', description: 'Presença Real', xpReward: 30, completed: false, icon: 'sun', timeOfDay: 'afternoon', dayOfWeek: [4], actionLink: 'OPEN_SOCIAL' },
  { id: 'f7', title: 'Via Sacra', description: 'Paixão de Cristo', xpReward: 30, completed: false, icon: 'cross', timeOfDay: 'afternoon', dayOfWeek: [5], actionLink: 'READ_LITURGY' },
  { id: 'f8', title: 'Santo Terço', description: 'Com Maria', xpReward: 30, completed: false, icon: 'rosary', timeOfDay: 'morning', dayOfWeek: [6], actionLink: 'OPEN_COMMUNITY' },
  { id: 'f9', title: 'Exame de Consciência', description: 'Revisão da noite', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
];

export const generateJournalReflection = async (
  mood: 'peace' | 'struggle',
  content: string
): Promise<{ reflection: string; verse: string }> => {
  try {
    const data = await callAiProxy('generateJournalReflection', { mood, content });
    return {
      reflection: data.reflection || 'Deus te vê e te ama nesse momento.',
      verse: data.verse || 'Salmo 139, 1',
    };
  } catch {
    return { reflection: 'Entregue este momento a Deus. Ele te ouve.', verse: 'Salmo 23, 1' };
  }
};

export const generateSpiritualRoutine = async (
  data: OnboardingData,
  reviewData?: MonthlyReviewData
): Promise<{ routine: RoutineItem[]; profileDescription: string; profileReasoning: string }> => {
  try {
    const result = await callAiProxy('generateRoutine', { userData: data, reviewData });
    return {
      routine: result.routine ?? FALLBACK_ROUTINE,
      profileDescription: cleanAIOutput(result.profileDescription ?? 'Peregrino'),
      profileReasoning: cleanAIOutput(result.profileReasoning ?? 'Caminho de fé.'),
    };
  } catch (e) {
    console.error("AI Routine Error:", e);
    return { profileDescription: "Peregrino", profileReasoning: "Caminho de fé.", routine: FALLBACK_ROUTINE };
  }
};
