const { downloadArtifact } = require('@electron/get');
const extract = require('extract-zip');
const path = require('path');
const fs = require('fs');
const { version } = require('../node_modules/electron/package.json');

async function main() {
  console.log(`Starting Electron v${version} setup...`);
  const zipPath = await downloadArtifact({
    version,
    artifactName: 'electron',
    platform: 'win32',
    arch: 'x64'
  });
  console.log(`Downloaded zip to: ${zipPath}`);
  const distDir = path.resolve(__dirname, '../node_modules/electron/dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  console.log(`Extracting to: ${distDir}`);
  await extract(zipPath, { dir: distDir });
  fs.writeFileSync(path.resolve(__dirname, '../node_modules/electron/path.txt'), 'electron.exe');
  console.log('Electron successfully installed and configured!');
}

main().catch(err => {
  console.error('Failed to setup Electron:', err);
  process.exit(1);
});
