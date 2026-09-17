#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import argparse, hashlib, json, math, shutil, zipfile

W, H = 1000, 1400
M = 48
TITLE_FS = 48
TAG_FS = 24
HEADER_SINGLE_DIVIDER_Y = 168
HEADER_DOUBLE_DIVIDER_Y = 222
BORDER_RADIUS = 24
BORDER_TOP = 18
BAR_Y1 = BORDER_TOP + BORDER_RADIUS
BAR_Y2 = H - BORDER_TOP - BORDER_RADIUS

COLORS = {
    "black": (0,0,0), "red": (178,0,0), "green": (0,105,55),
    "gold": (150,105,0), "blue": (0,80,165), "purple": (105,45,145),
    "orange": (190,85,0), "teal": (0,105,115), "maroon": (125,25,55),
}

FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_AR = "/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf"

def F(path, size):
    return ImageFont.truetype(path, size=size, layout_engine=ImageFont.Layout.RAQM)

def tw(draw, text, font, direction=None):
    b = draw.textbbox((0,0), text, font=font, direction=direction)
    return b[2]-b[0]

def wrap(draw, text, font, maxw, direction=None):
    lines=[]
    for para in str(text).split("\n"):
        words=para.split()
        if not words:
            lines.append("")
            continue
        cur=words[0]
        for word in words[1:]:
            candidate=cur+" "+word
            if tw(draw,candidate,font,direction)<=maxw:
                cur=candidate
            else:
                lines.append(cur)
                cur=word
        lines.append(cur)
    return lines

def fit(draw, text, font_path, max_size, min_size, maxw, max_lines, direction=None):
    for size in range(max_size, min_size-1, -1):
        f=F(font_path,size)
        lines=wrap(draw,text,f,maxw,direction)
        if len(lines)<=max_lines:
            return f,lines
    f=F(font_path,min_size)
    return f,wrap(draw,text,f,maxw,direction)

