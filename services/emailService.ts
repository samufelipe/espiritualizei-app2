/**
 * EMAIL SERVICE
 * Gerencia envio de e-mails diários e notificações via Resend
 */

import { Resend } from 'resend';

// Inicializa Resend com a chave de API
const resend = new Resend(process.env.RESEND_API_KEY || '');

const FROM_EMAIL = 'Espiritualizei <contato@espiritualizei.com>';
const REPLY_TO = 'espiritualizeiapp@gmail.com';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Gera template de e-mail diário com inspiração
 */
export function generateDailyInspirationEmail(userName: string, liturgyData?: any): EmailTemplate {
  const inspirations = [
    {
      title: "Confiai no Senhor",
      verse: "Confiai no Senhor de todo o coração e não vos apoieis na vossa própria inteligência.",
      reference: "Provérbios 3,5",
      reflection: "Hoje, entregue suas preocupações a Deus. Ele conhece o caminho que você deve seguir."
    },
    {
      title: "O Senhor é meu pastor",
      verse: "O Senhor é meu pastor, nada me faltará.",
      reference: "Salmo 23,1",
      reflection: "Você não está sozinho. O Bom Pastor guia seus passos e cuida de você com amor infinito."
    },
    {
      title: "Buscai primeiro o Reino",
      verse: "Buscai primeiro o Reino de Deus e a sua justiça, e todas as coisas vos serão dadas por acréscimo.",
      reference: "Mateus 6,33",
      reflection: "Priorize Deus em sua vida hoje. Quando Ele está em primeiro lugar, tudo o mais encontra seu devido lugar."
    },
    {
      title: "Eu sou a luz do mundo",
      verse: "Eu sou a luz do mundo. Quem me segue não andará nas trevas, mas terá a luz da vida.",
      reference: "João 8,12",
      reflection: "Cristo é a luz que ilumina seu caminho. Siga-O e você nunca se perderá."
    },
    {
      title: "Tudo posso",
      verse: "Tudo posso naquele que me fortalece.",
      reference: "Filipenses 4,13",
      reflection: "Os desafios de hoje não são maiores que a força que Deus te dá. Confie e avance."
    }
  ];

  const today = new Date().getDate();
  const inspiration = inspirations[today % inspirations.length];

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${inspiration.title} - Espiritualizei</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Container Principal -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header com Gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 40px 30px; text-align: center;">
              <img src="https://www.espiritualizei.com/icon-192.png" alt="Espiritualizei" style="width: 64px; height: 64px; margin-bottom: 16px;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 8px 0; line-height: 1.2;">
                ${inspiration.title}
              </h1>
              <p style="color: #E9D5FF; font-size: 14px; margin: 0;">
                Inspiração diária do Espiritualizei
              </p>
            </td>
          </tr>

          <!-- Saudação -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                Olá, ${userName}! 🙏
              </p>
              <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">
                Que a paz de Cristo esteja com você neste novo dia!
              </p>
            </td>
          </tr>

          <!-- Versículo do Dia -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%); border-left: 4px solid #8B5CF6; border-radius: 8px; padding: 24px; margin: 0;">
                <p style="color: #6B21A8; font-size: 18px; font-weight: 600; line-height: 1.6; margin: 0 0 12px 0; font-style: italic;">
                  "${inspiration.verse}"
                </p>
                <p style="color: #7C3AED; font-size: 14px; font-weight: 500; margin: 0;">
                  — ${inspiration.reference}
                </p>
              </div>
            </td>
          </tr>

          <!-- Reflexão -->
          <tr>
            <td style="padding: 24px 30px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
                Reflexão para Hoje
              </h2>
              <p style="color: #4B5563; font-size: 15px; line-height: 1.7; margin: 0;">
                ${inspiration.reflection}
              </p>
            </td>
          </tr>

          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="https://www.espiritualizei.com" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);">
                      Acessar Minha Rotina
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 30px;">
              <div style="border-top: 1px solid #E5E7EB; margin: 20px 0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 30px 30px; text-align: center;">
              <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                Você está recebendo este e-mail porque é membro da comunidade Espiritualizei.
              </p>
              <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6; margin: 0;">
                <a href="https://www.espiritualizei.com" style="color: #8B5CF6; text-decoration: none;">Gerenciar preferências</a> • 
                <a href="mailto:${REPLY_TO}" style="color: #8B5CF6; text-decoration: none;">Falar conosco</a>
              </p>
              <p style="color: #D1D5DB; font-size: 12px; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} Espiritualizei. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
${inspiration.title}

Olá, ${userName}!

Que a paz de Cristo esteja com você neste novo dia!

VERSÍCULO DO DIA:
"${inspiration.verse}"
— ${inspiration.reference}

REFLEXÃO:
${inspiration.reflection}

Acesse sua rotina espiritual: https://www.espiritualizei.com

---
Você está recebendo este e-mail porque é membro da comunidade Espiritualizei.
Gerenciar preferências: https://www.espiritualizei.com
Falar conosco: ${REPLY_TO}

© ${new Date().getFullYear()} Espiritualizei. Todos os direitos reservados.
  `;

  return {
    subject: `${inspiration.title} - Inspiração do Dia`,
    html,
    text
  };
}

/**
 * Envia e-mail diário para um usuário
 */
export async function sendDailyEmail(
  userEmail: string,
  userName: string,
  liturgyData?: any
): Promise<boolean> {
  try {
    const template = generateDailyInspirationEmail(userName, liturgyData);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      replyTo: REPLY_TO,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }

    console.log('✅ E-mail enviado:', data);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

/**
 * Envia e-mails diários para múltiplos usuários
 */
export async function sendBulkDailyEmails(
  users: Array<{ email: string; name: string }>,
  liturgyData?: any
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const user of users) {
    const sent = await sendDailyEmail(user.email, user.name, liturgyData);
    if (sent) {
      success++;
    } else {
      failed++;
    }
    
    // Delay de 100ms entre e-mails para não sobrecarregar
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`📧 E-mails enviados: ${success} sucesso, ${failed} falhas`);
  return { success, failed };
}
