import { gsap } from 'gsap';

// Фон-экскурсия на первом экране: после лоадера ролик сам плавно проигрывается один раз —
// героиня встречает у стойки и ведёт через зал к арочному окну. Подписи привязаны к таймкоду.
// В конце возвращается заголовок с кнопкой бронирования и появляется «Смотреть снова».

// Подписи: [появление, исчезновение] в секундах ролика (не реального времени). 0 — заголовок первого экрана.
// Ролик проигрывается на 80% скорости — плавнее и успеваешь прочитать подписи.
const RATE = 0.8;
const CAPTIONS = [
  [0, 1.1],
  [1.3, 2.7],
  [3.0, 4.4],
  [4.7, 6.5],
];

export function initTour() {
  const root = document.querySelector('.tour');
  const video = root.querySelector('video');
  const steps = [...root.querySelectorAll('.tour-step')];
  const replay = root.querySelector('.tour-replay');
  const hero = steps[0];
  let shown = hero;

  const show = (step) => {
    if (step === shown) return;
    if (shown) gsap.to(shown, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in', overwrite: true });
    if (step) gsap.fromTo(step, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.25, ease: 'power3.out', overwrite: true });
    shown = step;
  };

  const sync = () => {
    if (video.ended) return; // финал показывает обработчик ended
    const t = video.currentTime;
    const i = CAPTIONS.findIndex(([a, b]) => t >= a && t < b);
    show(i >= 0 ? steps[i] : null);
    if (!video.paused && !video.ended) requestAnimationFrame(sync);
  };

  video.addEventListener('play', () => {
    gsap.to(replay, { autoAlpha: 0, duration: 0.3 });
    requestAnimationFrame(sync);
  });
  video.addEventListener('ended', () => {
    show(hero);
    gsap.to(replay, { autoAlpha: 1, duration: 0.5, delay: 0.6 });
  });
  replay.addEventListener('click', () => {
    video.currentTime = 0;
    video.play();
  });

  // Запуск — после лоадера. Если браузер запретил автозапуск (например, режим энергосбережения),
  // остаётся постер с заголовком и кнопка запуска.
  video.defaultPlaybackRate = RATE;
  video.playbackRate = RATE;
  return () =>
    video.play().catch(() => {
      replay.textContent = 'Смотреть экскурсию';
      gsap.to(replay, { autoAlpha: 1, duration: 0.5 });
    });
}
