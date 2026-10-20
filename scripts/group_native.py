"""Group named native OOXML shapes without rasterizing or changing geometry."""
import argparse
import json
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.etree import ElementTree as ET

P='http://schemas.openxmlformats.org/presentationml/2006/main'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
NS={'p':P,'a':A}
ET.register_namespace('p',P); ET.register_namespace('a',A)
def tag(ns,n): return '{'+ns+'}'+n

def group_native(source, target, config):
    if Path(source).resolve()==Path(target).resolve():
        raise ValueError('Use a separate output file; preserve the source.')
    with ZipFile(source) as z: data={n:z.read(n) for n in z.namelist()}
    reports=[]
    for rule in config.get('groups',[]):
        number=rule['slide']
        if not isinstance(number,int) or number<1: raise ValueError('Slide numbers start at 1.')
        member=f'ppt/slides/slide{number}.xml'
        if member not in data: raise ValueError(f'Missing slide: {number}')
        root=ET.fromstring(data[member])
        reports.extend(group_slide(root,rule['prefixes'],number))
        data[member]=ET.tostring(root,encoding='utf-8',xml_declaration=True)
    with ZipFile(target,'w',ZIP_DEFLATED) as z:
        for n,b in data.items():z.writestr(n,b)
    return {'groups_created':len(reports),'groups':reports}

def group_slide(root, prefixes, slide_number):
    tree=root.find('p:cSld/p:spTree',NS)
    if not isinstance(prefixes,list) or any(not isinstance(p,str) or not p for p in prefixes):
        raise ValueError('Provide nonempty object prefixes explicitly.')
    if len(set(prefixes))!=len(prefixes): raise ValueError('Duplicate prefixes.')
    next_id=max(int(e.get('id')) for e in root.findall('.//p:cNvPr',NS))+1
    reports=[]
    for prefix in prefixes:
        members=[]; bounds=[]
        for e in list(tree):
            nv=e.find('.//p:cNvPr',NS)
            if nv is None or not nv.get('name','').startswith(prefix): continue
            xf=e.find('p:spPr/a:xfrm',NS)
            if xf is None: continue
            off=xf.find('a:off',NS); ext=xf.find('a:ext',NS)
            x,y=int(off.get('x')),int(off.get('y'));w,h=int(ext.get('cx')),int(ext.get('cy'))
            members.append(e);bounds.append((x,y,x+w,y+h))
        if len(members)<2: raise ValueError(f'Prefix {prefix!r} must match at least two native shapes.')
        indexes=[list(tree).index(e) for e in members]
        if indexes!=list(range(indexes[0],indexes[-1]+1)):
            raise ValueError(f'Prefix {prefix!r} is interleaved with other objects; grouping would change z-order.')
        x=min(b[0] for b in bounds);y=min(b[1] for b in bounds)
        w=max(b[2] for b in bounds)-x;h=max(b[3] for b in bounds)-y
        g=ET.Element(tag(P,'grpSp'))
        nv=ET.SubElement(g,tag(P,'nvGrpSpPr'))
        ET.SubElement(nv,tag(P,'cNvPr'),{'id':str(next_id),'name':prefix.rstrip('-')})
        next_id+=1
        ET.SubElement(nv,tag(P,'cNvGrpSpPr'));ET.SubElement(nv,tag(P,'nvPr'))
        gp=ET.SubElement(g,tag(P,'grpSpPr'));xf=ET.SubElement(gp,tag(A,'xfrm'))
        for n,attrs in [('off',{'x':x,'y':y}),('ext',{'cx':w,'cy':h}),('chOff',{'x':x,'y':y}),('chExt',{'cx':w,'cy':h})]:
            ET.SubElement(xf,tag(A,n),{k:str(v) for k,v in attrs.items()})
        index=list(tree).index(members[0])
        for e in members: tree.remove(e);g.append(e)
        tree.insert(index,g)
        reports.append({'slide':slide_number,'prefix':prefix,'members':len(members)})
    return reports

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('source',type=Path);ap.add_argument('target',type=Path)
    ap.add_argument('--config',type=Path,required=True,help='Diagram configuration JSON containing groups.')
    a=ap.parse_args();config=json.loads(a.config.read_text(encoding='utf-8'))
    print(json.dumps(group_native(a.source,a.target,config)))
