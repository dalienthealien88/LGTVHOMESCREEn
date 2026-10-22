const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const width = 128;
const height = 128;
const logoWidth = 20;
const logoHeight = 20;
const logo = Buffer.from('AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAGP8EWn3/DFo7/wEAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAGP8HfrL/F6K4/xeiuP8Xorj/FHZN/wEAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAY/wd+sv8Xorj/F6K4/xeiuP8Xoqf/CikA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAGP8HfrL/F6K4/xefrP8TlbL/F6K4/xeTd/8DAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AABj/B36y/xeiuP8Xn6D/CjEG/wAAGP8HfLL/F5iD/wQAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAY/wd+sv8Xorj/F5+g/woxBv8BTY//FZB3/wQKGP8HfKz/E3xf/wQPDP8BJE3/CmlZ/wEAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAGP8HfrL/F6K4/xefoP8KMQb/AU2P/xaiuP8Xorj/F5B3/wQKGP8HfLL/F6K4/xeiuP8Xorj/FXxZ/wEAAP8AAAD/AAAA/wAAAP8AABj/B36y/xeiuP8Xn6D/CjEG/wFNj/8Worj/F6K4/xeiuP8Xorj/F5B3/wQKGP8HfLL/F6K4/xeiuP8Xoqf/Ci4A/wAAAP8AAAD/AAAY/wd+sv8Xorj/F5+g/woxBv8BTY//FqK4/xeiuP8Xorj/F6K4/xeiuP8Xorj/FXlN/wEFX/8Porj/F6K4/xeaj/8HEgD/AAAA/wAAGP8HfrL/F6K4/xefoP8KMQb/AU2P/xaiuP8Xorj/F6K4/xeiuP8Xorj/F6K4/xZ+X/8BCjX/CYmy/xeiuP8XmpX/CCYG/wAAAP8AABj/B36y/xeiuP8Xoqf/CjEG/wFNj/8Worj/F6K4/xeiuP8Xorj/F6K4/xeiuP8Wfl//AQo1/wmJsv8Xorj/F5qV/wgmBv8AAAD/AAAA/wJfoP8Xorj/F6K4/xeJZf8BDTv/C5C4/xeiuP8Xorj/F6K4/xeiuP8Xorj/Fn5f/wEKNf8JibL/F6K4/xealf8IJgb/AAAA/wAAAP8AAAD/Al2a/xeiuP8Xorj/F6K4/xNxR/8BF0f/DJC4/xeiuP8Xorj/F6K4/xaDZf8CCjX/CYmy/xeiuP8XmpX/CCYG/wAAAP8AAAD/AAAA/wAAAP8AABj/B36y/xeiuP8WmKz/FZ24/xNxR/8BF0f/DJC4/xeiuP8Wg2X/Ago1/wmJsv8Xorj/F5qV/wgmBv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AABj/AiEM/wAAAP8ABR7/B36y/xNxR/8BF0f/Cm9l/wIKNf8JibL/F6K4/xealf8IJgb/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8ALnf/E6K4/xNxR/8BBTX/CYmy/xeiuP8XmpX/CCYG/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAxd/8Torj/F6K4/xeiuP8Xorj/F5qV/wgmBv8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/BGys/xeiuP8Xorj/F6K4/xealf8IJgb/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AABj/B36y/xeiuP8XmpX/CCYG/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAz/AR4j/wEKAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/wAAAP8AAAD/AAAA/w==', 'base64');
const rgba = Buffer.alloc(width * height * 4, 255);
for (let i = 0; i < rgba.length; i += 4) rgba[i] = rgba[i + 1] = rgba[i + 2] = 0;

const drawSize = 96;
const offset = (width - drawSize) / 2;
for (let y = 0; y < drawSize; y++) {
  for (let x = 0; x < drawSize; x++) {
    const sourceX = ((x + 0.5) / drawSize) * logoWidth - 0.5;
    const sourceY = ((y + 0.5) / drawSize) * logoHeight - 0.5;
    const x0 = Math.max(0, Math.floor(sourceX)), y0 = Math.max(0, Math.floor(sourceY));
    const x1 = Math.min(logoWidth - 1, x0 + 1), y1 = Math.min(logoHeight - 1, y0 + 1);
    const fx = Math.max(0, sourceX - x0), fy = Math.max(0, sourceY - y0);
    const target = (Math.floor(offset + y) * width + Math.floor(offset + x)) * 4;
    for (let channel = 0; channel < 3; channel++) {
      const a = logo[(y0 * logoWidth + x0) * 4 + channel];
      const b = logo[(y0 * logoWidth + x1) * 4 + channel];
      const c = logo[(y1 * logoWidth + x0) * 4 + channel];
      const d = logo[(y1 * logoWidth + x1) * 4 + channel];
      const top = a * (1 - fx) + b * fx;
      const bottom = c * (1 - fx) + d * fx;
      rgba[target + channel] = Math.round(top * (1 - fy) + bottom * fy);
    }
    rgba[target + 3] = 255;
  }
}

const rows = [];
for (let y = 0; y < height; y++) {
  const row = Buffer.alloc(1 + width * 4);
  rgba.copy(row, 1, y * width * 4, (y + 1) * width * 4);
  rows.push(row);
}
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuffer = Buffer.from(type), length = Buffer.alloc(4), checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, checksum]);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', header),
  chunk('IDAT', zlib.deflateSync(Buffer.concat(rows))),
  chunk('IEND', Buffer.alloc(0))
]);
fs.writeFileSync(path.join(__dirname, 'urlviewer-icon-1.0.4.png'), png);
