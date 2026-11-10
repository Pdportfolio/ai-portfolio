from collections import deque
from pathlib import Path

from PIL import Image
from scipy import ndimage
import numpy as np

src = Path("public/images/prakhar.jpg")
dst = Path("public/images/prakhar.png")

arr = np.array(Image.open(src).convert("RGB"))
h, w = arr.shape[:2]
rgb = arr.astype(np.float32)
lum = rgb.mean(axis=2)
chroma = rgb.max(axis=2) - rgb.min(axis=2)
dist = np.linalg.norm(rgb - np.array([241.0, 241.0, 239.0]), axis=2)

yy, xx = np.ogrid[:h, :w]
cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
radius = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
torso_y = int(h * 0.68)
t = np.clip((yy - torso_y) / float(max(h - torso_y, 1)), 0, 1)
chest = (yy >= torso_y) & (xx >= w * (0.42 - 0.24 * t)) & (xx <= w * (0.58 + 0.24 * t))
head = ((xx - cx) / (0.28 * w)) ** 2 + ((yy - h * 0.40) / (0.30 * h)) ** 2 <= 1
skinish = (chroma >= 16) & (lum < 224) & (dist > 26)
hairish = lum < 115
protected = (head & (skinish | hairish)) | (chest & ~((lum > 232) & (chroma <= 14) & (dist < 18)))


def is_plate(x: int, y: int, *, tight: bool) -> bool:
    if protected[y, x]:
        return False
    if tight:
        return dist[y, x] < 18 and lum[y, x] > 232 and chroma[y, x] <= 10
    return dist[y, x] < 38 and lum[y, x] > 198


visited = np.zeros((h, w), dtype=bool)
is_bg = np.zeros((h, w), dtype=bool)
queue: deque[tuple[int, int]] = deque()


def seed(x: int, y: int) -> None:
    if visited[y, x] or protected[y, x]:
        return
    ok = is_plate(x, y, tight=True) if (y >= torso_y) else (dist[y, x] < 34 and lum[y, x] > 208)
    if not ok:
        return
    visited[y, x] = True
    is_bg[y, x] = True
    queue.append((x, y))


for x in range(w):
    seed(x, 0)
    if x < w * 0.16 or x > w * 0.84:
        seed(x, h - 1)
for y in range(h):
    seed(0, y)
    seed(w - 1, y)

while queue:
    x, y = queue.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if nx < 0 or ny < 0 or nx >= w or ny >= h or visited[ny, nx]:
            continue
        visited[ny, nx] = True
        if is_plate(nx, ny, tight=ny >= torso_y):
            is_bg[ny, nx] = True
            queue.append((nx, ny))

# Drop shadow: mid-grey, low chroma, left of the head.
queue.clear()
visited[:, :] = False
visited[is_bg] = True
for y, x in np.argwhere(is_bg):
    if y < torso_y:
        queue.append((int(x), int(y)))
while queue:
    x, y = queue.popleft()
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if nx < 0 or ny < 0 or nx >= w or ny >= h or visited[ny, nx]:
            continue
        visited[ny, nx] = True
        if protected[ny, nx] or chest[ny, nx] or nx > w * 0.46:
            continue
        if 145 < lum[ny, nx] < 226 and chroma[ny, nx] <= 26:
            is_bg[ny, nx] = True
            queue.append((nx, ny))

# GitHub circular crop + illustrated halo in the upper half.
is_bg |= (yy < h * 0.46) & (radius > 212) & (lum > 120) & ~protected
is_bg |= (yy < h * 0.22) & ((xx < w * 0.16) | (xx > w * 0.84)) & (lum < 70)
is_bg[protected] = False

fg = ~is_bg
fg = ndimage.binary_fill_holes(fg)

labeled, nlab = ndimage.label(fg)
if nlab:
    sizes = ndimage.sum(fg, labeled, index=range(1, nlab + 1))
    keep_ids = {i + 1 for i, size in enumerate(sizes) if size >= 250}
    fg = np.isin(labeled, list(keep_ids))
fg |= protected
fg = ndimage.binary_fill_holes(fg)

# Plate leftovers hugging the jacket, mostly on the left.
fg &= ~((yy > h * 0.52) & (xx < w * 0.30) & (lum > 160) & (chroma <= 32))
fg &= ~((yy > h * 0.58) & (xx > w * 0.74) & (lum > 200) & (chroma <= 22))

# Choke only light anti-aliased plate pixels so hair stays sharp.
interior = ndimage.binary_erosion(fg, structure=np.ones((3, 3)))
light_fringe = fg & ~interior & (lum > 175) & (chroma <= 28) & ~protected
fg[light_fringe] = False
fg |= protected
fg = ndimage.binary_fill_holes(fg)
closed = ndimage.binary_closing(fg, structure=np.ones((7, 7)))
fg[torso_y:] = closed[torso_y:]
fg = ndimage.binary_fill_holes(fg)

labeled, nlab = ndimage.label(fg)
if nlab:
    sizes = ndimage.sum(fg, labeled, index=range(1, nlab + 1))
    fg = labeled == (int(np.argmax(sizes)) + 1)

# Inward defringe: edge pixels copy interior color, killing grey matte.
interior = ndimage.binary_erosion(fg, structure=np.ones((3, 3)))
edge = fg & ~interior
if interior.any() and edge.any():
    inv = ~interior
    _, idx = ndimage.distance_transform_edt(inv, return_indices=True)
    arr[edge] = arr[idx[0][edge], idx[1][edge]]

alpha = np.where(fg, 255, 0).astype(np.uint8)
Image.fromarray(np.dstack([arr, alpha]), mode="RGBA").save(dst, "PNG")
print("wrote", dst, "fg", int(fg.sum()), "bg", int((~fg).sum()))
