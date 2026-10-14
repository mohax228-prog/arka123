# План: честный финал с Библиотекой

## Почему склейка выглядела плохо
В видео мы снимали **правое** арочное окно, за ним стеклянная башня. Фото с Библиотекой (7.png) снято из **другого** окна, поэтому склейка выглядела как «другой этаж».
На фото **01.png** и исходных фото 35–36 видно: Библиотека видна прямо из нашего зала, через **левое** арочное окно. Финал строим на нём, и всё будет снято в одном зале.

## Шаг 1 — ChatGPT: Алина у левого окна с видом на Библиотеку
Прикрепить 2 файла:
1. `materials/photos_processed/01.png` — зал с двумя арочными окнами, Библиотека в левом окне;
2. `materials/ai/keyframes/k3-day.png` — Алина (по нему он возьмёт лицо и костюм).

Промпт:
```
Create a new photorealistic image. Use the first photo as the exact location: the hall with two huge arched windows and the glass diamond-shaped National Library building visible through the left window. Keep the walls, radiators, herringbone floor, window frames and the library exactly as in the photo. Change only the lighting to bright natural daytime: soft blue sky with light clouds, no sunset, no orange tones. Remove the text badge in the bottom right corner and the round sticker on the right window. Place the woman from the second image — same face, long wavy hair, navy suit, cream blouse, silver arch "123" pin — standing at the left arched window, three-quarter back view, pointing at the library with her open hand. Horizontal 16:9.
```
Сохранить как `materials/ai/keyframes/k-lib.png` (без пробелов в имени).

## Шаг 2 — Hailuo: зал → левое окно с Библиотекой (заменяет видео 2)
Start/End Frame, 768p, 5s, Auto.
- Start: `materials/ai/keyframes/kling/v1-last.png` (конец видео 1, шов не будет виден);
- End: `materials/ai/keyframes/kling/k-lib.png` (подготовлю из шага 1).

Промпт:
```
The woman turns and walks across the bright hall to the left arched window with the view of the glass diamond-shaped library building, the camera glides forward behind her, she stops at the window and points to the library, natural daylight, smooth continuous dolly shot, single take, no cuts
```

## Шаг 3 — Hailuo (по желанию): камера подлетает к Библиотеке
Конечный кадр не генерируем, а вырезаю окно с Библиотекой крупно из того же кадра k-lib. Свет и вид совпадут на 100%, морфинга не будет.
- Start: `kling/k-lib.png`, End: `kling/k-lib-close.png` (подготовлю);
- промпт: `The camera slowly pushes forward past the woman toward the arched window and the glass library building outside, natural daylight, smooth continuous dolly-in, single take, no cuts`

## Шаг 4 — я
Склеиваю видео 1 + новое видео 2 (+ видео 3) в один ролик, возвращаю финальную подпись «Вид, который запоминают» и публикую.

## Если шаг 1 или 2 не получится
Пересобираем всю цепочку ключевых кадров на основе 01.png, чтобы все кадры были из одного ракурса: стойка → зал → левое окно. Это 2–3 картинки в ChatGPT и 2–3 видео в Hailuo.
