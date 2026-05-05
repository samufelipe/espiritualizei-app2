import { SUPABASE_URL, SUPABASE_KEY } from './authService';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: any }> => {
  if (!SUPABASE_URL) {
    console.warn('Supabase não configurado — email não enviado');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY,
      },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { success: false, error };
  }
};
