from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "tmp" / "video-frames"
OUT = ROOT / "assets" / "altikod-demo.mp4"
POSTER = ROOT / "assets" / "altikod-demo-poster.png"

WIDTH, HEIGHT = 1280, 720
FPS = 24
DURATION = 9

BRAND = "#ce4e4d"
CREAM = "#fffdf5"
INK = "#000000"
YELLOW = "#ffd93d"
VIOLET = "#c4b5fd"
WHITE = "#ffffff"


def font(size: int, black: bool = True) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/ariblk.ttf") if black else Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


F_LOGO = font(42)
F_H1 = font(46)
F_H2 = font(36)
F_BODY = font(30, black=False)
F_SMALL = font(24, black=False)
F_TAG = font(26)


SCENES = [
    {
        "title": "DIJITAL\nDONUSUM",
        "accent": "ALTIKOD ILE\nHIZLANIR",
        "body": "Yazilim, yapay zeka ve entegrasyon cozumleri tek akista.",
        "chips": ["AI", "WEB + MOBIL", "WHATSAPP"],
        "color": YELLOW,
    },
    {
        "title": "AI\nAJANLAR",
        "accent": "7/24\nCALISIR",
        "body": "Chatbot, RAG, sesli asistan ve surec analiziyle ekip yukunu azaltin.",
        "chips": ["RAG", "CHATBOT", "SES ANALIZI"],
        "color": BRAND,
    },
    {
        "title": "WHATSAPP",
        "accent": "DESTEK VE\nSATIS",
        "body": "Randevu, bildirim, siparis ve musteri yonlendirme akislari.",
        "chips": ["DESTEK", "RANDEVU", "BILDIRIM"],
        "color": YELLOW,
    },
    {
        "title": "ENTEGRASYON",
        "accent": "SISTEMLER\nKONUSUR",
        "body": "ERP, CRM, odeme, raporlama ve operasyon verileri birlesir.",
        "chips": ["ERP", "CRM", "API"],
        "color": VIOLET,
    },
]


def wrap(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_text_block(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font_obj, fill: str, max_width: int, line_gap: int = 8) -> int:
    x, y = xy
    lines: list[str] = []
    for paragraph in text.splitlines():
        lines.extend(wrap(draw, paragraph, font_obj, max_width))
    for line in lines:
        draw.text((x, y), line, font=font_obj, fill=fill)
        y += draw.textbbox((0, 0), line, font=font_obj)[3] + line_gap
    return y


def draw_centered_block(
    draw: ImageDraw.ImageDraw,
    box_xy: tuple[int, int, int, int],
    text: str,
    font_obj,
    fill: str,
    line_gap: int = 4,
) -> None:
    x1, y1, x2, y2 = box_xy
    lines = text.splitlines()
    heights = [draw.textbbox((0, 0), line, font=font_obj)[3] for line in lines]
    total_height = sum(heights) + line_gap * max(0, len(lines) - 1)
    y = y1 + max(0, (y2 - y1 - total_height) // 2)
    for line, line_height in zip(lines, heights):
        width = draw.textbbox((0, 0), line, font=font_obj)[2]
        draw.text((x1 + max(0, (x2 - x1 - width) // 2), y), line, font=font_obj, fill=fill)
        y += line_height + line_gap


def box(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], fill: str, shadow: int = 10, border: int = 6) -> None:
    x1, y1, x2, y2 = xy
    draw.rectangle((x1 + shadow, y1 + shadow, x2 + shadow, y2 + shadow), fill=INK)
    draw.rectangle(xy, fill=fill, outline=INK, width=border)


def draw_grid(draw: ImageDraw.ImageDraw) -> None:
    for x in range(0, WIDTH + 1, 40):
        draw.line((x, 0, x, HEIGHT), fill="#e8e1d5", width=1)
    for y in range(0, HEIGHT + 1, 40):
        draw.line((0, y, WIDTH, y), fill="#e8e1d5", width=1)
    for x in range(28, WIDTH, 40):
        for y in range(28, HEIGHT, 40):
            draw.rectangle((x, y, x + 3, y + 3), fill=INK)


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def draw_scene(draw: ImageDraw.ImageDraw, scene: dict[str, object], local_frame: int) -> None:
    enter = ease(local_frame / 16)
    offset = int((1 - enter) * 70)

    box(draw, (64, 54, 404, 154), BRAND)
    draw.text((88, 78), "ALTIKOD", font=F_LOGO, fill=WHITE)
    draw.text((90, 122), "DIGITAL SOLUTIONS", font=F_SMALL, fill=WHITE)

    title_fill = WHITE if scene["color"] == BRAND else INK
    box(draw, (74 - offset, 188, 764 - offset, 420), str(scene["color"]))
    draw_centered_block(draw, (106 - offset, 216, 732 - offset, 314), str(scene["title"]), F_H1, title_fill, 0)
    draw_centered_block(draw, (112 - offset, 326, 726 - offset, 396), str(scene["accent"]), F_H2, title_fill, 2)

    box(draw, (88, 448, 764, 622), WHITE)
    draw.rectangle((120, 484, 132, 586), fill=BRAND)
    draw_text_block(draw, (164, 478), str(scene["body"]), F_BODY, INK, 530, 10)

    box(draw, (838 + offset, 98, 1198 + offset, 604), VIOLET)
    draw.text((884 + offset, 150), "SUPER", font=F_H2, fill=INK)
    draw.text((884 + offset, 214), "FAST", font=F_H1, fill=INK)
    draw.line((882 + offset, 304, 1154 + offset, 304), fill=INK, width=6)

    chip_y = 340
    for chip in scene["chips"]:
        box(draw, (876 + offset, chip_y, 1160 + offset, chip_y + 62), YELLOW if chip_y != 340 else BRAND, shadow=6, border=5)
        draw.text((906 + offset, chip_y + 16), str(chip), font=F_TAG, fill=WHITE if chip_y == 340 else INK)
        chip_y += 82


def make_frame(frame: int) -> Image.Image:
    img = Image.new("RGB", (WIDTH, HEIGHT), CREAM)
    draw = ImageDraw.Draw(img)
    draw_grid(draw)

    scene_length = FPS * 2
    scene_index = min(len(SCENES) - 1, frame // scene_length)
    local_frame = frame - scene_index * scene_length
    draw_scene(draw, SCENES[scene_index], local_frame)

    progress_w = int((frame / (FPS * DURATION - 1)) * 1090)
    box(draw, (94, 646, 1186, 680), WHITE, shadow=5, border=5)
    draw.rectangle((104, 656, 104 + progress_w, 670), fill=BRAND)

    if frame > FPS * 8:
        alpha = ease((frame - FPS * 8) / FPS)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (206, 78, 77, int(alpha * 245)))
        img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
        draw = ImageDraw.Draw(img)
        box(draw, (250, 224, 1030, 492), YELLOW, shadow=14, border=7)
        draw.text((342, 292), "DEMO TALEP EDIN", font=F_H1, fill=INK)
        draw.text((390, 386), "Altikod Digital Solutions", font=F_H2, fill=INK)

    return img


def main() -> None:
    if FRAMES.exists():
        shutil.rmtree(FRAMES)
    FRAMES.mkdir(parents=True)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    total = FPS * DURATION
    for frame in range(total):
        image = make_frame(frame)
        image.save(FRAMES / f"frame-{frame:04d}.png")
        if frame == 18:
            image.save(POSTER)

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(FRAMES / "frame-%04d.png"),
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            str(OUT),
        ],
        check=True,
    )
    shutil.rmtree(FRAMES)
    print(OUT)


if __name__ == "__main__":
    main()
