import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Фон-экскурсия: героиня встречает у стойки → ведёт по залу → подводит к окну → вид на Библиотеку.
// Прокрутка управляет «камерой». Экскурсия состоит из планов (shots):
//  - still: ключевой кадр, камера наезжает к точке фокуса (fx, fy) и перетекает в следующий план;
//    continues — кадр совпадает с последним кадром предыдущего видео, растворение не нужно;
//  - video: покадровая последовательность из AI-видео (public/img/tour/<name>/NNNN.webp).
// weight — какую долю прокрутки занимает план.
const SHOTS = [
  { video: 'img/tour/v1', count: 78, weight: 1.4 },
  { video: 'img/tour/v2', count: 78, weight: 1.4 },
  { video: 'img/tour/v3', count: 78, weight: 1.4 },
  { still: 'img/tour/v3/0078.webp', fx: 0.55, fy: 0.4, weight: 0.6, zoom: 0.08, continues: true },
];

// Подписи: [появление, исчезновение] в долях всей прокрутки секции.
const CAPTIONS = [null, [0.07, 0.16], [0.2, 0.29], [0.42, 0.55], [0.78, null]];

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const frameUrl = (shot, i) => `${shot.video}/${String(i + 1).padStart(4, '0')}.webp`;
const smooth = (x) => x * x * (3 - 2 * x);

// Рисует картинку по принципу object-fit: cover с масштабом и смещением к точке фокуса.
function drawCover(ctx, img, w, h, scale = 1, fx = 0.5, fy = 0.5, alpha = 1) {
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height) * scale;
  const dw = img.width * s;
  const dh = img.height * s;
  const k = ((scale - 1) / scale) * 1.6;
  const dx = w / 2 - dw * (0.5 + (fx - 0.5) * k);
  const dy = h / 2 - dh * (0.5 + (fy - 0.5) * k);
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, Math.min(0, Math.max(w - dw, dx)), Math.min(0, Math.max(h - dh, dy)), dw, dh);
  ctx.globalAlpha = 1;
}

export async function initTour() {
  const root = document.querySelector('.tour');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let progress = 0;

  // Загрузка: статичные кадры и первый/последний кадр каждого видео — сразу, остальное фоном.
  await Promise.all(
    SHOTS.map(async (shot) => {
      if (shot.still) shot.img = await loadImage(shot.still);
      else {
        shot.frames = new Array(shot.count);
        [shot.frames[0], shot.frames[shot.count - 1]] = await Promise.all([
          loadImage(frameUrl(shot, 0)),
          loadImage(frameUrl(shot, shot.count - 1)),
        ]);
      }
    }),
  );
  (async () => {
    for (const shot of SHOTS.filter((s) => s.video)) {
      for (let step of [4, 1])
        for (let i = 0; i < shot.count; i += step) if (!shot.frames[i]) shot.frames[i] = await loadImage(frameUrl(shot, i));
    }
  })();

  const first = (shot) => shot.img || shot.frames[0];
  const last = (shot) => shot.img || shot.frames[shot.count - 1];
  const videoFrame = (shot, t) => {
    let i = Math.round(t * (shot.count - 1));
    while (i > 0 && !shot.frames[i]) i--; // кадр ещё не загружен — показываем ближайший готовый
    return shot.frames[i];
  };

  const total = SHOTS.reduce((sum, s) => sum + s.weight, 0);
  const render = () => {
    let pos = progress * total;
    let i = 0;
    while (i < SHOTS.length - 1 && pos > SHOTS[i].weight) pos -= SHOTS[i++].weight;
    const shot = SHOTS[i];
    const t = Math.min(pos / shot.weight, 1);
    const prev = SHOTS[i - 1];
    const next = SHOTS[i + 1];
    ctx.clearRect(0, 0, w, h);

    if (shot.video) {
      drawCover(ctx, videoFrame(shot, t), w, h);
      return;
    }
    // статичный план: камера наезжает
    drawCover(ctx, shot.img, w, h, 1 + (shot.zoom ?? 0.45) * t, shot.fx, shot.fy);
    // после видео — последний кадр видео растворяется в этом плане
    if (prev?.video && !shot.continues && t < 0.4) drawCover(ctx, last(prev), w, h, 1, 0.5, 0.5, 1 - smooth(t / 0.4));
    // в конце плана проявляется первый кадр следующего
    if (next && t > 0.55) {
      const e = smooth((t - 0.55) / 0.45);
      drawCover(ctx, first(next), w, h, next.video ? 1.12 - 0.12 * e : 1.18 - 0.18 * e, next.fx, next.fy, e);
    }
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  };
  resize();
  addEventListener('resize', resize);

  const steps = root.querySelectorAll('.tour-step');
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        progress = self.progress;
        render();
      },
    },
  });
  tl.to(steps[0], { opacity: 0, y: -40, duration: 0.05 }, 0.02);
  steps.forEach((step, i) => {
    if (!CAPTIONS[i]) return;
    const [show, hide] = CAPTIONS[i];
    tl.fromTo(step, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.05 }, show);
    if (hide) tl.to(step, { opacity: 0, y: -40, duration: 0.05 }, hide);
  });
  tl.set({}, {}, 1); // таймлайн занимает всю прокрутку секции
}
