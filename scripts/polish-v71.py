from pathlib import Path
import sys

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")

def apply(path, replacements):
    p = root / path
    text = p.read_text(encoding="utf-8")
    original = text
    for old, new in replacements:
        text = text.replace(old, new)
    if text != original:
        p.write_text(text, encoding="utf-8")
        print(f"POLISHED {path}")
    else:
        print(f"UNCHANGED {path}")

apply("index.html", [
    ("The character becomes a sign.", "A visual identity takes shape."),
    ("人物开始成为一种符号。", "视觉身份逐渐成形。"),
    ("These two works push Rayan closest to a title image: attitude, headphones, frog iconography and hand-painted marks are reduced into a recognizable exhibition language.",
     "Attitude, headphones, frog iconography and hand-painted marks are distilled into a visual signature that can carry the exhibition on its own."),
    ("这两件作品最接近展览的主视觉：情绪、耳机、青蛙符号与手绘痕迹，被压缩成一套容易辨认的展览语言。",
     "情绪、耳机、青蛙符号与手绘痕迹被提炼成一套清晰的视觉签名，也成为整个展览最容易辨认的身份。"),
    ("Across East Asian picture traditions.", "Across ink and print traditions."),
    ("进入东方绘画与版画语言。", "在水墨与版画之间。"),
    ("Mineral-pigment mural language meets the formal gravity of an old-master portrait. The costumes stay familiar while the pictorial rules change completely.",
     "Mineral-pigment mural language meets the formal gravity of an old-master portrait. The familiar RAYAN silhouette remains, while the pictorial rules change completely."),
    ("矿物颜料般的壁画质感，与古典油画肖像的庄重相遇。服装仍然熟悉，但画面的规则已经完全改变。",
     "矿物颜料般的壁画质感，与古典油画肖像的庄重相遇。熟悉的 RAYAN 造型仍在，但画面的规则已经完全改变。"),
    ("The figure before the fiction.", "The portrait comes first."),
    ("故事之前的角色。", "先看人物本身。"),
    ("Here Rayan is not photographed beside a celebrity. He is the celebrity: red carpet, dressing mirror, backstage wait, lounge, spotlight and return to stage.",
     "Red carpet, dressing mirror, backstage wait, lounge and spotlight turn RAYAN into the night’s only headliner. Eight works share one visual language of black, gold, velvet red and frog green."),
    ("Use the official wall full-screen, or create a personalized museum check-in card below. Your photo stays in your browser while the card is generated. It is uploaded only if you choose POST TO VISITOR WALL.",
     "Open the official photo wall full-screen, or create a personalized museum check-in card below. Your photo stays in your browser while the card is generated; it is uploaded only if you choose POST TO VISITOR WALL."),
    ("可以全屏使用官方打卡墙，也可以制作个人观展卡片。照片生成卡片时只保留在浏览器中，只有点击“发布到访客墙”后才会上传。",
     "可以全屏打开官方打卡墙，也可以在下方制作个人观展卡片。照片在生成卡片时只保留在你的浏览器中；只有点击“发布到访客墙”后才会上传。"),
])

# Cache-bust the Starlight Chamber assets so browsers do not retain the earlier 404 responses.
p = root / "index.html"
text = p.read_text(encoding="utf-8")
for name in ["star-kv.webp", "star01.webp", "star02.webp", "star03.webp", "star04.webp", "star05.webp", "star06.webp", "star07.webp", "star08.webp"]:
    text = text.replace(f"assets/images/curated/{name}\"", f"assets/images/curated/{name}?v=20260929b\"")
p.write_text(text, encoding="utf-8")
print("CACHE-BUSTED Starlight Chamber")

apply("archive.html", [
    ("The archive keeps a compact record of the exhibition after the live viewing window: early transformations, everyday scenes and a small curator selection. Hidden after-hours rooms remain part of the live museum route.",
     "The archive preserves a compact record of the exhibition: early studies, everyday scenes and a small curator selection. The hidden after-hours route remains inside the museum experience rather than the public archive.")
])

apply("opening-night.html", [
    ("A one-night ceremonial route through <b>Same Kid, Different World</b>: ticket validation, public galleries, a limited Special Exhibition label, an unlisted Room 00, the official photo wall and the visitor book.",
     "A one-night ceremonial route through <b>Same Kid, Different World</b>: ticket validation, public galleries, Photo Salon, an after-hours threshold, the official check-in wall and the visitor book. A hidden route remains off the public map."),
    ("SPECIAL EXHIBITION / PRIVATE SELECTION", "PHOTO SALON / CURATOR SELECTION"),
    ("PHOTO WALL / VISITOR BOOK", "AFTER HOURS / CHECK-IN & VISITOR BOOK")
])
