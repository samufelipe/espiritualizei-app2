
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, OnboardingData, RoutineItem, DailyTopic, MonthlyReviewData } from '../types';

// Inicialização conforme as novas diretrizes de engenharia
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const cleanAIOutput = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/\*/g, '')
    .replace(/_/g, '')
    .replace(/#/g, '')
    .replace(/`/g, '')
    .trim();
};

const SAINT_SPIRITUALITY: Record<string, string> = {
  acutis: "Foco: Eucaristia e santificação do mundo digital. Tarefas sugeridas: Adoração, oração antes de usar o computador, oferecer o tempo de internet.",
  michael: "Foco: Combate espiritual e vigilância. Tarefas sugeridas: Oração de São Miguel, vigilância das virtudes, atos de coragem espiritual.",
  therese: "Foco: Pequena Via e Confiança. Tarefas sugeridas: Pequenos atos de amor ocultos, aceitar contrariedades com alegria, confiança na misericórdia.",
  joseph: "Foco: Silêncio e Trabalho. Tarefas sugeridas: Oferecimento do trabalho, oração pela família, prática do silêncio interior.",
  mary: "Foco: Entrega Total (Totus Tuus). Tarefas sugeridas: Terço diário, imitação das virtudes de humildade e pureza da Virgem."
};

export const sendMessageToSpiritualDirector = async (message: string, user?: UserProfile): Promise<string> => {
  try {
    const userContext = user 
      ? `Usuário: ${user.name}. Luta: ${user.spiritualFocus}. Santo: ${user.patronSaint}.` 
      : "Visitante em busca de luz.";

    const systemInstruction = `
      Você é um Diretor Espiritual Católico sábio, paternal e fiel à Igreja.
      RESPONDA SEMPRE EM PORTUGUÊS DO BRASIL.
      Seu tom deve ser acolhedor, mas firme na doutrina.
      Integre conselhos baseados na vida do santo padroeiro do usuário.
      Não use negritos ou asteriscos na resposta.
      Contexto: ${userContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: { systemInstruction },
    });

    return cleanAIOutput(response.text || "Paz e Bem. Como posso ajudar sua alma hoje?");
  } catch (error) {
    return "Um momento de recolhimento técnico. Em breve retornarei com seu direcionamento.";
  }
};

export const generateSpiritualRoutine = async (data: OnboardingData, reviewData?: MonthlyReviewData): Promise<{ routine: RoutineItem[], profileDescription: string }> => {
  const saintSpirituality = SAINT_SPIRITUALITY[data.patronSaint || 'michael'] || "";
  
  const prompt = `
    Aja como um Diretor Espiritual Católico. Crie uma REGRA DE VIDA personalizada para ${data.name}.
    
    PERFIL DO FIEL:
    - Estado: ${data.stateOfLife}
    - Ritmo: ${data.routineType}
    - Luta contra: ${data.primaryStruggle}
    - Objetivo: ${data.spiritualGoal}
    - Santo Guia: ${data.patronSaint} (${saintSpirituality})

    ESTRUTURA TEMÁTICA DA SEMANA:
    - Seg: Almas | Ter: Anjos | Qua: São José | Qui: Eucaristia | Sex: Paixão | Sáb: Maria | Dom: Ressurreição.

    REQUISITOS OBRIGATÓRIOS:
    1. Responda APENAS em PORTUGUÊS DO BRASIL.
    2. Cada dia deve ter uma tarefa inspirada no carisma de ${data.patronSaint}.
    3. Distribua 4-5 tarefas por dia: 'morning', 'afternoon', 'night'.
    4. "profileDescription" deve ser um título místico curto (Ex: "Combatente de Miguel", "Sentinela do Sacrário").

    RETORNE APENAS JSON:
    {
      "profileDescription": "String",
      "routine": [
        { "title": "String", "description": "String", "detailedContent": "String", "xpReward": Number, "icon": "String", "timeOfDay": "String", "dayOfWeek": [Number], "actionLink": "String" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: 'application/json',
          systemInstruction: "Você gera regras de vida católica em formato JSON em Português."
        }
    });

    const json = JSON.parse(response.text || '{}');
    const routine = (json.routine || []).map((item: any) => ({
        ...item,
        id: crypto.randomUUID(),
        completed: false,
        title: cleanAIOutput(item.title),
        description: cleanAIOutput(item.description)
    }));

    return { 
      routine, 
      profileDescription: cleanAIOutput(json.profileDescription || 'Peregrino da Fé') 
    };
  } catch (e) {
    return {
        profileDescription: "Peregrino da Fé",
        routine: [
            { id: 'f1', title: 'Oferecimento do Dia', description: 'Entregar o dia ao Senhor', xpReward: 20, completed: false, icon: 'sun', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' },
            { id: 'f2', title: 'Evangelho do Dia', description: 'Escutar a voz de Cristo', xpReward: 30, completed: false, icon: 'book', timeOfDay: 'morning', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'READ_LITURGY' },
            { id: 'f3', title: 'Exame de Consciência', description: 'Revisar o dia no amor', xpReward: 20, completed: false, icon: 'moon', timeOfDay: 'night', dayOfWeek: [0,1,2,3,4,5,6], actionLink: 'NONE' }
        ]
    };
  }
};

export const generateDailyReflection = async (saint: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma frase curta e humilde em PORTUGUÊS sobre a fé católica. Sem formatação Markdown.`,
    });
    return cleanAIOutput(response.text || "Deus te abençoe.");
  } catch { return "Caminhe na paz de Cristo."; }
};

export const generateDailyTheme = async (gospel?: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Resuma o Evangelho em 5 palavras em PORTUGUÊS: ${gospel || 'Amor de Deus'}`,
    });
    return cleanAIOutput(response.text || "Santidade Diária");
  } catch { return "Santidade Diária"; }
};

export const generateLiturgicalDailyTopic = async (day: number, season: string): Promise<DailyTopic> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Crie um desafio prático católico em PORTUGUÊS para o dia ${day} do tempo de ${season}. Retorne JSON com title, description, scripture, actionType, actionContent.`,
            config: { responseMimeType: 'application/json' }
        });
        const data = JSON.parse(response.text || '{}');
        return {
            day,
            title: cleanAIOutput(data.title),
            description: cleanAIOutput(data.description),
            isCompleted: false,
            isLocked: false,
            actionType: data.actionType || 'GENERIC',
            actionContent: cleanAIOutput(data.actionContent),
            scripture: cleanAIOutput(data.scripture)
        };
    } catch {
        return { day, title: "Ato de Caridade", description: "Faça uma caridade hoje.", isCompleted: false, isLocked: false };
    }
};
