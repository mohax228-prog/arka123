// Фирменный знак АРКА 123 в координатах исходного PNG (1254×1254).
// Все элементы — линии со stroke, поэтому их можно «рисовать» через stroke-dashoffset.

export const NAVY = '#22323F';

// Внутренний проём арки — «окно», в котором загорается свет и через которое мы входим на сайт.
export const WINDOW_PATH = 'M342 975 V595 A283.5 283.5 0 0 1 909 595 V975 Z';
export const WINDOW_CENTER = '625 690';

// Силуэт Национальной библиотеки (ромбокубооктаэдр) — виден в окне арки.
const LIBRARY = `
  <g class="library" fill="none" stroke-width="7" stroke-linejoin="round">
    <path d="M590 372 H660 L700 412 V482 L660 522 H590 L550 482 V412 Z"/>
    <path d="M598 402 H652 V492 H598 Z"/>
    <path d="M590 372 L598 402 M660 372 L652 402 M700 412 L652 402 M700 482 L652 492 M660 522 L652 492 M590 522 L598 492 M550 482 L598 492 M550 412 L598 402"/>
    <path d="M520 540 H730" stroke-width="9"/>
  </g>`;

export function markSVG({ id = 'mark', glow = true, library = true, className = '' } = {}) {
  return `
<svg class="mark ${className}" viewBox="270 240 712 806" aria-hidden="true">
  <defs>
    <clipPath id="${id}-win"><path d="${WINDOW_PATH}"/></clipPath>
    <linearGradient id="${id}-sun" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#F3B76B"/>
      <stop offset=".55" stop-color="#F7DDB5"/>
      <stop offset="1" stop-color="#FBF4EA" stop-opacity="0"/>
    </linearGradient>
  </defs>
  ${glow ? `<g clip-path="url(#${id}-win)"><rect class="win-bg" x="330" y="300" width="600" height="690" fill="#F4EFE6"/><rect class="glow" x="330" y="300" width="600" height="690" fill="url(#${id}-sun)"/></g>` : ''}
  <g stroke="${NAVY}" fill="none">
    ${library ? LIBRARY : ''}
    <g stroke-width="54" stroke-linejoin="miter">
      <path class="frame" d="M465.5 1001 H315 V595 A310.5 310.5 0 0 1 936 595 V1001 H465.5"/>
      <path class="digit stem" d="M465.5 1001 V562"/>
      <path class="digit flag" fill="${NAVY}" stroke="none" d="M372 621 L422 562 H493 V621 Z"/>
      <path class="digit two" d="M540 662 V641 A61.5 61.5 0 0 1 663 641 C663 662 655 676 644 692 L540 840 V873 H669"/>
      <path class="digit three" stroke-linejoin="bevel" d="M704 585 H849 L759 714 A79 79 0 1 1 701 796"/>
    </g>
  </g>
</svg>`;
}

// Подготовка путей к анимации «рисования»: длина штриха = длине пути.
export function prepDraw(paths) {
  paths.forEach((p) => {
    const len = p.getTotalLength();
    p.style.strokeDasharray = len;
    p.style.strokeDashoffset = len;
  });
}
