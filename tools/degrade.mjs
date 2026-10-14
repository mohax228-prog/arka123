// Убирает «закат»: подтягивает цвет каждого кадра к статистике первого (дневного) кадра.
// Сила коррекции растёт вместе с тем, насколько кадр «потеплел».
import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [src, dst] = process.argv.slice(2);
fs.mkdirSync(dst, { recursive: true });
const files = fs.readdirSync(src).filter(f => f.endsWith('.png')).sort();
const stats = async f => (await sharp(path.join(src, f)).stats()).channels.slice(0, 3).map(c => ({ m: c.mean, s: c.stdev }));
const ref = await stats(files[0]);
const warmth = st => (st[0].m - st[2].m) - (ref[0].m - ref[2].m);
const all = await Promise.all(files.map(stats));
const maxWarm = Math.max(...all.map(warmth));
for (let i = 0; i < files.length; i++) {
  const st = all[i];
  const k = Math.max(0, Math.min(1, warmth(st) / maxWarm));
  // линейное преобразование канала: (x - m) * (sRef/s) + mRef, смешанное с исходным по k
  const a = st.map((c, j) => 1 + k * (ref[j].s / c.s - 1));
  const b = st.map((c, j) => k * (ref[j].m - c.m * (ref[j].s / c.s)));
  await sharp(path.join(src, files[i])).linear(a, b).toFile(path.join(dst, files[i]));
}
console.log('frames', files.length, 'maxWarm', maxWarm.toFixed(1));
