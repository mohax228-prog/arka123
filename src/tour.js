import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Фон-экскурсия: героиня встречает у стойки → ведёт по залу → подводит к окну → вид на Библиотеку.
// Прокрутка управляет «камерой». Два режима:
//  - frames: покадровая последовательность из видео (public/img/tour/frames/NNNN.webp);
//  - keyframes: запасной — 4 ключевых кадра с наездом камеры и перетеканием между ними.

const KEYFRAMES = [
  // fx/fy — точка, к которой «едет» камера на этом кадре
  { src: 'img/tour/k1.webp', fx: 0.12, fy: 0.42 },
  { src: 'img/tour/k2.webp', fx: 0.62, fy: 0.36 },
  { src: 'img/tour/k3.webp', fx: 0.6, fy: 0.38 },
  { src: 'img/tour/k4.webp', fx: 0.5, fy: 0.42 },
];

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// Рисует картинку по принципу object-fit: cover с масштабом и смещением к точке фокуса.
function drawCover(ctx, img, w, h, scale = 1, fx = 0.5, fy = 0.5, alpha = 1) {
  if (!img) return;
  const base = Math.max(w / img.width, h / img.height);
  const s = base * scale;
  const dw = img.width * s;
  const dh = img.height * s;
  // при scale=1 картинка по центру, при увеличении — смещается к фокусу
  const k = (scale - 1) / scale;
  const cx = 0.5 + (fx - 0.5) * k * 1.6;
  const cy = 0.5 + (fy - 0.5) * k * 1.6;
  const dx = w / 2 - dw * cx;
  const dy = h / 2 - dh * cy;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, Math.min(0, Math.max(w - dw, dx)), Math.min(0, Math.max(h - dh, dy)), dw, dh);
  ctx.globalAlpha = 1;
}

export async function initTour({ frames = null } = {}) {
  const root = document.querySelector('.tour');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let progress = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  };

  let render;
  if (frames) {
    // Покадровый режим: первый кадр грузим сразу, остальные — фоном.
    const imgs = new Array(frames.count);
    const url = (i) => `${frames.path}/${String(i + 1).padStart(4, '0')}.webp`;
    imgs[0] = await loadImage(url(0));
    render = () => {
      let i = Math.round(progress * (frames.count - 1));
      while (i > 0 && !imgs[i]) i--; // если кадр ещё не загружен — показываем ближайший готовый
      ctx.clearRect(0, 0, w, h);
      drawCover(ctx, imgs[i], w, h);
    };
    (async () => {
      for (let i = 1; i < frames.count; i += 4) imgs[i] = await loadImage(url(i)); // сначала каждый 4-й
      for (let i = 1; i < frames.count; i++) if (!imgs[i]) imgs[i] = await loadImage(url(i));
    })();
  } else {
    const imgs = await Promise.all(KEYFRAMES.map((k) => loadImage(k.src)));
    const n = KEYFRAMES.length - 1;
    render = () => {
      const pos = Math.min(progress * n, n - 0.0001);
      const i = Math.floor(pos);
      const t = pos - i;
      const cur = KEYFRAMES[i];
      const next = KEYFRAMES[i + 1];
      // камера наезжает на текущий кадр, во второй половине перехода его сменяет следующий
      const blend = gsap.utils.clamp(0, 1, (t - 0.55) / 0.45);
      const ease = blend * blend * (3 - 2 * blend);
      ctx.clearRect(0, 0, w, h);
      drawCover(ctx, imgs[i], w, h, 1 + 0.45 * t, cur.fx, cur.fy);
      if (ease > 0) drawCover(ctx, imgs[i + 1], w, h, 1.18 - 0.18 * ease, next.fx, next.fy, ease);
    };
  }

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
  // Подписи привязаны к кадрам: [появление, исчезновение] в долях прокрутки.
  // Кадры полностью в кадре при 0, 1/3, 2/3 и 1.
  const TIMING = [null, [0.1, 0.24], [0.3, 0.5], [0.62, 0.8], [0.9, null]];
  tl.to(steps[0], { opacity: 0, y: -40, duration: 0.06 }, 0.04);
  steps.forEach((step, i) => {
    if (!TIMING[i]) return;
    const [show, hide] = TIMING[i];
    tl.fromTo(step, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.05 }, show);
    if (hide) tl.to(step, { opacity: 0, y: -40, duration: 0.05 }, hide);
  });
  tl.set({}, {}, 1); // таймлайн занимает всю прокрутку секции
}
