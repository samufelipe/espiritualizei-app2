
/**
 * ESPIRITUALIZEI - TEMPLATES DE E-MAIL DE ELITE
 * Design: Estética de Luz (Dark Mode, Lilás, Dourado)
 */

const BRAND_COLOR = '#A78BFA'; // Lilás principal
const DARK_BG = '#15191E';     // Fundo escuro do app
const TEXT_COLOR = '#E2E8F0';  // Texto claro

const baseTemplate = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espiritualizei</title>
    <style>
        body { margin: 0; padding: 0; background-color: ${DARK_BG}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: ${TEXT_COLOR}; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; padding-bottom: 40px; }
        .card { background-color: #1E252B; border-radius: 24px; padding: 40px; border: 1px solid rgba(167, 139, 250, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .logo { width: 80px; height: 80px; margin-bottom: 20px; }
        h1 { color: #FFFFFF; font-size: 28px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
        p { font-size: 16px; line-height: 1.6; color: #94A3B8; margin-bottom: 24px; }
        .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #FFFFFF !important; padding: 16px 32px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(167, 139, 250, 0.3); transition: transform 0.2s; }
        .footer { text-align: center; padding-top: 40px; font-size: 12px; color: #475569; }
        .highlight { color: ${BRAND_COLOR}; font-weight: 700; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.2), transparent); margin: 32px 0; }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    <div class="container">
        <div class="header">
            <img src="https://www.espiritualizei.com/logo-email.png" alt="Espiritualizei" class="logo">
        </div>
        <div class="card">
            ${content}
        </div>
        <div class="footer">
            <p style="margin-bottom: 8px;">Enviado com amor pela equipe Espiritualizei</p>
            <p>espiritualizeiapp@gmail.com • <a href="https://www.espiritualizei.com" style="color: #64748B; text-decoration: underline;">espiritualizei.com</a></p>
            <div style="margin-top: 20px;">
                <a href="#" style="color: #475569; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const getWelcomeEmail = (userName: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Bem-vindo à sua nova jornada, ${firstName}!</h1>
        <p>É uma alegria imensa ter você conosco. O Espiritualizei nasceu para ser o seu santuário digital, um lugar onde a tecnologia serve à sua alma.</p>
        <p>Sua jornada personalizada já foi preparada com base no seu perfil. Agora, o próximo passo é a <span class="highlight">constância</span>.</p>
        <div class="divider"></div>
        <p style="font-style: italic; color: #64748B;">"A santidade consiste em fazer a vontade de Deus com alegria, nas pequenas coisas de cada dia."</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://app.espiritualizei.com" class="button">Iniciar minha Jornada</a>
        </div>
    `;
    return baseTemplate(content, `Sua jornada espiritual começa agora, ${firstName}.`);
};

export const getAchievementEmail = (userName: string, achievement: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Sua alma está florescendo!</h1>
        <p>Parabéns, ${firstName}! Você acaba de conquistar o selo de <span class="highlight">${achievement}</span>.</p>
        <p>Cada oração feita e cada desafio concluído é um passo real em direção a uma vida mais plena e centrada em Deus. Sua constância é uma inspiração para toda a nossa comunidade.</p>
        <div style="text-align: center; margin: 32px 0;">
            <div style="background: rgba(167, 139, 250, 0.1); border-radius: 20px; padding: 20px; display: inline-block; border: 1px dashed ${BRAND_COLOR};">
                <span style="font-size: 40px;">✨</span>
                <h2 style="margin: 10px 0 0 0; color: #FFFFFF; font-size: 18px;">${achievement}</h2>
            </div>
        </div>
        <p>Continue firme. O Céu celebra cada pequeno sim que você dá hoje.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://app.espiritualizei.com" class="button">Ver minhas conquistas</a>
        </div>
    `;
    return baseTemplate(content, `Parabéns pela sua nova conquista no Espiritualizei!`);
};

export const getLiturgyEmail = (userName: string, seasonName: string, seasonColor: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Um novo tempo começou: ${seasonName}</h1>
        <p>Olá, ${firstName}. A Igreja inicia hoje um novo ciclo de graça, e o Espiritualizei já se adaptou para caminhar com você.</p>
        <p>O tempo de <span style="color: ${seasonColor}; font-weight: 800;">${seasonName}</span> é um convite para mergulhar mais fundo no mistério de Cristo. Sua rotina e seus desafios agora refletem a essência deste tempo sagrado.</p>
        <div class="divider"></div>
        <p>Preparamos conteúdos exclusivos na sua <span class="highlight">Biblioteca da Fé</span> para ajudar você a viver este período com intensidade e propósito.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://app.espiritualizei.com" class="button">Ver minha rotina de ${seasonName}</a>
        </div>
    `;
    return baseTemplate(content, `A Igreja inicia o tempo de ${seasonName}. Veja o que mudou no seu app.`);
};

export const getIntercessionEmail = (userName: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Alguém acendeu uma vela por você!</h1>
        <p>Olá, ${firstName}. Temos uma notícia emocionante: um irmão da nossa comunidade acaba de interceder pela sua intenção.</p>
        <p>No Espiritualizei, acreditamos que <span class="highlight">ninguém caminha sozinho</span>. Enquanto você cuida da sua alma, outros estão cuidando de você através da oração silenciosa.</p>
        <div style="text-align: center; margin: 32px 0;">
            <span style="font-size: 48px; filter: drop-shadow(0 0 10px ${BRAND_COLOR});">🕯️</span>
        </div>
        <p>Que tal retribuir esse gesto? Entre no Mural agora e veja quem também precisa de uma prece hoje.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://app.espiritualizei.com" class="button">Rezar pela Comunidade</a>
        </div>
    `;
    return baseTemplate(content, `Você recebeu uma intercessão! A comunidade está rezando por você.`);
};

export const getInactivityEmail = (userName: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>O silêncio também é oração...</h1>
        <p>Olá, ${firstName}. Sentimos sua falta nos últimos dias.</p>
        <p>Sabemos que a vida pode ser agitada e, às vezes, o cansaço tenta nos afastar do essencial. Mas lembre-se: o Espiritualizei não é mais uma tarefa na sua lista, é o seu <span class="highlight">respiro</span>.</p>
        <p>Não se preocupe com o tempo perdido. O importante é o agora. Que tal retomar sua jornada hoje com apenas 5 minutos de silêncio?</p>
        <div class="divider"></div>
        <p style="text-align: center; color: #64748B;">"Não é o muito saber que sacia a alma, mas o sentir e o gostar das coisas internamente."</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://app.espiritualizei.com" class="button">Retomar minha Jornada</a>
        </div>
    `;
    return baseTemplate(content, `Sentimos sua falta, ${firstName}. Vamos retomar?`);
};
