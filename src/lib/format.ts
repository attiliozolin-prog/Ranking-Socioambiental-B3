// Utilitários de formatação.
// Datas "YYYY-MM-DD" são tratadas como datas de calendário: `new Date('2023-03-15')`
// interpreta UTC e, no fuso de Brasília, exibia o dia anterior (bug da v1).

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function parseISODate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`Data inválida (esperado YYYY-MM-DD): ${iso}`);
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

export function formatDate(iso: string, precision: 'day' | 'month' | 'year' = 'day'): string {
  const d = parseISODate(iso);
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  if (precision === 'year') return String(year);
  if (precision === 'month') return `${month}/${year}`;
  return `${String(day).padStart(2, '0')} ${month} ${year}`;
}

export function formatScore(n: number): string {
  return Math.round(n).toString();
}

export function formatPoints(n: number): string {
  const v = Math.round(n * 10) / 10;
  const s = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1).replace('.', ',');
  return v > 0 ? `+${s}` : s.replace('-', '−');
}

export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function formatCnpjRoot(root: string): string {
  return root.length === 8 ? `${root.slice(0, 2)}.${root.slice(2, 5)}.${root.slice(5)}` : root;
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
