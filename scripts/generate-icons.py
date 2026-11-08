"""Generate opaque scoreboard icons with no external dependencies."""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'icons'
ROOT.mkdir(parents=True, exist_ok=True)

def icon(size, filename):
    pixels = bytearray(bytes.fromhex('142e28') * size * size)
    def rect(x, y, w, h, color):
        rgb = bytes.fromhex(color)
        for row in range(round(y * size), round((y + h) * size)):
            for col in range(round(x * size), round((x + w) * size)):
                pos = (row * size + col) * 3
                pixels[pos:pos+3] = rgb
    # Everything meaningful fits within the central maskable safe circle.
    for x, color in [(0.28, 'ffffff'), (0.55, 'd5f26a')]:
        rect(x, .32, .17, .36, color)
        rect(x + .045, .37, .08, .26, '142e28')
    rect(.492, .32, .016, .36, '71867d')
    rect(.28, .74, .17, .02, 'ffffff')
    rect(.55, .74, .17, .02, 'd5f26a')
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    raw = b''.join(b'\0' + pixels[row * size * 3:(row+1) * size * 3] for row in range(size))
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
    (ROOT / filename).write_bytes(png)

for size in [192, 512]:
    icon(size, f'icon-{size}.png')
icon(512, 'maskable-512.png')
icon(180, 'apple-touch-icon.png')
