#!/usr/bin/env python3
"""
content 폴더의 파일들을 src/pages/post로 처리하는 스크립트
Google Drive 동기화 후 2단계로 실행되는 처리 스크립트
"""
import re
import shutil
from pathlib import Path

def sanitize_filename(title):
    """파일명 정리: 띄어쓰기를 '-'로, 특수문자 제거"""
    title = title.replace(' ', '-')
    title = re.sub(r'[^\w\-]', '', title)
    return title

def convert_obsidian_links_to_hyperlinks(content):
    """옵시디언 링크 문법을 일반 하이퍼링크로 변환"""
    # [[문서명|표시이름]] → [표시이름](/resource/문서명)
    content = re.sub(r'\[\[([^\[\]|]+)\|([^\[\]]+)\]\]', r'[\2](/resource/\1)', content)
    # [[문서명]] → [문서명](/resource/문서명)
    content = re.sub(r'\[\[([^\[\]|]+)\]\]', r'[\1](/resource/\1)', content)
    return content

def clean_content(content):
    """파일 내용 정리: 잘못된 문자나 줄바꿈 정리"""
    lines = content.split('\n')
    cleaned_lines = []
    
    for i, line in enumerate(lines):
        # 첫 번째 줄이 frontmatter가 아니고 의미 없는 단일 문자인 경우 제거
        if i == 0 and line.strip() and line.strip() != '---' and len(line.strip()) <= 2:
            continue
        cleaned_lines.append(line)
    
    return '\n'.join(cleaned_lines)

def process_markdown_file(content):
    """마크다운 파일 내용 처리"""
    # 먼저 내용 정리
    content = clean_content(content)
    lines = content.split('\n')
    
    # frontmatter 처리
    if lines and lines[0] == '---':
        frontmatter_end = -1
        for i, line in enumerate(lines[1:], 1):
            if line == '---':
                frontmatter_end = i
                break
        
        if frontmatter_end > 0:
            # frontmatter에서 links 필드 제거
            frontmatter_lines = []
            skip_links = False
            
            for line in lines[1:frontmatter_end]:
                if line.startswith('links:'):
                    skip_links = True
                    continue
                elif skip_links and (line.startswith('  ') or line.startswith('\t') or line.startswith('- ')):
                    # links 필드의 하위 항목들 건너뛰기 (리스트 항목도 포함)
                    continue
                elif skip_links and not (line.startswith('  ') or line.startswith('\t') or line.startswith('- ') or line.strip() == ''):
                    skip_links = False
                
                if not skip_links:
                    frontmatter_lines.append(line)
            
            # 나머지 내용
            body_lines = lines[frontmatter_end + 1:]
            body_content = '\n'.join(body_lines)
            
            # 옵시디언 링크 변환
            body_content = convert_obsidian_links_to_hyperlinks(body_content)
            
            # 최종 내용 조합
            processed_content = '---\n' + '\n'.join(frontmatter_lines) + '\n---\n' + body_content
            return processed_content
    
    # frontmatter가 없는 경우 옵시디언 링크만 변환
    return convert_obsidian_links_to_hyperlinks(content)

def clear_destination_directory(dest_path: Path):
    """목적지 디렉토리의 모든 파일 삭제"""
    if dest_path.exists():
        for item in dest_path.iterdir():
            if item.is_file():
                item.unlink()
                print(f"[CLEAR] {item.name}")
            elif item.is_dir():
                shutil.rmtree(item)
                print(f"[CLEAR] {item.name}/")

def main():
    src_dir = Path("content")
    dest_dir = Path("src/pages/post")
    
    if not src_dir.exists():
        print(f"Error: Source directory {src_dir} does not exist")
        return
    
    # 목적지 디렉토리 생성
    dest_dir.mkdir(parents=True, exist_ok=True)
    
    # 목적지 디렉토리 초기화
    print(f"[INFO] Clearing destination directory: {dest_dir}")
    clear_destination_directory(dest_dir)
    
    # 파일 처리 및 복사
    processed_count = 0
    for src_path in src_dir.rglob("*.md"):
        try:
            # 원본 파일명에서 확장자 제거
            original_name = src_path.stem
            
            # 파일명 정리
            sanitized_name = sanitize_filename(original_name)
            dest_filename = f"{sanitized_name}.md"
            dest_path = dest_dir / dest_filename
            
            # 파일 내용 읽기
            with src_path.open('r', encoding='utf-8') as f:
                content = f.read()
            
            # 마크다운 파일 처리
            processed_content = process_markdown_file(content)
            
            # 처리된 내용을 목적지에 저장
            with dest_path.open('w', encoding='utf-8') as f:
                f.write(processed_content)
            
            print(f"[PROCESS] {src_path.name} -> {dest_filename}")
            processed_count += 1
            
        except Exception as e:
            print(f"[ERROR] Failed to process {src_path}: {e}")
    
    print(f"[SUMMARY] processed: {processed_count} files")

if __name__ == "__main__":
    main() 