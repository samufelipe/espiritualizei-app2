# Guia de Montagem — VSL Diagnóstico Espiritualizei

Como juntar os clipes (Higgsfield) + a narração (Samuel) + legendas num único `vsl.mp4`.
Ferramenta sugerida: **CapCut** (grátis, mobile ou desktop) ou Premiere/DaVinci.

---

## 1. Linha do tempo (EDL) — clipe × áudio

Coloque a **faixa de áudio** (sua narração) como base. Encaixe cada clipe no timecode do trecho correspondente.

| Clipe | Entra em | Trecho da narração |
|---|---|---|
| Cena 1 | 0:00 | "Antes de você ver o seu diagnóstico..." |
| Cena 2 | 0:12 | "Se você respondeu aquelas três perguntas..." |
| Cena 3 | 0:28 | "...a dor que você sente quando tá sozinho." |
| Cena 4 | 0:40 | "E a fé foi ficando pra depois. Sempre pra depois." |
| Cena 5 | 0:52 | "Semana que vem eu começo de verdade..." |
| Cena 6 | 1:12 | "A sua vida é cheia. Trabalho, família, contas..." |
| Cena 7 | 1:32 | "Já baixou aquele aplicativo. Já comprou o livro." |
| Cena 8 | 1:42 | "Já começou a novena e parou no terceiro dia." |
| Cena 9 | 1:52 | "Mas o que você fez aqui hoje foi diferente." |
| Cena 10 | 2:00 | "...a gente preparou uma coisa que não existe..." |
| Cena 11 | 2:08 | "Ele já tá pronto." |
| Cena 12 | 2:12 | "Toque no botão abaixo..." |

> Os timecodes são guia. Ajuste ao tempo real da sua narração — o áudio manda, o vídeo acompanha.

---

## 2. Legendas — OBRIGATÓRIAS (legenda queimada)

O vídeo **inicia mudo** no funil (autoplay). A maioria assiste sem som até clicar em "Ativar som". Sem legenda, você perde o lead nos primeiros segundos.

- Legenda **queimada** (hardcoded) no vídeo, não arquivo separado.
- CapCut → "Legendas automáticas" → revise os erros → estilo: fonte branca, peso bold, fundo/contorno escuro para leitura.
- Posição: terço inferior, mas **acima** dos ~20% de baixo (onde ficam o botão e a barra de progresso do player).
- Frases curtas, 3–6 palavras por vez, sincronizadas com a fala.

---

## 3. Trilha e clima
- Música instrumental suave e emotiva (piano/ambient), volume **baixo** (-18 a -24 dB) para não competir com a voz.
- Leve "swell" da música na virada (cena 9) reforça a mudança de emoção.
- Fontes livres de royalties: YouTube Audio Library, Pixabay Music.

---

## 4. Export (específico para web)
- Resolução: **1080×1920 (9:16)**
- Codec: **H.264**, MP4
- Frame rate: 24 ou 30 fps
- Bitrate: alvo de arquivo **8–15 MB** (VSL de 2 min comprime bem; web precisa carregar rápido)
- Nome do arquivo: **`vsl.mp4`**

---

## 5. Onde colocar
Salve o arquivo final em:
```
public/quiz/vsl.mp4
```
O player já está apontando para `/quiz/vsl.mp4`. Assim que o arquivo existir, a VSL passa a tocar automaticamente no funil. Enquanto não existir, o funil pula direto para a página de diagnóstico (sem travar).

Depois de colocar o arquivo, faça commit/push — o Vercel publica sozinho.

---

## 6. (Opcional) Poster/thumbnail
Um frame bonito da cena 9 (luz da igreja) salvo como `public/quiz/vsl-poster.jpg` aparece enquanto o vídeo carrega. Adiciono o atributo `poster` no player se você gerar essa imagem.
