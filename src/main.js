import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './style.css';
import { markSVG } from './logo.js';
import { runLoader } from './loader.js';
import { initReveals, initHeader, initSpace, initGallery } from './sections.js';
import { initTour } from './tour.js';

// Логотип в шапке: при наведении арка заново прорисовывается,
// в окне загорается закат, цифры 1-2-3 по очереди подпрыгивают.
function initLogoHover(link) {
  link.insertAdjacentHTML('afterbegin', markSVG({ id: 'hdr', library: false }));
  const q = (s) => link.querySelector(s);
  const frame = q('.frame');
  const len = frame.getTotalLength();
  const glow = q('.glow');
  gsap.set(glow, { yPercent: 100 });

  let tl;
  link.addEventListener('mouseenter', () => {
    tl?.kill();
    tl = gsap.timeline()
      .fromTo(frame, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' })
      .to(glow, { yPercent: 0, duration: 0.6, ease: 'power2.out' }, 0.1)
      .to(['.stem', '.flag', '.two', '.three'].map(q), {
        keyframes: [{ y: -60, duration: 0.18, ease: 'power2.out' }, { y: 0, duration: 0.35, ease: 'bounce.out' }],
        stagger: 0.09,
      }, 0.15);
  });
  link.addEventListener('mouseleave', () => gsap.to(glow, { yPercent: 100, duration: 0.5, ease: 'power2.in' }));
}

initLogoHover(document.querySelector('.logo'));
initHeader();
initSpace();
initGallery();
const startTour = initTour();

const lenis = new Lenis({ autoRaf: true });
lenis.on('scroll', ScrollTrigger.update);
lenis.stop();
document.documentElement.classList.add('is-loading');

runLoader(document.fonts.ready).then(() => {
  document.documentElement.classList.remove('is-loading');
  lenis.start();
  initReveals();
  gsap.from('.hero [data-reveal]', { y: 40, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out' });
  startTour();
});
