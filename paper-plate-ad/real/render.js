// node render.js [stills]  ->  out/paper-plate-ad-03.mp4 (silent) + out/paper-plate-ad-03-sound.mp4 (the clips' own room sound)
// Each <img class="vid" data-clip data-a data-b data-s data-e> plays seconds s..e of gen/<clip>.mp4 over ad time a..b.
// Frames get a light blur and film grain so every shot shares one texture.
const { chromium } = require('playwright'); const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FPS = 30, SECONDS = 34, out = path.join(__dirname, 'out'), frames = path.join(out, 'frames'), clipDir = path.join(out, 'clips');
const STILLS = { '01-question': 1.2, '02-phone-out': 3.2, '03-tap': 4.6, '04-snap': 6.6, '05-shelf': 7.9, '06-plate': 10.2, '07-second': 13.1,
                 '08-stuck': 13.7, '09-aha': 16.2, '10-relief': 18.4, '11-couch': 20.8, '12-share': 23.8, '13-recipe': 26.1, '14-relax': 29.6, '15-end': 33.5 };
(async () => {
  fs.mkdirSync(frames, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'story.html') + '#raw'); await p.evaluate(() => document.fonts.ready);
  const vids = await p.evaluate(() => [...document.querySelectorAll('.vid')].map(v => ({ clip: v.dataset.clip, a: +v.dataset.a, b: +v.dataset.b, s: +v.dataset.s, e: +v.dataset.e })));
  for (const v of vids) {
    const d = path.join(clipDir, v.clip); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(__dirname, 'gen', v.clip + '.mp4'),
      '-vf', 'fps=30,scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=0.45,noise=alls=7:allf=t', '-q:v', '2', path.join(d, '%04d.jpg')]);
    v.n = fs.readdirSync(d).length;
  }
  const seek = async t => {
    const srcs = vids.map(v => { const k = Math.min(1, Math.max(0, (t - v.a) / (v.b - v.a))); const sec = v.s + k * (v.e - v.s);
      return [v.clip, 'file://' + path.join(clipDir, v.clip, String(Math.min(v.n, 1 + Math.round(sec * 30))).padStart(4, '0') + '.jpg')]; });
    await p.evaluate(async ({ ms, srcs }) => {
      for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
      for (const [clip, src] of srcs) { const i = document.querySelector(`[data-clip=${clip}]`); if (i.src !== src) { i.src = src; await i.decode(); } }
    }, { ms: t * 1000, srcs });
  };
  for (const [n, t] of Object.entries(STILLS)) { await seek(t); await p.screenshot({ path: path.join(out, `still-${n}.jpg`), quality: 88 }); }
  if (process.argv[2] !== 'stills') {
    for (let f = 0; f < FPS * SECONDS; f++) { await seek(f / FPS); await p.screenshot({ path: path.join(frames, String(f).padStart(4, '0') + '.jpg'), quality: 95 }); }
    const enc = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '128k'];
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', ...enc, path.join(out, 'paper-plate-ad-03.mp4')]);
    // same picture with each clip's own sound laid under its shot
    const ins = [], parts = [];
    vids.forEach((v, i) => { ins.push('-i', path.join(__dirname, 'gen', v.clip + '.mp4'));
      parts.push(`[${i + 1}:a]atrim=${v.s}:${v.e},asetpts=PTS-STARTPTS,afade=t=in:d=0.15,afade=t=out:st=${(v.e - v.s - 0.2).toFixed(2)}:d=0.2,adelay=${Math.round(v.a * 1000)}:all=1[a${i}]`); });
    const fc = parts.join(';') + ';' + vids.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${vids.length}:normalize=0,apad=whole_dur=${SECONDS}[a]`;
    try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'paper-plate-ad-03.mp4'), ...ins, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '128k', '-t', String(SECONDS), path.join(out, 'paper-plate-ad-03-sound.mp4')]); }
    catch (e) { console.log('sound mix failed:', String(e.stderr || e).slice(0, 300)); }
  }
  fs.rmSync(frames, { recursive: true, force: true }); fs.rmSync(clipDir, { recursive: true, force: true }); await b.close();
})();
