const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

async function main() {
  const projectDir = __dirname;
  const outputDir = path.join(projectDir, 'capturas_mobile');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('[INFO] Carpeta creada: ' + outputDir);
  }

  // Lo MÁS RELEVANTE para animar: index + podcast + ecosistema
  const priority = [
    'index.html',
    'podcast.html',
    'muro-espiritual.html',
    'quienes-somos.html',
    'salud-mental.html',
    'colegios.html',
    'universidades.html',
    'recursos.html',
    'fuego-d5.html',
    'contacto.html',
    'preguntas-frecuentes.html',
    'faq.html'
  ];

  const files = priority.filter(f => fs.existsSync(path.join(projectDir, f)));

  // Si falta alguna interesante, también la añadimos sin duplicar
  const allHtml = fs.readdirSync(projectDir).filter(f => f.toLowerCase().endsWith('.html'));
  for (const f of allHtml) {
    if (!files.includes(f)) {
      // Añadimos solo las que puedan aportar al recorrido
      if (f.includes('podcast') || f.includes('video') || f.includes('unirme') || f.includes('lanzamiento')) {
        files.push(f);
      }
    }
  }

  if (files.length === 0) {
    console.warn('[AVISO] No se encontraron archivos .html');
    return;
  }

  console.log('[INFO] Archivos a capturar:');
  files.forEach((f, i) => console.log('  ' + (i+1) + '. ' + f));
  console.log('');

  const urls = files.map(f => 'file:///' + path.join(projectDir, f).replace(/\\/g, '/'));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  try {
    for (let i = 0; i < urls.length; i++) {
      const file = files[i];
      console.log('[' + (i+1) + '/' + urls.length + '] Capturando: ' + file);
      await page.goto(urls[i], { waitUntil: 'domcontentloaded', timeout: 90000 });
      // Espera un poco más para carátulas, imágenes y posible reveal
      await page.waitForTimeout(1800);
      const slug = file.replace(/\.html$/i, '').replace(/[^a-zA-Z0-9\-_]+/g, '_').toLowerCase();
      const outPath = path.join(outputDir, slug + '.png');
      await page.screenshot({ path: outPath, fullPage: true, animations: 'disabled' });
      console.log('[OK] ' + slug + '.png');
    }
    console.log('\n[COMPLETADO] Capturas guardadas en: ' + outputDir);
  } catch (e) {
    console.error('[ERROR]', e);
  } finally {
    await browser.close();
  }
}

main();
