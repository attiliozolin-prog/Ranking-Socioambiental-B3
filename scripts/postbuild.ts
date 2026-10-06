// Pós-build: sitemap.xml + HTML estático por rota com <title>/description/OG próprios.
// O SPA continua igual; isto só melhora indexação e prévias de link (WhatsApp, LinkedIn, X),
// que não executam JavaScript. A Vercel serve arquivos estáticos antes do rewrite para /index.html.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { companies, dataset } from '../src/lib/data';
import { SITE_NAME, SITE_URL } from '../src/lib/site';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function render(path: string, title: string, description: string): string {
  const url = `${SITE_URL}${path}`;
  const full = esc(`${title} · ${SITE_NAME}`);
  const desc = esc(description);
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${full}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${full}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${esc(url)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${esc(url)}$2`);
}

function write(path: string, html: string) {
  const file = join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const pages: { path: string; title: string; description: string }[] = [
  {
    path: '/metodologia',
    title: 'Metodologia',
    description: 'Como as notas são calculadas: pilares E, S e G, práticas reconhecidas, controvérsias ponderadas por status jurídico e tempo, e materialidade setorial.',
  },
  { path: '/sobre', title: 'Sobre', description: 'Por que o Ranking Socioambiental B3 existe, como usar e como contribuir com correções.' },
  { path: '/comparar', title: 'Comparar empresas', description: 'Compare lado a lado as notas socioambientais de até 4 empresas da B3.' },
  ...companies.map((c) => ({
    path: `/empresa/${c.ticker}`,
    title: `${c.name} (${c.ticker}) — nota ${c.score}`,
    description: `${c.name} (${c.ticker}) tem nota socioambiental ${c.score}/100 (faixa ${c.rating}) e ocupa a ${c.rank}ª posição entre ${companies.length} empresas da B3. Veja a conta completa.`,
  })),
];

for (const p of pages) write(p.path, render(p.path, p.title, p.description));

const lastmod = dataset.meta.as_of;
const urls = ['/', ...pages.map((p) => p.path)]
  .map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${lastmod}</lastmod></url>`)
  .join('\n');
writeFileSync(
  join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

console.log(`postbuild: ${pages.length} páginas estáticas + sitemap.xml`);
