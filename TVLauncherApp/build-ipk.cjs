const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const crypto = require('crypto');

const base = __dirname;
const repoRoot = path.dirname(base);
const meta = JSON.parse(fs.readFileSync(path.join(base, 'appinfo.json'), 'utf8'));
const outputPath = path.join(repoRoot, 'TVLauncher.ipk');
const tempPath = path.join(base, '.package');
const appFiles = new Set([
  'appinfo.json',
  meta.main,
  meta.icon,
  meta.largeIcon,
  'webOSTV.js',
  'WEBOSTV-LICENSE.txt',
  'app.js',
  'styles.css'
].filter(Boolean));

fs.rmSync(tempPath, { recursive: true, force: true });
fs.mkdirSync(path.join(tempPath, 'control'), { recursive: true });

const appPath = path.join(tempPath, 'usr', 'palm', 'applications', meta.id);
fs.mkdirSync(appPath, { recursive: true });
for (const name of appFiles) {
  const sourcePath = path.join(base, name);
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`Missing app package file: ${sourcePath}`);
  }
  fs.copyFileSync(sourcePath, path.join(appPath, name));
}

fs.writeFileSync(path.join(tempPath, 'control', 'control'), [
  `Package: ${meta.id}`,
  `Version: ${meta.version}`,
  'Architecture: all',
  `Description: ${meta.appDescription || meta.title}`,
  `Maintainer: ${meta.vendor || 'LGTV Homebrew'}`,
  'Section: misc',
  'Priority: optional',
  ''
].join('\n'));

function tarGzip(cwd, files) {
  const result = cp.spawnSync('tar', ['-czf', '-', '-C', cwd, ...files], {
    encoding: null,
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error((result.stderr || Buffer.from('tar failed')).toString());
  }
  return result.stdout;
}

function arHeader(name, data) {
  const header = Buffer.alloc(60, 32);
  header.write(`${name}/`, 0, 16, 'ascii');
  header.write('0', 16, 12, 'ascii');
  header.write('0', 28, 6, 'ascii');
  header.write('0', 34, 6, 'ascii');
  header.write('100644', 40, 8, 'ascii');
  header.write(String(data.length), 48, 10, 'ascii');
  header.write('`\n', 58, 2, 'ascii');
  return header;
}

const parts = [
  ['debian-binary', Buffer.from('2.0\n')],
  ['control.tar.gz', tarGzip(path.join(tempPath, 'control'), ['./control'])],
  ['data.tar.gz', tarGzip(tempPath, ['./usr'])]
];
const packageParts = [Buffer.from('!<arch>\n')];
for (const [name, data] of parts) {
  packageParts.push(arHeader(name, data), data);
  if (data.length % 2) packageParts.push(Buffer.from('\n'));
}

const packageBuffer = Buffer.concat(packageParts);
fs.writeFileSync(outputPath, packageBuffer);
const manifestPath = path.join(repoRoot, 'tvlauncher.manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.ipkHash = {
  sha256: crypto.createHash('sha256').update(packageBuffer).digest('hex')
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.rmSync(tempPath, { recursive: true, force: true });
console.log(`${outputPath} (${fs.statSync(outputPath).size} bytes)`);
