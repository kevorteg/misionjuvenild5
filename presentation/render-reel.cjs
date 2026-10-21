const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

async function main() {
  const htmlPath = path.resolve(__dirname, 'motion-reel.html');
  const outputDir = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'Codex', 'reel-output'));
  fs.mkdirSync(outputDir, { recursive: true });
  const scenesDir = path.join(outputDir, 'reel-scenes');
  fs.mkdirSync(scenesDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(() => { window.requestAnimationFrame = function () { return 0; }; });
  await page.goto(pathToFileURL(htmlPath).href);
  await page.evaluate(async () => Promise.all(Array.from(document.images).map(image => image.decode().catch(() => {}))));
  await page.addStyleTag({ content: '*{animation:none!important;transition:none!important}' });
  const scenes = await page.locator('[data-scene]').count();
  for (let index = 0; index < scenes; index += 1) {
    await page.evaluate(activeIndex => {
      document.querySelectorAll('[data-scene]').forEach((scene, index) => scene.classList.toggle('active', index === activeIndex));
    }, index);
    await page.locator('.stage').screenshot({ path: path.join(scenesDir, `scene-${String(index + 1).padStart(2, '0')}.png`) });
  }
  await context.close();
  await browser.close();

  const outputPath = path.join(outputDir, 'Mision-Juvenil-D5-reel-vertical.mp4');
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  for (let index = 0; index < scenes; index += 1) {
    args.push('-loop', '1', '-framerate', '25', '-t', '10.4', '-i', path.join(scenesDir, `scene-${String(index + 1).padStart(2, '0')}.png`));
  }
  const filters = [];
  for (let index = 0; index < scenes; index += 1) {
    filters.push(`[${index}:v]zoompan=z='min(zoom+0.00019,1.05)':d=260:s=720x1280:fps=25,setsar=1,format=yuv420p[v${index}]`);
  }
  let last = 'v0';
  for (let index = 1; index < scenes; index += 1) {
    const next = `x${index}`;
    filters.push(`[${last}][v${index}]xfade=transition=fade:duration=0.4:offset=${(index * 10).toFixed(1)}[${next}]`);
    last = next;
  }
  args.push('-filter_complex', filters.join(';'), '-map', `[${last}]`, '-t', '60.4', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outputPath);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  process.stdout.write(outputPath + '\n');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
