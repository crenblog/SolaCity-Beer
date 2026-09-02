#!/usr/bin/env bash
# 교체 전에 지금 파일을 archive 로 옮긴다.
# 사용: scripts/archive-clip.sh q1 aroma_fruity
set -euo pipefail
folder="${1:?q1|q2|q3}"
id="${2:?clip id}"
root="/workspace/public/media"
src="$root/$folder"
stamp="$(date +%Y%m%d-%H%M)"
dest="$root/archive/$folder/${id}_${stamp}"
mkdir -p "$dest"
moved=0
for ext in mp4 hevc.mp4 jpg avif; do
  f="$src/${id}.${ext}"
  if [[ -f "$f" ]]; then
    mv "$f" "$dest/"
    moved=1
  fi
done
if [[ "$moved" -eq 0 ]]; then
  echo "없음: $src/${id}.*" >&2
  exit 1
fi
echo "archive ← $dest"
ls -lh "$dest"
