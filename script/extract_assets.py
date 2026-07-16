#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
像素素材展示图切分工具

适用于本项目的 1536x1024 spritesheet.png，也支持其它尺寸的图片。

核心策略：
1. 按语义区域限定检测范围，避免把标题、分隔线和相邻模块混进来。
2. 通过局部背景差分提取前景，而不是假设图片有透明背景。
3. 使用形态学闭运算连接同一角色中相邻但未接触的像素块。
4. 对候选包围盒进行合并、补边、空白裁剪和调试可视化。
5. 自动结果不理想时，可用 --manual 进入鼠标框选模式。

依赖：
    pip install pillow opencv-python numpy

常用命令：
    python extract_assets.py spritesheet.png
    python extract_assets.py spritesheet.png --only hero npc icons
    python extract_assets.py spritesheet.png --manual
    python extract_assets.py spritesheet.png --clean

输出：
    assets/<分类>/*.png
    assets/_debug/detection_overlay.png
    assets/_debug/contact_sheet.png
    assets/_debug/manifest.json
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, Sequence

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont


@dataclass(frozen=True)
class Region:
    name: str
    folder: str
    box: tuple[int, int, int, int]  # left, top, right, bottom
    min_area: int = 30
    max_area: int = 10000
    min_w: int = 4
    min_h: int = 4
    max_w: int = 180
    max_h: int = 180
    merge_x: int = 5
    merge_y: int = 5
    close_kernel: tuple[int, int] = (3, 3)
    pad: int = 3
    expected: int | None = None
    sort_mode: str = "row"
    remove_gold: bool = True


# 针对用户提供的 1536x1024 展示图校准。
# 坐标只用于限定“检测区域”，不是直接把每个精灵硬裁出来。
REGIONS_1536: tuple[Region, ...] = (
    Region(
        "hero_walk_down",
        "characters/hero/walk_down",
        (642, 38, 958, 106),
        min_area=80,
        max_area=2600,
        min_w=12,
        min_h=25,
        max_w=55,
        max_h=62,
        merge_x=8,
        merge_y=8,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "hero_walk_up",
        "characters/hero/walk_up",
        (642, 103, 958, 169),
        min_area=80,
        max_area=2600,
        min_w=12,
        min_h=25,
        max_w=55,
        max_h=62,
        merge_x=8,
        merge_y=8,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "hero_actions",
        "characters/hero/actions",
        (642, 173, 958, 255),
        min_area=70,
        max_area=5000,
        min_w=12,
        min_h=20,
        max_w=75,
        max_h=78,
        merge_x=9,
        merge_y=9,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "npc_people",
        "characters/npc/people",
        (974, 23, 1515, 102),
        min_area=90,
        max_area=3500,
        min_w=12,
        min_h=25,
        max_w=60,
        max_h=75,
        merge_x=7,
        merge_y=7,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "npc_animals_objects",
        "characters/npc/animals_objects",
        (974, 104, 1515, 158),
        min_area=35,
        max_area=3500,
        min_w=8,
        min_h=10,
        max_w=70,
        max_h=50,
        merge_x=7,
        merge_y=6,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "icons_top",
        "icons/top",
        (974, 190, 1515, 224),
        min_area=24,
        max_area=1200,
        min_w=7,
        min_h=7,
        max_w=38,
        max_h=34,
        merge_x=4,
        merge_y=4,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "icons_bottom",
        "icons/bottom",
        (974, 228, 1515, 265),
        min_area=20,
        max_area=1200,
        min_w=6,
        min_h=6,
        max_w=40,
        max_h=36,
        merge_x=4,
        merge_y=4,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "cursors",
        "cursor",
        (1242, 315, 1510, 362),
        min_area=35,
        max_area=1800,
        min_w=8,
        min_h=10,
        max_w=52,
        max_h=45,
        merge_x=5,
        merge_y=5,
        close_kernel=(3, 3),
        pad=4,
    ),
    Region(
        "buttons_normal",
        "ui/buttons/normal",
        (1242, 417, 1510, 465),
        min_area=600,
        max_area=15000,
        min_w=70,
        min_h=25,
        max_w=140,
        max_h=48,
        merge_x=4,
        merge_y=4,
        close_kernel=(5, 5),
        pad=2,
    ),
    Region(
        "buttons_states",
        "ui/buttons/states",
        (1242, 480, 1510, 531),
        min_area=400,
        max_area=12000,
        min_w=55,
        min_h=20,
        max_w=115,
        max_h=45,
        merge_x=4,
        merge_y=4,
        close_kernel=(5, 5),
        pad=2,
    ),
    Region(
        "buildings",
        "buildings",
        (13, 617, 625, 715),
        min_area=600,
        max_area=30000,
        min_w=45,
        min_h=45,
        max_w=150,
        max_h=100,
        merge_x=12,
        merge_y=8,
        close_kernel=(7, 7),
        pad=5,
    ),
    Region(
        "decorations",
        "decorations",
        (13, 755, 625, 862),
        min_area=40,
        max_area=6000,
        min_w=7,
        min_h=7,
        max_w=75,
        max_h=80,
        merge_x=6,
        merge_y=6,
        close_kernel=(3, 3),
        pad=4,
    ),
    Region(
        "effects",
        "effects",
        (13, 914, 625, 1014),
        min_area=45,
        max_area=8000,
        min_w=8,
        min_h=8,
        max_w=95,
        max_h=90,
        merge_x=7,
        merge_y=7,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "dynamic_fire",
        "dynamic/fire",
        (653, 786, 758, 872),
        min_area=30,
        max_area=3000,
        min_w=8,
        min_h=10,
        max_w=55,
        max_h=55,
        merge_x=5,
        merge_y=5,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "dynamic_water",
        "dynamic/water",
        (762, 786, 865, 872),
        min_area=30,
        max_area=4000,
        min_w=12,
        min_h=8,
        max_w=100,
        max_h=45,
        merge_x=5,
        merge_y=5,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "dynamic_leaves",
        "dynamic/leaves",
        (875, 786, 994, 872),
        min_area=15,
        max_area=1000,
        min_w=4,
        min_h=4,
        max_w=35,
        max_h=35,
        merge_x=3,
        merge_y=3,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "dynamic_clouds",
        "dynamic/clouds",
        (1006, 786, 1110, 872),
        min_area=25,
        max_area=2500,
        min_w=8,
        min_h=5,
        max_w=70,
        max_h=35,
        merge_x=5,
        merge_y=5,
        close_kernel=(3, 3),
        pad=3,
    ),
    Region(
        "dynamic_stars",
        "dynamic/stars",
        (1116, 786, 1230, 872),
        min_area=8,
        max_area=700,
        min_w=3,
        min_h=3,
        max_w=28,
        max_h=28,
        merge_x=2,
        merge_y=2,
        close_kernel=(2, 2),
        pad=3,
    ),
    Region(
        "dynamic_flag",
        "dynamic/flag",
        (1240, 786, 1334, 872),
        min_area=150,
        max_area=6000,
        min_w=25,
        min_h=25,
        max_w=90,
        max_h=80,
        merge_x=5,
        merge_y=5,
        close_kernel=(5, 5),
        pad=4,
    ),
    Region(
        "dynamic_butterflies",
        "dynamic/butterflies",
        (1340, 786, 1510, 872),
        min_area=10,
        max_area=1000,
        min_w=4,
        min_h=4,
        max_w=35,
        max_h=35,
        merge_x=3,
        merge_y=3,
        close_kernel=(2, 2),
        pad=3,
    ),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="自动/半自动切分像素素材展示图")
    parser.add_argument(
        "image", nargs="?", default="spritesheet.png", help="输入图片路径"
    )
    parser.add_argument("-o", "--output", default="assets", help="输出目录")
    parser.add_argument(
        "--only", nargs="*", help="只处理名称或文件夹包含指定关键词的区域"
    )
    parser.add_argument("--manual", action="store_true", help="使用鼠标手工框选精灵")
    parser.add_argument("--clean", action="store_true", help="运行前清空输出目录")
    parser.add_argument(
        "--no-normalize", action="store_true", help="不把同一分类的图片居中到统一画布"
    )
    parser.add_argument(
        "--scale", type=float, default=1.0, help="调试图显示缩放，不影响输出坐标"
    )
    return parser.parse_args()


def ensure_rgba(path: Path) -> Image.Image:
    if not path.exists():
        raise FileNotFoundError(f"找不到输入图片：{path}")
    return Image.open(path).convert("RGBA")


def clip_box(box: Sequence[int], width: int, height: int) -> tuple[int, int, int, int]:
    l, t, r, b = map(int, box)
    return max(0, l), max(0, t), min(width, r), min(height, b)


def local_background(rgb: np.ndarray) -> np.ndarray:
    """从 ROI 边缘估计局部背景颜色。"""
    h, w = rgb.shape[:2]
    edge = max(2, min(h, w) // 20)
    samples = np.concatenate(
        [
            rgb[:edge].reshape(-1, 3),
            rgb[-edge:].reshape(-1, 3),
            rgb[:, :edge].reshape(-1, 3),
            rgb[:, -edge:].reshape(-1, 3),
        ],
        axis=0,
    )
    # 中位数对少量前景污染更稳健。
    return np.median(samples, axis=0)


def build_foreground_mask(roi_rgba: np.ndarray, region: Region) -> np.ndarray:
    rgb = roi_rgba[:, :, :3].astype(np.int16)
    alpha = roi_rgba[:, :, 3]
    bg = local_background(rgb).astype(np.int16)

    # 与局部背景的最大通道差，像素画边缘也能保留下来。
    diff = np.max(np.abs(rgb - bg), axis=2)
    brightness = np.max(rgb, axis=2)
    chroma = np.max(rgb, axis=2) - np.min(rgb, axis=2)

    mask = ((diff >= 16) | ((diff >= 9) & (chroma >= 14)) | (brightness >= 145)) & (
        alpha > 8
    )

    if region.remove_gold:
        # 移除标题和黄色虚线。保留偏橙/棕的精灵像素，条件刻意收窄。
        bgr = cv2.cvtColor(roi_rgba, cv2.COLOR_RGBA2BGRA)[:, :, :3]
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        gold = (
            (hsv[:, :, 0] >= 18)
            & (hsv[:, :, 0] <= 34)
            & (hsv[:, :, 1] >= 145)
            & (hsv[:, :, 2] >= 150)
        )
        mask &= ~gold

    mask = mask.astype(np.uint8) * 255

    kw, kh = region.close_kernel
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (max(1, kw), max(1, kh)))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    mask = cv2.morphologyEx(
        mask, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8), iterations=1
    )
    return mask


def connected_boxes(
    mask: np.ndarray, region: Region
) -> list[tuple[int, int, int, int]]:
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    boxes: list[tuple[int, int, int, int]] = []
    for i in range(1, count):
        x, y, w, h, area = map(int, stats[i])
        if not (region.min_area <= area <= region.max_area):
            continue
        if not (
            region.min_w <= w <= region.max_w and region.min_h <= h <= region.max_h
        ):
            continue
        boxes.append((x, y, x + w, y + h))
    return boxes


def boxes_close(
    a: tuple[int, int, int, int], b: tuple[int, int, int, int], gx: int, gy: int
) -> bool:
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    horizontal_gap = max(0, max(ax1, bx1) - min(ax2, bx2))
    vertical_gap = max(0, max(ay1, by1) - min(ay2, by2))
    x_overlap = min(ax2, bx2) - max(ax1, bx1)
    y_overlap = min(ay2, by2) - max(ay1, by1)
    return (horizontal_gap <= gx and y_overlap >= -gy) or (
        vertical_gap <= gy and x_overlap >= -gx
    )


def merge_boxes(
    boxes: list[tuple[int, int, int, int]], gx: int, gy: int
) -> list[tuple[int, int, int, int]]:
    boxes = boxes[:]
    changed = True
    while changed:
        changed = False
        result: list[tuple[int, int, int, int]] = []
        used = [False] * len(boxes)
        for i, box in enumerate(boxes):
            if used[i]:
                continue
            current = box
            used[i] = True
            expanded = True
            while expanded:
                expanded = False
                for j, other in enumerate(boxes):
                    if used[j]:
                        continue
                    if boxes_close(current, other, gx, gy):
                        current = (
                            min(current[0], other[0]),
                            min(current[1], other[1]),
                            max(current[2], other[2]),
                            max(current[3], other[3]),
                        )
                        used[j] = True
                        expanded = True
                        changed = True
            result.append(current)
        boxes = result
    return boxes


def sort_boxes(
    boxes: Iterable[tuple[int, int, int, int]], mode: str
) -> list[tuple[int, int, int, int]]:
    boxes = list(boxes)
    if mode == "x":
        return sorted(boxes, key=lambda b: (b[0], b[1]))
    if mode == "y":
        return sorted(boxes, key=lambda b: (b[1], b[0]))

    # 行优先：先按纵向中心聚类，再按 x 排序。
    boxes = sorted(boxes, key=lambda b: ((b[1] + b[3]) / 2, b[0]))
    rows: list[list[tuple[int, int, int, int]]] = []
    for box in boxes:
        cy = (box[1] + box[3]) / 2
        placed = False
        for row in rows:
            row_cy = sum((r[1] + r[3]) / 2 for r in row) / len(row)
            row_h = max(r[3] - r[1] for r in row)
            if abs(cy - row_cy) <= max(8, row_h * 0.45):
                row.append(box)
                placed = True
                break
        if not placed:
            rows.append([box])
    rows.sort(key=lambda row: min(b[1] for b in row))
    output: list[tuple[int, int, int, int]] = []
    for row in rows:
        output.extend(sorted(row, key=lambda b: b[0]))
    return output


def trim_to_foreground(
    crop: Image.Image, tolerance: int = 11, padding: int = 1
) -> Image.Image:
    """根据四角背景颜色进一步去除多余空白，但不会裁断主体。"""
    arr = np.asarray(crop.convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    alpha = arr[:, :, 3]
    corners = np.array([rgb[0, 0], rgb[0, -1], rgb[-1, 0], rgb[-1, -1]])
    bg = np.median(corners, axis=0)
    diff = np.max(np.abs(rgb - bg), axis=2)
    fg = (diff > tolerance) & (alpha > 8)
    ys, xs = np.where(fg)
    if len(xs) == 0:
        return crop
    l = max(0, int(xs.min()) - padding)
    t = max(0, int(ys.min()) - padding)
    r = min(crop.width, int(xs.max()) + 1 + padding)
    b = min(crop.height, int(ys.max()) + 1 + padding)
    return crop.crop((l, t, r, b))


def normalize_images(paths: Sequence[Path]) -> None:
    images = [Image.open(p).convert("RGBA") for p in paths]
    if not images:
        return
    max_w = max(im.width for im in images)
    max_h = max(im.height for im in images)
    for path, im in zip(paths, images):
        canvas = Image.new("RGBA", (max_w, max_h), (0, 0, 0, 0))
        x = (max_w - im.width) // 2
        y = max_h - im.height  # 脚底对齐，比垂直居中更适合角色动画。
        canvas.alpha_composite(im, (x, y))
        canvas.save(path)


def crop_region(
    image: Image.Image,
    region: Region,
    output_root: Path,
    debug_draw: ImageDraw.ImageDraw,
    manifest: list[dict],
    normalize: bool,
) -> list[Path]:
    l, t, r, b = clip_box(region.box, image.width, image.height)
    roi = np.asarray(image.crop((l, t, r, b)))
    mask = build_foreground_mask(roi, region)
    boxes = connected_boxes(mask, region)
    boxes = merge_boxes(boxes, region.merge_x, region.merge_y)

    # 合并后再次尺寸过滤，避免多个相邻精灵被错误拼成超大框。
    filtered = []
    for x1, y1, x2, y2 in boxes:
        w, h = x2 - x1, y2 - y1
        if w <= region.max_w * 1.45 and h <= region.max_h * 1.45:
            filtered.append((x1, y1, x2, y2))
    boxes = sort_boxes(filtered, region.sort_mode)

    out_dir = output_root / region.folder
    out_dir.mkdir(parents=True, exist_ok=True)
    saved: list[Path] = []

    for index, (x1, y1, x2, y2) in enumerate(boxes):
        gx1 = max(l, l + x1 - region.pad)
        gy1 = max(t, t + y1 - region.pad)
        gx2 = min(r, l + x2 + region.pad)
        gy2 = min(b, t + y2 + region.pad)

        crop = image.crop((gx1, gy1, gx2, gy2))
        crop = trim_to_foreground(crop, tolerance=10, padding=2)
        filename = f"{index:03d}.png"
        path = out_dir / filename
        crop.save(path)
        saved.append(path)

        debug_draw.rectangle(
            (gx1, gy1, gx2 - 1, gy2 - 1), outline=(255, 0, 255, 255), width=2
        )
        debug_draw.text(
            (gx1 + 2, gy1 + 2), f"{region.name}:{index}", fill=(255, 255, 255, 255)
        )
        manifest.append(
            {
                "region": region.name,
                "folder": region.folder,
                "file": str(path),
                "box": [gx1, gy1, gx2, gy2],
                "size": [crop.width, crop.height],
            }
        )

    debug_draw.rectangle((l, t, r - 1, b - 1), outline=(255, 190, 0, 255), width=1)

    if normalize and saved:
        normalize_images(saved)

    status = f"{region.name}: {len(saved)} 个"
    if region.expected is not None and len(saved) != region.expected:
        status += f"（期望 {region.expected}）"
    print(status)
    return saved


def create_contact_sheet(
    paths: Sequence[Path], destination: Path, cell: int = 96, columns: int = 8
) -> None:
    if not paths:
        return
    rows = math.ceil(len(paths) / columns)
    sheet = Image.new("RGBA", (columns * cell, rows * (cell + 22)), (12, 21, 34, 255))
    draw = ImageDraw.Draw(sheet)
    for i, path in enumerate(paths):
        im = Image.open(path).convert("RGBA")
        max_side = cell - 12
        scale = min(max_side / max(1, im.width), max_side / max(1, im.height), 4.0)
        preview = im.resize(
            (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
            Image.Resampling.NEAREST,
        )
        x = (i % columns) * cell + (cell - preview.width) // 2
        y = (i // columns) * (cell + 22) + (cell - preview.height) // 2
        sheet.alpha_composite(preview, (x, y))
        draw.text(
            ((i % columns) * cell + 4, (i // columns) * (cell + 22) + cell),
            path.parent.name + "/" + path.name,
            fill=(235, 235, 235, 255),
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(destination, quality=95)


def manual_mode(image: Image.Image, output_root: Path) -> None:
    """鼠标框选：Enter/Space 确认一个框，Esc 结束。"""
    bgr = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGBA2BGRA)
    display = bgr[:, :, :3]
    print("手工模式：拖动鼠标框选；Enter/Space 确认；Esc 完成。")
    rois = cv2.selectROIs(
        "Select sprites", display, showCrosshair=True, fromCenter=False
    )
    cv2.destroyAllWindows()
    out_dir = output_root / "manual"
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, (x, y, w, h) in enumerate(rois):
        crop = image.crop((int(x), int(y), int(x + w), int(y + h)))
        crop = trim_to_foreground(crop, tolerance=10, padding=2)
        crop.save(out_dir / f"{i:03d}.png")
    print(f"手工导出 {len(rois)} 个素材到 {out_dir}")


def scaled_regions(width: int, height: int) -> tuple[Region, ...]:
    if width == 1536 and height == 1024:
        return REGIONS_1536
    sx, sy = width / 1536.0, height / 1024.0
    print(f"提示：输入尺寸为 {width}x{height}，将按比例缩放默认检测区域。")
    result = []
    for region in REGIONS_1536:
        l, t, r, b = region.box
        scaled = Region(
            **{
                **asdict(region),
                "box": (round(l * sx), round(t * sy), round(r * sx), round(b * sy)),
                "min_area": max(4, round(region.min_area * sx * sy)),
                "max_area": max(16, round(region.max_area * sx * sy)),
                "min_w": max(2, round(region.min_w * sx)),
                "min_h": max(2, round(region.min_h * sy)),
                "max_w": max(4, round(region.max_w * sx)),
                "max_h": max(4, round(region.max_h * sy)),
                "merge_x": max(1, round(region.merge_x * sx)),
                "merge_y": max(1, round(region.merge_y * sy)),
                "close_kernel": (
                    max(1, round(region.close_kernel[0] * sx)),
                    max(1, round(region.close_kernel[1] * sy)),
                ),
                "pad": max(1, round(region.pad * max(sx, sy))),
            }
        )
        result.append(scaled)
    return tuple(result)


def selected_regions(
    regions: Sequence[Region], keywords: Sequence[str] | None
) -> list[Region]:
    if not keywords:
        return list(regions)
    normalized = [k.lower() for k in keywords]
    return [
        r
        for r in regions
        if any(k in r.name.lower() or k in r.folder.lower() for k in normalized)
    ]


def main() -> int:
    args = parse_args()
    input_path = Path(args.image)
    output_root = Path(args.output)

    if args.clean and output_root.exists():
        shutil.rmtree(output_root)

    image = ensure_rgba(input_path)
    output_root.mkdir(parents=True, exist_ok=True)

    if args.manual:
        manual_mode(image, output_root)
        return 0

    debug = image.copy()
    debug_draw = ImageDraw.Draw(debug)
    manifest: list[dict] = []
    all_saved: list[Path] = []

    regions = selected_regions(scaled_regions(image.width, image.height), args.only)
    if not regions:
        print(
            "没有匹配到任何区域。可用关键词示例：hero npc icons cursor buttons buildings effects dynamic"
        )
        return 2

    for region in regions:
        all_saved.extend(
            crop_region(
                image=image,
                region=region,
                output_root=output_root,
                debug_draw=debug_draw,
                manifest=manifest,
                normalize=not args.no_normalize,
            )
        )

    debug_dir = output_root / "_debug"
    debug_dir.mkdir(parents=True, exist_ok=True)
    debug.convert("RGB").save(debug_dir / "detection_overlay.png", quality=95)
    create_contact_sheet(all_saved, debug_dir / "contact_sheet.png")
    with (debug_dir / "manifest.json").open("w", encoding="utf-8") as fp:
        json.dump(
            {
                "input": str(input_path),
                "input_size": [image.width, image.height],
                "count": len(manifest),
                "assets": manifest,
            },
            fp,
            ensure_ascii=False,
            indent=2,
        )

    print("\n完成")
    print(f"素材目录：{output_root.resolve()}")
    print(f"检测框：{(debug_dir / 'detection_overlay.png').resolve()}")
    print(f"预览表：{(debug_dir / 'contact_sheet.png').resolve()}")
    print(
        "自动检测若仍有个别误差，请运行 --manual 进行鼠标框选；不要再修改每个精灵的固定 crop 坐标。"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\n已取消。")
        raise SystemExit(130)
    except Exception as exc:
        print(f"错误：{exc}", file=sys.stderr)
        raise SystemExit(1)
