// ============================================================
// Ranking Socioambiental B3 — tipos de domínio (v2)
// O arquivo de dados guarda apenas fatos; notas são derivadas
// por src/lib/scoring.ts a partir de src/lib/methodology.ts.
// ============================================================

export type Pillar = 'E' | 'S' | 'G';

/** Segmento de listagem B3. VERIFICAR = não confirmado (não pontua). */
export type Segment = 'NM' | 'N2' | 'N1' | 'BASICO' | 'BDR' | 'VERIFICAR';

export type IndexMembership =
  | 'ISE B3'
  | 'S&P/B3 ESG'
  | 'ICO2 B3'
  | 'IDiversa B3'
  | 'IGPTW B3'
  | 'ITAG';

export type Disclosure =
  | { type: 'GRI'; link?: string | null }
  | { type: 'CDP'; grade: 'A' | 'B' | 'C'; link?: string | null };

/** Status jurídico/administrativo do evento — define o peso da dedução. */
export type LegalStatus = 'investigacao' | 'processo' | 'acordo' | 'reconhecido' | 'condenacao';

/** 1 leve · 2 moderada · 3 grave · 4 muito grave · 5 catastrófica */
export type Severity = 0 | 1 | 2 | 3 | 4 | 5;

export type LinkType = 'primaria' | 'busca' | 'ausente';

export interface CompanyEvent {
  id: string;
  source: string;
  pillars: Pillar[];
  severity: Severity;
  status: LegalStatus;
  date: string; // YYYY-MM-DD
  date_precision?: 'day' | 'month' | 'year';
  description: string;
  link?: string | null;
  link_type: LinkType;
  /** quarentena: fora da nota e oculto até checagem; sinal_de_risco: exibido sem pontuar */
  review?: 'quarentena' | 'sinal_de_risco';
  review_note?: string;
}

export interface DirtyListEntry {
  date: string;
  link: string;
}

export interface Company {
  ticker: string;
  name: string;
  cnpj_root: string;
  cnpj_verified: boolean;
  sector: string;
  segment: Segment;
  indices: IndexMembership[];
  disclosures: Disclosure[];
  events: CompanyEvent[];
  tags: string[];
  last_verified: string;
  notice?: string;
  /** Cadastro de Empregadores (MTE) — exclusão automática */
  dirty_list?: DirtyListEntry;
}

export interface DatasetMeta {
  dataset_version: string;
  as_of: string;
  methodology_version: string;
  notes?: string;
}

export interface Dataset {
  meta: DatasetMeta;
  companies: Company[];
}

// ---------- Saída do motor ----------

export type Rating = 'A' | 'B' | 'C' | 'D' | 'E' | 'X';

export interface Contribution {
  label: string;
  points: number; // já na escala do pilar (positivo = soma, negativo = dedução)
  detail?: string;
  eventId?: string;
}

export interface PillarResult {
  pillar: Pillar;
  practices: number; // 0–100 — aproveitamento das práticas reconhecidas
  score: number; // 0–100
  weight: number; // peso de materialidade do setor
  additions: Contribution[];
  deductions: Contribution[];
}

export interface ScoredEvent extends CompanyEvent {
  ageYears: number;
  decay: number;
  statusWeight: number;
  /** pontos deduzidos em CADA pilar listado */
  deduction: number;
}

export interface CapInfo {
  limit: number;
  reason: string;
  eventId: string;
}

export type Confidence = 'alta' | 'media' | 'baixa';

export interface ScoredCompany extends Company {
  score: number; // 0–100, inteiro — é a nota publicada e define faixa e posição
  exactScore: number; // uma casa decimal, antes do arredondamento
  uncappedScore: number;
  rating: Rating;
  pillars: Record<Pillar, PillarResult>;
  scoredEvents: ScoredEvent[];
  riskSignals: CompanyEvent[];
  cap?: CapInfo;
  excluded: boolean;
  confidence: Confidence;
  confidenceReasons: string[];
  materialityProfile: string;
  rank: number;
  sectorRank: number;
  sectorSize: number;
  percentile: number; // 0–100 (maior = melhor)
}
