
// O SDK do Resend é voltado para ambiente de servidor (Node.js).
// Para evitar erros de "tela branca" no navegador (PWA), usamos a API REST direta via fetch.

const RESEND_API_KEY = 're_GeQaP7ie_DBq2jMNrPhmh1B448WErYigA';

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Espiritualizei <contato@espiritualizei.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar e-mail via Resend API:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado no serviço de e-mail (Fetch):', error);
    return { success: false, error };
  }
};
