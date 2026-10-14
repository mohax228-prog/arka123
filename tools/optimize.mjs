import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [src, dst, width = 1920, quality = 78] = process.argv.slice(2);
fs.mkdirSync(dst, { recursive: true });
for (const f of fs.readdirSync(src).filter(f => /\.(png|jpe?g)$/i.test(f))) {
  const out = path.join(dst, f.replace(/\.\w+$/, '.webp'));
  await sharp(path.join(src, f)).resize({ width: +width, withoutEnlargement: true }).webp({ quality: +quality }).toFile(out);
}
