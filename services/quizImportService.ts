import { SUPABASE_URL, SUPABASE_KEY, supabase } from './authService';
import type { OnboardingData } from '../types';

/**
 * Unificação Quiz -> App.
 * Lê (read-only) a quiz_session mais recente de um e-mail e devolve a diagnose
 * + o plano de 21 dias + o stripe_session_id (chave durável dos materiais).
 *
 * Dois caminhos de leitura:
 *  - Autenticado (preferido): usa o client Supabase com o JWT do usuário. A RLS
 *    `quiz_select_own_email` só devolve a própria linha. É o caminho da aba
 *    "Meus Materiais".
 *  - Anônimo (fallback): REST com a anon key, para o enriquecimento que pode
 *    ocorrer antes do login. Depende da policy anon ampla (a ser endurecida).
 *
 * 100% aditivo e não-bloqueante: qualquer falha retorna null e o fluxo normal
 * de onboarding/cadastro segue intacto.
 */

export interface QuizImport {
  found: boolean;
  name?: string;
  email: string;
  primaryStruggle?: OnboardingData['primaryStruggle'];
  spiritualGoal?: OnboardingData['spiritualGoal'];
  levelName?: string;
  plan?: any;              // plan_data (jornada de 21 dias)
  quizData?: any;          // quiz_data bruto
  stripeSessionId?: string; // chave para abrir os materiais persistentes
}

// quiz.challenge -> app.primaryStruggle (conjuntos quase idênticos)
const CHALLENGE_TO_STRUGGLE: Record<string, OnboardingData['primaryStruggle']> = {
  anxiety: 'anxiety',
  laziness: 'laziness',
  dryness: 'dryness',
  ignorance: 'ignorance',
  pride: 'pride',
  lust: 'lust',
};

// quiz.goal -> app.spiritualGoal (match exato)
const GOAL_TO_GOAL: Record<string, OnboardingData['spiritualGoal']> = {
  peace: 'peace',
  truth: 'truth',
  discipline: 'discipline',
  love: 'love',
  healing: 'healing',
};

const mapRow = (row: any, email: string): QuizImport | null => {
  if (!row) return null;
  const answers = row.quiz_data?.answers || {};
  return {
    found: true,
    name: row.name || row.quiz_data?.name || undefined,
    email,
    primaryStruggle: CHALLENGE_TO_STRUGGLE[answers.challenge] || undefined,
    spiritualGoal: GOAL_TO_GOAL[answers.goal] || undefined,
    levelName: row.quiz_data?.levelName || undefined,
    plan: row.plan_data || null,
    quizData: row.quiz_data || null,
    stripeSessionId: row.stripe_session_id || undefined,
  };
};

/**
 * Leitura por e-mail — APENAS autenticada (JWT do usuário logado), governada
 * pela RLS `quiz_select_own_email` (só devolve a própria linha). É o caminho da
 * aba "Meus Materiais". Pré-login retorna null (sem leitura anônima da tabela).
 */
export const fetchQuizSessionByEmail = async (rawEmail: string): Promise<QuizImport | null> => {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email || !supabase) return null;

  try {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess?.session) return null; // sem sessão = sem leitura (segurança)

    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('name,email,quiz_data,plan_data,stripe_session_id')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);
    if (error || !Array.isArray(data) || !data[0]) return null;
    return mapRow(data[0], email);
  } catch (_) {
    return null;
  }
};

/**
 * Leitura por stripe_session_id (segredo de posse, do link pós-compra). Usada
 * para alinhar o perfil de quem veio do quiz ANTES do login, via edge function
 * service-role — sem expor a tabela ao papel anônimo.
 */
export const fetchQuizSessionBySession = async (stripeSessionId: string): Promise<QuizImport | null> => {
  const sid = (stripeSessionId || '').trim();
  if (!sid || !SUPABASE_URL) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/get-quiz-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      body: JSON.stringify({ stripe_session_id: sid }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data?.found) return null;
    return mapRow(data, (data.email || '').trim().toLowerCase());
  } catch (_) {
    return null;
  }
};
