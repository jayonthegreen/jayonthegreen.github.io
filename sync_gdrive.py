#!/usr/bin/env python3
import os
import sys
import tempfile
import shutil
import hashlib
from pathlib import Path

import gdown  # pip install gdown

FOLDER_ID = os.environ.get("GDRIVE_FOLDER_ID")
DEST_DIR = os.environ.get("DEST_DIR", "content")  # 리포 내 동기화 경로(기본: content)

# 해시 계산(큰 파일도 안전하게)
def sha256sum(path: Path, chunk_size: int = 1024 * 1024) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()



def build_manifest(root: Path):
    """root 아래 모든 파일에 대해 {상대경로: (size, sha256)} 매니페스트 생성"""
    manifest = {}
    for p in sorted(root.rglob("*")):
        if p.is_file():
            rel = p.relative_to(root).as_posix()
            try:
                manifest[rel] = (p.stat().st_size, sha256sum(p))
            except Exception as e:
                print(f"[WARN] hash failed: {p} ({e})")
    return manifest

def ensure_parent_dir(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)

def main():
    if not FOLDER_ID:
        print("Env GDRIVE_FOLDER_ID is required.")
        sys.exit(2)

    dest = Path(DEST_DIR).resolve()
    dest.mkdir(parents=True, exist_ok=True)

    # 1) 임시 폴더에 Google Drive 폴더 전체 다운로드
    tmp_root = Path(tempfile.mkdtemp(prefix="gdrive_sync_"))
    try:
        print(f"[INFO] Downloading folder id={FOLDER_ID} -> {tmp_root}")
        # 공개 폴더(링크 공개)일 때 인증 없이 동작
        gdown.download_folder(
            id=FOLDER_ID,
            output=str(tmp_root),
            quiet=False,
            use_cookies=False,   # Actions 환경에서 쿠키 불필요
            remaining_ok=True,   # 중간에 실패 파일이 있어도 계속
        )

        # 2) 매니페스트 비교로 변경점 계산
        src_manifest = build_manifest(tmp_root)
        dest_manifest = build_manifest(dest)

        to_add_or_update = []
        to_delete = []

        # 추가/수정 후보
        for rel, (sz, h) in src_manifest.items():
            if rel not in dest_manifest:
                to_add_or_update.append(rel)
            else:
                dsz, dh = dest_manifest[rel]
                if dsz != sz or dh != h:
                    to_add_or_update.append(rel)

        # 삭제 후보(원본에 없고, 목적지에만 있는 파일)
        for rel in dest_manifest.keys():
            if rel not in src_manifest:
                to_delete.append(rel)

        # 3) 삭제 적용
        for rel in to_delete:
            target = dest / rel
            try:
                target.unlink()
                print(f"[DEL] {rel}")
            except FileNotFoundError:
                pass

        # 4) 추가/수정 적용(필요한 파일만 복사)
        for rel in to_add_or_update:
            src_path = tmp_root / rel
            dest_path = dest / rel
            ensure_parent_dir(dest_path)
            shutil.copy2(src_path, dest_path)
            print(f"[UPD] {rel}")

        # 5) 결과 요약(깃 변경 유무 판단은 GitHub Actions 단계에서 git status로)
        print(f"[SUMMARY] updated: {len(to_add_or_update)}, deleted: {len(to_delete)}")

    finally:
        # 임시 폴더 정리
        shutil.rmtree(tmp_root, ignore_errors=True)

if __name__ == "__main__":
    main()