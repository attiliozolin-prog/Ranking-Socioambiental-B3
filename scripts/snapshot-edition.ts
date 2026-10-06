// Congela as notas da edição atual em src/data/editions/<as_of>.json.
// Rode ao publicar uma edição: o site passa a mostrar a variação em relação a ela na edição seguinte.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { companies, dataset } from '../src/lib/data';

const file = fileURLToPath(new URL(`../src/data/editions/${dataset.meta.as_of}.json`, import.meta.url));
const snapshot = {
  as_of: dataset.meta.as_of,
  methodology_version: dataset.meta.methodology_version,
  scores: Object.fromEntries(companies.map((c) => [c.ticker, { score: c.score, rating: c.rating, rank: c.rank, cnpj_root: c.cnpj_root }])),
};
writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n');
console.log(`edição ${dataset.meta.as_of} congelada (${companies.length} empresas)`);
