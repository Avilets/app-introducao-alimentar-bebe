import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

const logoPath = 'C:/Users/mathe/.gemini/antigravity/brain/ca79267c-0486-4a0a-9124-618cfe11f0f7/media__1780707585243.jpg';
const projectDir = '.';

async function main() {
  console.log('Iniciando processamento do logotipo com API Jimp...');
  
  // Carrega a imagem original
  const image = await Jimp.read(logoPath);
  
  // Definições de destinos e tamanhos
  const targets = [
    // Web / PWA
    { path: 'public/favicon.png', width: 512, height: 512 },
    { path: 'public/apple-touch-icon.png', width: 180, height: 180 },
    { path: 'public/icon-192.png', width: 192, height: 192 },
    { path: 'public/icon-512.png', width: 512, height: 512 },
    
    // Android Launcher Icons (mipmap)
    { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png', width: 48, height: 48 },
    { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png', width: 48, height: 48 },
    { path: 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png', width: 48, height: 48 },
    
    { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png', width: 72, height: 72 },
    { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png', width: 72, height: 72 },
    { path: 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png', width: 72, height: 72 },
    
    { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png', width: 96, height: 96 },
    { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png', width: 96, height: 96 },
    { path: 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png', width: 96, height: 96 },
    
    { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png', width: 144, height: 144 },
    { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png', width: 144, height: 144 },
    { path: 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png', width: 144, height: 144 },
    
    { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', width: 192, height: 192 },
    { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png', width: 192, height: 192 },
    { path: 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png', width: 192, height: 192 }
  ];

  for (const target of targets) {
    const destPath = path.join(projectDir, target.path);
    const dir = path.dirname(destPath);
    
    // Garante que o diretório de destino existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Clona a imagem original e redimensiona usando w e h
    const resizedImage = image.clone().resize({ w: target.width, h: target.height });
    
    // Salva a imagem
    await resizedImage.write(destPath);
    console.log(`Ícone gerado: ${target.path} (${target.width}x${target.height})`);
  }
  
  console.log('Todos os ícones foram gerados com sucesso!');
}

main().catch(err => {
  console.error('Erro ao processar as imagens:', err);
  process.exit(1);
});
