#!/usr/bin/env python3
import re,glob,os,json,collections
root='/home/usapcool/serphim obsidian vault'
files=glob.glob(root+'/**/*.md',recursive=True)
name={f:os.path.splitext(os.path.basename(f))[0] for f in files}
resolver={v.lower():v for v in name.values()}
for f in files:
    t=open(f,encoding='utf-8',errors='ignore').read()
    m=re.match(r'^---\n([\s\S]*?)\n---\n',t)
    if not m: continue
    fm=m.group(1); on=False
    for line in fm.splitlines():
        if line.strip()=='aliases:': on=True; continue
        if on and re.match(r'^\s*-\s+',line):
            a=re.sub(r'^\s*-\s+','',line).strip().strip('"\'')
            if a: resolver[a.lower()]=name[f]
        elif on and (line.strip()=='' or re.match(r'^[A-Za-z0-9_\-]+\s*:',line.strip())):
            on=False
out=collections.defaultdict(set);inn=collections.defaultdict(set)
for f in files:
    src=name[f]
    t=open(f,encoding='utf-8',errors='ignore').read()
    for x in re.findall(r'\[\[([^\]|#]+)',t):
        tgt=resolver.get(x.strip().lower())
        if tgt and tgt!=src:
            out[src].add(tgt); inn[tgt].add(src)
rows=[]
for n in name.values():
    score=len(out[n])+len(inn[n])
    rows.append({'node':n,'in':len(inn[n]),'out':len(out[n]),'score':score})
rows.sort(key=lambda r:(r['score'],r['in']))
report={'ts':__import__('datetime').datetime.now().isoformat(),'total_nodes':len(rows),'lowest':rows[:25],'highest':rows[-25:]}
out_path='/home/usapcool/.openclaw/workspace/reports/skill-graph-score.json'
os.makedirs('/home/usapcool/.openclaw/workspace/reports',exist_ok=True)
open(out_path,'w').write(json.dumps(report,indent=2))
print(out_path)
