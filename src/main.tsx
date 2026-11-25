import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { loadYouTubeIframeApi } from './utils/youtubePlayerApi';
import './index.css';

loadYouTubeIframeApi().catch(() => {});

registerSW({
  immediate: true,
});

createRoot(document.getElementById('root')!).render(<App />);
