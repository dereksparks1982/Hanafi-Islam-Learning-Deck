#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, features
import json, hashlib, math, shutil, zipfile

W,H=1000,1400
BG=(251,250,243)
GREEN=(7,55,40)
GOLD=(174,125,0)
RED=(195,22,28)
BLACK=(20,20,20)
GREY=(115,115,105)
OUT=Path('/mnt/data/Hanafi-Arabic-Alphabet-Expansion-v1.5')
# Always build from a clean output tree so rejected/renamed files cannot leak into a package.
if OUT.exists():
    shutil.rmtree(OUT)
CARDS=OUT/'cards'; SHEETS=OUT/'sheets'
for p in (CARDS,SHEETS): p.mkdir(parents=True,exist_ok=True)

FONT_R='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
FONT_AR='/usr/share/fonts/truetype/noto/NotoNaskhArabic-Regular.ttf'
assert features.check('raqm')

def F(path,size): return ImageFont.truetype(path,size=size,layout_engine=ImageFont.Layout.RAQM)

def tw(d,text,font,dir=None):
    b=d.textbbox((0,0),text,font=font,direction=dir); return b[2]-b[0]

def wrap(d,text,font,maxw):
    lines=[]
    for para in text.split('\n'):
        words=para.split()
        if not words: lines.append(''); continue
        cur=words[0]
        for w in words[1:]:
            cand=cur+' '+w
            if tw(d,cand,font)<=maxw: cur=cand
            else: lines.append(cur); cur=w
        lines.append(cur)
    return lines

def draw_wrapped(d,text,xy,font,maxw,fill=BLACK,spacing=8):
    x,y=xy
    for line in wrap(d,text,font,maxw):
        d.text((x,y),line,font=font,fill=fill)
        b=d.textbbox((0,0),line,font=font); y += (b[3]-b[1])+spacing
    return y

