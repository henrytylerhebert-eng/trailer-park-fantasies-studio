#!/usr/bin/env python3
"""
build_graphic_novel.py
======================
Populate a `graphic_novel.html` template's `<!-- Page N content goes here -->`
placeholders with prose + artwork produced by the autonovel / AuthorClaw pipeline.

It also can GENERATE a fresh template scaffold so you can test the whole flow
before wiring in real content.

------------------------------------------------------------------------------
USAGE
------------------------------------------------------------------------------
  # 1) Make a blank 150-page template scaffold:
  python build_graphic_novel.py --make-template 150 --template graphic_novel.html

  # 2) Populate it from autonovel outputs:
  python build_graphic_novel.py \
      --template graphic_novel.html \
      --chapters ./chapters \
      --art ./art \
      --page-art ./page_art \
      --out graphic_novel_final.html

------------------------------------------------------------------------------
EXPECTED INPUTS (autonovel defaults — all configurable via flags)
------------------------------------------------------------------------------
  chapters/ch_01.md, ch_02.md, ...     prose, Markdown
  art/cover.png                        front cover
  art/ornament_ch01.png, ...           per-chapter opener ornament
  art/scene_break.png                  divider used at "* * *" / "---" breaks
  page_art/page_007.png, ...           OPTIONAL full-page GTA-style art keyed by
                                       1-based page number (drop these in yourself)

Placeholder format in the template (one per page, any whitespace tolerated):
  <!-- Page 12 content goes here -->
"""

import argparse, base64, html, mimetypes, re, sys
from pathlib import Path

# ----------------------------- CONFIG DEFAULTS -----------------------------
WORDS_PER_PAGE      = 230     # rough target prose per page; tune to your layout
EMBED_IMAGES_BASE64 = True    # True -> single portable HTML file you can text/email
SCENE_BREAK_TOKENS  = ("* * *", "***", "---", "— — —")
# ---------------------------------------------------------------------------

PLACEHOLDER_RE = re.compile(r"<!--\s*Page\s+(\d+)\s+content goes here\s*-->", re.I)


