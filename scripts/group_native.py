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

def group_native(source, target):
    with ZipFile(source) as z: data={n:z.read(n) for n in z.namelist()}
    root=ET.fromstring(data['ppt/slides/slide1.xml'])
    tree=root.find('p:cSld/p:spTree',NS)
    prefixes=['stack-','device-','state-A-','state-B-','sim-hard-','sim-easy-']
    next_id=max(int(e.get('id')) for e in root.findall('.//p:cNvPr',NS))+1
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
        if len(members)<2: continue
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
    data['ppt/slides/slide1.xml']=ET.tostring(root,encoding='utf-8',xml_declaration=True)
    with ZipFile(target,'w',ZIP_DEFLATED) as z:
        for n,b in data.items():z.writestr(n,b)
    report={'groups':len(root.findall('.//p:grpSp',NS)),
            'native_shapes':len(root.findall('.//p:sp',NS)),
            'pictures':len(root.findall('.//p:pic',NS)),
            'texts':len(root.findall('.//a:t',NS))}
    assert report['pictures']==0
    assert report['groups']>=4 and report['native_shapes']>100
    return report

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('source',type=Path);ap.add_argument('target',type=Path)
    a=ap.parse_args();print(json.dumps(group_native(a.source,a.target)))
