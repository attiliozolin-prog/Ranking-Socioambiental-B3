// Busca tolerante a acentos e caixa: "itau" encontra "Itaú", "sao martinho" encontra "São Martinho".

export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(fields.join(' '));
  const compact = haystack.replace(/ /g, '');
  return q.split(' ').every((term) => haystack.includes(term) || compact.includes(term));
}
