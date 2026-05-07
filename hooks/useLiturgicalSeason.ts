import { useMemo } from 'react';
import { getSeasonDetailedInfo, SeasonInfo } from '../services/liturgyService';

/**
 * Hook que retorna o tempo litúrgico atual calculado deterministicamente.
 * Re-executa apenas quando o dia muda (memoizado pela data atual).
 * Sem DB, sem API, sem cron - pura matemática da Igreja Católica.
 */
export const useLiturgicalSeason = (): SeasonInfo => {
  const today = new Date().toDateString();
  return useMemo(() => getSeasonDetailedInfo(new Date()), [today]);
};