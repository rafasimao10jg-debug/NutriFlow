import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'dist');
const files = [
  'index.html',
  'supabase-app.js',
  'manifest.webmanifest',
  'service-worker.js',
  'supabase/config.example.js',
];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of files) {
  const destination = path.join(outputDir, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(projectRoot, file), destination);
}

await cp(path.join(projectRoot, 'icons'), path.join(outputDir, 'icons'), { recursive: true });
console.log(`Static NutriFlow files prepared in ${path.relative(projectRoot, outputDir)}.`);
