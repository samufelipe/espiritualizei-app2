/**
 * Serviço de Desafios Comunitários
 * 
 * Gerencia desafios práticos e específicos da comunidade
 * com lógica de 3 dias e persistência no banco de dados
 */

import { supabase } from './supabaseClient';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  detailedAction: string;
  category: 'prayer' | 'charity' | 'study' | 'fasting' | 'service';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  startDate: Date;
  endDate: Date;
  participants: number;
  status: 'active' | 'completed' | 'upcoming';
  isUserParticipating: boolean;
}

/**
 * Lista de desafios específicos e práticos
 */
const SPECIFIC_CHALLENGES: Omit<Challenge, 'id' | 'startDate' | 'endDate' | 'participants' | 'status' | 'isUserParticipating'>[] = [
  {
    title: 'Rosário em Família',
    description: 'Reúna sua família para rezar um terço completo juntos',
    detailedAction: 'Escolha um horário do dia (manhã, tarde ou noite) e convide sua família para rezar o terço. Se morar sozinho(a), convide amigos ou reze online com a comunidade.',
    category: 'prayer',
    difficulty: 'easy',
    xpReward: 50
  },
  {
    title: 'Jejum de Redes Sociais',
    description: 'Passe 24 horas sem acessar redes sociais e dedique esse tempo à oração',
    detailedAction: 'Desinstale temporariamente os apps de redes sociais do seu celular. Use o tempo livre para ler a Bíblia, rezar ou meditar.',
    category: 'fasting',
    difficulty: 'medium',
    xpReward: 75
  },
  {
    title: 'Visita ao Santíssimo',
    description: 'Visite uma igreja e passe 30 minutos em adoração ao Santíssimo',
    detailedAction: 'Encontre uma igreja próxima que tenha adoração ao Santíssimo. Leve um caderno para anotar suas reflexões e orações.',
    category: 'prayer',
    difficulty: 'easy',
    xpReward: 60
  },
  {
    title: 'Ato de Caridade',
    description: 'Doe alimentos ou roupas para uma instituição de caridade',
    detailedAction: 'Separe itens em bom estado que você não usa mais. Pesquise instituições próximas (asilos, orfanatos, casas de apoio) e faça a doação pessoalmente.',
    category: 'charity',
    difficulty: 'medium',
    xpReward: 80
  },
  {
    title: 'Leitura Bíblica Diária',
    description: 'Leia e medite sobre um capítulo da Bíblia por 3 dias seguidos',
    detailedAction: 'Escolha um livro da Bíblia (sugestão: Evangelho de João). Leia um capítulo por dia, anote insights e compartilhe no feed da comunidade.',
    category: 'study',
    difficulty: 'easy',
    xpReward: 45
  },
  {
    title: 'Serviço Voluntário',
    description: 'Dedique 2 horas do seu tempo para servir em uma obra social',
    detailedAction: 'Entre em contato com paróquias, ONGs ou projetos sociais da sua cidade. Ofereça-se para ajudar em atividades práticas.',
    category: 'service',
    difficulty: 'hard',
    xpReward: 100
  },
  {
    title: 'Perdão e Reconciliação',
    description: 'Entre em contato com alguém que você precisa perdoar ou pedir perdão',
    detailedAction: 'Reflita sobre relacionamentos que precisam de cura. Envie uma mensagem sincera ou, se possível, converse pessoalmente.',
    category: 'charity',
    difficulty: 'hard',
    xpReward: 90
  },
  {
    title: 'Estudo do Catecismo',
    description: 'Estude 3 parágrafos do Catecismo da Igreja Católica por dia',
    detailedAction: 'Acesse o Catecismo online ou em livro. Escolha um tema (ex: Os Dez Mandamentos) e estude com atenção, fazendo anotações.',
    category: 'study',
    difficulty: 'medium',
    xpReward: 70
  },
  {
    title: 'Oração pela Paz',
    description: 'Reze pela paz no mundo durante 15 minutos por 3 dias',
    detailedAction: 'Escolha um horário fixo. Reze pela paz em países em conflito, por líderes mundiais e pela conversão dos corações.',
    category: 'prayer',
    difficulty: 'easy',
    xpReward: 40
  },
  {
    title: 'Gratidão Diária',
    description: 'Liste 10 motivos de gratidão a Deus todos os dias',
    detailedAction: 'Ao acordar ou antes de dormir, escreva 10 bênçãos que recebeu. Compartilhe algumas no feed da comunidade para inspirar outros.',
    category: 'prayer',
    difficulty: 'easy',
    xpReward: 35
  }
];

