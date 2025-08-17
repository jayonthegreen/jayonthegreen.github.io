#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sync Google Drive folder → mirror into ./content → process Markdown → write to src/pages/post

Spec:
0) Always clear src/pages/post first (reflect deletions on Drive)
1) For each .md file:
   - remove `links` from frontmatter
   - if no `title`, use filename (stem)
   - write as `{sanitize_filename(title)}.md`
2) Save into src/pages/post

Env:
- GDRIVE_FOLDER_ID (required)
- POST_DEST_DIR (optional, default: src/pages/post)
"""

import os
import sys
import tempfile
import shutil
import subprocess
import re
from pathlib import Path
from typing import Optional

import gdown
import frontmatter

# ===== Config from env =====
FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID")  # required
POST_DEST_DIR = Path(os.environ.get("POST_DEST_DIR", "src/pages/post")).resolve()
DOWNLOAD_SUBDIR_NAME = "content"  # temp subdir to place the downloaded Drive folder
DEST_DIR = Path(os.environ.get("DEST_DIR", "content")).resolve()

# ===== Utilities =====

def sanitize_filename(title: str) -> str:
    """URL/filename-safe slug: spaces → '-', strip non [\w-]."""
    if not isinstance(title, str):
        title = str(title)
    title = title.strip().replace(" ", "-")
    # normalize multiple dashes
    title = re.sub(r"-+", "-", title)
    # keep only word chars and hyphens
    title = re.sub(r"[^\w\-]", "", title)
    # trim leading/trailing hyphens
    title = title.strip("-")
    return title or "untitled"


def clear_directory(dir_path: Path) -> None:
    if dir_path.exists():
        for p in dir_path.iterdir():
            if p.is_file() or p.is_symlink():
                p.unlink(missing_ok=True)
            elif p.is_dir():
                shutil.rmtree(p)
    else:
        dir_path.mkdir(parents=True, exist_ok=True)


def copy_tree(src: Path, dst: Path) -> None:
    """Mirror copy: wipe dst then copy src tree (files & folders) preserving modtimes."""
    clear_directory(dst)
    for root, dirs, files in os.walk(src):
        rel = Path(root).relative_to(src)
        target_root = dst / rel
        target_root.mkdir(parents=True, exist_ok=True)
        for d in dirs:
            (target_root / d).mkdir(parents=True, exist_ok=True)
        for f in files:
            s = Path(root) / f
            t = target_root / f
            shutil.copy2(s, t)


def process_markdown_file(src_md_path: Path, dest_dir: Path) -> Path:
    post = frontmatter.load(src_md_path)

    # 1) drop `links` from frontmatter
    if "links" in post.metadata:
        del post.metadata["links"]

    # 2) set title from filename if missing
    if "title" not in post.metadata or not str(post.metadata.get("title")).strip():
        post.metadata["title"] = src_md_path.stem

    # 3) safe filename from (final) title
    safe_title = sanitize_filename(post.metadata.get("title", "untitled"))
    out_name = f"{safe_title}.md"
    out_path = dest_dir / out_name

    dest_dir.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        frontmatter.dump(post, f)

    print(f"[POST] {src_md_path} → {out_path}")
    return out_path


# ===== gdown helpers (try a few ways) =====

def _try_gdown_folder(output_dir: Path, *, folder_id: Optional[str], url: Optional[str], use_cookies: bool) -> bool:
    try:
        print(
            f"[TRY] gdown.download_folder(use_cookies={use_cookies}, "
            f"{'id='+folder_id if folder_id else ''}{' url='+url if url else ''})"
        )
        gdown.download_folder(
            id=folder_id,
            url=url,
            output=str(output_dir),
            quiet=False,
            use_cookies=use_cookies,
            remaining_ok=True,
        )
        any_file = any(p.is_file() for p in output_dir.rglob("*"))
        print(f"[INFO] any_file_downloaded={any_file}")
        return any_file
    except Exception as e:
        print(f"[WARN] gdown.download_folder failed: {e}")
        return False


def _try_gdown_cli_fuzzy(output_dir: Path, target: str) -> bool:
    cmd = ["gdown", "--fuzzy", target, "-O", str(output_dir)]
    print(f"[TRY] {' '.join(cmd)}")
    try:
        res = subprocess.run(cmd, check=False, capture_output=True, text=True)
        print("[STDOUT]", res.stdout)
        print("[STDERR]", res.stderr)
        any_file = any(p.is_file() for p in output_dir.rglob("*"))
        print(f"[INFO] any_file_downloaded={any_file}")
        return any_file and res.returncode == 0
    except FileNotFoundError:
        print("[WARN] gdown CLI not found in PATH")
        return False


def download_folder_all_ways(tmp_root: Path, folder_id: str) -> Optional[Path]:
    url = f"https://drive.google.com/drive/folders/{folder_id}"
    out_dir = tmp_root / DOWNLOAD_SUBDIR_NAME
    out_dir.mkdir(parents=True, exist_ok=True)

    if _try_gdown_folder(out_dir, folder_id=folder_id, url=None, use_cookies=False):
        return out_dir
    if _try_gdown_folder(out_dir, folder_id=None, url=url, use_cookies=False):
        return out_dir
    if _try_gdown_folder(out_dir, folder_id=folder_id, url=None, use_cookies=True):
        return out_dir
    if _try_gdown_folder(out_dir, folder_id=None, url=url, use_cookies=True):
        return out_dir
    if _try_gdown_cli_fuzzy(out_dir, url):
        return out_dir
    return None


# ===== Main =====

def main():
    if not FOLDER_ID:
        print("Env GDRIVE_FOLDER_ID is required.")
        sys.exit(2)

    tmp_root = Path(tempfile.mkdtemp(prefix="gdrive_sync_"))
    try:
        print(f"[INFO] Downloading folder id={FOLDER_ID} → {tmp_root}")
        downloaded_root = download_folder_all_ways(tmp_root, FOLDER_ID)
        if not downloaded_root:
            print("\n[DIAG] Failed to retrieve folder contents.")
            print("  - Confirm folder is PUBLIC: 'Anyone with the link'.")
            print("  - Turn OFF 'Restrict download' in share settings.")
            print("  - Ensure this is a REAL folder, not a shortcut.")
            print("  - Make sure there are regular files (.md/.txt/.jpg etc.).")
            sys.exit(3)

        # Mirror the downloaded folder into persistent repo ./content
        print(f"[INFO] Mirroring downloaded files into: {DEST_DIR}")
        DEST_DIR.mkdir(parents=True, exist_ok=True)
        copy_tree(downloaded_root, DEST_DIR)

        # 0) Clear post destination first
        print(f"[INFO] Clearing destination: {POST_DEST_DIR}")
        POST_DEST_DIR.mkdir(parents=True, exist_ok=True)
        clear_directory(POST_DEST_DIR)

        # 1) Process markdown files into POST_DEST_DIR
        md_files = sorted(DEST_DIR.rglob("*.md"))
        if not md_files:
            print("[WARN] No Markdown files found in downloaded folder.")
        for md in md_files:
            process_markdown_file(md, POST_DEST_DIR)

        print("[DONE] All markdown files processed into src/pages/post")

    finally:
        shutil.rmtree(tmp_root, ignore_errors=True)


if __name__ == "__main__":
    main()