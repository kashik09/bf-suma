#!/usr/bin/env python3
"""
BF Suma Catalog Image Downloader
Downloads product images from bfsumaproducts.co.ke and organizes them by category.

Usage:
    python3 scripts/download-catalog-images.py [--output-dir PATH] [--dry-run]

Output Structure:
    public/catalog-images/
    ├── immune-booster/
    │   ├── 2_bf-suma-pure-broken-ganoderma-spores-30s.jpg
    │   └── ...
    ├── mens-power/
    ├── womens-beauty/
    └── ...

Requirements:
    Python 3.6+ and requests (pip install requests)
"""

import argparse
import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: 'requests' not found. Run: pip install requests")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Product catalogue — (id, name, category_slug)
# ---------------------------------------------------------------------------
PRODUCTS = [
    # Immune Booster
    (2,  "BF Suma Pure & Broken Ganoderma Spores 30s",     "immune-booster"),
    (3,  "Pure & Broken Ganoderma Spores 60s",             "immune-booster"),
    (13, "Pure Broken Ganoderma Spores Oil Capsules 60s",  "immune-booster"),
    (20, "4 in 1 Cordyceps Coffee",                        "immune-booster"),
    (22, "4-in-1 Reishi Coffee",                           "immune-booster"),
    (24, "Quad-Reishi Capsules",                           "immune-booster"),
    # Sport Fit
    (25, "GymEffect",                                      "sport-fit"),
    # Heart & Blood Fit
    (21, "4-in-1 Ginseng Coffee",                          "heart-and-blood-fit"),
    (31, "ArthroXtra Tablets",                             "heart-and-blood-fit"),
    (34, "GluzoJoint-F Capsules",                          "heart-and-blood-fit"),
    (36, "CereBrain",                                      "heart-and-blood-fit"),
    (45, "MicrO2 Cycle Tablets",                           "heart-and-blood-fit"),
    (59, "GluzoJoint-Ultra Pro",                           "heart-and-blood-fit"),
    # Suma Fit
    (5,  "Ez-Xlim",                                        "suma-fit"),
    (8,  "Veggie Veggie",                                  "suma-fit"),
    (23, "Probio3 Strawberry Flavor 30s",                  "suma-fit"),
    (38, "ZaminoCal Plus Capsules",                        "suma-fit"),
    (40, "Relivin Tea",                                    "suma-fit"),
    (42, "Detoxilive Pro Oil Capsules",                    "suma-fit"),
    (43, "NTDiarr Pills 1 Dozen",                          "suma-fit"),
    (44, "ConstiRelax Oral Solution",                      "suma-fit"),
    (62, "Elements",                                       "suma-fit"),
    # Men's Power
    (7,  "X Power Coffee",                                 "mens-power"),
    (32, "ProstatRelax Capsules",                          "mens-power"),
    (37, "X Power Man Plus Capsules",                      "mens-power"),
    # Smart Kids
    (10, "Blueberry Chewable Tablets",                     "smart-kids"),
    (11, "Calcium & Vitamin D3 Milk Tablets",              "smart-kids"),
    (12, "Vitamin C Chewable Tablets",                     "smart-kids"),
    # Women's Beauty
    (14, "Youth Essence Facial Cream",                     "womens-beauty"),
    (15, "Youth Essence Facial Mask",                      "womens-beauty"),
    (16, "Youth Essence Toner",                            "womens-beauty"),
    (17, "Youth Essence Lotion",                           "womens-beauty"),
    (18, "Youth Refreshing Facial Cleanser",               "womens-beauty"),
    (19, "Refined Yunzhi Essence",                         "womens-beauty"),
    (30, "Feminergy Capsules",                             "womens-beauty"),
    (33, "Novel Depile Capsules",                          "womens-beauty"),
    (35, "FemiCare (Feminine Cleanser)",                   "womens-beauty"),
    (60, "Femicalcium D3",                                 "womens-beauty"),
    (61, "FemiBiotics",                                    "womens-beauty"),
    # Suma Living
    (27, "Coolroll 1 Dozen",                               "suma-living"),
    (39, "Anatic Herbal Essence Soap",                     "suma-living"),
    (41, "Dr. Ts Toothpaste",                              "suma-living"),
    # Others
    (57, "Own Your Own Business",                          "others"),
]

BASE_URL = "https://www.bfsumaproducts.co.ke/web/image/product.template/{id}/image_512"
REQUEST_TIMEOUT = 30
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-")


def image_url(product_id: int) -> str:
    return BASE_URL.format(id=product_id)


def download(url: str, dest: Path) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, stream=True)
        r.raise_for_status()
        # Determine extension from Content-Type
        ct = r.headers.get("Content-Type", "")
        ext = ".jpg"
        if "png" in ct:
            ext = ".png"
        elif "webp" in ct:
            ext = ".webp"
        # Rename dest with correct extension if needed
        if dest.suffix != ext:
            dest = dest.with_suffix(ext)
        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return True
    except requests.RequestException as e:
        print(f"    FAILED: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Download BF Suma product images")
    parser.add_argument(
        "--output-dir",
        default=str(Path(__file__).parent.parent / "public" / "catalog-images"),
        help="Root output directory (default: public/catalog-images)",
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Print paths without downloading"
    )
    args = parser.parse_args()

    output_root = Path(args.output_dir)
    print(f"BF Suma Image Downloader — {'DRY RUN' if args.dry_run else 'LIVE'}")
    print(f"Output: {output_root}")
    print("=" * 60)

    counts = {"downloaded": 0, "exists": 0, "failed": 0}

    for pid, name, category in PRODUCTS:
        slug = slugify(name)
        # Placeholder filename — extension may be corrected after HEAD detection
        dest = output_root / category / f"{pid}_{slug}.jpg"
        url = image_url(pid)

        # Check for any existing file with same stem (any extension)
        existing = list(dest.parent.glob(f"{pid}_{slug}.*"))
        if existing:
            print(f"[EXISTS] {category}/{existing[0].name}")
            counts["exists"] += 1
            continue

        if args.dry_run:
            print(f"[DRY-RUN] {url}")
            print(f"       -> {dest.relative_to(output_root.parent.parent)}")
            continue

        print(f"[GET] {name}  ({category})")
        if download(url, dest):
            # Find the actual saved file (extension may have changed)
            saved = next(dest.parent.glob(f"{pid}_{slug}.*"), dest)
            print(f"   -> {saved.relative_to(output_root.parent.parent)}")
            counts["downloaded"] += 1
        else:
            counts["failed"] += 1

    if not args.dry_run:
        print()
        print("=" * 60)
        print(f"Downloaded : {counts['downloaded']}")
        print(f"Already had: {counts['exists']}")
        print(f"Failed     : {counts['failed']}")
        if counts["failed"]:
            print("\nTip: Re-run the script to retry failed downloads.")


if __name__ == "__main__":
    main()
