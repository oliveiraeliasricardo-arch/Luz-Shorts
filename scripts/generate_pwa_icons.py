# -*- coding: utf-8 -*-
"""
Gera ícones PNG válidos para o PWA Luz Shorts usando apenas a biblioteca padrão do Python.
"""
import math
import os
import struct
import zlib


def point_in_triangle(px, py, ax, ay, bx, by, cx, cy):
    v0x, v0y = cx - ax, cy - ay
    v1x, v1y = bx - ax, by - ay
    v2x, v2y = px - ax, py - ay

    dot00 = v0x * v0x + v0y * v0y
    dot01 = v0x * v1x + v0y * v1y
    dot02 = v0x * v2x + v0y * v2y
    dot11 = v1x * v1x + v1y * v1y
    dot12 = v1x * v2x + v1y * v2y

    denom = dot00 * dot11 - dot01 * dot01
    if denom == 0:
        return False
    inv_denom = 1.0 / denom
    u = (dot11 * dot02 - dot01 * dot12) * inv_denom
    v = (dot00 * dot12 - dot01 * dot02) * inv_denom
    return (u >= 0.0) and (v >= 0.0) and (u + v <= 1.0)


def make_png(width, height, is_maskable=False):
    raw_rows = []

    top_bg = (3, 105, 161)     # #0369a1 (sky-700)
    bottom_bg = (12, 74, 110)  # #0c4a6e (sky-900)
    play_white = (255, 255, 255)
    ray_sky = (186, 230, 253)  # #bae6fd (sky-200)

    cx = width / 2.0
    cy = height / 2.0
    radius = min(width, height) / 2.0

    # Margem de segurança de 15% quando maskable (zona segura Android)
    scale = 0.72 if is_maskable else 0.92

    for y in range(height):
        row = bytearray([0])
        ny = (y - cy) / (radius * scale)
        grad_t = y / float(max(1, height - 1))
        base_r = int(top_bg[0] * (1 - grad_t) + bottom_bg[0] * grad_t)
        base_g = int(top_bg[1] * (1 - grad_t) + bottom_bg[1] * grad_t)
        base_b = int(top_bg[2] * (1 - grad_t) + bottom_bg[2] * grad_t)

        for x in range(width):
            nx = (x - cx) / (radius * scale)
            r, g, b = base_r, base_g, base_b
            a = 255

            if not is_maskable:
                corner_radius = 0.24 * min(width, height)
                dx = max(0.0, abs(x - cx) - (cx - corner_radius))
                dy = max(0.0, abs(y - cy) - (cy - corner_radius))
                if math.sqrt(dx * dx + dy * dy) > corner_radius:
                    a = 0

            # Haste vertical de luz à esquerda do símbolo Play
            if -0.44 <= nx <= -0.32 and -0.44 <= ny <= 0.44:
                r, g, b = ray_sky

            # Triângulo Play centralizado opticamente
            if point_in_triangle(nx, ny, -0.18, -0.42, -0.18, 0.42, 0.48, 0.0):
                r, g, b = play_white

            row.extend([r, g, b, a])
        raw_rows.append(bytes(row))

    raw_data = b"".join(raw_rows)
    compressed = zlib.compress(raw_data, 9)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = b"IHDR" + ihdr
    ihdr_crc = struct.pack(">I", zlib.crc32(ihdr_chunk) & 0xFFFFFFFF)

    idat_chunk = b"IDAT" + compressed
    idat_crc = struct.pack(">I", zlib.crc32(idat_chunk) & 0xFFFFFFFF)

    iend_chunk = b"IEND"
    iend_crc = struct.pack(">I", zlib.crc32(iend_chunk) & 0xFFFFFFFF)

    return (
        b"\x89PNG\r\n\x1a\n"
        + struct.pack(">I", len(ihdr))
        + ihdr_chunk
        + ihdr_crc
        + struct.pack(">I", len(compressed))
        + idat_chunk
        + idat_crc
        + struct.pack(">I", 0)
        + iend_chunk
        + iend_crc
    )


def main():
    os.makedirs("public", exist_ok=True)
    icons = [
        ("public/pwa-192x192.png", 192, 192, False),
        ("public/pwa-512x512.png", 512, 512, False),
        ("public/pwa-maskable-512x512.png", 512, 512, True),
        ("public/apple-touch-icon.png", 180, 180, False),
        ("public/favicon.ico", 64, 64, False),
    ]
    for path, w, h, maskable in icons:
        data = make_png(w, h, maskable)
        with open(path, "wb") as f:
            f.write(data)
        print(f"Gerado {path} ({w}x{h}, {len(data)} bytes)")


if __name__ == "__main__":
    main()
