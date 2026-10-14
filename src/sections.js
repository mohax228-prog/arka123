import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Появление элементов при прокрутке (кроме первого экрана — его показывает лоадер).
export function initReveals() {
  gsap.utils.toArray('main section:not(.hero) [data-reveal], .footer-cta > *').forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  // Счётчики в блоке цифр
  document.querySelectorAll('[data-count]').forEach((el) => {
    const n = { v: 0 };
    const target = +el.dataset.count;
    gsap.to(n, {
      v: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = Math.round(n.v)),
    });
  });
}

export function initHeader() {
  const header = document.querySelector('.header');
  ScrollTrigger.create({
    start: 80,
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
  });
}

// Помещение: переключатель рассадки + объёмный наклон сцены за курсором и параллакс при прокрутке.
export function initSpace() {
  const root = document.querySelector('.space');
  const buttons = root.querySelectorAll('.layouts button');
  const layers = root.querySelectorAll('[data-layout]:not(button)');
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      layers.forEach((l) => l.classList.toggle('is-active', l.dataset.layout === btn.dataset.layout));
    }),
  );

  const stage = root.querySelector('.stage-inner');
  const imgs = stage.querySelectorAll('img');
  if (matchMedia('(hover: hover)').matches) {
    const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const ix = gsap.quickTo(imgs, 'x', { duration: 0.8, ease: 'power3.out' });
    const iy = gsap.quickTo(imgs, 'y', { duration: 0.8, ease: 'power3.out' });
    stage.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 8);
      rx(-py * 6);
      ix(-px * 24);
      iy(-py * 16);
    });
    stage.addEventListener('mouseleave', () => {
      rx(0); ry(0); ix(0); iy(0);
    });
  }
  gsap.fromTo(stage, { rotationX: 14, scale: 0.92 }, {
    rotationX: 0,
    scale: 1,
    ease: 'none',
    scrollTrigger: { trigger: root.querySelector('.stage'), start: 'top bottom', end: 'top 30%', scrub: true },
  });
}

// Галерея: сетка из обработанных фото + просмотр по клику.
const PHOTOS = ['01', '8', '6', '4', '7', '5', '15', '1', '18', '9', '10', '11', '16', '2', '17', '3', '19', '12', '13', '20', '21', '14'];

export function initGallery() {
  const grid = document.querySelector('.gallery-grid');
  grid.innerHTML = PHOTOS.map(
    (n) => `<button data-src="img/photos/${n}.webp" aria-label="Открыть фото"><img src="img/thumbs/${n}.webp" alt="" loading="lazy" /></button>`,
  ).join('');
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML = `<img src="${btn.dataset.src}" alt="" />`;
    const close = () => gsap.to(box, { opacity: 0, duration: 0.25, onComplete: () => box.remove() });
    box.addEventListener('click', close);
    addEventListener('keydown', (ev) => ev.key === 'Escape' && close(), { once: true });
    document.body.append(box);
    gsap.from(box, { opacity: 0, duration: 0.25 });
    gsap.from(box.querySelector('img'), { scale: 0.94, duration: 0.4, ease: 'power3.out' });
  });
  gsap.from(grid.children, {
    y: 30,
    opacity: 0,
    duration: 0.7,
    stagger: 0.04,
    ease: 'power3.out',
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
  });
}
