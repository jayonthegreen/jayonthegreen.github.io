#!/usr/bin/env python3
import os
import sys
import tempfile
import shutil
import hashlib
import time
import subprocess
import json
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

def download_gdrive_folder_list_method(folder_id: str, output_dir: Path):
    """gdown --list로 파일 목록을 가져온 후 개별 다운로드"""
    try:
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
        print(f"[INFO] Getting file list from folder: {folder_url}")
        
        # 1단계: 폴더 내 파일 목록 가져오기
        list_cmd = ["gdown", folder_url, "--folder", "--list"]
        result = subprocess.run(list_cmd, capture_output=True, text=True, check=True)
        
        if not result.stdout.strip():
            print("[WARN] No files found in folder listing")
            return False
            
        print(f"[INFO] Found files in folder:")
        print(result.stdout)
        
        # 2단계: 출력에서 파일 URL들 추출
        lines = result.stdout.strip().split('\n')
        file_urls = []
        file_names = []
        
        for line in lines:
            if 'https://drive.google.com/file/d/' in line:
                # 파일 URL과 이름 추출
                parts = line.split()
                for part in parts:
                    if part.startswith('https://drive.google.com/file/d/'):
                        file_urls.append(part)
                        # 파일명은 URL 다음에 나타날 것
                        try:
                            name_part = line.split(part)[1].strip()
                            if name_part:
                                file_names.append(name_part.split()[0] if name_part.split() else f"file_{len(file_urls)}")
                            else:
                                file_names.append(f"file_{len(file_urls)}")
                        except:
                            file_names.append(f"file_{len(file_urls)}")
                        break
        
        if not file_urls:
            print("[WARN] No file URLs found in listing")
            return False
            
        print(f"[INFO] Found {len(file_urls)} files to download")
        
        # 3단계: 각 파일을 개별적으로 다운로드
        output_dir.mkdir(parents=True, exist_ok=True)
        downloaded_count = 0
        
        for i, (url, name) in enumerate(zip(file_urls, file_names)):
            try:
                print(f"[INFO] Downloading {i+1}/{len(file_urls)}: {name}")
                
                # gdown으로 개별 파일 다운로드
                output_path = output_dir / name
                gdown.download(url, str(output_path), quiet=False)
                
                if output_path.exists():
                    downloaded_count += 1
                    print(f"[SUCCESS] Downloaded: {name}")
                else:
                    print(f"[WARN] Failed to download: {name}")
                    
            except Exception as e:
                print(f"[ERROR] Failed to download {name}: {e}")
                continue
        
        print(f"[INFO] Successfully downloaded {downloaded_count}/{len(file_urls)} files")
        return downloaded_count > 0
        
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to list folder contents: {e}")
        print(f"[ERROR] Command output: {e.stdout}")
        print(f"[ERROR] Command error: {e.stderr}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error in list method: {e}")
        return False

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
        # 먼저 list 방법으로 시도 (더 확실한 방법)
        print("[INFO] Trying list method first...")
        download_success = download_gdrive_folder_list_method(FOLDER_ID, tmp_root)
        
        # list 방법이 실패했으면 기존 방법으로 폴백
        if not download_success:
            print("[INFO] List method failed, trying standard folder download...")
            max_retries = 3
            
            for attempt in range(max_retries):
                try:
                    print(f"[INFO] Download attempt {attempt + 1}/{max_retries}")
                    gdown.download_folder(
                        id=FOLDER_ID,
                        output=str(tmp_root),
                        quiet=False,
                        use_cookies=False,   # Actions 환경에서 쿠키 불필요
                        remaining_ok=True,   # 중간에 실패 파일이 있어도 계속
                    )
                    
                    # 다운로드된 파일 수 확인
                    downloaded_files = list(tmp_root.rglob("*"))
                    file_count = len([f for f in downloaded_files if f.is_file()])
                    print(f"[INFO] Downloaded {file_count} files")
                    
                    if file_count > 0:
                        download_success = True
                        break
                        
                except Exception as e:
                    print(f"[WARN] Download attempt {attempt + 1} failed: {e}")
                    if attempt < max_retries - 1:
                        print(f"[INFO] Retrying in 5 seconds...")
                        time.sleep(5)
        
        if not download_success:
            print("[ERROR] All download methods failed")
            sys.exit(1)

        # 2) 다운로드 결과 상세 분석
        downloaded_files = list(tmp_root.rglob("*"))
        total_files = len([f for f in downloaded_files if f.is_file()])
        total_dirs = len([f for f in downloaded_files if f.is_dir()])
        
        print(f"[INFO] Download complete - Files: {total_files}, Directories: {total_dirs}")
        
        # 파일 목록 출력 (처음 20개만)
        md_files = [f for f in downloaded_files if f.is_file() and f.suffix == '.md']
        print(f"[INFO] Found {len(md_files)} markdown files")
        
        if md_files:
            print("[INFO] Sample files:")
            for i, f in enumerate(md_files[:20]):
                print(f"  {i+1:2d}. {f.name}")
            if len(md_files) > 20:
                print(f"  ... and {len(md_files) - 20} more files")

        # 3) 매니페스트 비교로 변경점 계산
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