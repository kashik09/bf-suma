#!/usr/bin/env python3
"""
BF Suma Catalog Image Downloader

Downloads product images from catalog_manifest.json into organized local folders.

Usage:
    cd /home/kashi-kweyu/projects/complete-projects/bf-suma
    python3 scripts/download-catalog-images.py

Output Structure:
    public/catalog-images/
    ├── joshoppers.com/
    │   ├── youth-essence-facial-cream.webp
    │   ├── ginseng-coffee.png
    │   └── ...
    ├── wellthessentials.co.ke/
    │   └── cordyceps-coffee.png
    └── placeholder.webp

Requirements:
    - Python 3.6+
    - requests library (pip install requests)

Assumptions:
    - catalog_manifest.json exists at data/catalog/catalog_manifest.json
    - Products without image_url are skipped
    - Duplicate product names get numeric suffixes
    - File extensions are preserved from URLs
"""

import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("Error: 'requests' library not found. Install with: pip install requests")
    sys.exit(1)

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
MANIFEST_PATH = PROJECT_ROOT / "data" / "catalog" / "catalog_manifest.json"
OUTPUT_DIR = PROJECT_ROOT / "public" / "catalog-images"
REQUEST_TIMEOUT = 30  # seconds

# Stats
stats = {
    "downloaded": 0,
    "skipped_no_url": 0,
    "failed": 0,
    "already_exists": 0,
}


def slugify(text: str) -> str:
    """Convert text to safe filename slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-")


def get_extension(url: str) -> str:
    """Extract file extension from URL."""
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[1].lower()
    if ext in [".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg"]:
        return ext
    return ".webp"  # Default


def get_domain(url: str) -> str:
    """Extract domain from URL."""
    parsed = urlparse(url)
    domain = parsed.netloc
    # Remove 'www.' prefix if present
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def download_image(url: str, output_path: Path) -> bool:
    """Download image from URL to output path."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT, stream=True)
        response.raise_for_status()

        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        return True
    except requests.RequestException as e:
        print(f"    Failed: {e}")
        return False


def main():
    """Main download routine."""
    print("BF Suma Catalog Image Downloader")
    print("=" * 50)

    # Check manifest exists
    if not MANIFEST_PATH.exists():
        print(f"Error: Manifest not found at {MANIFEST_PATH}")
        sys.exit(1)

    # Load manifest
    print(f"Loading manifest: {MANIFEST_PATH}")
    with open(MANIFEST_PATH, "r") as f:
        manifest = json.load(f)

    products = manifest.get("products", [])
    print(f"Found {len(products)} products in manifest\n")

    # Track used filenames to handle duplicates
    used_filenames: dict[str, int] = {}

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Process each product
    for product in products:
        name = product.get("name", "unknown")
        image_url = product.get("image_url")
        slug = product.get("slug") or slugify(name)

        if not image_url:
            print(f"[SKIP] {name} - no image URL")
            stats["skipped_no_url"] += 1
            continue

        # Determine domain folder and filename
        domain = get_domain(image_url)
        ext = get_extension(image_url)

        # Handle duplicate filenames
        base_filename = slug
        if base_filename in used_filenames:
            used_filenames[base_filename] += 1
            filename = f"{base_filename}-{used_filenames[base_filename]}{ext}"
        else:
            used_filenames[base_filename] = 0
            filename = f"{base_filename}{ext}"

        output_path = OUTPUT_DIR / domain / filename

        # Check if already exists
        if output_path.exists():
            print(f"[EXISTS] {name} -> {output_path.relative_to(PROJECT_ROOT)}")
            stats["already_exists"] += 1
            continue

        # Download
        print(f"[DOWNLOADING] {name}")
        print(f"    URL: {image_url}")
        print(f"    To: {output_path.relative_to(PROJECT_ROOT)}")

        if download_image(image_url, output_path):
            print(f"    Done!")
            stats["downloaded"] += 1
        else:
            stats["failed"] += 1

    # Create placeholder image
    placeholder_path = OUTPUT_DIR / "placeholder.webp"
    if not placeholder_path.exists():
        print("\n[INFO] Creating placeholder image...")
        # Create a simple placeholder (1x1 transparent pixel as minimal webp)
        # In production, you'd want a proper placeholder image
        placeholder_path.touch()
        print(f"    Created: {placeholder_path.relative_to(PROJECT_ROOT)}")
        print("    Note: Replace with actual placeholder image")

    # Summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    print(f"Downloaded:      {stats['downloaded']}")
    print(f"Already existed: {stats['already_exists']}")
    print(f"Skipped (no URL): {stats['skipped_no_url']}")
    print(f"Failed:          {stats['failed']}")
    print(f"\nOutput folder: {OUTPUT_DIR.relative_to(PROJECT_ROOT)}")

    # List folder structure
    print("\nFolder structure:")
    for domain_dir in sorted(OUTPUT_DIR.iterdir()):
        if domain_dir.is_dir():
            file_count = len(list(domain_dir.iterdir()))
            print(f"  {domain_dir.name}/ ({file_count} files)")


if __name__ == "__main__":
    main()
