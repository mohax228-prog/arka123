import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Фон-экскурсия: героиня встречает у стойки → ведёт по залу → подводит к окну → вид на Библиотеку.
// Прокрутка управляет «камерой». Экскурсия состоит из планов (shots):
//  - video: покадровая последовательность из AI-видео (public/img/tour/<name>/NNNN.webp);
//  - arch: финал — вокруг последнего кадра смыкается тёмная рамка в форме арки из логотипа,
//    и в арке проявляется фото (вид на Библиотеку). Рифма с лоадером, где мы влетаем в сайт через арку.
// weight — какую долю прокрутки занимает план.
const SHOTS = [
  { video: 'img/tour/v1', count: 78, weight: 1.4 },
  { video: 'img/tour/v2', count: 78, weight: 1.4 },
  { video: 'img/tour/v3', count: 50, weight: 1 },
  { arch: 'img/tour/library.webp', fy: 0.38, weight: 1.2 },
];

// Подписи: [появление, исчезновение] в долях всей прокрутки секции.
const CAPTIONS = [null, [0.085, 0.18], [0.22, 0.32], [0.46, 0.6], [0.8, null]];

const NAVY = '#22323F';
const SUN = '#F3B76B';

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
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Рисует картинку в прямоугольник (x, y, w, h) по принципу object-fit: cover.
function drawCover(ctx, img, x, y, w, h, scale = 1, fy = 0.5, alpha = 1) {
  if (!img) return;
  const s = Math.max(w / img.width, h / img.height) * scale;
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * fy, dw, dh);
  ctx.globalAlpha = 1;
}

// Контур арки как в логотипе: прямые стенки и полукруглый верх.
function archPath(ctx, x, y, w, h) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

// Готовит экскурсию: грузит только то, что нужно для первого экрана, и возвращает
// функцию, которая догружает остальные кадры (её вызывают после лоадера).
export async function initTour() {
  const root = document.querySelector('.tour');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let progress = 0;

  for (const shot of SHOTS) if (shot.video) shot.frames = new Array(shot.count);
  const firstShot = SHOTS[0];
  firstShot.frames[0] = await loadImage(frameUrl(firstShot, 0));

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
    ctx.clearRect(0, 0, w, h);

    if (shot.video) {
      drawCover(ctx, videoFrame(shot, t), 0, 0, w, h);
      return;
    }

    // Финал-арка. На широком экране арка справа (подпись слева), на узком — по центру сверху.
    const prev = videoFrame(SHOTS[i - 1], 1);
    const wide = w > h * 1.1;
    const ah = wide ? h * 0.74 : h * 0.52;
    const aw = Math.min(ah * 0.8, w * 0.84);
    const cx = wide ? w * 0.68 : w / 2;
    const cy = wide ? h * 0.52 : h * 0.4;
    const close = smooth(clamp01(t / 0.6)); // рамка смыкается
    const reveal = smooth(clamp01((t - 0.15) / 0.45)); // в арке проявляется вид
    const grow = 1 + 3.2 * (1 - close); // в начале арка больше экрана — рамки не видно
    const bw = aw * grow;
    const bh = ah * grow;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;

    drawCover(ctx, prev, 0, 0, w, h);
    ctx.fillStyle = NAVY;
    ctx.globalAlpha = close;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    ctx.save();
    archPath(ctx, bx, by, bw, bh);
    ctx.clip();
    drawCover(ctx, prev, 0, 0, w, h, 1, 0.5, 1 - reveal);
    drawCover(ctx, shot.img, bx, by, bw, bh, 1.12 - 0.12 * t, shot.fy, reveal);
    ctx.restore();

    if (close > 0.05) {
      archPath(ctx, bx, by, bw, bh);
      ctx.strokeStyle = SUN;
      ctx.globalAlpha = close;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
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

  // Догрузка: сначала каждый 4-й кадр по порядку экскурсии (видео уже «играет» рывками),
  // затем остальные; фото для арки — после первого прохода.
  return async () => {
    const videos = SHOTS.filter((s) => s.video);
    for (const shot of videos)
      for (let i = 0; i < shot.count; i += 4) if (!shot.frames[i]) shot.frames[i] = await loadImage(frameUrl(shot, i));
    const arch = SHOTS.find((s) => s.arch);
    arch.img = await loadImage(arch.arch);
    for (const shot of videos)
      for (let i = 0; i < shot.count; i++) if (!shot.frames[i]) shot.frames[i] = await loadImage(frameUrl(shot, i));
    render();
  };
}
