// node render.js [stills]  ->  out/paper-plate-ad-02-storyboard.mp4 and one still per shot
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SECONDS = 24, out = path.join(__dirname, 'out'), frames = path.join(out, 'frames');
const STILLS = { '1-question': 2.2, '2-tap': 4.3, '3-snap': 6.2, '4a-shelf': 8.2, '4b-plate': 10.6, '5-smile': 12.6, '6-couch': 15.4, '7a-share': 18, '7b-recipe': 20.2, '8-end': 23.5 };
(async () => {
  fs.mkdirSync(frames, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'story.html') + '#raw'); await p.evaluate(() => document.fonts.ready);
  const seek = t => p.evaluate(ms => { for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; } }, t * 1000);
  for (const [n, t] of Object.entries(STILLS)) { await seek(t); await p.screenshot({ path: path.join(out, `still-${n}.jpg`), quality: 88 }); }
  if (process.argv[2] !== 'stills') {
    for (let f = 0; f < FPS * SECONDS; f++) { await seek(f / FPS); await p.screenshot({ path: path.join(frames, String(f).padStart(4, '0') + '.jpg'), quality: 95 }); }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', path.join(out, 'paper-plate-ad-02-storyboard.mp4')]);
  }
  fs.rmSync(frames, { recursive: true, force: true }); await b.close();
})();
