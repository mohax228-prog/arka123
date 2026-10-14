import sharp from 'sharp'; import fs from 'fs'; import path from 'path';
const [dir, out, cols = 6] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
const W = 320, H = 200, C = +cols, R = Math.ceil(files.length / C);
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(path.join(dir, f)).resize(W, H - 20, { fit: 'cover' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="20"><rect width="100%" height="100%" fill="#000"/><text x="4" y="15" font-size="14" fill="#fff" font-family="Arial">${f}</text></svg>`);
  return [{ input: img, left: (i % C) * W, top: Math.floor(i / C) * H }, { input: label, left: (i % C) * W, top: Math.floor(i / C) * H + H - 20 }];
}));
await sharp({ create: { width: W * C, height: H * R, channels: 3, background: '#fff' } }).composite(tiles.flat()).jpeg({ quality: 80 }).toFile(out);
