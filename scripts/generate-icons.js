const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tailles d'icônes requises
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

const inputFile = path.join(__dirname, '..', 'public', 'logo_spa.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Vérifier que le fichier source existe
    if (!fs.existsSync(inputFile)) {
      console.error('❌ Erreur: logo_spa.png non trouvé dans /public');
      console.log('📝 Veuillez placer votre logo dans public/logo_spa.png');
      return;
    }

    console.log('🎨 Génération des icônes en cours...\n');

    // Générer toutes les tailles
    for (const { size, name } of sizes) {
      const outputPath = path.join(outputDir, name);

      await sharp(inputFile)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} (${size}x${size})`);
    }

    // Générer le favicon.ico (multi-tailles)
    const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');
    await sharp(inputFile)
      .resize(32, 32)
      .png()
      .toFile(faviconPath.replace('.ico', '-temp.png'));

    console.log('✅ favicon.ico (32x32)');

    // Copier apple-touch-icon à la racine public aussi
    const appleTouchSrc = path.join(outputDir, 'apple-touch-icon.png');
    const appleTouchDest = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
    fs.copyFileSync(appleTouchSrc, appleTouchDest);
    console.log('✅ apple-touch-icon.png copié à la racine');

    console.log('\n🎉 Toutes les icônes ont été générées avec succès!');
    console.log(`📁 Emplacement: ${outputDir}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error);
  }
}

generateIcons();