# name, letter, translit, say, mouth, source, voice, weight, avoid, forms iso/init/med/final, example ar/trans/eng, notes
L=[
('ALIF','ا','ā / a','ā — a long open “aa” sound, as in father.','Mouth open and relaxed. The vowel is carried on the breath; no special tongue contact.','For long ā, the sound flows through the open mouth after a fatḥah.','Voiced.','Neutral; its quality follows the surrounding consonants.','Do not treat bare Alif as an English “uh.” A written hamza (أ / إ) is a separate glottal-stop sound.',('ﺍ','—','—','ﺎ'),('بَاب','Bāb','Door'),['Bare Alif commonly lengthens fatḥah to long ā.','Alif does not connect to a following letter on its left.','When hamza appears on or under Alif, pronounce the hamza as a glottal stop.','Example: بَاب has a long ā between the two b sounds.']),
('BĀʾ','ب','b','b — like the b in boy.','Close both lips, build a little pressure, then release.','Both lips.','Voiced.','Light.','Do not turn it into p; Arabic ب is voiced.',('ﺏ','ﺑ','ﺒ','ﺐ'),('بَيْت','Bayt','House'),['One dot below distinguishes ب from ت and ث.','Bāʾ connects on both sides when neighboring letters allow it.','Its basic sound is b in every position.','Example: بَيْت begins with Bāʾ.']),
('TĀʾ','ت','t','t — like a clean t in top, with less puff of air than strong English t.','Touch the tongue tip near the upper front teeth/gum ridge, then release.','Tongue tip with the upper front teeth/alveolar area.','Voiceless.','Light.','Do not pronounce it as English th or as emphatic ṭ.',('ﺕ','ﺗ','ﺘ','ﺖ'),('تَمْر','Tamr','Dates'),['Two dots above distinguish ت from ب and ث.','Tāʾ connects on both sides.','Keep it light; ط is the heavy counterpart.','Example: تَمْر begins with Tāʾ.']),
('THĀʾ','ث','th','th — like the th in think.','Let the tongue tip touch or slightly pass between the front teeth while air flows.','Tongue tip and upper front teeth.','Voiceless.','Light.','Do not replace it with s, t, or the voiced th of this.',('ﺙ','ﺛ','ﺜ','ﺚ'),('ثَوْب','Thawb','Garment'),['Three dots above identify ث.','Thāʾ connects on both sides.','The English word think gives a useful approximation.','Example: ثَوْب begins with Thāʾ.']),
('JĪM','ج','j','j — like the j in jam in standard/Qurʾanic pronunciation.','Raise the middle of the tongue toward the hard palate and release the voiced sound.','Middle of the tongue with the hard palate.','Voiced.','Light.','Do not reduce it to English y or French-style zh.',('ﺝ','ﺟ','ﺠ','ﺞ'),('جَمَل','Jamal','Camel'),['One dot below distinguishes ج from ح and خ.','Jīm connects on both sides.','In standard Arabic it is taught as the j sound in jam.','Example: جَمَل begins with Jīm.']),
('ḤĀʾ','ح','ḥ','ḥ — no exact English equivalent; a strong, clear breathy h from the middle throat.','Keep the mouth open and let air pass through a gently narrowed middle throat.','Middle throat (pharyngeal area).','Voiceless.','Light.','Do not pronounce it as ordinary ه h, and do not scrape it like خ kh.',('ﺡ','ﺣ','ﺤ','ﺢ'),('حَقّ','Ḥaqq','Truth / right'),['Ḥāʾ has no dot.','It shares its basic shape with ج and خ.','The sound is deeper than ه but smoother than خ.','Example: حَقّ begins with Ḥāʾ.']),
('KHĀʾ','خ','kh','kh — like the ch in Scottish loch or German Bach.','Raise the back of the tongue near the soft palate and let air rub through the narrow space.','Upper throat/back of the mouth.','Voiceless.','Heavy.','Do not pronounce it as k, h, or an English “ch.”',('ﺥ','ﺧ','ﺨ','ﺦ'),('خُبْز','Khubz','Bread'),['One dot above distinguishes خ from ح and ج.','Khāʾ connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: خُبْز begins with Khāʾ.']),
('DĀL','د','d','d — like the d in day.','Touch the tongue tip near the upper front teeth/gum ridge and release with voice.','Tongue tip with the upper front teeth/alveolar area.','Voiced.','Light.','Do not turn it into dh; ذ is a different letter.',('ﺩ','—','—','ﺪ'),('دِين','Dīn','Religion'),['Dāl has no dot.','It connects to a preceding letter on its right, but not to a following letter on its left.','Its sound stays d in all positions.','Example: دِين begins with Dāl.']),
('DHĀL','ذ','dh','dh — like the th in this.','Place the tongue tip at or slightly between the front teeth and use voice.','Tongue tip and upper front teeth.','Voiced.','Light.','Do not replace it with z, d, or the voiceless th of think.',('ﺫ','—','—','ﺬ'),('ذِكْر','Dhikr','Remembrance'),['One dot above distinguishes ذ from د.','Dhāl does not connect to a following letter on its left.','The sound matches the voiced th in this.','Example: ذِكْر begins with Dhāl.']),
('RĀʾ','ر','r','r — a quick tongue tap or light roll, not the English r.','Tap the tongue tip against the ridge just behind the upper front teeth.','Tongue tip and alveolar ridge.','Voiced.','Context-dependent in recitation: sometimes light, sometimes heavy.','Do not use the English back-of-the-mouth r.',('ﺭ','—','—','ﺮ'),('رَحْمَة','Raḥmah','Mercy'),['Rāʾ has no dot.','It does not connect to a following letter on its left.','In Qurʾanic recitation its heaviness depends on context.','Example: رَحْمَة begins with Rāʾ.']),
('ZĀY','ز','z','z — like the z in zoo.','Bring the tongue close to the front gum ridge and let voiced air pass through.','Front of tongue near the alveolar ridge.','Voiced.','Light.','Do not pronounce it as s.',('ﺯ','—','—','ﺰ'),('زَكَاة','Zakāh','Obligatory alms'),['One dot above distinguishes ز from ر.','Zāy does not connect to a following letter on its left.','Its basic sound is z.','Example: زَكَاة begins with Zāy.']),
('SĪN','س','s','s — like the s in sun.','Keep the tongue close to the front teeth/gum ridge and let air hiss through.','Front of tongue near the lower incisors and alveolar area.','Voiceless.','Light.','Do not voice it as z, and do not make it heavy like ص.',('ﺱ','ﺳ','ﺴ','ﺲ'),('سَلَام','Salām','Peace'),['Sīn has no dots and has three “teeth” in its common shape.','It connects on both sides.','Keep the sound light and clear.','Example: سَلَام begins with Sīn.']),
('SHĪN','ش','sh','sh — like the sh in ship.','Raise the middle/front of the tongue toward the palate while air passes through.','Middle of the tongue toward the hard palate.','Voiceless.','Light.','Do not pronounce it as s or ch.',('ﺵ','ﺷ','ﺸ','ﺶ'),('شَمْس','Shams','Sun'),['Three dots above distinguish ش from س.','Shīn connects on both sides.','Its sound is close to English sh.','Example: شَمْس begins with Shīn.']),
('ṢĀD','ص','ṣ','ṣ — a heavy/emphatic s; no exact English equivalent.','Make an s while raising the back of the tongue, giving the sound a fuller, darker quality.','Front tongue for s, with the back of the tongue raised.','Voiceless.','Heavy.','Do not flatten it into plain س s.',('ﺹ','ﺻ','ﺼ','ﺺ'),('صَبْر','Ṣabr','Patience'),['Ṣād has no dot.','It connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: صَبْر begins with Ṣād.']),
('ḌĀD','ض','ḍ','ḍ — a heavy Arabic d sound; no exact English equivalent.','Press one side of the tongue toward the upper molars while keeping the back of the tongue raised.','Side of the tongue with the upper molars.','Voiced.','Heavy.','Do not reduce it to plain د d or ظ ẓ.',('ﺽ','ﺿ','ﻀ','ﺾ'),('ضَوْء','Ḍawʾ','Light'),['One dot above distinguishes ض from ص.','Ḍād connects on both sides.','Its classical articulation uses the side of the tongue against the upper molars.','Example: ضَوْء begins with Ḍād.']),
('ṬĀʾ','ط','ṭ','ṭ — a heavy/emphatic t; no exact English equivalent.','Make a t with the tongue tip at the upper gum ridge while raising the back of the tongue.','Tongue tip plus a raised back of tongue.','Voiceless.','Heavy.','Do not pronounce it as plain ت t.',('ﻁ','ﻃ','ﻄ','ﻂ'),('طَيِّب','Ṭayyib','Good / wholesome'),['Ṭāʾ has no dot.','It connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: طَيِّب begins with Ṭāʾ.']),
('ẒĀʾ','ظ','ẓ','ẓ — a heavy voiced th, made like ذ but with the back of the tongue raised.','Put the tongue tip at the upper front teeth and add emphatic depth by raising the back of the tongue.','Tongue tip and upper teeth, with raised back of tongue.','Voiced.','Heavy.','Do not replace it with plain ذ dh, ز z, or ض ḍ.',('ﻅ','ﻇ','ﻈ','ﻆ'),('ظِلّ','Ẓill','Shade'),['One dot above distinguishes ظ from ط.','Ẓāʾ connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: ظِلّ begins with Ẓāʾ.']),
('ʿAYN','ع','ʿ','ʿ — no English equivalent; a voiced constricted sound from the middle throat.','Gently narrow the middle throat and let the voice pass through without closing it completely.','Middle throat (pharynx).','Voiced.','Light.','Do not omit it, turn it into a vowel, or replace it with hamza.',('ﻉ','ﻋ','ﻌ','ﻊ'),('عِلْم','ʿIlm','Knowledge'),['ʿAyn has no dot.','It connects on both sides.','The symbol ʿ in transliteration represents this throat sound.','Example: عِلْم begins with ʿAyn.']),
('GHAYN','غ','gh','gh — a voiced friction sound high in the throat/back of the mouth; no exact English equivalent.','Raise the back of the tongue near the soft palate/uvula and let voiced air rub through.','Upper throat/back of the mouth.','Voiced.','Heavy.','Do not pronounce it as hard English g.',('ﻍ','ﻏ','ﻐ','ﻎ'),('غُرْفَة','Ghurfah','Room'),['One dot above distinguishes غ from ع.','Ghayn connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: غُرْفَة begins with Ghayn.']),
('FĀʾ','ف','f','f — like the f in fine.','Touch the inner lower lip lightly to the upper front teeth and let air pass.','Lower lip with upper incisors.','Voiceless.','Light.','Do not voice it as v.',('ﻑ','ﻓ','ﻔ','ﻒ'),('فَجْر','Fajr','Dawn'),['One dot above identifies ف in standard Arabic script.','Fāʾ connects on both sides.','Its sound is close to English f.','Example: فَجْر begins with Fāʾ.']),
('QĀF','ق','q','q — a deep stop made farther back than k; no exact English equivalent.','Raise the back of the tongue to the uvular/very back palate area, stop the air, then release.','Back of the tongue with the uvular/soft-palate area.','Voiceless.','Heavy.','Do not replace it with ك k or English g.',('ﻕ','ﻗ','ﻘ','ﻖ'),('قَلْب','Qalb','Heart'),['Two dots above distinguish ق from ف.','Qāf connects on both sides.','It is one of the heavy letters in Qurʾanic recitation.','Example: قَلْب begins with Qāf.']),
('KĀF','ك','k','k — like the k in skin.','Raise the back of the tongue to the soft palate, briefly stop the air, then release.','Back of the tongue with the soft palate.','Voiceless.','Light.','Do not make it as deep or heavy as ق q.',('ﻙ','ﻛ','ﻜ','ﻚ'),('كِتَاب','Kitāb','Book'),['Kāf connects on both sides.','Its sound is the ordinary Arabic k.','Compare it with the deeper Qāf ق.','Example: كِتَاب begins with Kāf.']),
('LĀM','ل','l','l — like a clear/light l.','Touch the tongue tip/front edge to the gum ridge behind the upper front teeth.','Tongue tip/front with the upper alveolar ridge.','Voiced.','Usually light; the l in the name Allāh can be heavy in specific contexts.','Do not use an overly dark English final-l sound.',('ﻝ','ﻟ','ﻠ','ﻞ'),('لَيْل','Layl','Night'),['Lām connects on both sides.','It is normally pronounced light.','In Allāh, its heaviness depends on the preceding vowel in recitation.','Example: لَيْل begins with Lām.']),
('MĪM','م','m','m — like the m in moon.','Close both lips and let the voiced sound resonate through the nose.','Both lips, with nasal resonance.','Voiced.','Light.','Do not leave the lips open; full lip closure is part of m.',('ﻡ','ﻣ','ﻤ','ﻢ'),('مَاء','Māʾ','Water'),['Mīm connects on both sides.','It is a nasal consonant.','In tajwīd, some contexts lengthen or conceal its nasal resonance.','Example: مَاء begins with Mīm.']),
('NŪN','ن','n','n — like the n in noon.','Touch the tongue tip near the upper gum ridge while voice resonates through the nose.','Tongue tip with alveolar ridge, plus nasal resonance.','Voiced.','Light.','Do not turn it into English ng.',('ﻥ','ﻧ','ﻨ','ﻦ'),('نُور','Nūr','Light'),['One dot above identifies ن.','Nūn connects on both sides.','It carries nasal resonance (ghunnah), especially noticeable in tajwīd rules.','Example: نُور begins with Nūn.']),
('HĀʾ','ه','h','h — like a clear h in hat.','Keep the throat open and let breath pass gently without the stronger constriction of ح.','Deep throat/open glottal area.','Voiceless.','Light.','Do not make it as deep as ح ḥ or rough like خ kh.',('ﻩ','ﻫ','ﻬ','ﻪ'),('هُدَى','Hudā','Guidance'),['Hāʾ connects on both sides.','Its h is lighter than ح.','Its connected forms can look quite different from the isolated form.','Example: هُدَى begins with Hāʾ.']),
('WĀW','و','w / ū','w — like w in water; it can also carry the long vowel ū.','Round the lips for w. For long ū, hold the rounded vowel smoothly.','Both lips.','Voiced.','Light.','Do not pronounce consonantal و as v.',('ﻭ','—','—','ﻮ'),('وَرْد','Ward','Rose'),['Wāw does not connect to a following letter on its left.','As a consonant it sounds w.','After ḍammah, a vowelless و can represent long ū.','Example: وَرْد begins with consonantal Wāw.']),
('YĀʾ','ي','y / ī','y — like y in yes; it can also carry the long vowel ī.','Raise the middle of the tongue toward the hard palate without fully blocking the air.','Middle of tongue toward the hard palate.','Voiced.','Light.','Do not pronounce consonantal ي as the English long-i sound in my.',('ﻱ','ﻳ','ﻴ','ﻲ'),('يَد','Yad','Hand'),['Two dots below identify ي in most positions.','Yāʾ connects on both sides.','After kasrah, a vowelless ي can represent long ī.','Example: يَد begins with consonantal Yāʾ.']),
]

