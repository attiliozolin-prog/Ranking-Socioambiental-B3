export const SITE_URL = 'https://ranking-socioambiental-b3.vercel.app';
export const SITE_NAME = 'Ranking Socioambiental B3';
export const REPO_URL = 'https://github.com/attiliozolin-prog/Ranking-Socioambiental-B3';

/** Link para abrir uma issue de correção já preenchida. Só texto controlado entra na URL. */
export function correctionUrl(ticker?: string): string {
  const title = ticker ? `Correção de dados: ${ticker}` : 'Correção de dados';
  const body = [
    ticker ? `Empresa: ${ticker}` : '',
    '',
    'O que está incorreto?',
    '',
    'Fonte primária (link oficial) que comprova a correção:',
    '',
  ].join('\n');
  const params = new URLSearchParams({ title, body, labels: 'dados' });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
