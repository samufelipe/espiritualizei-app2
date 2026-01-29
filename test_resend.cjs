
const { Resend } = require('resend');

const RESEND_API_KEY = 're_GeQaP7ie_DBq2jMNrPhmh1B448WErYigA';
const resend = new Resend(RESEND_API_KEY);

const testSend = async () => {
  console.log("🚀 Iniciando teste de envio real via Resend...");
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Espiritualizei <onboarding@resend.dev>', // Usando o domínio de teste do Resend até o domínio oficial ser validado
      to: ['samucafe01@gmail.com'],
      subject: 'Teste de Integração: Espiritualizei + Resend ✨',
      html: `
        <div style="background-color: #15191E; padding: 40px; font-family: sans-serif; color: #E2E8F0; text-align: center; border-radius: 24px;">
          <h1 style="color: #FFFFFF;">Conexão Estabelecida!</h1>
          <p style="color: #94A3B8;">Samuca, este é um e-mail de teste automático para confirmar que a chave da API do Resend está funcionando perfeitamente no sistema do Espiritualizei.</p>
          <div style="margin: 30px 0; height: 1px; background: linear-gradient(90deg, transparent, #A78BFA, transparent);"></div>
          <p style="font-weight: bold; color: #A78BFA;">Próximo passo: Validar o domínio na Hostinger.</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Erro no Resend:', error);
    } else {
      console.log('✅ E-mail enviado com sucesso! ID:', data.id);
      console.log('Verifique a caixa de entrada de espiritualizeiapp@gmail.com');
    }
  } catch (err) {
    console.error('💥 Erro inesperado:', err);
  }
};

testSend();
