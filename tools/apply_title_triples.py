#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import json, math, hashlib, re
import numpy as np

ROOT=Path('.')
LABELS=json.loads((ROOT/'source/title_language_labels.json').read_text(encoding='utf-8'))
FONT_B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_I='/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf'
FONT_SERIF_B='/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
FONT_SERIF='/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
FONT_SERIF_I='/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf'
FONT_AR='/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf'
DARK_GREEN=(8,55,38)
GOLD=(170,115,0)
BLACK=(12,12,12)
COLORS={'black':(20,20,20),'red':(178,0,0),'green':(0,105,55),'gold':(150,105,0),'blue':(0,80,165),'purple':(105,45,145),'orange':(190,85,0),'teal':(0,105,115),'maroon':(125,25,55)}

def F(path,size):
    return ImageFont.truetype(path,size=size,layout_engine=ImageFont.Layout.RAQM)

def width(d,t,f,direction=None):
    b=d.textbbox((0,0),t,font=f,direction=direction); return b[2]-b[0]

def wrap(d,text,f,maxw):
    words=text.split(); lines=[]; cur=''
    for w in words:
        cand=w if not cur else cur+' '+w
        if width(d,cand,f)<=maxw: cur=cand
        else:
            if cur: lines.append(cur)
            cur=w
    if cur: lines.append(cur)
    return lines

def fit_lines(d,text,fontpath,start,minsize,maxw,maxlines):
    for s in range(start,minsize-1,-1):
        f=F(fontpath,s); lines=wrap(d,text,f,maxw)
        if len(lines)<=maxlines: return f,lines
    f=F(fontpath,minsize); return f,wrap(d,text,f,maxw)[:maxlines]

def fit_single(d,text,fontpath,start,minsize,maxw,direction=None):
    for s in range(start,minsize-1,-1):
        f=F(fontpath,s)
        if width(d,text,f,direction)<=maxw:return f
    return F(fontpath,minsize)

def detect_dark_divider(im,y0,y1):
    arr=np.array(im.convert('RGB')); region=arr[y0:y1,40:-40]
    dark=(region[:,:,0]<220)&(region[:,:,1]<220)&(region[:,:,2]<220)
    counts=dark.sum(axis=1); y=int(y0+np.argmax(counts))
    if counts.max()<400: raise RuntimeError(f'No divider found {counts.max()}')
    return y

def detect_gold_divider(im,y0,y1):
    arr=np.array(im.convert('RGB')); region=arr[y0:y1,40:-40]
    m=(region[:,:,0]>120)&(region[:,:,0]<230)&(region[:,:,1]>70)&(region[:,:,1]<190)&(region[:,:,2]<120)
    counts=m.sum(axis=1); y=int(y0+np.argmax(counts))
    if counts.max()<400: raise RuntimeError(f'No gold divider found {counts.max()}')
    return y

def preserve_below(before,after,y,label):
    a=np.array(before.convert('RGB')); b=np.array(after.convert('RGB'))
    if np.any(a[y:]!=b[y:]): raise RuntimeError(f'Body preservation failed: {label}')

def avg_bg(im,box):
    arr=np.array(im.convert('RGB').crop(box)); return tuple(np.median(arr.reshape(-1,3),axis=0).astype(int))

def load_main_cards():
    cards=[]
    for p in sorted((ROOT/'source').glob('cards_*.json')): cards.extend(json.loads(p.read_text(encoding='utf-8')))
    return {int(c['n']):c for c in cards}
MAIN=load_main_cards()

def apply_main():
    changed=[]
    for n in range(1,147):
        p=ROOT/'cards'/f'card_{n:03d}.png'; before=Image.open(p).convert('RGB'); im=before.copy(); d=ImageDraw.Draw(im)
        div=detect_dark_divider(im,150,270); bg=avg_bg(im,(450,45,550,min(div-8,120)))
        d.rectangle((42,40,958,div-4),fill=bg)
        c=MAIN[n]; eng=f"{n}. {c['title']}"; lab=LABELS['main'][str(n)]
        ef,elines=fit_lines(d,eng,FONT_B,46,26,560,2)
        top=47
        for i,line in enumerate(elines): d.text((62,top+i*(ef.size+4)),line,font=ef,fill=BLACK)
        af=fit_single(d,lab['arabic'],FONT_AR,44,25,300,'rtl')
        d.text((940,45),lab['arabic'],font=af,fill=DARK_GREEN,anchor='ra',direction='rtl')
        lf=fit_single(d,lab['latin'],FONT_I,23,15,560); d.text((62,div-48),lab['latin'],font=lf,fill=DARK_GREEN)
        tag=c.get('tag','')
        if tag:
            tf=fit_single(d,tag,FONT_B,18,12,330); d.text((940,div-47),tag,font=tf,fill=COLORS.get(c.get('color','black'),BLACK),anchor='ra')
        d.line((48,div,952,div),fill=BLACK,width=3)
        preserve_below(before,im,div+2,f'main {n}'); im.save(p,'PNG',optimize=True); changed.append(p)
    return changed

