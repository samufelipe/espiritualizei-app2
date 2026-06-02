
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
        body { margin: 0; padding: 0; background-color: #F8FAFC; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1E293B; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #FFFFFF; border-radius: 24px; padding: 40px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .logo-container { text-align: center; margin-bottom: 32px; }
        .logo { width: 64px; height: 64px; border-radius: 16px; }
        h1 { color: #1E293B; font-size: 26px; font-weight: 800; margin-bottom: 16px; line-height: 1.3; text-align: center; }
        p { font-size: 16px; line-height: 1.7; color: #64748B; margin-bottom: 20px; }
        .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #FFFFFF !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 8px 16px rgba(167, 139, 250, 0.25); }
        .footer { text-align: center; padding-top: 32px; font-size: 12px; color: #94A3B8; }
        .highlight { color: ${BRAND_COLOR}; font-weight: 700; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #E2E8F0, transparent); margin: 28px 0; }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
    <div class="container">
        <div class="card">
            <div class="logo-container">
                <img src="https://www.espiritualizei.com/icon-512.png" alt="Espiritualizei" class="logo">
            </div>
            ${content}
        </div>
        <div class="footer">
            <p style="margin-bottom: 8px;">Enviado com amor pela equipe Espiritualizei</p>
            <p>espiritualizeiapp@gmail.com • <a href="https://www.espiritualizei.com" style="color: #64748B; text-decoration: underline;">espiritualizei.com</a></p>
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
            <a href="https://www.espiritualizei.com" class="button">Iniciar minha Jornada</a>
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
            <a href="https://www.espiritualizei.com" class="button">Ver minhas conquistas</a>
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
            <a href="https://www.espiritualizei.com" class="button">Ver minha rotina de ${seasonName}</a>
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
            <a href="https://www.espiritualizei.com" class="button">Rezar pela Comunidade</a>
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
            <a href="https://www.espiritualizei.com" class="button">Retomar minha Jornada</a>
        </div>
    `;
    return baseTemplate(content, `Sentimos sua falta, ${firstName}. Vamos retomar?`);
};


/**
 * E-MAIL DE INSPIRAÇÃO DIÁRIA
 */
export const getDailyInspirationEmail = (userName: string, title: string, body: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>${title}</h1>
        <p>Bom dia, ${firstName}!</p>
        <div style="background: rgba(167, 139, 250, 0.1); border-radius: 16px; padding: 24px; margin: 24px 0; border-left: 4px solid ${BRAND_COLOR};">
            <p style="font-size: 18px; line-height: 1.8; color: #E2E8F0; margin: 0; font-style: italic;">"${body}"</p>
        </div>
        <p>Que esta palavra ilumine o seu dia e guie seus passos. Lembre-se: cada momento é uma oportunidade de encontro com Deus.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">Começar minha Rotina</a>
        </div>
    `;
    return baseTemplate(content, `${title} - Sua inspiração de hoje no Espiritualizei`);
};

/**
 * E-MAIL DE LEMBRETE DE ROTINA
 */
export const getRoutineReminderEmail = (userName: string, period: 'morning' | 'afternoon' | 'evening') => {
    const firstName = userName.split(' ')[0];
    
    const periodMessages = {
        morning: {
            title: 'Bom Dia! ☀️',
            message: 'Que tal começar o dia com sua rotina espiritual? Alguns minutos de oração pela manhã podem transformar todo o seu dia.',
            cta: 'Iniciar Rotina Matinal'
        },
        afternoon: {
            title: 'Pausa para Deus 🙏',
            message: 'No meio da correria do dia, reserve um momento para renovar suas forças. Uma breve oração pode trazer a paz que você precisa.',
            cta: 'Fazer uma Pausa'
        },
        evening: {
            title: 'Boa Noite 🌙',
            message: 'Antes de descansar, que tal fazer um breve exame de consciência? Agradeça pelas graças do dia e entregue suas preocupações a Deus.',
            cta: 'Encerrar o Dia em Paz'
        }
    };
    
    const { title, message, cta } = periodMessages[period];
    
    const content = `
        <h1>${title}</h1>
        <p>Olá, ${firstName}!</p>
        <p>${message}</p>
        <div class="divider"></div>
        <p style="text-align: center; color: #64748B; font-style: italic;">"Em paz me deito e logo adormeço, pois só tu, Senhor, me fazes repousar seguro." (Sl 4,9)</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">${cta}</a>
        </div>
    `;
    return baseTemplate(content, `${title} - Hora da sua rotina espiritual`);
};

/**
 * E-MAIL DE NOVO DESAFIO COMUNITÁRIO
 */
export const getChallengeEmail = (userName: string, challengeTitle: string, challengeDescription: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Novo Desafio Comunitário! 🔥</h1>
        <p>Olá, ${firstName}! Um novo desafio de 3 dias está disponível para toda a comunidade.</p>
        <div style="background: rgba(167, 139, 250, 0.1); border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid rgba(167, 139, 250, 0.2);">
            <h2 style="color: #FFFFFF; font-size: 20px; margin: 0 0 12px 0;">${challengeTitle}</h2>
            <p style="color: #94A3B8; margin: 0; line-height: 1.6;">${challengeDescription}</p>
        </div>
        <p>Participe junto com seus irmãos e fortaleça sua fé. Ao completar o desafio, você pode compartilhar sua conquista e inspirar outros!</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">Aceitar o Desafio</a>
        </div>
    `;
    return baseTemplate(content, `Novo desafio: ${challengeTitle} - Participe agora!`);
};

/**
 * E-MAIL DE SUBIDA DE NÍVEL
 */
export const getLevelUpEmail = (userName: string, newLevel: number) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Você Subiu de Nível! ⭐</h1>
        <p>Parabéns, ${firstName}! Sua dedicação está dando frutos.</p>
        <div style="text-align: center; margin: 32px 0;">
            <div style="background: linear-gradient(135deg, ${BRAND_COLOR}, #8B5CF6); border-radius: 50%; width: 100px; height: 100px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(167, 139, 250, 0.4);">
                <span style="font-size: 40px; font-weight: 900; color: #FFFFFF;">Lv${newLevel}</span>
            </div>
        </div>
        <p>Cada nível representa sua jornada de crescimento espiritual. Continue firme na oração, nos desafios e na comunidade.</p>
        <p style="color: #64748B; font-style: italic;">O Céu celebra cada pequeno passo que você dá em direção à santidade.</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">Ver meu Progresso</a>
        </div>
    `;
    return baseTemplate(content, `Parabéns! Você alcançou o nível ${newLevel} no Espiritualizei!`);
};

/**
 * E-MAIL DE STREAK (DIAS CONSECUTIVOS)
 */
export const getStreakEmail = (userName: string, streakDays: number) => {
    const firstName = userName.split(' ')[0];
    
    let message = '';
    let emoji = '🔥';
    
    if (streakDays >= 30) {
        message = 'Um mês inteiro de constância! Você é uma inspiração para toda a comunidade.';
        emoji = '🏆';
    } else if (streakDays >= 7) {
        message = 'Uma semana de fidelidade! Sua perseverança está construindo uma base sólida.';
        emoji = '⭐';
    } else {
        message = 'Continue assim! A constância é o segredo dos santos.';
    }
    
    const content = `
        <h1>${streakDays} Dias Consecutivos! ${emoji}</h1>
        <p>Incrível, ${firstName}!</p>
        <div style="text-align: center; margin: 32px 0;">
            <div style="background: rgba(251, 191, 36, 0.1); border-radius: 20px; padding: 24px; display: inline-block; border: 2px solid rgba(251, 191, 36, 0.3);">
                <span style="font-size: 48px;">${emoji}</span>
                <h2 style="margin: 10px 0 0 0; color: #FCD34D; font-size: 32px; font-weight: 900;">${streakDays} dias</h2>
            </div>
        </div>
        <p>${message}</p>
        <div class="divider"></div>
        <p style="color: #64748B; font-style: italic;">"A perseverança produz caráter aprovado, e o caráter aprovado, esperança." (Rm 5,4)</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">Manter minha Sequência</a>
        </div>
    `;
    return baseTemplate(content, `${streakDays} dias consecutivos de oração! Continue firme!`);
};

/**
 * E-MAIL DE SUGESTÃO DE BIBLIOTECA
 */
/**
 * E-MAIL DIÁRIO DO DESAFIO DE 21 DIAS (QUIZ)
 * Enviado a cada dia após a compra, com teaser da intenção e CTA para o dia específico.
 */
export const getQuizDayEmail = (params: {
  name:       string
  dayNumber:  number
  weekNumber: number
  weekTheme:  string
  intention:  string
  challenge:  string
  ctaUrl:     string
}): string => {
  const { name, dayNumber, weekNumber, weekTheme, intention, ctaUrl } = params
  const firstName   = name.split(' ')[0] || name
  const isNovena    = dayNumber <= 9
  const isLastWeek  = weekNumber === 3
  const progressPct = Math.round((dayNumber / 21) * 100)

  const novenaNames: Record<string, string> = {
    anxiety:   'Novena da Paz Interior',
    laziness:  'Novena da Constância',
    dryness:   'Novena do Reencontro',
    ignorance: 'Novena da Luz na Fé',
    pride:     'Novena do Esvaziamento',
    lust:      'Novena da Libertação',
  }
  const novenaName = novenaNames[params.challenge] || 'Novena Personalizada'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Dia ${dayNumber} do seu Desafio | Espiritualizei</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">

<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <!-- Logo -->
  <div style="text-align:center;margin-bottom:36px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,0.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <!-- Card principal -->
  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,0.15);">

    <!-- Saudação -->
    <p style="font-size:14px;color:rgba(255,255,255,0.5);margin:0 0 20px;">Bom dia, ${firstName}.</p>

    <!-- Número do dia -->
    <div style="margin-bottom:20px;">
      <div style="display:inline-block;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.25);border-radius:40px;padding:6px 16px;margin-bottom:12px;">
        <span style="font-size:11px;font-weight:700;color:#A78BFA;letter-spacing:1.5px;text-transform:uppercase;">DIA ${dayNumber} DE 21</span>
      </div>
      <h1 style="font-size:24px;font-weight:800;margin:0 0 4px;line-height:1.2;">
        ${isLastWeek ? 'Reta final da sua jornada.' : `Semana ${weekNumber} do seu desafio.`}
      </h1>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:0;">${weekTheme}</p>
    </div>

    <!-- Barra de progresso -->
    <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:4px;margin-bottom:28px;overflow:hidden;">
      <div style="background:#A78BFA;height:100%;width:${progressPct}%;border-radius:4px;"></div>
    </div>

    ${isNovena ? `
    <!-- Badge Novena -->
    <div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:10px;padding:10px 14px;margin-bottom:24px;display:inline-flex;align-items:center;gap:8px;">
      <span style="font-size:10px;font-weight:800;color:rgba(167,139,250,0.7);letter-spacing:1.5px;text-transform:uppercase;">NOVENA · DIA ${dayNumber} DE 9 · ${novenaName}</span>
    </div>
    ` : ''}

    <!-- Divisor -->
    <div style="height:1px;background:rgba(255,255,255,0.07);margin-bottom:24px;"></div>

    <!-- Intenção do dia -->
    <p style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(167,139,250,0.65);margin:0 0 12px;">INTENÇÃO DO DIA</p>
    <p style="font-size:19px;font-style:italic;font-family:Georgia,'Times New Roman',serif;color:rgba(255,255,255,0.93);line-height:1.7;margin:0 0 32px;border-left:3px solid #A78BFA;padding-left:16px;">
      "${intention}"
    </p>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="${ctaUrl}"
         style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#ffffff;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;letter-spacing:0.3px;">
        Começar o Dia ${dayNumber} &rarr;
      </a>
    </div>

  </div>

  <!-- Rodapé -->
  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0 0 6px;">
      Você recebe este e-mail porque adquiriu o Diagnóstico Espiritual do Espiritualizei.
    </p>
    <p style="font-size:11px;color:rgba(255,255,255,0.2);margin:0;">
      <a href="https://www.espiritualizei.com/quiz/resultado?session=${ctaUrl.split('session=')[1]?.split('&')[0] || ''}" style="color:rgba(167,139,250,0.5);text-decoration:underline;">Ver meu plano completo</a>
      &nbsp;·&nbsp;
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20desafio" style="color:rgba(255,255,255,0.2);text-decoration:underline;">Cancelar e-mails</a>
    </p>
  </div>

</div>
</body>
</html>`
}

/**
 * E-MAILS DE RECUPERAÇÃO DE CARRINHO ABANDONADO (QUIZ)
 * 3 steps: +10min, +24h, +72h após o lead entrar o e-mail sem comprar.
 */

const CHALLENGE_LABELS_RECOVERY: Record<string, string> = {
  anxiety:   'ansiedade e inquietação interior',
  laziness:  'falta de constância na vida espiritual',
  dryness:   'a oração que parece vazia e distante',
  ignorance: 'dúvidas e questionamentos na fé',
  pride:     'orgulho e impaciência interior',
  lust:      'lutas com hábitos e vícios',
}

export const getRecoveryEmail = (params: {
  step:      1 | 2 | 3
  name:      string
  challenge: string
  ctaUrl:    string
}): string => {
  const { step, name, challenge, ctaUrl } = params
  const firstName     = name.split(' ')[0] || name
  const challengeText = CHALLENGE_LABELS_RECOVERY[challenge] || 'sua jornada espiritual'

  const subjects: Record<number, string> = {
    1: `${firstName}, seu diagnóstico espiritual está aqui`,
    2: `${firstName}, você ainda está carregando isso?`,
    3: `${firstName}, uma última coisa antes de você ir...`,
  }

  const contents: Record<number, { headline: string; body: string; cta: string; ps?: string }> = {
    1: {
      headline: 'Seu diagnóstico está esperando por você.',
      body: `Você respondeu 3 perguntas honestas sobre sua vida espiritual e revelou algo importante sobre onde está agora. Seu diagnóstico personalizado e o Plano de 21 Dias criado para o seu momento estão prontos e aguardando.`,
      cta: 'Acessar meu diagnóstico &rarr;',
    },
    2: {
      headline: `Você ainda está carregando ${challengeText}?`,
      body: `${firstName}, esse peso não desaparece sozinho. O Plano de 21 Dias que criamos foi pensado especificamente para o desafio que você revelou — não um plano genérico, mas um caminho feito para o seu momento real. Ele está esperando por você.`,
      cta: 'Ver meu plano personalizado &rarr;',
      ps: `R$19,90 — pagamento único, acesso permanente. Menos de R$1 por dia.`,
    },
    3: {
      headline: 'Uma última coisa antes de você ir.',
      body: `${firstName}, você fez as perguntas certas. Revelou onde está. Existe um caminho de 21 dias esperando por você — com intenção, oração e tarefa para cada dia, criados para o seu desafio específico. Não é uma promessa vaga. É um plano real para um começo real.`,
      cta: 'Quero meu plano de 21 dias &rarr;',
      ps: `Garantia de 7 dias. Se não valer cada centavo, devolvemos tudo.`,
    },
  }

  const c = contents[step]
  const previewText = subjects[step]

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${previewText}</title>
</head>
<body style="margin:0;padding:0;background:#0F1419;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">

  <div style="text-align:center;margin-bottom:36px;">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#A78BFA">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
    <p style="color:rgba(167,139,250,.6);font-size:10px;letter-spacing:2.5px;margin:6px 0 0;text-transform:uppercase;">Espiritualizei</p>
  </div>

  <div style="background:#1A2530;border-radius:20px;padding:32px 28px;border:1px solid rgba(167,139,250,.15);">

    <p style="font-size:14px;color:rgba(255,255,255,.5);margin:0 0 20px;">Olá, ${firstName}.</p>

    <h1 style="font-size:22px;font-weight:800;margin:0 0 20px;line-height:1.25;color:#fff;">
      ${c.headline}
    </h1>

    <div style="height:1px;background:rgba(255,255,255,.07);margin-bottom:20px;"></div>

    <p style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.75;margin:0 0 28px;">
      ${c.body}
    </p>

    ${step === 3 ? `
    <div style="background:rgba(167,139,250,.08);border:1.5px solid rgba(167,139,250,.2);border-radius:14px;padding:16px 18px;margin-bottom:28px;text-align:center;">
      <p style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(167,139,250,.7);margin:0 0 6px;">PAGAMENTO ÚNICO</p>
      <p style="font-size:28px;font-weight:900;color:#fff;margin:0;">R$19,90</p>
      <p style="font-size:12px;color:rgba(255,255,255,.4);margin:4px 0 0;">Acesso permanente. Menos de R$1 por dia.</p>
    </div>` : ''}

    <div style="text-align:center;margin-bottom:${c.ps ? '20px' : '0'};">
      <a href="${ctaUrl}" style="display:inline-block;background:rgba(167,139,250,1);color:#1A2530;text-decoration:none;padding:16px 36px;border-radius:14px;font-weight:800;font-size:16px;">
        ${c.cta}
      </a>
    </div>

    ${c.ps ? `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07);text-align:center;">
      <p style="font-size:12px;color:rgba(255,255,255,.35);margin:0;font-style:italic;">${c.ps}</p>
    </div>` : ''}

  </div>

  <div style="text-align:center;padding-top:28px;">
    <p style="font-size:11px;color:rgba(255,255,255,.2);margin:0 0 6px;">Você recebe este e-mail porque iniciou o Diagnóstico Espiritual do Espiritualizei.</p>
    <p style="font-size:11px;margin:0;">
      <a href="mailto:espiritualizeiapp@gmail.com?subject=Cancelar%20e-mails%20do%20diagn%C3%B3stico" style="color:rgba(255,255,255,.2);text-decoration:underline;">Não quero mais receber</a>
    </p>
  </div>

</div>
</body>
</html>`
}

export const getLibrarySuggestionEmail = (userName: string) => {
    const firstName = userName.split(' ')[0];
    const content = `
        <h1>Hora de Aprofundar sua Fé 📚</h1>
        <p>Olá, ${firstName}!</p>
        <p>A <span class="highlight">Biblioteca da Fé</span> do Espiritualizei está repleta de conteúdos para nutrir sua alma. Que tal dedicar alguns minutos hoje para crescer no conhecimento de Deus?</p>
        <div style="background: rgba(167, 139, 250, 0.1); border-radius: 16px; padding: 24px; margin: 24px 0;">
            <h3 style="color: #FFFFFF; margin: 0 0 16px 0;">Sugestões para você:</h3>
            <ul style="color: #94A3B8; margin: 0; padding-left: 20px; line-height: 2;">
                <li>Vida dos Santos - Histórias que inspiram</li>
                <li>Doutrina Católica - Fundamentos da fé</li>
                <li>Liturgia - Entenda a Missa</li>
                <li>Orações - Aprenda novas formas de rezar</li>
            </ul>
        </div>
        <p style="color: #64748B; font-style: italic;">"Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente." (Tg 1,5)</p>
        <div style="text-align: center; margin-top: 32px;">
            <a href="https://www.espiritualizei.com" class="button">Explorar a Biblioteca</a>
        </div>
    `;
    return baseTemplate(content, `Novos conteúdos na Biblioteca da Fé te esperam!`);
};
