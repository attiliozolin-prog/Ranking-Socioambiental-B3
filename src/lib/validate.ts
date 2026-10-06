// Validação estrutural e de regras de negócio do dataset.
// Roda no `npm run validate`, nos testes e antes de todo build — dado inválido não vai ao ar.
import { SECTOR_PROFILE, STATUS } from './methodology';
import type { Dataset } from './types';

export interface ValidationReport {
  errors: string[];
  warnings: string[];
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const TICKER = /^[A-Z0-9]{4}(3|4|5|6|11|3[1-5])$/;
const SEGMENTS = new Set(['NM', 'N2', 'N1', 'BASICO', 'BDR', 'VERIFICAR']);
const INDICES = new Set(['ISE B3', 'S&P/B3 ESG', 'ICO2 B3', 'IDiversa B3', 'IGPTW B3', 'ITAG']);
const PILLARS = new Set(['E', 'S', 'G']);

function isSafeUrl(u: string): boolean {
  try {
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}

function isRealDate(s: string): boolean {
  if (!ISO.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function validateDataset(data: Dataset): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { meta, companies } = data;

  if (!isRealDate(meta.as_of)) errors.push(`meta.as_of inválido: ${meta.as_of}`);

  const tickers = new Set<string>();
  const cnpjs = new Map<string, string>();
  const eventIds = new Set<string>();

  for (const c of companies) {
    const at = `[${c.ticker}]`;
    if (!TICKER.test(c.ticker)) errors.push(`${at} ticker fora do padrão B3`);
    if (tickers.has(c.ticker)) errors.push(`${at} ticker duplicado`);
    tickers.add(c.ticker);

    if (!/^\d{8}$/.test(c.cnpj_root)) errors.push(`${at} CNPJ raiz deve ter 8 dígitos`);
    const other = cnpjs.get(c.cnpj_root);
    if (other) errors.push(`${at} CNPJ raiz duplicado com ${other}`);
    cnpjs.set(c.cnpj_root, c.ticker);
    if (!c.cnpj_verified) warnings.push(`${at} CNPJ não verificado`);

    if (!c.name.trim()) errors.push(`${at} nome vazio`);
    if (!(c.sector in SECTOR_PROFILE)) errors.push(`${at} setor sem perfil de materialidade: ${c.sector}`);

    if (!SEGMENTS.has(c.segment)) errors.push(`${at} segmento inválido: ${c.segment}`);
    // Regra B3: Novo Mercado admite apenas ações ordinárias (ON, final 3).
    if (c.segment === 'NM' && !c.ticker.endsWith('3')) errors.push(`${at} Novo Mercado exige ação ON (final 3)`);
    if (/3[1-5]$/.test(c.ticker) && c.segment !== 'BDR') errors.push(`${at} ticker de BDR com segmento ${c.segment}`);
    if (c.segment === 'VERIFICAR') warnings.push(`${at} segmento de listagem em verificação`);

    for (const i of c.indices) if (!INDICES.has(i)) errors.push(`${at} índice desconhecido: ${i}`);
    if (new Set(c.indices).size !== c.indices.length) errors.push(`${at} índice repetido`);

    for (const d of c.disclosures) {
      if (d.link && !isSafeUrl(d.link)) errors.push(`${at} link de divulgação não-HTTPS: ${d.link}`);
    }

    if (!isRealDate(c.last_verified)) errors.push(`${at} last_verified inválido`);
    if (c.dirty_list && (!isRealDate(c.dirty_list.date) || !isSafeUrl(c.dirty_list.link))) {
      errors.push(`${at} registro da Lista Suja precisa de data válida e link HTTPS`);
    }
    if (c.notice) warnings.push(`${at} aviso societário: ${c.notice}`);

    for (const e of c.events) {
      const ev = `${at}{${e.id}}`;
      if (eventIds.has(e.id)) errors.push(`${ev} id de evento duplicado`);
      eventIds.add(e.id);
      if (!isRealDate(e.date)) errors.push(`${ev} data inválida: ${e.date}`);
      else if (e.date > meta.as_of) errors.push(`${ev} data posterior à data de referência`);
      if (!(e.status in STATUS)) errors.push(`${ev} status inválido: ${e.status}`);
      if (!e.pillars.length || e.pillars.some((p) => !PILLARS.has(p))) errors.push(`${ev} pilares inválidos`);
      if (!e.review && (e.severity < 1 || e.severity > 5)) errors.push(`${ev} gravidade deve estar entre 1 e 5`);
      if (e.review && !e.review_note) errors.push(`${ev} evento em revisão precisa de review_note`);
      if (!e.description.trim()) errors.push(`${ev} descrição vazia`);
      if (e.link && !isSafeUrl(e.link)) errors.push(`${ev} link não-HTTPS: ${e.link}`);
      const expected = !e.link ? 'ausente' : e.link.includes('google.com/search') ? 'busca' : 'primaria';
      if (e.link_type !== expected) errors.push(`${ev} link_type "${e.link_type}" não corresponde ao link (${expected})`);
      if (!e.review && e.link_type !== 'primaria') warnings.push(`${ev} sem fonte primária`);
      if (e.review === 'quarentena') warnings.push(`${ev} em quarentena: ${e.review_note}`);
    }
  }

  return { errors, warnings };
}
