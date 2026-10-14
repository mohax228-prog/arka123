#!/bin/zsh
# Видео Hailuo → кадры WebP для экскурсии: срезаем чёрную полосу снизу, затираем водяной знак, 15 кадров/с.
# usage: tools/frames.sh <video.mp4> <name>
set -e
ROOT=${0:A:h:h}
TMP=$(mktemp -d)
ffmpeg -v error -i "$1" -an -vf "crop=1344:756:0:0,delogo=x=1010:y=698:w=318:h=40,fps=15,scale=1280:720" "$TMP/%04d.png"
rm -rf "$ROOT/public/img/tour/$2"
node "$ROOT/tools/optimize.mjs" "$TMP" "$ROOT/public/img/tour/$2" 1280 66
rm -rf "$TMP"
echo "$2: $(ls "$ROOT/public/img/tour/$2" | wc -l | tr -d ' ') frames, $(du -sh "$ROOT/public/img/tour/$2" | cut -f1)"
