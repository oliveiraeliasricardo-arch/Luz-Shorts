# Luz Shorts — Vídeos Curtos Cristãos

Plataforma de vídeos curtos verticais (formato YouTube Shorts) com visual limpo, reprodução automática, compartilhamento direto e curadoria estrita de conteúdo cristão.

## Regras de Filtragem e Doutrina

- **Pregações e Bíblia / Evangelho**: filtrados exclusivamente para conteúdos alinhados à **Doutrina Adventista do Sétimo Dia** (canais oficiais e ministérios adventistas verificados, além de bloqueio de conflitos doutrinários).
- **Louvores e Testemunhos**: abertos a **qualquer denominação cristã**, preservando o filtro contra conteúdo secular ou fora do propósito cristão.

## Recursos

- Feed vertical com rolagem magnética (`scroll-snap`) e reprodução automática via YouTube IFrame Player API.
- Avanço automático para o próximo vídeo ao finalizar (com opção de ativar/desativar).
- Navegação por toque/scroll, setas na tela ou teclado (`↑` / `↓`, `J` / `K`, `M` para silenciar).
- Filtros por categoria (**Todos**, **Pregações**, **Bíblia**, **Louvores**, **Testemunhos**, **Salvos**) e busca por tema, versículo ou canal.
- Compartilhamento com link direto (`/?v=ID_DO_VIDEO`), botão copiar, WhatsApp, Telegram e Web Share API nativa.
- Chave da YouTube Data API v3 (`YOUTUBE_API_KEY`) mantida exclusivamente no backend (`server.ts`).

## Configuração da YouTube API e Execução Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Informe sua chave da **YouTube Data API v3** no `.env`:
   ```env
   YOUTUBE_API_KEY="SUA_CHAVE_AQUI"
   ```
   > **Nota:** Caso `YOUTUBE_API_KEY` ainda não esteja configurada no ambiente, o servidor utiliza automaticamente os feeds oficiais de Shorts dos canais cristãos e adventistas verificados como contingência para o app continuar funcional.

4. Inicie em desenvolvimento:
   ```bash
   npm run dev
   ```

5. Build e produção:
   ```bash
   npm run build
   npm start
   ```

## Publicando no GitHub

```bash
git init
git add .
git commit -m "feat: Luz Shorts app com curadoria cristã e adventista"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/luz-shorts.git
git push -u origin main
```

Ao implantar a partir do GitHub (Render, Railway, Cloud Run, Fly.io, etc.), configure `YOUTUBE_API_KEY` nas variáveis de ambiente/Secrets da plataforma e nunca suba o arquivo `.env` para o repositório.
