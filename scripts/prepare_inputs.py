"""Extract every PDF page and inventory refs; this does not infer paper mechanisms.

Usage: python prepare_inputs.py --paper input.pdf --ref ref --out build/inputs
Needs pypdf. Source directories remain unmodified.
"""
import argparse
import hashlib
import json
import shutil
import subprocess
from pathlib import Path
from pypdf import PdfReader

def prepare(paper, ref, out):
    out.mkdir(parents=True,exist_ok=True)
    reader=PdfReader(paper)
    pages=[{'pdf_page':i+1,'text':p.extract_text() or ''} for i,p in enumerate(reader.pages)]
    (out/'paper-pages.json').write_text(json.dumps(pages,ensure_ascii=False,indent=2),encoding='utf-8')
    (out/'paper.txt').write_text('\n\n'.join(f'=== PDF PAGE {p["pdf_page"]} ===\n{p["text"]}' for p in pages),encoding='utf-8')
    extensions={'.png','.jpg','.jpeg','.webp','.pdf','.pptx'}
    files=[p for p in sorted(ref.rglob('*')) if p.is_file() and p.suffix.lower() in extensions]
    manifest={'paper':str(paper.resolve()),'paper_sha256':hashlib.sha256(paper.read_bytes()).hexdigest(),
      'page_count':len(pages),'pages_with_little_text':[p['pdf_page'] for p in pages if len(p['text'].strip())<80],
      'refs':[{'path':str(p.resolve()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    return manifest

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--paper',type=Path,required=True);ap.add_argument('--ref',type=Path,required=True)
    ap.add_argument('--out',type=Path,required=True);ap.add_argument('--render-pages',type=int,nargs='*',default=[])
    a=ap.parse_args();m=prepare(a.paper,a.ref,a.out)
    if a.render_pages:
        binary=shutil.which('pdftoppm')
        if not binary:raise RuntimeError('pdftoppm unavailable; text and manifest were saved.')
        for n in a.render_pages:
            if not 1<=n<=m['page_count']:raise ValueError(f'Invalid PDF page: {n}')
            subprocess.run([binary,'-f',str(n),'-l',str(n),'-scale-to','1700','-png',str(a.paper),str(a.out/'page')],check=True)
    print(json.dumps({'pages':m['page_count'],'refs':len(m['refs']),'ocr_review_pages':m['pages_with_little_text']}))
