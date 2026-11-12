"""Tiny client for Gradio spaces on Hugging Face (the session proxy adds the sign-in).
   python3 hf.py <space-host> <api> <out-file> '<json list of args>'
   An arg written as {"file": "path"} is uploaded first."""
import json, sys, os, subprocess, time

def curl(*a, timeout=600):
    return subprocess.run(['curl', '-sS', '-m', str(timeout), *a], capture_output=True, text=True).stdout

def upload(host, path):
    r = json.loads(curl('-F', f'files=@{path}', f'https://{host}.hf.space/gradio_api/upload'))
    return {'path': r[0], 'meta': {'_type': 'gradio.FileData'}, 'orig_name': os.path.basename(path)}

def call(host, api, args, out):
    args = [upload(host, a['file']) if isinstance(a, dict) and 'file' in a else a for a in args]
    r = curl('-H', 'Content-Type: application/json', '-d', json.dumps({'data': args}),
             f'https://{host}.hf.space/gradio_api/call/{api}')
    eid = json.loads(r)['event_id']
    s = curl('-N', f'https://{host}.hf.space/gradio_api/call/{api}/{eid}', timeout=900)
    ev = None
    for line in s.splitlines():
        if line.startswith('event:'): ev = line[6:].strip()
        elif line.startswith('data:') and ev in ('complete', 'error'):
            if ev == 'error': raise SystemExit(f'{api} error: {line[5:].strip()[:400]}')
            data = json.loads(line[5:])
            f = data[0]
            if isinstance(f, dict) and 'video' in f: f = f['video']
            url = f.get('url') or f'https://{host}.hf.space/gradio_api/file={f["path"]}'
            subprocess.run(['curl', '-sS', '-m', '300', '-o', out, url], check=True)
            print(out, os.path.getsize(out), 'seed', data[1:] )
            return
    raise SystemExit(f'{api}: no result. tail: {s[-400:]}')

if __name__ == '__main__':
    call(sys.argv[1], sys.argv[2], json.loads(sys.argv[4]), sys.argv[3])
