const fs = require('fs');
const zlib = require('zlib');
const width = 128, height = 128, rows = [];
function inside(x, y, left, top, right, bottom) {
  return x >= left && x <= right && y >= top && y <= bottom;
}
for (let y = 0; y < height; y++) {
  const row = Buffer.alloc(1 + width * 4);
  for (let x = 0; x < width; x++) {
    let color = [15, 27, 43, 255];
    const border = inside(x, y, 14, 25, 114, 103) &&
      (inside(x, y, 14, 25, 114, 36) || inside(x, y, 14, 92, 114, 103) ||
       inside(x, y, 14, 25, 25, 103) || inside(x, y, 103, 25, 114, 103));
    if (border) color = [120, 213, 255, 255];
    if (inside(x, y, 36, 57, 94, 66)) color = [245, 247, 251, 255];
    if (inside(x, y, 54, 45, 63, 78)) color = [245, 247, 251, 255];
    row.set(color, 1 + x * 4);
  }
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
fs.writeFileSync(require('path').join(__dirname, 'icon.png'), png);
