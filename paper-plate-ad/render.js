// Renders ad.html to out/paper-plate-ad-01.mp4 plus one still per scene.
//   node render.js          stills + video
//   node render.js stills   stills only
//
// Screen recordings: put snap / share / stack (.mp4 or .mov) in recordings/.
// A scene with a recording shows it in a phone frame; a scene without one keeps
// its drawn screen. Each clip is sped up or slowed to fill its scene.
// Optional recordings/clips.json trims and zooms, all fields optional:
//   { "snap": { "start": 2, "end": 14, "zoom": 1.3, "y": 0.2 } }
//   start/end = seconds of the clip to use; zoom = magnify; y = 0 top .. 1 bottom of what stays in view
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FPS = 30, SECONDS = 21;
const STILLS = { '0-hook': 2.6, '1-snap': 6.9, '2-share': 11.9, '3-stack': 16.6, '4-end': 20.5,
                 '1a-snap-camera': 4.3, '2a-share-sheet': 9.6 };
// when each scene's recording plays, in ad seconds
const WINDOWS = { snap: [3.25, 7.6], share: [7.95, 12.4], stack: [12.75, 17.5] };

const here = __dirname, out = path.join(here, 'out'), recDir = path.join(here, 'recordings');

function loadClips() {
  const cfgFile = path.join(recDir, 'clips.json');
  const cfg = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8')) : {};
  const clips = {};
  for (const name of Object.keys(WINDOWS)) {
    const file = ['.mp4', '.mov', '.MP4', '.MOV'].map(e => path.join(recDir, name + e)).find(fs.existsSync);
    if (!file) continue;
    const c = cfg[name] || {}, dir = path.join(out, 'rec', name);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    const args = ['-y', '-loglevel', 'error'];
    if (c.start != null) args.push('-ss', String(c.start));
    if (c.end != null) args.push('-to', String(c.end));
    args.push('-i', file, '-vf', 'fps=30,scale=976:-2', '-q:v', '3', path.join(dir, '%05d.jpg'));
    execFileSync('ffmpeg', args);
    const n = fs.readdirSync(dir).length;
    if (!n) throw new Error('no frames came out of ' + file);
    clips[name] = { dir, n, zoom: c.zoom || 1, y: c.y || 0 };
    console.log(`${name}: ${path.basename(file)}, ${(n / 30).toFixed(1)} s used, plays at ${(n / 30 / (WINDOWS[name][1] - WINDOWS[name][0])).toFixed(1)}x`);
  }
  return clips;
}

(async () => {
  const frames = path.join(out, 'frames');
  fs.mkdirSync(frames, { recursive: true });
  const clips = loadClips();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(here, 'ad.html') + '#raw');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(clips => {
    for (const [name, c] of Object.entries(clips)) {
      const img = document.querySelector(`[data-rec=${name}]`);
      img.closest('.scene').classList.add('rec');
      img.style.objectPosition = `50% ${c.y * 100}%`;
      img.style.transformOrigin = `50% ${c.y * 100}%`;
      img.style.transform = `scale(${c.zoom})`;
    }
  }, clips);

  const seek = async t => {
    const srcs = {};
    for (const [name, c] of Object.entries(clips)) {
      const [a, b] = WINDOWS[name];
      const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
      srcs[name] = 'file://' + path.join(c.dir, String(1 + Math.round(k * (c.n - 1))).padStart(5, '0') + '.jpg');
    }
    await page.evaluate(async ({ ms, srcs }) => {
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
      for (const [name, src] of Object.entries(srcs)) {
        const img = document.querySelector(`[data-rec=${name}]`);
        if (img.src !== src) { img.src = src; await img.decode(); }
      }
    }, { ms: t * 1000, srcs });
  };

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
  }
  fs.rmSync(frames, { recursive: true, force: true });
  fs.rmSync(path.join(out, 'rec'), { recursive: true, force: true });
  await browser.close();
})();
