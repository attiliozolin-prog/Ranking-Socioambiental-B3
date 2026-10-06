// Histórico de edições (src/data/editions/*.json, gerado por scripts/snapshot-edition.ts).
// Só compara com edições da MESMA versão de metodologia — mudar a régua não é mudar a empresa.
import { dataset } from './data';
import type { Rating } from './types';

interface Edition {
  as_of: string;
  methodology_version: string;
  scores: Record<string, { score: number; rating: Rating; rank: number; cnpj_root: string }>;
}

const files = import.meta.glob<Edition>('../data/editions/*.json', { eager: true, import: 'default' });
const editions = Object.values(files).sort((a, b) => a.as_of.localeCompare(b.as_of));

export const previousEdition: Edition | undefined = [...editions]
  .reverse()
  .find((e) => e.as_of < dataset.meta.as_of && e.methodology_version === dataset.meta.methodology_version);

export function previousScore(ticker: string, cnpjRoot: string) {
  if (!previousEdition) return undefined;
  return (
    previousEdition.scores[ticker] ??
    Object.values(previousEdition.scores).find((s) => s.cnpj_root === cnpjRoot)
  );
}
