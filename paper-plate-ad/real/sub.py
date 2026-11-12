import json,subprocess,sys
E='google/nano-banana-2.1/edit'
KEEP=" Same candid phone-snapshot look: 24mm phone lens, everything in focus, neutral true-to-life colour, slight noise, natural unretouched skin."
def edit(name,src,prompt,seed=7):
    srcs=src if isinstance(src,list) else [src]
    body={'prompt':prompt+KEEP,'image_urls':[{'file':s} for s in srcs],'aspect_ratio':'9:16','resolution':'1K','seed':seed,'output_format':'jpeg'}
    r=subprocess.run(['python3','relay.py','submit',name,E,json.dumps(body)],capture_output=True,text=True); print(r.stdout.strip(),r.stderr.strip()[:300])
def video(name,start,end,prompt,dur=5):
    body={'prompt':prompt,'image_url':{'file':start},'duration':dur,'resolution':'768P'}
    if end: body['end_image_url']={'file':end}
    r=subprocess.run(['python3','relay.py','submit',name,'minimax/h3/image-to-video',json.dumps(body)],capture_output=True,text=True); print(r.stdout.strip(),r.stderr.strip()[:300])
