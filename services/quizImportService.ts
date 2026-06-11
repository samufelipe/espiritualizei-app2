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

export const fetchQuizSessionByEmail = async (rawEmail: string): Promise<QuizImport | null> => {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email || !SUPABASE_URL) return null;

  const SELECT = 'name,email,quiz_data,plan_data,stripe_session_id';

  // Caminho autenticado (aba Meus Materiais): usa o JWT do usuário logado.
  try {
    if (supabase) {
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session) {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select(SELECT)
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && Array.isArray(data) && data[0]) {
          return mapRow(data[0], email);
        }
        // Sem erro mas sem linha: cai para o fallback abaixo (caso o e-mail do
        // perfil difira do e-mail da compra, o anon ainda pode achar).
      }
    }
  } catch (_) { /* tenta o fallback anônimo */ }

  // Fallback anônimo (enriquecimento pré-login)
  try {
    const url = `${SUPABASE_URL}/rest/v1/quiz_sessions`
      + `?email=eq.${encodeURIComponent(email)}`
      + `&select=${encodeURIComponent(SELECT)}`
      + `&order=created_at.desc&limit=1`;

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;

    const rows = await res.json().catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : null;
    return mapRow(row, email);
  } catch (_) {
    return null; // nunca bloqueia o cadastro
  }
};
