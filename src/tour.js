import { gsap } from 'gsap';

// Фон-экскурсия на первом экране: после лоадера ролик сам плавно проигрывается один раз —
// героиня встречает у стойки и ведёт через зал к арочному окну. Подписи привязаны к таймкоду.
// В конце возвращается заголовок с кнопкой бронирования и появляется «Смотреть снова».

// Подписи: [появление, исчезновение] в секундах ролика (не реального времени). 0 — заголовок первого экрана.
// Скорость проигрывания ролика (1 — обычная).
const RATE = 1;
const CAPTIONS = [
  [0, 2.4],
  [2.7, 4.6],
  [5.0, 7.0],
  [7.4, 10.1],
];

// Где героиня в кадре (доля ширины) в разные секунды ролика. На узких экранах (телефон)
// видна только часть кадра — сдвигаем её так, чтобы героиня оставалась в кадре.
const SUBJECT_X = [
  [0, 0.6],
  [2, 0.58],
  [3, 0.52],
  [4, 0.45],
  [5, 0.36],
  [6, 0.29],
  [7, 0.28],
  [8, 0.32],
  [10.2, 0.36],
];
const VIDEO_ASPECT = 16 / 9;

function subjectX(t) {
  let i = 1;
  while (i < SUBJECT_X.length - 1 && t > SUBJECT_X[i][0]) i++;
  const [t0, x0] = SUBJECT_X[i - 1];
  const [t1, x1] = SUBJECT_X[i];
  return x0 + (x1 - x0) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
}

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

  // Видимая доля ширины кадра при object-fit: cover; если кадр виден целиком — ничего не двигаем.
  const frame = (t) => {
    const visible = Math.min(1, video.clientWidth / video.clientHeight / VIDEO_ASPECT);
    if (visible >= 0.98) return;
    const p = (subjectX(t) - visible / 2) / (1 - visible);
    video.style.objectPosition = `${(Math.min(1, Math.max(0, p)) * 100).toFixed(1)}% center`;
  };
  frame(0);
  addEventListener('resize', () => frame(video.currentTime));

  const sync = () => {
    if (video.ended) return; // финал показывает обработчик ended
    const t = video.currentTime;
    frame(t);
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