SACRED_TAGS={1:('COLOR KEY • HOW TO USE','gold'),2:('MAKKAH • SACRED MOSQUE','gold'),3:('MASJID AL-HARAM • MAKKAH','gold'),4:('MASJID AL-HARAM • MAKKAH','gold'),5:('MASJID AL-HARAM • MAKKAH','gold'),6:('MASJID AL-HARAM • MAKKAH','gold'),7:('HOLY SITES • NEAR MAKKAH','blue'),8:('HOLY SITES • NEAR MAKKAH','blue'),9:("BETWEEN 'ARAFAT AND MINA",'blue'),10:("MADINAH • PROPHET'S MOSQUE",'green'),11:('INSIDE MASJID AN-NABAWI • MADINAH','green'),12:('MADINAH • HISTORIC CEMETERY','green'),13:('MADINAH • HISTORIC MOSQUE','green'),14:('MADINAH • MOSQUE OF THE TWO QIBLAHS','green'),15:('JERUSALEM • AL-HARAM AL-SHARIF','gold'),16:('AL-AQSA COMPOUND • JERUSALEM','gold'),17:('MAKKAH • HISTORICAL SITE','teal'),18:('JABAL THAWR • MAKKAH','teal'),19:('MADINAH • HISTORICAL SITE','maroon')}

def sacred_files():
    files=[]
    for p in (ROOT/'Sacred-Places-Expansion').glob('card_*.png'):
        m=re.match(r'card_(\d+)_',p.name)
        if m: files.append((int(m.group(1)),p))
    return sorted(files)

def apply_sacred(only=None):
    changed=[]
    wanted=None if only is None else set(only)
    for n,p in sacred_files():
        if wanted is not None and n not in wanted: continue
        before=Image.open(p).convert('RGB'); im=before.copy(); d=ImageDraw.Draw(im); div=detect_dark_divider(im,120,240)
        bg=avg_bg(im,(400,45,600,min(div-10,130))); d.rectangle((47,40,953,div-4),fill=bg)
        lab=LABELS['sacred_places'][str(n)]; eng=f"{n}. {lab['english']}"; latin_y=div-37
        ef=elines=None
        for s in range(46,21,-1):
            cand=F(FONT_B,s); lines=wrap(d,eng,cand,570)
            if not lines or len(lines)>2: continue
            y=48; bottom=48
            for line in lines:
                b=d.textbbox((63,y),line,font=cand); bottom=max(bottom,b[3]); y += s+2
            if bottom <= latin_y-10:
                ef,elines=cand,lines; break
        if ef is None: raise RuntimeError(f'Could not fit Sacred Places title {n}')
        y=48
        for line in elines:
            d.text((63,y),line,font=ef,fill=BLACK); y += ef.size+2
        af=fit_single(d,lab['arabic'],FONT_AR,42,24,300,'rtl'); d.text((940,46),lab['arabic'],font=af,fill=DARK_GREEN,anchor='ra',direction='rtl')
        lf=fit_single(d,lab['latin'],FONT_I,20,13,430); d.text((63,latin_y),lab['latin'],font=lf,fill=DARK_GREEN)
        tag,col=SACRED_TAGS[n]; tf=fit_single(d,tag,FONT_B,16,11,350); d.text((940,latin_y),tag,font=tf,fill=COLORS[col],anchor='ra')
        d.line((48,div,952,div),fill=BLACK,width=3)
        preserve_below(before,im,div+2,f'sacred {n}'); im.save(p,'PNG',optimize=True); changed.append(p)
    return changed

def names_files():
    files=[]
    for p in (ROOT/'99-Names-of-Allah-Expansion').glob('card_*.png'):
        m=re.match(r'card_(\d+)_',p.name)
        if m: files.append((int(m.group(1)),p))
    return sorted(files)

