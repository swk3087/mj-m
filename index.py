import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone, UTC

current_date = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%S+00:00")
kst = timezone(timedelta(hours=9))
now_kst = datetime.now(kst).isoformat(timespec='seconds')

current_dir = os.path.dirname(os.path.abspath(__file__))
sitemap_path = os.path.join(current_dir, "public", "sitemap.xml")

try:
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    for url in root.findall("url"):
        lastmod = url.find("lastmod")
        if lastmod is not None:
            lastmod.text = current_date
    tree.write(sitemap_path, encoding="utf-8", xml_declaration=True)
    print(f"✅ sitemap.xml의 lastmod가 최신 날짜({current_date})로 업데이트되었습니다.")
except FileNotFoundError:
    print(f"❌ 오류: 'public/sitemap.xml' 파일을 찾을 수 없습니다. 경로를 확인하세요 → {sitemap_path}")

index_path = os.path.join(current_dir, "public", "index.html")
pattern_published = r'("datePublished"\s*:\s*")([^"]+)(")'
pattern_modified = r'("dateModified"\s*:\s*")([^"]+)(")'

try:
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(pattern_published, r'\1' + now_kst + r'\3', content)
    content = re.sub(pattern_modified, r'\1' + now_kst + r'\3', content)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ index.html의 날짜가 현재 한국 시간({now_kst})으로 업데이트되었습니다.")
except FileNotFoundError:
    print(f"❌ 오류: 'public/index.html' 파일을 찾을 수 없습니다. 경로를 확인하세요 → {index_path}")
