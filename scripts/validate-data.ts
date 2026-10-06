// npm run validate — falha (exit 1) se houver erro; lista avisos de qualidade.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDataset } from '../src/lib/validate';
import type { Dataset } from '../src/lib/types';

const data = JSON.parse(readFileSync(fileURLToPath(new URL('../src/data/companies.json', import.meta.url)), 'utf-8')) as Dataset;
const { errors, warnings } = validateDataset(data);
const verbose = process.argv.includes('--verbose');

const groups = new Map<string, number>();
for (const w of warnings) {
  const key = w.replace(/^\[[^\]]+\](\{[^}]+\})?\s*/, '').split(':')[0];
  groups.set(key, (groups.get(key) ?? 0) + 1);
}

console.log(`Dataset ${data.meta.dataset_version} · referência ${data.meta.as_of} · ${data.companies.length} empresas`);
if (verbose) for (const w of warnings) console.log(`  aviso  ${w}`);
else for (const [k, n] of groups) console.log(`  aviso  ${n}× ${k}`);
for (const e of errors) console.error(`  ERRO   ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} erro(s). Corrija src/data/companies.json antes de publicar.`);
  process.exit(1);
}
console.log(`\nOK — 0 erros, ${warnings.length} avisos${verbose ? '' : ' (use --verbose para detalhar)'}.`);
