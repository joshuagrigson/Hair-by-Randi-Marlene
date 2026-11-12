// node render.js [stills]  ->  out/paper-plate-ad-02.mp4 and one still per shot.
// The clips in gen/v*.mp4 are turned into frames; each <img class="vid" data-clip data-a data-b> shows the
// right frame for the moment, the whole clip stretched over its a..b window.
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SECONDS = 37, out = path.join(__dirname, 'out'), frames = path.join(out, 'frames'), clipDir = path.join(out, 'clips');
const STILLS = { '01-question': 1.5, '02-phone-out': 4.6, '03-tap': 6.2, '04-snap': 8.0, '05-shelf': 10.8, '06-plate': 13.9, '07-second-plate': 18.0,
                 '08-smile': 20.3, '09-couch': 23.5, '10-share': 26.5, '11-recipe': 28.8, '12-relax': 33.0, '13-end': 36.5 };
(async () => {
  fs.mkdirSync(frames, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'story.html') + '#raw'); await p.evaluate(() => document.fonts.ready);
  const vids = await p.evaluate(() => [...document.querySelectorAll('.vid')].map(v => ({ clip: v.dataset.clip, a: +v.dataset.a, b: +v.dataset.b })));
  const count = {};
  for (const v of vids) {
    const d = path.join(clipDir, v.clip); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(__dirname, 'gen', v.clip + '.mp4'), '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-q:v', '2', path.join(d, '%04d.jpg')]);
    count[v.clip] = fs.readdirSync(d).length;
  }
  const seek = async t => {
    const srcs = vids.map(v => { const k = Math.min(1, Math.max(0, (t - v.a) / (v.b - v.a)));
      return [v.clip, 'file://' + path.join(clipDir, v.clip, String(1 + Math.round(k * (count[v.clip] - 1))).padStart(4, '0') + '.jpg')]; });
    await p.evaluate(async ({ ms, srcs }) => {
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
      for (const [clip, src] of srcs) { const i = document.querySelector(`[data-clip=${clip}]`); if (i.src !== src) { i.src = src; await i.decode(); } }
    }, { ms: t * 1000, srcs });
  };
  for (const [n, t] of Object.entries(STILLS)) { await seek(t); await p.screenshot({ path: path.join(out, `still-${n}.jpg`), quality: 88 }); }
  if (process.argv[2] !== 'stills') {
    for (let f = 0; f < FPS * SECONDS; f++) { await seek(f / FPS); await p.screenshot({ path: path.join(frames, String(f).padStart(4, '0') + '.jpg'), quality: 95 }); }
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', path.join(out, 'paper-plate-ad-02.mp4')]);
  }
  fs.rmSync(frames, { recursive: true, force: true }); fs.rmSync(clipDir, { recursive: true, force: true }); await b.close();
})();
