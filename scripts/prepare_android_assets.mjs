import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

if (!fs.existsSync(resDir)) {
  console.error('Android res directory not found:', resDir);
  process.exit(1);
}

// Remove adaptive XML so crisp Luz Shorts PNG launcher icons render on all Android versions
const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
if (fs.existsSync(anydpiDir)) {
  fs.rmSync(anydpiDir, { recursive: true, force: true });
}

const icon512 = path.join(rootDir, 'public', 'pwa-512x512.png');
const icon192 = path.join(rootDir, 'public', 'pwa-192x192.png');

const densitySources = [
  ['mipmap-xxxhdpi', icon512],
  ['mipmap-xxhdpi', icon512],
  ['mipmap-xhdpi', icon512],
  ['mipmap-hdpi', icon192],
  ['mipmap-mdpi', icon192],
];

for (const [folder, srcFile] of densitySources) {
  if (!fs.existsSync(srcFile)) continue;
  const targetDir = path.join(resDir, folder);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(srcFile, path.join(targetDir, 'ic_launcher.png'));
  fs.copyFileSync(srcFile, path.join(targetDir, 'ic_launcher_round.png'));
}

console.log('Android launcher icons updated for Luz Shorts.');
