from pathlib import Path
import re

p = Path('README.md')
s = p.read_text(encoding='utf-8')

downloads = '''## Downloads\n\n- **Complete current v1.4 R2 ZIP:** https://github.com/dereksparks1982/Hanafi-Islam-Learning-Deck/archive/refs/heads/main.zip\n- **Main Deck, Cards 1–146:** https://github.com/dereksparks1982/Hanafi-Islam-Learning-Deck/tree/main/cards\n- **Sacred Places, Cards 1–19:** https://github.com/dereksparks1982/Hanafi-Islam-Learning-Deck/tree/main/Sacred-Places-Expansion\n- **Printable sheets:** https://github.com/dereksparks1982/Hanafi-Islam-Learning-Deck/tree/main/sheets\n- **Optional card back:** https://github.com/dereksparks1982/Hanafi-Islam-Learning-Deck/blob/main/card-back/card-back.jpg\n\n'''

s = re.sub(r'## Current Downloads\n.*?(?=## Introduction\n)', downloads, s, flags=re.S)
s = re.sub(r'## Downloads\n.*?(?=## Introduction\n)', downloads, s, flags=re.S)
s = re.sub(r'### Current Sacred Places v1\.4 R2 Files\n.*?(?=## 99 Names of Allah Expansion\n)', '', s, flags=re.S)
s = s.replace('Expansion packs remain separate so learners can download, print, and add only the sets they want.', 'Expansion packs remain separate so learners can print and add only the sets they want.')
s = s.replace('The download will be added when the v1.4 rebuild is complete.', 'It will be added when the v1.4 rebuild is complete.')
s = s.replace('- Published the expansion as its own downloadable ZIP\n', '')

before, rest = s.split('## Downloads\n', 1)
dl_body, after = rest.split('## Introduction\n', 1)
for token in ['archive/refs/heads/main.zip','/tree/main/cards','/tree/main/Sacred-Places-Expansion','/tree/main/sheets','/blob/main/card-back/card-back.jpg']:
    assert token not in before
    assert token not in after

p.write_text(s, encoding='utf-8')