def apply_names():
    changed=[]
    for n,p in names_files():
        before=Image.open(p).convert('RGB'); im=before.copy(); d=ImageDraw.Draw(im); div=detect_dark_divider(im,130,220)
        bg=avg_bg(im,(400,45,600,min(div-10,120))); d.rectangle((60,42,940,div-4),fill=bg)
        lab=LABELS['names_of_allah'][str(n)]; eng=f"{n}. {lab['english']}"; ef,elines=fit_lines(d,eng,FONT_B,34,24,520,2)
        for i,line in enumerate(elines): d.text((80,56+i*(ef.size+2)),line,font=ef,fill=DARK_GREEN)
        af=fit_single(d,lab['arabic'],FONT_AR,38,24,310,'rtl'); d.text((920,50),lab['arabic'],font=af,fill=DARK_GREEN,anchor='ra',direction='rtl')
        lf=fit_single(d,lab['latin'],FONT_I,22,15,480); d.text((80,div-48),lab['latin'],font=lf,fill=(190,145,55))
        if n==1: tag='EXPANSION GUIDE'
        else:
            lo=1+(n-2)*9; hi=min(99,lo+8); tag=f'NAMES {lo}–{hi}'
        tf=fit_single(d,tag,FONT_B,20,14,260); d.text((920,div-48),tag,font=tf,fill=(190,145,55),anchor='ra')
        d.line((82,div,918,div),fill=DARK_GREEN,width=3)
        preserve_below(before,im,div+2,f'names {n}'); im.save(p,'PNG',optimize=True); changed.append(p)
    return changed

def alphabet_files():
    files=[]
    for p in (ROOT/'Arabic-Alphabet-Expansion/cards').glob('card_*.png'):
        m=re.match(r'card_(\d+)_',p.name)
        if m: files.append((int(m.group(1)),p))
    return sorted(files)

def apply_alphabet():
    changed=[]
    for n,p in alphabet_files():
        before=Image.open(p).convert('RGB'); im=before.copy(); d=ImageDraw.Draw(im); div=detect_gold_divider(im,120,210)
        bg=avg_bg(im,(430,45,570,min(div-10,120))); d.rectangle((55,42,945,div-4),fill=bg)
        lab=LABELS['arabic_alphabet'][str(n)]; eng=f"{n}. {lab['english']}"; ef,elines=fit_lines(d,eng,FONT_B,47,30,500,1); d.text((64,54),elines[0],font=ef,fill=DARK_GREEN)
        af=fit_single(d,lab['arabic'],FONT_AR,44,28,270,'rtl'); d.text((936,48),lab['arabic'],font=af,fill=DARK_GREEN,anchor='ra',direction='rtl')
        lf=fit_single(d,lab['latin'],FONT_I,25,17,360); d.text((64,div-48),lab['latin'],font=lf,fill=GOLD)
        tf=F(FONT_B,20); d.text((936,div-48),'ARABIC • ALPHABET',font=tf,fill=GOLD,anchor='ra')
        d.line((56,div,944,div),fill=GOLD,width=2)
        preserve_below(before,im,div+2,f'alphabet {n}'); im.save(p,'PNG',optimize=True); changed.append(p)
    return changed

def apply_important(path,n):
    before=Image.open(path).convert('RGB'); im=before.copy(); d=ImageDraw.Draw(im); div=detect_gold_divider(im,170,230)
    bg=avg_bg(im,(480,170,560,195)); d.rectangle((80,70,944,div-4),fill=bg)
    lab=LABELS['important_places'][str(n)]; eng=f"{n}. {lab['english']}"; ef,elines=fit_lines(d,eng,FONT_SERIF_B,48,30,560,1); d.text((104,83),elines[0],font=ef,fill=BLACK)
    af=fit_single(d,lab['arabic'],FONT_AR,43,28,290,'rtl'); d.text((936,83),lab['arabic'],font=af,fill=DARK_GREEN,anchor='ra',direction='rtl')
    locf=fit_single(d,lab['location'],FONT_SERIF_B,30,22,430); d.text((104,143),lab['location'],font=locf,fill=DARK_GREEN)
    lf=fit_single(d,lab['latin'],FONT_SERIF_I,27,18,300); d.text((936,145),lab['latin'],font=lf,fill=DARK_GREEN,anchor='ra')
    d.line((84,div,940,div),fill=(183,132,18),width=2)
    preserve_below(before,im,div+2,f'important {n}'); im.save(path,'PNG',optimize=True); return path

