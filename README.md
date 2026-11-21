# Luz Shorts — Vídeos Curtos Cristãos

Plataforma de vídeos curtos verticais (formato YouTube Shorts) com visual limpo, reprodução automática, compartilhamento direto, instalação como **PWA** e empacotamento nativo via **Capacitor (Android / iOS)**.

## Regras de Filtragem e Doutrina

- **Pregações e Bíblia / Evangelho**: filtrados exclusivamente para conteúdos alinhados à **Doutrina Adventista do Sétimo Dia** (canais oficiais e ministérios adventistas verificados, além de bloqueio de conflitos doutrinários).
- **Louvores e Testemunhos**: abertos a **qualquer denominação cristã**, mantendo o filtro contra conteúdo secular ou fora do propósito cristão.

## Recursos

- Feed vertical com rolagem magnética (`scroll-snap`) e reprodução automática via YouTube IFrame Player API.
- Avanço automático para o próximo vídeo ao finalizar (com opção de ativar/desativar).
- Navegação por toque/scroll, setas na tela ou teclado (`↑` / `↓`, `J` / `K`, `M` para silenciar).
- Filtros por categoria (**Todos**, **Pregações**, **Bíblia**, **Louvores**, **Testemunhos**, **Salvos**) e busca por tema, versículo ou canal.
- Compartilhamento com link direto (`/?v=ID_DO_VIDEO`), botão copiar, WhatsApp, Telegram e Web Share API nativa.
- **Aplicativo instalável (PWA)**: Service Worker (`vite-plugin-pwa`), `manifest.webmanifest`, ícones PNG (`192x192`, `512x512`, `maskable`, `apple-touch-icon`), indicador offline e botão **Instalar como App** (Android/Chrome/Desktop e guia iOS Safari).
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

## Transformar em App Nativo Android (APK)

O projeto já inclui `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` e `capacitor.config.ts` (`appId: com.luzshorts.app`, `appName: Luz Shorts`, `webDir: dist`). Não é necessária nenhuma chave do Vite para o build, e o app Android carrega o catálogo curado diretamente via `CapacitorHttp` mesmo sem servidor próprio.

### Baixar o APK pronto pelo GitHub

Ao enviar o código para a branch `main`, o workflow `.github/workflows/ci-build.yml` compila automaticamente o arquivo **`Luz-Shorts.apk`**:

- **Releases (recomendado para celular)**: acesse a aba **Releases** no repositório do GitHub e baixe **`Luz-Shorts.apk`** diretamente (sem `.zip`).
- **Actions**: acesse a aba **Actions**, abra a execução mais recente e baixe o artefato **`Luz-Shorts-APK`**.

### Compilar localmente

```bash
npm run build
npx cap add android
node scripts/prepare_android_assets.mjs
npx cap sync android
npx cap open android
```

## Publicando no GitHub

```bash
git init
git add .
git commit -m "feat: Luz Shorts app Android APK + PWA"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/luz-shorts.git
git push -u origin main
```
