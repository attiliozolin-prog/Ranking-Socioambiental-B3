export interface Dimensions {
  environmental: number;
  social: number;
  governance: number;
}

export interface Evidence {
  type: 'BONUS' | 'PENALTY';
  source: string;
  description: string;
  impact: number;
  date?: string;
  link_ref?: string;
}

export interface Company {
  ticker: string;
  name: string;
  cnpj_root: string;
  score_final: number;
  dimensions: Dimensions;
  badges: string[];
  evidence_log: Evidence[];
}

export interface Meta {
  version: string;
  last_update: string;
  total_companies: number;
}

export interface RankingData {
  meta: Meta;
  companies: Company[];
}
