#!/usr/bin/env bash
# =============================================================================
# 영상 내용이 바뀌어도 압축은 항상 여기만 탄다.
# 과일 영상이든 빵 영상이든 encode_one() 인자는 같고, 로딩 시간도 그래서 비슷하다.
#
# 계약
#   해상도  1080×1920. 줄이지 않는다. 키우기만 한다.
#   길이    6초 전후. 길면 앞만 써도 루프라서 용량만 늘어난다.
#   소리    없음 (-an). 용량·디코드 둘 다.
#   앞쪽    +faststart. moov가 파일 앞에 있어야 첫 바이트부터 재생.
#   키프레임 2초 (keyint=48). 첫 장·루프가 빨리 붙는다. 해상도와 무관.
#   H.264   CRF 20, maxrate 2.5M. 폰 기본. 장면이 복잡해도 초당 상한이 같아서
#           받는 시간이 클립마다 크게 안 벌어진다.
#   HEVC    CRF 24, vbv 1.8M. iOS가 probably일 때만 src.
#   AV1     지금은 안 붙인다. 인코드가 너무 길다. pickVideo가 파일이 있으면 고른다.
#
# 교체할 때
#   1. scripts/archive-clip.sh q1 aroma_fruity
#      지금 파일은 backup or public/videos/archive/q1/ 로 옮긴다. 덮어쓰지 않음.
#   2. 원본을 artifacts/imagine_videos/<이름>.mp4 에 둔다. 1080이면 그대로.
#   3. 아래 copy_src 한 줄만 바꾼다. id는 public/videos/q{1|2|3}/<id>.mp4 가 된다.
#   4. 이 스크립트를 돌린다. encode_one 말고 다른 ffmpeg를 쓰지 않는다.
#   5. tonight.ts clip() 의 ?v= 숫자를 올린다. 캐시 버스트.
#
# 앱 쪽은 파일 안을 보지 않는다. 앞 두 장을 blob으로 다 받은 뒤에만 재생한다.
# =============================================================================
set -euo pipefail
dir="${1:-/workspace/public/videos}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

copy_src() {
  local src="/workspace/artifacts/imagine_videos/${2}.mp4"
  # 원본이 있을 때만. 없으면 그 클립은 건너뜀. 앱은 public/media 를 봄.
  [[ -f "$src" ]] || return 0
  cp "$src" "$tmp/${1}.src.mp4"
}
copy_src aroma_hoppy  grok-video-3aa3e87f-b8fd-4dd3-a1dd-58bae2f1729a-2
copy_src aroma_fruity grok-video-dbf78d9d-7786-48b9-aed8-fb513ac43286
copy_src aroma_fresh  lumina_fresh_up
copy_src aroma_malty  lumina_malty_up
copy_src aroma_floral lumina_floral_up
copy_src taste_sweet  cb32063d-aede-4c95-834d-e5ad7a7e4bbf
copy_src taste_bitter grok-video-6246e4fa-5526-46af-ba30-50703a398636-3
copy_src body_smooth  55f056d2-3428-4abb-8fc2-95e02a0d9eec
copy_src body_soft    19d9149c-59f5-4526-b4fb-8e11724c5c36
copy_src body_gentle  3e6ac94a-b7a6-4d80-b965-01bf6a70f270
copy_src body_thin    bfce351d-6f39-4840-87cf-2e7bcefaeb16
copy_src body_full    5bcb18e5-a450-4520-870b-0e6eae2c7cac

# 내용과 무관. 모든 클립이 같은 1080 캔버스.
vf="fps=24,scale=1080:1920:flags=lanczos:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1"

encode_one() {
  local src="$1"
  local id
  id="$(basename "$src" .src.mp4)"
  local folder=q1
  case "$id" in
    aroma_*) folder=q1 ;;
    taste_*) folder=q2 ;;
    body_*) folder=q3 ;;
  esac
  mkdir -p "$dir/$folder"
  # 장면이 달라도 비트 상한은 같다. 로딩이 클립마다 튀지 않게.
  # 6초만. 길면 앞만 — 루프라서 뒤는 용량만 늘고 스타트가 기다린다.
  ffmpeg -y -i "$src" -t 6 -an -vf "$vf" \
    -c:v libx264 -profile:v high -level 4.1 -pix_fmt yuv420p \
    -preset medium -tune film -crf 20 -maxrate 2.5M -bufsize 5M \
    -x264-params "keyint=48:min-keyint=24:scenecut=40" \
    -movflags +faststart \
    "$tmp/${id}.mp4" >/dev/null 2>&1
  ffmpeg -y -i "$src" -t 6 -an -vf "$vf" \
    -c:v libx265 -pix_fmt yuv420p -preset fast -crf 24 -tag:v hvc1 \
    -x265-params "vbv-maxrate=1800:vbv-bufsize=3600:keyint=48:min-keyint=24" \
    -movflags +faststart \
    "$tmp/${id}.hevc.mp4" >/dev/null 2>&1
  mv "$tmp/${id}.mp4" "$dir/$folder/${id}.mp4"
  mv "$tmp/${id}.hevc.mp4" "$dir/$folder/${id}.hevc.mp4"
  ls -lh "$dir/$folder/${id}.mp4" "$dir/$folder/${id}.hevc.mp4" | awk '{print $5,$9}'
}

export -f encode_one
export vf tmp dir
shopt -s nullglob
srcs=("$tmp"/*.src.mp4)
if ((${#srcs[@]} == 0)); then
  echo "원본 없음. artifacts/imagine_videos 에 mp4 두고 copy_src 한 줄 추가."
  exit 0
fi
printf '%s\n' "${srcs[@]}" | xargs -P 3 -n 1 bash -c 'encode_one "$0"'
