"""Run fal.ai jobs through the image relay (Steve's kit). Needs env RELAY_PASS; nothing secret is written to disk.
   python3 relay.py submit <name> <model> '<json body>'   images given as {"file": "path"} become data URIs
   python3 relay.py wait [name ...]                       polls, downloads to gen/<name>.<ext>
   Jobs are remembered in jobs.json so a rerun never pays twice."""
import base64, io, json, os, subprocess, sys, time
from PIL import Image
URL = os.environ.get('IMAGE_RELAY_URL', 'https://jg-image-relay.netlify.app/generate')
PASS = os.environ['RELAY_PASS']
JOBS = 'jobs.json'
jobs = json.load(open(JOBS)) if os.path.exists(JOBS) else {}

def post(payload):
    r = subprocess.run(['curl', '-sS', '-m', '120', '-H', 'Content-Type: application/json', '-H', f'x-relay-pass: {PASS}',
                        '--data-binary', '@-', URL], input=json.dumps(payload), capture_output=True, text=True)
    try: return json.loads(r.stdout)
    except Exception: raise SystemExit(f'relay said: {r.stdout[:400]} {r.stderr[:200]}')

def data_uri(path):
    b = io.BytesIO(); Image.open(path).convert('RGB').save(b, 'JPEG', quality=93)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def inline(v):
    if isinstance(v, dict) and 'file' in v: return data_uri(v['file'])
    if isinstance(v, list): return [inline(x) for x in v]
    return v

if sys.argv[1] == 'submit':
    name, model, body = sys.argv[2], sys.argv[3], json.loads(sys.argv[4])
    if name in jobs: raise SystemExit(f'{name} already submitted; delete it from jobs.json to pay again')
    r = post({'action': 'submit', 'model': model, **{k: inline(v) for k, v in body.items()}})
    if 'status_url' not in r: raise SystemExit(f'{name}: {json.dumps(r)[:500]}')
    jobs[name] = {'model': model, 'status_url': r['status_url'], 'response_url': r['response_url']}
    json.dump(jobs, open(JOBS, 'w'), indent=1); print('submitted', name)
else:
    todo = [n for n in (sys.argv[2:] or jobs) if not jobs[n].get('file')]
    t0 = time.time()
    while todo and time.time() - t0 < 900:
        for n in list(todo):
            s = post({'action': 'poll', 'url': jobs[n]['status_url']})
            st = s.get('status')
            if st == 'COMPLETED':
                r = post({'action': 'poll', 'url': jobs[n]['response_url']})
                item = r.get('video') or (r.get('images') or [None])[0] or r.get('image')
                if not item: print(n, 'no output:', json.dumps(r)[:400]); todo.remove(n); continue
                ext = 'mp4' if 'video' in r else 'jpg'
                out = f'gen/{n}.{ext}'
                subprocess.run(['curl', '-sS', '-m', '300', '-o', out, item['url']], check=True)
                jobs[n]['file'] = out; json.dump(jobs, open(JOBS, 'w'), indent=1)
                print('done', n, os.path.getsize(out)); todo.remove(n)
            elif st not in ('IN_QUEUE', 'IN_PROGRESS'):
                print(n, 'status', json.dumps(s)[:300]); todo.remove(n)
        if todo: time.sleep(8)
    if todo: print('still running:', todo)
