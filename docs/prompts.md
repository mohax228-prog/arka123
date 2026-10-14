# Промпты для генерации

## Персонаж — Gemini (gemini.google.com, режим создания изображений)

Перед первым промптом прикрепи к сообщению два файла:
- `materials/logo/2.png` — знак логотипа (для броши);
- `materials/promo/1.png` — макет с брошью на лацкане.

### Промпт 1 — основной портрет (генерируем первым, остальные — от него)

```
Photorealistic portrait of a Slavic woman, 32 years old, the brand ambassador of "ARKA 123" — a premium event space for workshops and seminars in Minsk. Calm confident smile, natural makeup, light-brown hair in a neat low bun. She wears a tailored dark navy (#22323F) blazer over a cream silk blouse, strict business style. On her left lapel — an enamel and silver brooch exactly in the shape of the attached logo: an arch outline with the digits "123" inside (use the attached logo image as the exact brooch design, like on the attached mockup).
Setting: bright loft interior with a huge arched window behind her, warm golden-hour sunlight, soft background blur. Waist-up shot, looking at the camera, 3:4 vertical, high detail, editorial commercial photography, 85mm lens.
```

### Если лицо «плывёт» между кадрами
Пиши: «Keep exactly the same face as in the first image» и прикладывай первую удачную картинку как референс.

Лучший портрет сохрани как `materials/ai/character/portrait.png` (папку создай).

---

## Видео с героем — ключевые кадры (тоже Gemini / Nano Banana)

Сценарий: героиня встречает гостя у стойки, проводит в зал, подводит к арочному окну, и камера улетает к библиотеке. Это 4 кадра и 3 перехода между ними.

**Главное правило:** к каждому промпту прикладываем **реальное фото зала** и **портрет героини**. Так помещение остаётся настоящим и не искажается.

Все кадры делаем горизонтальными, 16:9. Если фото обрезалось или стало квадратным, попроси «Output 16:9 horizontal».

### Кадр 1 — встреча (прикрепить `materials/photos_processed/11.png` + портрет)
```
Use the attached interior photo as the exact background — do not change the architecture, walls, columns, floor or furniture. Place the woman from the attached portrait (same face, navy blazer, cream blouse, arch "123" brooch) standing next to the white reception desk, smiling at the camera with a welcoming open-hand gesture, as if greeting a guest who just entered. Full body, natural daylight matching the photo, realistic shadows on the floor. Photorealistic, 16:9.
```

### Кадр 2 — в зале (прикрепить `materials/photos_processed/6.png` + портрет)
```
Use the attached interior photo as the exact background — keep the room, arched windows, graphite columns, herringbone floor and ceiling lights unchanged. Place the same woman (same face, outfit and brooch) in the middle of the hall, three-quarter view, walking toward the arched windows and pointing to them with her hand, looking back at the camera with a smile. Full body, realistic shadow, daylight. Photorealistic, 16:9.
```

### Кадр 3 — у окна (прикрепить `materials/photos_processed/4.png` + портрет)
```
Use the attached interior photo as the exact background — keep the arched window and the view outside unchanged. Place the same woman (same face, outfit and brooch) standing at the large arched window, seen from behind at a slight angle, her hand gesturing toward the glass diamond-shaped National Library building visible through the window. Warm golden-hour light. Photorealistic, 16:9.
```

### Кадр 4 — вид на библиотеку
Берём реальное фото `materials/photos_processed/7.png` как есть, генерировать не нужно.

Сохрани кадры в `materials/ai/keyframes/` как `k1.png`, `k2.png`, `k3.png`.

---

## Переходы — видео (Kling, klingai.com, вход через Google)

Режим **Image to Video** → включить **Start & End frame** (первый и последний кадр). Если на бесплатном тарифе эта функция закрыта, то же самое умеет Hailuo (hailuoai.video).

Параметры: длительность 5 с, соотношение 16:9, режим Standard (дешевле по кредитам).

| Видео | Начальный кадр | Конечный кадр | Промпт |
|---|---|---|---|
| v1 | k1 | k2 | `Smooth cinematic camera move following the woman as she walks from the reception desk into the bright hall, steady gimbal shot, no cuts, realistic motion` |
| v2 | k2 | k3 | `The woman walks to the large arched window, camera glides forward behind her, smooth continuous dolly shot, no cuts` |
| v3 | k3 | 7.png | `Camera slowly pushes forward past the woman through the arched window toward the glass library building outside, smooth continuous dolly-in, no cuts` |

Генерируй каждый переход 2–3 раза и выбирай лучший. Сохрани в `materials/ai/video/` как `v1.mp4`, `v2.mp4`, `v3.mp4`. Склейку и нарезку на кадры для сайта сделаю я.
