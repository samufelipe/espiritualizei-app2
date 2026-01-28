
import { generateWeeklyLibraryContent, saveWeeklyLibraryContent } from '../../services/liturgyService';

export default async function handler(req: any, res: any) {
  // Proteção simples por token (opcional, mas recomendado)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Iniciando geração de conteúdo semanal...');
    const content = await generateWeeklyLibraryContent();
    
    if (!content) {
      return res.status(500).json({ error: 'Falha ao gerar conteúdo com Gemini' });
    }

    const saved = await saveWeeklyLibraryContent(content);
    
    if (!saved) {
      return res.status(500).json({ error: 'Falha ao salvar no banco de dados' });
    }

    return res.status(200).json({ 
      message: 'Biblioteca atualizada com sucesso!',
      title: content.title 
    });
  } catch (error: any) {
    console.error('Erro na automação:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
