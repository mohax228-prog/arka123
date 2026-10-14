import { gsap } from 'gsap';
import { markSVG, prepDraw, WINDOW_PATH, WINDOW_CENTER } from './logo.js';

// Лоадер: арка рисуется линией → в окне встаёт «закат» над библиотекой →
// цифры 1-2-3 вырастают по очереди → счётчик доходит до 123 м² →
// камера влетает в окно арки, и сквозь него открывается сайт.
export function runLoader() {
  const root = document.getElementById('loader');
  const S = 0.2; // масштаб знака в системе координат лоадера (viewBox 1000×1000, slice)
  const place = `translate(${500 - 625 * S} ${440 - 640 * S}) scale(${S})`;

  root.innerHTML = `
    <svg class="loader-scene" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <mask id="loader-hole" maskUnits="userSpaceOnUse" x="-5000" y="-5000" width="11000" height="11000">
          <rect x="-5000" y="-5000" width="11000" height="11000" fill="#fff"/>
          <g transform="${place}"><path class="hole" d="${WINDOW_PATH}" fill="#000"/></g>
        </mask>
      </defs>
      <rect class="curtain" x="-5000" y="-5000" width="11000" height="11000" mask="url(#loader-hole)"/>
      <g transform="${place}"><g class="zoom">${markSVG({ id: 'ld' }).replace(/<\/?svg[^>]*>/g, '')}</g></g>
    </svg>
    <div class="loader-text">
      <div class="loader-word"><span>А</span><span>Р</span><span>К</span><span>А</span><span>&nbsp;</span><span>1</span><span>2</span><span>3</span></div>
      <div class="loader-slogan">Встречаемся напротив Библиотеки.</div>
    </div>
    <div class="loader-count"><b>0</b> м²</div>`;

  const q = (s) => root.querySelector(s);
  const qa = (s) => [...root.querySelectorAll(s)];
  const frame = q('.frame');
  const strokes = [frame, q('.stem'), q('.two'), q('.three')];
  prepDraw(strokes);
  prepDraw(qa('.library path'));

  const count = { v: 0 };
  const countEl = q('.loader-count b');
  const pageLoaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));

  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
  tl.set(q('.glow'), { yPercent: 100 })
    .to(frame, { strokeDashoffset: 0, duration: 1.3 })
    .to(q('.glow'), { yPercent: 0, duration: 1.4, ease: 'power2.out' }, '-=0.5')
    .to(qa('.library path'), { strokeDashoffset: 0, duration: 1, stagger: 0.08 }, '<0.2')
    .to(q('.stem'), { strokeDashoffset: 0, duration: 0.45, ease: 'power3.out' }, '-=1.1')
    .from(q('.flag'), { scale: 0, transformOrigin: '100% 0%', duration: 0.35, ease: 'back.out(3)' }, '-=0.15')
    .to(q('.two'), { strokeDashoffset: 0, duration: 0.55 }, '-=0.15')
    .to(q('.three'), { strokeDashoffset: 0, duration: 0.6 }, '-=0.3')
    .from(qa('.loader-word span'), { yPercent: 110, duration: 0.6, stagger: 0.05, ease: 'power3.out' }, '-=0.9')
    .from(q('.loader-slogan'), { opacity: 0, y: 10, duration: 0.6 }, '-=0.3')
    .to(count, { v: 123, duration: tl.duration(), ease: 'power1.inOut', onUpdate: () => (countEl.textContent = Math.round(count.v)) }, 0);

  return new Promise((resolve) => {
    tl.eventCallback('onComplete', async () => {
      await pageLoaded;
      const out = gsap.timeline({
        onComplete: () => {
          root.remove();
          resolve();
        },
      });
      out
        .to([q('.loader-text'), q('.loader-count')], { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in' })
        .to([q('.glow'), q('.win-bg')], { opacity: 0, duration: 0.5 }, '<0.1')
        .to(qa('.library path'), { opacity: 0, duration: 0.3 }, '<')
        // знак и «дыра» в шторке масштабируются вместе — мы пролетаем сквозь окно арки
        .to([q('.zoom'), q('.hole')], { scale: 40, svgOrigin: WINDOW_CENTER, duration: 1.4, ease: 'expo.in' }, '-=0.2');
    });
  });
}