def render(card, idx):
    name,letter,tr,say,mouth,source,voice,weight,avoid,forms,ex,notes=card
    img=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(img)
    # current deck-style inset double border
    d.rounded_rectangle((20,20,980,1380),radius=42,outline=GOLD,width=6)
    d.rounded_rectangle((34,34,966,1366),radius=34,outline=GREEN,width=3)
    # header
    d.text((62,57),f'{idx}. {name}',font=F(FONT_B,52),fill=GREEN)
    d.text((938,66),'ARABIC  •  ALPHABET',font=F(FONT_B,27),fill=GOLD,anchor='ra')
    d.text((938,105),'Hanafi Learning Deck',font=F(FONT_R,26),fill=BLACK,anchor='ra')
    d.line((56,164,944,164),fill=GOLD,width=2)
    # upper body divider
    d.line((410,205,410,758),fill=GOLD,width=2)
    # left letter block
    d.text((235,330),letter,font=F(FONT_AR,245),fill=BLACK,anchor='mm',direction='rtl')
    d.text((235,510),name.title(),font=F(FONT_B,54),fill=GREEN,anchor='ma')
    # Arabic letter name approximated from data map below
    ar_names={'ALIF':'أَلِف','BĀʾ':'بَاء','TĀʾ':'تَاء','THĀʾ':'ثَاء','JĪM':'جِيم','ḤĀʾ':'حَاء','KHĀʾ':'خَاء','DĀL':'دَال','DHĀL':'ذَال','RĀʾ':'رَاء','ZĀY':'زَاي','SĪN':'سِين','SHĪN':'شِين','ṢĀD':'صَاد','ḌĀD':'ضَاد','ṬĀʾ':'طَاء','ẒĀʾ':'ظَاء','ʿAYN':'عَيْن','GHAYN':'غَيْن','FĀʾ':'فَاء','QĀF':'قَاف','KĀF':'كَاف','LĀM':'لَام','MĪM':'مِيم','NŪN':'نُون','HĀʾ':'هَاء','WĀW':'وَاو','YĀʾ':'يَاء'}
    d.text((235,585),ar_names[name],font=F(FONT_AR,61),fill=BLACK,anchor='ma',direction='rtl')
    d.text((235,670),'Transliteration:',font=F(FONT_B,24),fill=GOLD,anchor='ma')
    d.text((235,710),tr,font=F(FONT_B,40),fill=BLACK,anchor='ma')
    # right pronunciation rows: auto-fit so no text can collide with the divider
    label_x=438; body_x=585; maxw=350
    rows=[('SAY IT:',say,GREEN),('MOUTH:',mouth,GREEN),('SOURCE:',source,GREEN),('VOICE:',voice,GREEN),('WEIGHT:',weight,GREEN),('AVOID:',avoid,RED)]
    label_font=F(FONT_B,27)
    def upper_height(fs):
        test=Image.new('RGB',(10,10)); td=ImageDraw.Draw(test)
        y0=205
        font=F(FONT_R,fs)
        for lab,txt,col in rows:
            lines=wrap(td,txt,font,maxw)
            box=td.textbbox((0,0),'Ag',font=font)
            lh=box[3]-box[1]
            block=max(58, len(lines)*(lh+6))
            y0 += block + 13
        return y0
    body_fs=24
    while body_fs>18 and upper_height(body_fs)>758:
        body_fs-=1
    body_font=F(FONT_R,body_fs)
    y=205
    for lab,txt,col in rows:
        d.text((label_x,y),lab,font=label_font,fill=col)
        lines=wrap(d,txt,body_font,maxw)
        box=d.textbbox((0,0),'Ag',font=body_font)
        lh=box[3]-box[1]
        for j,line in enumerate(lines):
            d.text((body_x,y+j*(lh+6)),line,font=body_font,fill=BLACK)
        block=max(58, len(lines)*(lh+6))
        y += block + 13
    # Letter forms section
    d.line((56,782,944,782),fill=GOLD,width=2)
    d.text((60,797),'Letter Forms',font=F(FONT_B,34),fill=GREEN)
    labels=['Isolated','Beginning','Middle','Ending']
    centers=[165,375,625,835]
    for x in [280,500,750]: d.line((x,842,x,990),fill=(185,170,130),width=1)
    for lab,x,glyph in zip(labels,centers,forms):
        d.text((x,850),lab,font=F(FONT_B,23),fill=BLACK,anchor='ma')
        if glyph=='—':
            d.text((x,920),'—',font=F(FONT_B,43),fill=GREY,anchor='ma')
            d.text((x,958),'does not join',font=F(FONT_R,17),fill=GREY,anchor='ma')
        else:
            d.text((x,920),glyph,font=F(FONT_AR,72),fill=BLACK,anchor='mm',direction='rtl')
    # bottom
    d.line((56,1005,944,1005),fill=GOLD,width=2)
    d.line((410,1020,410,1330),fill=GOLD,width=2)
    d.text((60,1023),'Example Word',font=F(FONT_B,33),fill=GREEN)
    ex_ar,ex_tr,ex_en=ex
    d.text((235,1124),ex_ar,font=F(FONT_AR,86),fill=BLACK,anchor='mm',direction='rtl')
    d.text((235,1215),ex_tr,font=F(FONT_B,40),fill=BLACK,anchor='ma')
    d.text((235,1267),ex_en,font=F(FONT_R,32),fill=BLACK,anchor='ma')
    d.text((438,1023),'Notes',font=F(FONT_B,33),fill=GREEN)
    # Auto-fit notes into the available lower-right panel.
    def notes_height(fs):
        td=ImageDraw.Draw(Image.new('RGB',(10,10)))
        font=F(FONT_R,fs)
        yy=1070
        box=td.textbbox((0,0),'Ag',font=font)
        lh=box[3]-box[1]
        for note in notes:
            lines=wrap(td,note,font,450)
            yy += len(lines)*(lh+4) + 10
        return yy
    notes_fs=21
    while notes_fs>17 and notes_height(notes_fs)>1320:
        notes_fs-=1
    nf=F(FONT_R,notes_fs)
    bullet_font=F(FONT_B,max(21,notes_fs+3))
    y=1070
    box=d.textbbox((0,0),'Ag',font=nf)
    lh=box[3]-box[1]
    for note in notes:
        d.text((448,y),'•',font=bullet_font,fill=BLACK)
        lines=wrap(d,note,nf,450)
        for j,line in enumerate(lines):
            d.text((478,y+j*(lh+4)),line,font=nf,fill=BLACK)
        y += len(lines)*(lh+4) + 10
    # footer version marker, subtle
    d.text((500,1340),'Hanafi Learning Deck v1.5 • Arabic Alphabet Expansion',font=F(FONT_R,16),fill=(85,80,70),anchor='ma')
    return img

