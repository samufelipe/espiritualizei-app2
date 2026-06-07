import { SUPABASE_URL, SUPABASE_KEY } from './authService';
import type { OnboardingData } from '../types';

/**
 * Unificação Quiz -> App.
 * Lê (read-only) a quiz_session mais recente de um e-mail e devolve a diagnose
 * + o plano de 21 dias, para o app reconhecer quem veio do quiz e alinhar a
 * jornada (sem refazer o diagnóstico do zero).
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
  plan?: any;        // plan_data (jornada de 21 dias) para futura tela nativa
  quizData?: any;    // quiz_data bruto
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

export const fetchQuizSessionByEmail = async (rawEmail: string): Promise<QuizImport | null> => {
  const email = (rawEmail || '').trim().toLowerCase();
  if (!email || !SUPABASE_URL) return null;

  try {
    const url = `${SUPABASE_URL}/rest/v1/quiz_sessions`
      + `?email=eq.${encodeURIComponent(email)}`
      + `&select=name,email,quiz_data,plan_data`
      + `&order=created_at.desc&limit=1`;

    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;

    const rows = await res.json().catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : null;
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
    };
  } catch (_) {
    return null; // nunca bloqueia o cadastro
  }
};