# ============================ markdown -> html =============================
def md_to_html(text: str) -> str:
    """Minimal, dependency-free Markdown for prose: headings, emphasis, paragraphs."""
    out, in_para = [], []
    def flush():
        if in_para:
            joined = " ".join(in_para).strip()
            if joined:
                out.append(f"<p>{inline(joined)}</p>")
            in_para.clear()
    def inline(s):
        s = html.escape(s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", s)
        s = re.sub(r"_(.+?)_", r"<em>\1</em>", s)
        return s
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            flush(); continue
        if line.strip() in SCENE_BREAK_TOKENS:
            flush(); out.append('<div class="scene-break" data-break="1"></div>'); continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush(); lvl = len(m.group(1))
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>"); continue
        in_para.append(line.strip())
    flush()
    return "\n".join(out)


# ============================ content streaming ============================
class Block:
    """A renderable unit with an approximate 'weight' in words."""
    def __init__(self, html_str, weight, kind="prose", hard_break=False):
        self.html, self.weight, self.kind, self.hard_break = html_str, weight, kind, hard_break


def chapter_title_block(num, title):
    inner = f'<div class="chapter-opener"><span class="ch-num">Chapter {num}</span>'
    if title:
        inner += f'<h1 class="ch-title">{html.escape(title)}</h1>'
    inner += "</div>"
    return Block(inner, WORDS_PER_PAGE, kind="chapter", hard_break=True)


def build_blocks(chapters_dir: Path, art_dir: Path, embed):
    """Turn chapter markdown into an ordered list of Blocks."""
    blocks = []
    files = sorted(chapters_dir.glob("ch_*.md"))
    if not files:
        print(f"  [warn] no ch_*.md found in {chapters_dir}", file=sys.stderr)
    for f in files:
        num = int(re.search(r"ch_(\d+)", f.name).group(1))
        text = f.read_text(encoding="utf-8")
        # pull a title from a leading "# Title" if present
        title = ""
        mt = re.match(r"^\s*#\s+(.*)", text)
        if mt:
            title = mt.group(1).strip(); text = text[mt.end():]
        blocks.append(chapter_title_block(num, title))
        # optional chapter ornament under the title
        orn = art_dir / f"ornament_ch{num:02d}.png"
        if orn.exists():
            blocks.append(Block(img_tag(orn, embed, cls="ornament", alt=f"Chapter {num} ornament"),
                                weight=60, kind="art"))
        # split body into paragraph/scene-break blocks
        body = md_to_html(text)
        for chunk in re.split(r'(<div class="scene-break"[^>]*></div>)', body):
            if not chunk.strip():
                continue
            if chunk.startswith('<div class="scene-break"'):
                sb = art_dir / "scene_break.png"
                if sb.exists():
                    blocks.append(Block(img_tag(sb, embed, cls="scene-break-img",
                                                alt="scene break"), weight=40, kind="art"))
                else:
                    blocks.append(Block('<div class="scene-break-glyph">· · ·</div>', 40, "art"))
            else:
                words = len(re.findall(r"\w+", re.sub(r"<[^>]+>", " ", chunk)))
                blocks.append(Block(chunk, max(words, 20), kind="prose"))
    return blocks


# ================================ images ===================================
def img_tag(path: Path, embed, cls="", alt=""):
    cls_attr = f' class="{cls}"' if cls else ""
    if embed:
        mime = mimetypes.guess_type(str(path))[0] or "image/png"
        data = base64.b64encode(path.read_bytes()).decode()
        src = f"data:{mime};base64,{data}"
    else:
        src = str(path)
    return f'<img{cls_attr} src="{src}" alt="{html.escape(alt)}" loading="lazy">'


# ============================ pagination engine ============================
def paginate(blocks, page_numbers, page_art_dir, embed):
    """Flow blocks across the available page placeholders by word weight."""
    pages = {n: [] for n in page_numbers}
    order = sorted(page_numbers)
    idx, budget = 0, WORDS_PER_PAGE
    cur = order[idx]

    def advance():
        nonlocal idx, budget, cur
        idx += 1
        if idx >= len(order):
            return False
        cur = order[idx]; budget = WORDS_PER_PAGE
        return True

    overflow = []
    for b in blocks:
        if b.hard_break and pages[cur]:
            if not advance():
                overflow.append(b); continue
        if b.weight > budget and pages[cur] and b.kind != "art":
            if not advance():
                overflow.append(b); continue
        pages[cur].append(b.html)
        budget -= b.weight
        if budget <= 0:
            if not advance():
                budget = WORDS_PER_PAGE  # keep stacking on last page

    # overlay optional per-page GTA art
    if page_art_dir and page_art_dir.exists():
        for p in order:
            art = page_art_dir / f"page_{p:03d}.png"
            if art.exists():
                pages[p].insert(0, img_tag(art, embed, cls="page-art",
                                           alt=f"page {p} art"))
    return pages, overflow


# =============================== rendering =================================
def populate(template_path, out_path, chapters_dir, art_dir, page_art_dir, embed):
    tpl = template_path.read_text(encoding="utf-8")
    page_numbers = [int(m.group(1)) for m in PLACEHOLDER_RE.finditer(tpl)]
    if not page_numbers:
        sys.exit("No `<!-- Page N content goes here -->` placeholders found in template.")
    print(f"  template has {len(page_numbers)} page placeholders "
          f"({min(page_numbers)}–{max(page_numbers)})")

    blocks = build_blocks(chapters_dir, art_dir, embed)
    print(f"  built {len(blocks)} content blocks from chapters")

    # cover onto the first page if available
    cover = art_dir / "cover.png"
    if cover.exists():
        first = min(page_numbers)
        blocks.insert(0, Block(img_tag(cover, embed, cls="cover", alt="cover"),
                               weight=WORDS_PER_PAGE, kind="art", hard_break=True))

    pages, overflow = paginate(blocks, page_numbers, page_art_dir, embed)

    def repl(m):
        n = int(m.group(1))
        content = "\n".join(pages.get(n, []))
        return content if content.strip() else '<div class="blank-page"></div>'
    result = PLACEHOLDER_RE.sub(repl, tpl)
    out_path.write_text(result, encoding="utf-8")

    filled = sum(1 for n in page_numbers if pages[n])
    print(f"  filled {filled}/{len(page_numbers)} pages")
    if overflow:
        print(f"  [warn] {len(overflow)} blocks overflowed — add pages or raise "
              f"WORDS_PER_PAGE ({WORDS_PER_PAGE})", file=sys.stderr)
    print(f"  wrote {out_path}  ({out_path.stat().st_size//1024} KB)")


# ========================= template scaffold maker =========================
def make_template(n, path):
    pages = "\n".join(
        f'    <section class="page" id="page-{i}">\n'
        f'      <!-- Page {i} content goes here -->\n'
        f'      <span class="folio">{i}</span>\n    </section>'
        for i in range(1, n + 1)
    )
    doc = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Trailer Park Fantasies</title>
<style>
  :root {{ --ink:#2b2230; --paper:#faf5ef; --rose:#d4627a; --gold:#c49b5c; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:#15101c; color:var(--ink);
         font-family:Georgia,'Times New Roman',serif; }}
  .page {{ position:relative; width:min(820px,94vw); min-height:1160px;
          margin:28px auto; padding:64px 70px; background:var(--paper);
          box-shadow:0 18px 50px rgba(0,0,0,.45); border-radius:4px; overflow:hidden; }}
  .page img {{ max-width:100%; height:auto; border-radius:3px; display:block;
              margin:18px auto; }}
  img.cover, img.page-art {{ width:100%; margin:0 0 22px; border-radius:0; }}
  .chapter-opener {{ text-align:center; margin:120px 0 30px; }}
  .ch-num {{ letter-spacing:6px; text-transform:uppercase; font-size:14px;
            color:var(--gold); font-family:'DM Sans',sans-serif; }}
  .ch-title {{ font-size:40px; font-style:italic; color:var(--rose); margin:.3em 0; }}
  .page p {{ line-height:1.75; font-size:18px; margin:0 0 1.1em; text-indent:1.4em; }}
  .page p:first-of-type {{ text-indent:0; }}
  .ornament {{ width:120px !important; margin:8px auto 26px; }}
  .scene-break-img {{ width:90px !important; margin:26px auto; }}
  .scene-break-glyph {{ text-align:center; color:var(--gold); letter-spacing:8px;
                        margin:26px 0; }}
  .folio {{ position:absolute; bottom:28px; left:0; right:0; text-align:center;
           font-size:12px; color:#b8a99e; font-family:'DM Sans',sans-serif; }}
  .blank-page {{ min-height:600px; }}
  h1,h2,h3 {{ font-style:italic; color:var(--rose); }}
</style></head>
<body>
  <main class="book">
{pages}
  </main>
</body></html>"""
    path.write_text(doc, encoding="utf-8")
    print(f"  wrote template scaffold with {n} pages -> {path}")


# ================================== CLI ====================================
def main():
    global WORDS_PER_PAGE
    ap = argparse.ArgumentParser(description="Build the Trailer Park Fantasies graphic novel HTML.")
    ap.add_argument("--make-template", type=int, metavar="N",
                    help="generate a blank N-page template and exit")
    ap.add_argument("--template", type=Path, default=Path("graphic_novel.html"))
    ap.add_argument("--chapters", type=Path, default=Path("chapters"))
    ap.add_argument("--art", type=Path, default=Path("art"))
    ap.add_argument("--page-art", type=Path, default=Path("page_art"))
    ap.add_argument("--out", type=Path, default=Path("graphic_novel_final.html"))
    ap.add_argument("--words-per-page", type=int, default=WORDS_PER_PAGE)
    ap.add_argument("--link-images", action="store_true",
                    help="reference images by path instead of base64-embedding them")
    a = ap.parse_args()

    WORDS_PER_PAGE = a.words_per_page
    embed = not a.link_images

    if a.make_template:
        make_template(a.make_template, a.template); return
    if not a.template.exists():
        sys.exit(f"template not found: {a.template} (run --make-template first)")
    print("Building graphic novel:")
    populate(a.template, a.out, a.chapters, a.art, a.page_art, embed)


if __name__ == "__main__":
    main()
