const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const base = __dirname;
const meta = JSON.parse(fs.readFileSync(path.join(base, 'appinfo.json'), 'utf8'));
const out = path.join(base, 'URLViewer.ipk');
const tmp = path.join(base, '.package');
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(path.join(tmp, 'control'), { recursive: true });
const app = path.join(tmp, 'usr', 'palm', 'applications', meta.id);
fs.mkdirSync(app, { recursive: true });
for (const name of ['appinfo.json', 'index.html', 'urlviewer-icon-1.0.10.png']) fs.copyFileSync(path.join(base, name), path.join(app, name));
fs.writeFileSync(path.join(tmp, 'control', 'control'), [
  `Package: ${meta.id}`, `Version: ${meta.version}`, 'Architecture: all',
  `Description: ${meta.appDescription}`, 'Maintainer: LGTV Homebrew',
  'Section: misc', 'Priority: optional', ''
].join('\n'));
function tarGzip(cwd, paths) {
  const result = cp.spawnSync('tar', ['-czf', '-', '-C', cwd, ...paths], { encoding: null, maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error((result.stderr || Buffer.from('tar failed')).toString());
  return result.stdout;
}
function arHeader(name, data) {
  const header = Buffer.alloc(60, 32);
  header.write(name + '/', 0, 16, 'ascii'); header.write('0', 16, 12, 'ascii');
  header.write('0', 28, 6, 'ascii'); header.write('0', 34, 6, 'ascii');
  header.write('100644', 40, 8, 'ascii'); header.write(String(data.length), 48, 10, 'ascii');
  header.write('`\n', 58, 2, 'ascii');
  return header;
}
const parts = [
  ['debian-binary', Buffer.from('2.0\n')],
  ['control.tar.gz', tarGzip(path.join(tmp, 'control'), ['./control'])],
  ['data.tar.gz', tarGzip(tmp, ['./usr'])]
];
const output = [Buffer.from('!<arch>\n')];
for (const [name, data] of parts) {
  output.push(arHeader(name, data), data);
  if (data.length % 2) output.push(Buffer.from('\n'));
}
fs.writeFileSync(out, Buffer.concat(output));
console.log(`${out} (${fs.statSync(out).size} bytes)`);