manifest=[]
for i,c in enumerate(L,1):
    img=render(c,i)
    slug=c[0].lower().replace('ā','a').replace('ī','i').replace('ū','u').replace('ʾ','').replace('ḥ','h').replace('khā','kha').replace('dhā','dha').replace('ṣ','s').replace('ḍ','d').replace('ṭ','t').replace('ẓ','z').replace('ʿ','').replace(' ','_')
    fn=f'card_{i:03d}_{slug}.png'
    path=CARDS/fn; img.save(path,optimize=True)
    sha=hashlib.sha256(path.read_bytes()).hexdigest()
    manifest.append((i,fn,c[0],sha,path.stat().st_size))

# 4-card sheets (2x2)
for si,start in enumerate(range(0,len(manifest),4),1):
    sheet=Image.new('RGB',(W*2,H*2),'white')
    for j,item in enumerate(manifest[start:start+4]):
        im=Image.open(CARDS/item[1]).convert('RGB')
        sheet.paste(im,((j%2)*W,(j//2)*H))
    sheet.save(SHEETS/f'sheet_{si:02d}.png',optimize=True)

# contact sheet 4x7 at 250x350
thumbw,thumbh=250,350
contact=Image.new('RGB',(thumbw*4,thumbh*7),'white')
for j,item in enumerate(manifest):
    im=Image.open(CARDS/item[1]).convert('RGB').resize((thumbw,thumbh),Image.Resampling.LANCZOS)
    contact.paste(im,((j%4)*thumbw,(j//4)*thumbh))
contact.save(OUT/'contact_sheet.png',optimize=True)

# metadata
(OUT/'MANIFEST.txt').write_text('\n'.join(f'{i:02d}  {fn}  {name}  {size} bytes  sha256 {sha}' for i,fn,name,sha,size in manifest)+'\n',encoding='utf-8')
(OUT/'SOURCE_NOTES.md').write_text('''# Arabic Alphabet Expansion — Source Notes\n\nThis expansion teaches the 28-letter Arabic alphabet with beginner-friendly articulation guidance.\n\nPronunciation descriptions follow standard Arabic phonetics and traditional makhārij terminology used in Qurʾanic recitation. The practical English comparisons are approximations only where a true English equivalent exists.\n\nKey traditional reference point: Ibn al-Jazarī, *al-Muqaddimah al-Jazariyyah*, sections on makhārij al-ḥurūf and ṣifāt al-ḥurūf.\n\nOrthographic joining behavior follows standard Arabic script: ا د ذ ر ز و connect to a preceding letter but do not connect onward to a following letter; the remaining basic alphabet letters connect on both sides when context permits.\n\nFor Alif, the deck distinguishes bare Alif used to carry long ā from hamza (ء), which represents the glottal stop and may be written on or under Alif.\n''',encoding='utf-8')
(OUT/'README.md').write_text('''# Arabic Alphabet Expansion — Hanafi Learning Deck v1.5\n\nA 28-card Arabic alphabet and pronunciation expansion for the Hanafi Learning Deck.\n\nEach card uses the approved low-ink printable format and includes:\n\n- the Arabic letter and name\n- transliteration\n- plain-English pronunciation guidance\n- mouth and articulation instructions\n- voiced/voiceless and light/heavy guidance\n- common pronunciation mistakes to avoid\n- isolated/initial/medial/final forms, with non-joining forms marked clearly\n- a simple example word with transliteration and English meaning\n- concise study notes\n\n## Contents\n\n- `cards/` — 28 individual 1000×1400 PNG cards\n- `sheets/` — 7 four-card printable sheets\n- `contact_sheet.png` — visual overview\n- `MANIFEST.txt` — file list, sizes, and SHA-256 hashes\n- `SOURCE_NOTES.md` — pronunciation and orthography notes\n\nThe expansion is independently numbered from 1–28.\n''',encoding='utf-8')
(OUT/'QA_REPORT.txt').write_text(f'''Hanafi Learning Deck v1.5 — Arabic Alphabet Expansion QA\n\nCards: {len(manifest)}\nNumbering: 1–28 continuous\nCanvas: 1000 x 1400 px\nSheets: 7 four-card sheets\nBorder: inset double border, gold outer / dark-green inner\nHeader: approved Arabic Alphabet layout\nBackground: low-ink cream-white\nArabic font: Noto Naskh Arabic\nJoining rule check: non-joining letters ا د ذ ر ز و marked without initial/medial joining forms\nAlif note: distinguishes long-ā carrier function from hamza\nStatus: generated successfully\n''',encoding='utf-8')
# source JSON for future edits
src=[]
for i,c in enumerate(L,1):
    src.append({'n':i,'name':c[0],'letter':c[1],'translit':c[2],'say_it':c[3],'mouth':c[4],'source':c[5],'voice':c[6],'weight':c[7],'avoid':c[8],'forms':c[9],'example':c[10],'notes':c[11]})
(OUT/'arabic_alphabet_source.json').write_text(json.dumps(src,ensure_ascii=False,indent=2),encoding='utf-8')
# include builder
shutil.copy2('/mnt/data/build_arabic_alphabet_v15.py',OUT/'build_arabic_alphabet_v15.py')
# zip
zip_path=Path('/mnt/data/Hanafi-Arabic-Alphabet-Expansion-v1.5.zip')
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(OUT.rglob('*')):
        if p.is_file(): z.write(p,p.relative_to(OUT.parent))
print('cards',len(manifest),'zip',zip_path,zip_path.stat().st_size)
print('sha256 zip',hashlib.sha256(zip_path.read_bytes()).hexdigest())
