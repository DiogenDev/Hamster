const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

const C = {
  '.': [0, 0, 0, 0],         // Прозрачный
  'D': [143, 74, 10, 255],    // Темный мех / контур
  'F': [232, 145, 47, 255],   // Золотистый мех
  'L': [255, 194, 122, 255],  // Светлый мех
  'B': [255, 244, 214, 255],  // Животик
  'P': [249, 192, 211, 255],  // Розовый
  'E': [26, 26, 26, 255],     // Глаз
  'H': [255, 255, 255, 255],  // Блик
  'C': [255, 143, 168, 255],  // Щечки
};

const art = [
  '................................',
  '................................',
  '................................',
  '................................',
  '.............DD......DD.........',
  '............DPPD....DPPD........',
  '............DPPD....DPPD........',
  '...........DDFFFFFFFFFFFFD......',
  '.........DDFFFFFFFFFFFFFFD......',
  '........DDLLLFFFFFFFFFFFFD......',
  '.......DDLLLLLLFFFFFFHEEFFD.....',
  '......DLLLLFFFFFFFFFFEEEFFPD....',
  '.....DLLLFFFFFFFFFFFFFDFFFFD....',
  '.....DFFFFFFFFFFFFFFBBBBBCCF....',
  '....DFFFFFFFFFFFFFFFBBBBBCCF....',
  '....DFFFFFFFFFFFFFFFBBBBBFFD....',
  '....DFFFFFFFFFFFFFBBBBBBBBFD....',
  '...DPDFFFFFFFFFFFFBBBBBBBBFD....',
  '...DPDFFFFFFFFFFFFBBBBBBBFFD....',
  '....DFFFFFFFFFFFFFFFFFFFFD......',
  '.....DFFFFFFFFFFFFFFFFFDFD......',
  '......DDFFFFDD....DDFFFFDFD.....',
  '.......DPPPDD......DPPPDD.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

function buildPng(targetSize, scale) {
  const rawData = Buffer.alloc((targetSize * 4 + 1) * targetSize);
  let offset = 0;

  for (let y = 0; y < targetSize; y++) {
    rawData[offset++] = 0;
    const srcY = Math.floor(y / scale);
    const line = art[srcY] || '................................';
    for (let x = 0; x < targetSize; x++) {
      const srcX = Math.floor(x / scale);
      const char = line[srcX] || '.';
      const color = C[char] || C['.'];
      rawData[offset++] = color[0];
      rawData[offset++] = color[1];
      rawData[offset++] = color[2];
      rawData[offset++] = color[3];
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(targetSize, 0);
  ihdr.writeUInt32BE(targetSize, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function createIco(pngBuf, size = 32) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type (1 = ICO)
  header.writeUInt16LE(1, 4); // number of images

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // 0 means 256
  entry.writeUInt8(size === 256 ? 0 : size, 1); // 0 means 256
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // image size in bytes
  entry.writeUInt32LE(22, 12); // image data offset

  return Buffer.concat([header, entry, pngBuf]);
}

const png256 = buildPng(256, 8);
const png32 = buildPng(32, 1);
const ico32 = createIco(png32, 32);
const ico256 = createIco(png256, 256);

const publicDir = path.join(__dirname, '..', 'public');
const electronDir = path.join(__dirname, '..', 'electron');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico32);
fs.writeFileSync(path.join(electronDir, 'tray.ico'), ico32);
fs.writeFileSync(path.join(electronDir, 'icon.ico'), ico256);
fs.writeFileSync(path.join(electronDir, 'icon.png'), png256);
fs.writeFileSync(path.join(electronDir, 'tray_icon.png'), png32);

console.log('Icons generated successfully: icon.png (256x256), icon.ico (256x256), tray.ico (32x32)');