def draw_center(draw, lines, font, y, color=(0,0,0), direction=None, spacing=7):
    for line in lines:
        draw.text((W//2,y),line,font=font,fill=color,anchor="ma",direction=direction)
        b=draw.textbbox((0,0),line,font=font,direction=direction)
        y+=(b[3]-b[1])+spacing
    return y-spacing if lines else y

def wrap_header_title(draw, full_text, font, max_width):
    words=full_text.split()
    lines=[]
    cur=""
    for word in words:
        candidate=word if not cur else cur+" "+word
        if tw(draw,candidate,font)<=max_width:
            cur=candidate
        else:
            if cur:
                lines.append(cur)
            cur=word
    if cur:
        lines.append(cur)
    return lines

def header_fixed(draw,n,title,tag,color):
    draw.rounded_rectangle((18,18,W-18,H-18),radius=BORDER_RADIUS,
                           outline=COLORS["black"],width=4)
    draw.rectangle((20,BAR_Y1,31,BAR_Y2),fill=color)
    full=f"{n}. {title}"
    tf=F(FONT_B,TITLE_FS)
    maxw=W-2*(M+14)
    lines=wrap_header_title(draw,full,tf,maxw)
    if len(lines)<=1:
        draw.text((M+14,31),lines[0],font=tf,fill=COLORS["black"])
        if tag:
            tagf=F(FONT_B,TAG_FS)
            draw.text((W-M-10,112),tag,font=tagf,fill=color,anchor="ra")
        divider_y=HEADER_SINGLE_DIVIDER_Y
        body_y=divider_y+37
        used_lines=1
    else:
        if len(lines)>2:
            words=full.split()
            best=None
            for split in range(1,len(words)):
                a=" ".join(words[:split]); b=" ".join(words[split:])
                wa,wb=tw(draw,a,tf),tw(draw,b,tf)
                if wa<=maxw and wb<=maxw:
                    score=abs(wa-wb)
                    if best is None or score<best[0]:
                        best=(score,a,b)
            if best:
                lines=[best[1],best[2]]
            else:
                split=len(words)//2
                lines=[" ".join(words[:split])," ".join(words[split:])]
        draw.text((M+14,27),lines[0],font=tf,fill=COLORS["black"])
        draw.text((M+14,82),lines[1],font=tf,fill=COLORS["black"])
        if tag:
            tagf=F(FONT_B,TAG_FS)
            draw.text((W-M-10,163),tag,font=tagf,fill=color,anchor="ra")
        divider_y=HEADER_DOUBLE_DIVIDER_Y
        body_y=divider_y+35
        used_lines=2
    draw.line((M,divider_y,W-M,divider_y),fill=COLORS["black"],width=3)
    return body_y,divider_y,used_lines

def measure_bullet_rows(draw,bullets,fs,label_gap=36):
    f=F(FONT_R,fs); fb=F(FONT_B,fs)
    x_lead=M+18
    lead_width=max((tw(draw,str(lead),fb) for lead,_ in bullets),default=0)
    x_text=x_lead+lead_width+label_gap
    right=W-M-18
    text_width=max(210,right-x_text)
    rows=[]
    for lead,text in bullets:
        lines=wrap(draw,text,f,text_width)
        h=0
        for line in lines:
            b=draw.textbbox((0,0),line,font=f)
            h+=(b[3]-b[1])+7
        if lines: h-=7
        rows.append((str(lead),lines,h))
    return f,fb,x_lead,x_text,rows

def draw_bullets_layout(draw,bullets,y,fs,accent,available_bottom,
                        mixed_content=False,reserve_reflection=False):
    f,fb,x_lead,x_text,rows=measure_bullet_rows(draw,bullets,fs)
    n=len(rows); content_h=sum(r[2] for r in rows)
    usable=max(0,available_bottom-y)
    if n>1:
        if reserve_reflection:
            target_fraction=0.72; gap_cap=72
        elif mixed_content:
            target_fraction=0.72; gap_cap=72
        else:
            target_fraction=0.88 if n<=4 else 0.83; gap_cap=125
        desired=min(usable,max(content_h+18*(n-1),usable*target_fraction))
        gap=(desired-content_h)/(n-1)
        gap=max(18,min(gap_cap,gap))
        used=content_h+gap*(n-1)
    else:
        gap=0; used=content_h
    y+=max(0,usable-used)*(0.22 if reserve_reflection else 0.46)
    for ri,(lead,lines,row_h) in enumerate(rows):
        draw.text((x_lead,y),lead,font=fb,fill=accent)
        ly=y
        for line in lines:
            draw.text((x_text,ly),line,font=f,fill=COLORS["black"])
            b=draw.textbbox((0,0),line,font=f)
            ly+=(b[3]-b[1])+7
        y+=row_h
        if ri<n-1: y+=gap
    return y

def reflection_height(draw,text,source,maxw):
    label_f=F(FONT_B,22); text_f=F(FONT_R,26); src_f=F(FONT_R,19)
    lines=wrap(draw,text,text_f,maxw); slines=wrap(draw,source,src_f,maxw)
    h=34
    for line in lines:
        b=draw.textbbox((0,0),line,font=text_f); h+=(b[3]-b[1])+7
    h+=11
    for line in slines:
        b=draw.textbbox((0,0),line,font=src_f); h+=(b[3]-b[1])+5
    return h,lines,slines,label_f,text_f,src_f

def draw_reflection_if_room(draw,c,y_after_main,bottom_limit,accent):
    if not c.get("reflection"): return False
    maxw=W-2*(M+34)
    h,lines,slines,label_f,text_f,src_f=reflection_height(
        draw,c["reflection"],c["reflection_source"],maxw)
    if bottom_limit-y_after_main<h+70: return False
    ry=max(y_after_main+42,bottom_limit-h-10)
    draw.line((M+34,ry-18,W-M-34,ry-18),fill=accent,width=2)
    draw.text((M+34,ry),"REFLECTION",font=label_f,fill=accent); ry+=38
    for line in lines:
        draw.text((M+34,ry),line,font=text_f,fill=COLORS["black"])
        b=draw.textbbox((0,0),line,font=text_f); ry+=(b[3]-b[1])+7
    ry+=8
    for line in slines:
        draw.text((M+34,ry),line,font=src_f,fill=COLORS["black"])
        b=draw.textbbox((0,0),line,font=src_f); ry+=(b[3]-b[1])+5
    return True

def block_metrics(draw,text,font_path,max_size,min_size,maxw,max_lines,direction=None,spacing=7):
    f,lines=fit(draw,text,font_path,max_size,min_size,maxw,max_lines,direction)
    heights=[]
    for line in lines:
        b=draw.textbbox((0,0),line,font=f,direction=direction)
        heights.append(max(1,b[3]-b[1]))
    return f,lines,sum(heights)+spacing*max(0,len(lines)-1)

def draw_center_block(draw,lines,font,y,color,direction=None,spacing=7):
    for line in lines:
        draw.text((W//2,y),line,font=font,fill=color,anchor="ma",direction=direction)
        b=draw.textbbox((0,0),line,font=font,direction=direction)
        y+=(b[3]-b[1])+spacing
    return y-spacing if lines else y

def render_card(c):
    img=Image.new("RGB",(W,H),"white"); d=ImageDraw.Draw(img)
    color=COLORS[c.get("color","black")]
    body_y,_,_=header_fixed(d,c["n"],c["title"],c.get("tag",""),color)
    if c.get("special_allah"):
        af=F(FONT_AR,270); cy=(body_y+(H-60))//2
        d.text((W//2,cy),"اللّٰه",font=af,fill=COLORS["gold"],anchor="mm",direction="rtl")
        return img
    source_reserve=95 if c.get("source") else 35
    note_reserve=118 if c.get("note") else 0
    content_bottom=H-source_reserve-note_reserve-24
    reflection_reserve=0
    if c.get("reflection"):
        rh,*_=reflection_height(d,c["reflection"],c["reflection_source"],W-2*(M+34))
        reflection_reserve=rh+95
    main_bottom=content_bottom-reflection_reserve if reflection_reserve else content_bottom
    y=body_y
    has_three=bool(c.get("arabic") and c.get("translit") and c.get("meaning"))
    did_banded=False
    if has_three and not c.get("intro") and not c.get("alert") and not c.get("bullets"):
        maxw=W-2*(M+28)
        af,alines,ah=block_metrics(d,c["arabic"],FONT_AR,c.get("ar_size",76),c.get("ar_min",40),
                                  maxw,c.get("ar_max_lines",10),"rtl",9)
        max_ar_height=c.get("ar_height",520)
        while ah>max_ar_height and af.size>c.get("ar_min",40):
            af=F(FONT_AR,af.size-2); alines=wrap(d,c["arabic"],af,maxw,"rtl")
            hs=[]
            for line in alines:
                b=d.textbbox((0,0),line,font=af,direction="rtl")
                hs.append(max(1,b[3]-b[1]))
            ah=sum(hs)+9*max(0,len(alines)-1)
        tf,tlines,th=block_metrics(d,c["translit"],FONT_R,31,24,maxw,9,None,7)
        mf,mlines,mh=block_metrics(d,c["meaning"],FONT_R,30,23,maxw,8,None,7)
        avail=main_bottom-body_y; natural=ah+th+mh; spare=avail-natural
        if spare>=150:
            did_banded=True
            ar_start=body_y+18
            tr_center=body_y+int(avail*0.49)
            mn_center=body_y+int(avail*0.73)
            tr_start=int(tr_center-th/2); mn_start=int(mn_center-mh/2)
            min_gap=48
            tr_start=max(tr_start,ar_start+ah+min_gap)
            mn_start=max(mn_start,tr_start+th+min_gap)
            if mn_start+mh>main_bottom-10:
                shift=(mn_start+mh)-(main_bottom-10)
                mn_start-=shift
                tr_start=min(tr_start,mn_start-th-min_gap)
            draw_center_block(d,alines,af,ar_start,c.get("arabic_color",COLORS["black"]),"rtl",9)
            draw_center_block(d,tlines,tf,tr_start,COLORS["black"],None,7)
            y=draw_center_block(d,mlines,mf,mn_start,COLORS["black"],None,7)+24
    if not did_banded:
        if c.get("intro"):
            f,lines=fit(d,c["intro"],FONT_R,34,26,W-2*(M+30),7)
            y=draw_center(d,lines,f,y,color=COLORS["black"],spacing=8)+26
        if c.get("arabic"):
            maxw=W-2*(M+28)
            af,alines=fit(d,c["arabic"],FONT_AR,c.get("ar_size",76),c.get("ar_min",40),
                          maxw,c.get("ar_max_lines",10),"rtl")
            max_ar_height=c.get("ar_height",520)
            while af.size>c.get("ar_min",40):
                est=len(alines)*(af.size*1.28)
                if est<=max_ar_height: break
                af=F(FONT_AR,af.size-2); alines=wrap(d,c["arabic"],af,maxw,"rtl")
            y=draw_center(d,alines,af,y,color=c.get("arabic_color",COLORS["black"]),
                          direction="rtl",spacing=9)+26
        if c.get("translit"):
            tf,tlines=fit(d,c["translit"],FONT_R,31,24,W-2*(M+28),9)
            y=draw_center(d,tlines,tf,y,color=COLORS["black"],spacing=7)+24
        if c.get("meaning"):
            mf,mlines=fit(d,c["meaning"],FONT_R,30,23,W-2*(M+28),8)
            y=draw_center(d,mlines,mf,y,color=COLORS["black"],spacing=7)+28
        if c.get("alert"):
            af=F(FONT_B,30); lines=wrap(d,c["alert"],af,W-2*(M+28))
            for line in lines:
                d.text((W//2,y),line,font=af,fill=COLORS["red"],anchor="ma")
                b=d.textbbox((0,0),line,font=af); y+=(b[3]-b[1])+8
            y+=24
        if c.get("bullets"):
            fs=c.get("bullet_fs",31)
            while fs>=24:
                _,_,_,_,rows_m=measure_bullet_rows(d,c["bullets"],fs)
                min_h=sum(r[2] for r in rows_m)+max(0,len(rows_m)-1)*18
                if y+min_h<=main_bottom: break
                fs-=1
            mixed=bool(c.get("arabic") or c.get("translit") or c.get("meaning")
                       or c.get("alert") or c.get("intro"))
            y=draw_bullets_layout(d,c["bullets"],y,fs,color,main_bottom,
                                  mixed_content=mixed,reserve_reflection=bool(reflection_reserve))
    if c.get("reflection"):
        draw_reflection_if_room(d,c,y,content_bottom,color)
    if c.get("note"):
        nf=F(FONT_R,24); lines=wrap(d,c["note"],nf,W-2*(M+28))
        block=len(lines)*31; ny=max(y+24,H-source_reserve-block-30)
        d.line((M+30,ny-12,W-M-30,ny-12),fill=COLORS["black"],width=1)
        for line in lines:
            d.text((W//2,ny),line,font=nf,fill=COLORS["black"],anchor="ma"); ny+=31
    if c.get("source"):
        sf=F(FONT_R,20); slines=wrap(d,"Source: "+c["source"],sf,W-2*(M+26))
        sy=H-58-len(slines)*25
        for line in slines:
            d.text((W//2,sy),line,font=sf,fill=COLORS["black"],anchor="ma"); sy+=25
    return img

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--source-dir",default="source")
    ap.add_argument("--build-dir",default="build")
    ap.add_argument("--dist-dir",default="dist")
    args=ap.parse_args()
    if not features.check("raqm"):
        raise SystemExit("Pillow was built without RAQM support; Arabic shaping cannot be trusted.")
    for p in (FONT_R,FONT_B,FONT_AR):
        if not Path(p).exists():
            raise SystemExit(f"Required font missing: {p}")
    cards=[]
    for src in sorted(Path(args.source_dir).glob("cards_*.json")):
        cards.extend(json.loads(src.read_text(encoding="utf-8")))
    if len(cards)!=145:
        raise SystemExit(f"Expected 145 cards, found {len(cards)}")
    build=Path(args.build_dir); cards_dir=build/"cards"; sheets_dir=build/"sheets"
    if build.exists(): shutil.rmtree(build)
    cards_dir.mkdir(parents=True); sheets_dir.mkdir()
    for c in cards:
        render_card(c).save(cards_dir/f"card_{int(c['n']):03d}.png",optimize=True)
    sheet_w,sheet_h=2060,2860
    thumb_w,thumb_h=970,1358
    gap_x,gap_y=40,40
    start_x,start_y=40,52
    for si in range(math.ceil(len(cards)/4)):
        sheet=Image.new("RGB",(sheet_w,sheet_h),"white")
        for j in range(4):
            idx=si*4+j
            if idx>=len(cards): break
            im=Image.open(cards_dir/f"card_{idx+1:03d}.png").convert("RGB")
            im=im.resize((thumb_w,thumb_h),Image.Resampling.LANCZOS)
            col,row=j%2,j//2
            sheet.paste(im,(start_x+col*(thumb_w+gap_x),start_y+row*(thumb_h+gap_y)))
        sheet.save(sheets_dir/f"sheet_{si+1:02d}.png",optimize=True)
    cols,cw,ch=8,180,252
    rows=math.ceil(len(cards)/cols)
    contact=Image.new("RGB",(cols*cw,rows*ch),"white")
    for i,c in enumerate(cards):
        im=Image.open(cards_dir/f"card_{int(c['n']):03d}.png").convert("RGB")
        im.thumbnail((cw-6,ch-6),Image.Resampling.LANCZOS)
        x=(i%cols)*cw+(cw-im.width)//2
        y=(i//cols)*ch+(ch-im.height)//2
        contact.paste(im,(x,y))
    contact.save(build/"contact_sheet.png",optimize=True)
    (build/"CARD_MANIFEST.txt").write_text(
        "\n".join(f"{int(c['n']):03d}  {c['title']}  [{c.get('tag','')}]" for c in cards)+"\n",
        encoding="utf-8")
    card_paths=sorted(cards_dir.glob("card_*.png"))
    sheet_paths=sorted(sheets_dir.glob("sheet_*.png"))
    assert len(card_paths)==145
    assert len(sheet_paths)==37
    assert all(Image.open(p).size==(1000,1400) for p in card_paths)
    assert all(Image.open(p).size==(2060,2860) for p in sheet_paths)
    qa=("Hanafi Learning Deck — Version 1.0 QA\n"
        f"Cards: {len(card_paths)}\n"
        f"Sheets: {len(sheet_paths)}\n"
        "Header size: fixed 48 pt; long titles wrap instead of shrinking\n"
        f"Accent bar: y={BAR_Y1} to y={BAR_Y2}, ending at rounded-border tangent points\n"
        "Structural QA: PASS\n")
    (build/"QA_REPORT.txt").write_text(qa,encoding="utf-8")
    dist=Path(args.dist_dir); dist.mkdir(exist_ok=True)
    zip_path=dist/"Hanafi-Learning-Deck-v1.0.zip"
    if zip_path.exists(): zip_path.unlink()
    include_root=[Path("README.md"),Path("VERSION_1_NOTES.md"),
                  Path("AUDIT_AND_SOURCES.md"),Path("IMAM_REVIEW_NOTES.md")]
    with zipfile.ZipFile(zip_path,"w",zipfile.ZIP_DEFLATED) as z:
        for p in sorted(build.rglob("*")):
            if p.is_file(): z.write(p,p.relative_to(build.parent))
        for p in include_root:
            if p.exists(): z.write(p,p)
    sha=hashlib.sha256(zip_path.read_bytes()).hexdigest()
    (dist/"SHA256SUMS.txt").write_text(f"{sha}  {zip_path.name}\n",encoding="utf-8")
    print(f"Built {len(card_paths)} cards and {len(sheet_paths)} sheets.")
    print(f"ZIP: {zip_path}")
    print(f"SHA-256: {sha}")

if __name__=="__main__":
    main()
