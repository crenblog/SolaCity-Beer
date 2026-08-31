#!/usr/bin/env bash
# 해상도는 1080×1920. 줄이지 않는다. 선명도(unsharp/CRF)도 기존 클립을 다시 깎지 않는다.
# AV1   Chrome·새 Safari. libaom crf 30. YouTube가 쓰는 코덱. 같은 1080, 용량만 줄임.
# HEVC  iOS. tag hvc1. canPlayType===probably 일 때만 src.
# H.264 나머지. High, CRF 20, maxrate 2.5M. 1080 유지.
# 6초 원본 길이. 24fps. 소리 없음. +faststart.
# 키프레임 2초(keyint=48). 첫 프레임이 빨리 나오게. 해상도와 무관.
set -euo pipefail
dir="${1:-/workspace/public/media}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

copy_src() {
  cp "/workspace/artifacts/imagine_videos/${2}.mp4" "$tmp/${1}.src.mp4"
}
copy_src aroma_hoppy  lumina_hoppy_up
copy_src aroma_fruity lumina_fruity_up
copy_src aroma_fresh  lumina_fresh_up
copy_src aroma_malty  lumina_malty_up
copy_src aroma_floral 933a6d1b-7e5a-4f13-949f-a813960869a4
copy_src taste_sweet  cb32063d-aede-4c95-834d-e5ad7a7e4bbf
copy_src taste_bitter d3a5a249-f6ce-445a-953d-4774da5a14b9
copy_src body_smooth  55f056d2-3428-4abb-8fc2-95e02a0d9eec
copy_src body_soft    19d9149c-59f5-4526-b4fb-8e11724c5c36
copy_src body_gentle  3e6ac94a-b7a6-4d80-b965-01bf6a70f270
copy_src body_thin    bfce351d-6f39-4840-87cf-2e7bcefaeb16
copy_src body_full    5bcb18e5-a450-4520-870b-0e6eae2c7cac

vf="fps=24,scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"

encode_one() {
  local src="$1"
  local id
  id="$(basename "$src" .src.mp4)"
  ffmpeg -y -i "$src" -an -vf "$vf" \
    -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
    -preset medium -tune film -crf 20 -maxrate 2.5M -bufsize 5M \
    -x264-params "keyint=48:min-keyint=24:scenecut=40" \
    -movflags +faststart \
    "$tmp/${id}.mp4" >/dev/null 2>&1
  ffmpeg -y -i "$src" -an -vf "$vf" \
    -c:v libx265 -pix_fmt yuv420p -preset fast -crf 24 -tag:v hvc1 \
    -x265-params "vbv-maxrate=1800:vbv-bufsize=3600:keyint=48:min-keyint=24" \
    -movflags +faststart \
    "$tmp/${id}.hevc.mp4" >/dev/null 2>&1
  mv "$tmp/${id}.mp4" "$dir/${id}.mp4"
  mv "$tmp/${id}.hevc.mp4" "$dir/${id}.hevc.mp4"
  ls -lh "$dir/${id}.mp4" "$dir/${id}.hevc.mp4" | awk '{print $5,$9}'
}

export -f encode_one
export vf tmp dir
printf '%s\n' "$tmp"/*.src.mp4 | xargs -P 3 -n 1 bash -c 'encode_one "$0"'
