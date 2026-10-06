import raw from '../data/companies.json';
import { scoreAll } from './scoring';
import type { Dataset, ScoredCompany } from './types';

export const dataset = raw as Dataset;
export const AS_OF = dataset.meta.as_of;

export const companies: ScoredCompany[] = scoreAll(dataset.companies, AS_OF);

const byTicker = new Map(companies.map((c) => [c.ticker, c]));
export const getCompany = (ticker: string) => byTicker.get(ticker.toUpperCase());

export const sectors: string[] = [...new Set(companies.map((c) => c.sector))].sort((a, b) =>
  a.localeCompare(b, 'pt-BR'),
);

export function sectorPeers(c: ScoredCompany): ScoredCompany[] {
  return companies.filter((x) => x.sector === c.sector);
}

export function sectorAverage(sector: string): number {
  const xs = companies.filter((c) => c.sector === sector);
  return xs.reduce((s, c) => s + c.score, 0) / xs.length;
}

export const stats = (() => {
  const n = companies.length;
  const avg = companies.reduce((s, c) => s + c.score, 0) / n;
  const sorted = companies.map((c) => c.score).sort((a, b) => a - b);
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const severeActive = companies.filter((c) => c.scoredEvents.some((e) => e.severity >= 4 && e.decay >= 0.5)).length;
  const withControversy = companies.filter((c) => c.scoredEvents.length > 0).length;
  const totalEvents = companies.reduce((s, c) => s + c.scoredEvents.length, 0);
  const primaryEvents = companies.reduce((s, c) => s + c.scoredEvents.filter((e) => e.link_type === 'primaria').length, 0);
  const byRating = (['A', 'B', 'C', 'D', 'E', 'X'] as const).map((r) => ({
    rating: r,
    count: companies.filter((c) => c.rating === r).length,
  }));
  return { n, avg, median, severeActive, withControversy, totalEvents, primaryEvents, byRating };
})();