/**
 * Obtém o desafio ativo atual (lógica de 3 dias)
 */
export const getCurrentChallenge = async (userId: string): Promise<Challenge | null> => {
  if (!supabase) return null;
  
  try {
    // Buscar desafio ativo no banco
    const { data: activeChallenge, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar desafio:', error);
      return null;
    }
    
    // Se não há desafio ativo ou o desafio expirou, criar novo
    if (!activeChallenge || new Date(activeChallenge.end_date) < new Date()) {
      return await createNewChallenge();
    }
    
    // Verificar se usuário está participando
    const { data: participation } = await supabase
      .from('challenge_participants')
      .select('*')
      .eq('challenge_id', activeChallenge.id)
      .eq('user_id', userId)
      .single();
    
    // Contar participantes
    const { count } = await supabase
      .from('challenge_participants')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', activeChallenge.id);
    
    return {
      id: activeChallenge.id,
      title: activeChallenge.title,
      description: activeChallenge.description,
      detailedAction: activeChallenge.detailed_action,
      category: activeChallenge.category,
      difficulty: activeChallenge.difficulty,
      xpReward: activeChallenge.xp_reward,
      startDate: new Date(activeChallenge.start_date),
      endDate: new Date(activeChallenge.end_date),
      participants: count || 0,
      status: 'active',
      isUserParticipating: !!participation
    };
  } catch (error) {
    console.error('Erro ao obter desafio atual:', error);
    return null;
  }
};

/**
 * Cria um novo desafio (a cada 3 dias)
 */
const createNewChallenge = async (): Promise<Challenge | null> => {
  if (!supabase) return null;
  
  try {
    // Escolher desafio aleatório da lista
    const randomChallenge = SPECIFIC_CHALLENGES[Math.floor(Math.random() * SPECIFIC_CHALLENGES.length)];
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // 3 dias de duração
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('community_challenges')
      .insert({
        title: randomChallenge.title,
        description: randomChallenge.description,
        detailed_action: randomChallenge.detailedAction,
        category: randomChallenge.category,
        difficulty: randomChallenge.difficulty,
        xp_reward: randomChallenge.xpReward,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar desafio:', error);
      return null;
    }
    
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      detailedAction: data.detailed_action,
      category: data.category,
      difficulty: data.difficulty,
      xpReward: data.xp_reward,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      participants: 0,
      status: 'active',
      isUserParticipating: false
    };
  } catch (error) {
    console.error('Erro ao criar novo desafio:', error);
    return null;
  }
};

/**
 * Usuário participa do desafio
 */
export const joinChallenge = async (challengeId: string, userId: string): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        joined_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Erro ao participar do desafio:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao participar do desafio:', error);
    return false;
  }
};

/**
 * Usuário completa o desafio
 */
export const completeChallenge = async (challengeId: string, userId: string): Promise<{ success: boolean; xpEarned: number }> => {
  if (!supabase) return { success: false, xpEarned: 0 };
  
  try {
    // Buscar desafio
    const { data: challenge } = await supabase
      .from('community_challenges')
      .select('xp_reward')
      .eq('id', challengeId)
      .single();
    
    if (!challenge) return { success: false, xpEarned: 0 };
    
    // Atualizar participação
    const { error } = await supabase
      .from('challenge_participants')
      .update({
        completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erro ao completar desafio:', error);
      return { success: false, xpEarned: 0 };
    }
    
    // Adicionar XP ao usuário
    const { error: xpError } = await supabase.rpc('add_xp', {
      user_id: userId,
      xp_amount: challenge.xp_reward
    });
    
    if (xpError) {
      console.error('Erro ao adicionar XP:', xpError);
    }
    
    return { success: true, xpEarned: challenge.xp_reward };
  } catch (error) {
    console.error('Erro ao completar desafio:', error);
    return { success: false, xpEarned: 0 };
  }
};
