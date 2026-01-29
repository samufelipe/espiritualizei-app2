
import { Resend } from 'resend';

// A chave da API será injetada via variável de ambiente no deploy real
// Para o ambiente de desenvolvimento, usamos a chave fornecida pelo usuário
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY || 're_GeQaP7ie_DBq2jMNrPhmh1B448WErYigA';
const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Espiritualizei <contato@espiritualizei.com>',
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Erro ao enviar e-mail via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro inesperado no serviço de e-mail:', error);
    return { success: false, error };
  }
};

// Função para validar se o domínio está configurado (útil para debug)
export const checkDomainStatus = async (domainId: string) => {
  try {
    const { data, error } = await resend.domains.get(domainId);
    return { data, error };
  } catch (error) {
    return { error };
  }
};
