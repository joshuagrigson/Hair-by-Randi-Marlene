// Renders ad.html to frames, then (with ffmpeg) to out/paper-plate-ad-01.mp4,
// plus one still per scene.   node render.js          -> stills + video
//                             node render.js stills   -> stills only
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, SECONDS = 21;
const STILLS = { '0-hook': 2.6, '1-snap': 6.9, '2-share': 11.9, '3-stack': 16.6, '4-end': 20.5,
                 '1a-snap-camera': 4.3, '2a-share-sheet': 9.6 };

(async () => {
  const here = __dirname, out = path.join(here, 'out'), frames = path.join(out, 'frames');
  fs.mkdirSync(frames, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(here, 'ad.html') + '#raw');
  await page.evaluate(() => document.fonts.ready);
  const seek = t => page.evaluate(ms => {
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
  }, t * 1000);

  for (const [name, t] of Object.entries(STILLS)) {
    await seek(t);
    await page.screenshot({ path: path.join(out, `still-${name}.png`) });
  }
  if (process.argv[2] !== 'stills') {
    for (let f = 0; f < FPS * SECONDS; f++) {
      await seek(f / FPS);
      await page.screenshot({ path: path.join(frames, String(f).padStart(4, '0') + '.jpg'), quality: 95 });
    }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'),
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart',
      '-c:a', 'aac', '-b:a', '96k', path.join(out, 'paper-plate-ad-01.mp4')]);
    fs.rmSync(frames, { recursive: true });
  }
  await browser.close();
})();
