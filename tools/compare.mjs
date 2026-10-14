import sharp from 'sharp';
const [svgPath, pngPath, out] = process.argv.slice(2);
const svg = (await import('fs')).readFileSync(svgPath, 'utf8')
  .replace(/viewBox="[^"]+"/, 'viewBox="0 0 1254 1254" width="1254" height="1254"')
  .replace(/#22323F/g, '#ff0000');
const red = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp(pngPath).composite([{ input: red, blend: 'multiply' }]).png().toFile(out);