def rebuild_2x2(card_paths,sheets_dir,sheet_size=(2060,2860),thumb=(970,1358),start=(40,52),gaps=(40,40)):
    sheets_dir.mkdir(parents=True,exist_ok=True)
    for p in sheets_dir.glob('sheet_*.png'): p.unlink()
    sw,sh=sheet_size; tw,th=thumb; sx,sy=start; gx,gy=gaps
    for i in range(math.ceil(len(card_paths)/4)):
        sheet=Image.new('RGB',(sw,sh),'white')
        for j in range(4):
            idx=i*4+j
            if idx>=len(card_paths):break
            c=Image.open(card_paths[idx]).convert('RGB').resize((tw,th),Image.Resampling.LANCZOS)
            col,row=j%2,j//2; sheet.paste(c,(sx+col*(tw+gx),sy+row*(th+gy)))
        sheet.save(sheets_dir/f'sheet_{i+1:02d}.png','PNG',optimize=True)

def contact(card_paths,path,cols,cellw,cellh):
    rows=math.ceil(len(card_paths)/cols); out=Image.new('RGB',(cols*cellw,rows*cellh),'white')
    for i,p in enumerate(card_paths):
        im=Image.open(p).convert('RGB'); im.thumbnail((cellw-8,cellh-8),Image.Resampling.LANCZOS)
        x=(i%cols)*cellw+(cellw-im.width)//2; y=(i//cols)*cellh+(cellh-im.height)//2; out.paste(im,(x,y))
    out.save(path,'PNG',optimize=True)

def sha256(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def rewrite_manifests():
    d=ROOT/'99-Names-of-Allah-Expansion'; lines=['99 Names of Allah Expansion — v1.6.2','Cards 1-12','1000 x 1400 px, 5:7 playing-card format','Title bars: English • Latin transliteration • Arabic','','Files:']
    for n,p in names_files(): lines.append(f'{p.name}  {p.stat().st_size} bytes  SHA-256 {sha256(p)}')
    (d/'MANIFEST.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    d=ROOT/'Arabic-Alphabet-Expansion'; lines=['Arabic Alphabet Expansion — v1.6.2','Cards 1-28','1000 x 1400 px, 5:7 playing-card format','Title bars: English/letter name • Latin label • Arabic letter name','','Files:']
    for n,p in alphabet_files(): lines.append(f'{p.relative_to(d)}  {p.stat().st_size} bytes  SHA-256 {sha256(p)}')
    (d/'MANIFEST.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')

def main():
    if not features.check('raqm'): raise SystemExit('RAQM required')
    m=apply_main(); s=apply_sacred(); nn=apply_names(); a=apply_alphabet(); ip=[]
    for n,name in [(1,'card_001_lal_masjid.png'),(2,'card_002_chinguetti_mosque.png')]:
        p=ROOT/'Important-Places-Expansion'/name
        if p.exists(): ip.append(apply_important(p,n))
    rebuild_2x2(m,ROOT/'sheets'); contact(m,ROOT/'contact_sheet.png',8,180,252)
    rebuild_2x2([p for _,p in sacred_files()],ROOT/'Sacred-Places-Expansion'/'sheets'); contact([p for _,p in sacred_files()],ROOT/'Sacred-Places-Expansion'/'contact_sheet.png',5,200,280)
    rebuild_2x2([p for _,p in names_files()],ROOT/'99-Names-of-Allah-Expansion'/'sheets'); contact([p for _,p in names_files()],ROOT/'99-Names-of-Allah-Expansion'/'contact_sheet.png',4,250,350)
    rebuild_2x2([p for _,p in alphabet_files()],ROOT/'Arabic-Alphabet-Expansion'/'sheets',sheet_size=(2000,2800),thumb=(950,1330),start=(25,25),gaps=(50,50)); contact([p for _,p in alphabet_files()],ROOT/'Arabic-Alphabet-Expansion'/'contact_sheet.png',4,250,350)
    rewrite_manifests(); print(f'PASS main={len(m)} sacred={len(s)} names={len(nn)} alphabet={len(a)} important={len(ip)}')
if __name__=='__main__': main()
