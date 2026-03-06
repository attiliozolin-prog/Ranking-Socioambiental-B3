// ============================================================
// Tipos do Ranking Socioambiental B3
// Versão 3.0 — Motor de Score com Índices B3 e Fontes Oficiais
// ============================================================

export type EvidenceType = 'BONUS' | 'PENALTY';

export type EvidenceSource =
  // Fontes de Bônus (Índices B3)
  | 'ISE B3'
  | 'ICO2 B3'
  | 'IDiversa B3'
  | 'IGPTW B3'
  | 'S&P/B3 ESG'
  | 'IGC — Novo Mercado'
  | 'IGC — Nível 2'
  | 'IGC — Nível 1'
  | 'IGCT'
  | 'ITAG'
  | 'UN Global Compact'
  | 'GRI'
  | 'TCFD'
  | 'CDP'
  | 'DJSI'
  // Fontes de Penalidade (Órgãos Governamentais)
  | 'IBAMA'
  | 'ICMBio'
  | 'MTE — Lista Suja'
  | 'MTE'
  | 'MPT'
  | 'CADE'
  | 'CVM'
  | 'SEC'
  | 'Tribunal Federal'
  | 'Tribunal Estadual'
  | 'Banco Central'
  | 'Defesa Civil'
  // Outras
  | 'Relatório Anual'
  | 'Mídia'
  | string; // fallback para novas fontes

export type ESGDimension = 'environmental' | 'social' | 'governance' | 'all';

export type DataQuality = 'alto' | 'medio' | 'estimado';

export type Sector =
  | 'Mineração'
  | 'Petróleo e Gás'
  | 'Energia Elétrica'
  | 'Saneamento'
  | 'Financeiro'
  | 'Varejo'
  | 'Alimentos e Bebidas'
  | 'Transporte'
  | 'Saúde'
  | 'Tecnologia'
  | 'Telecomunicações'
  | 'Construção Civil'
  | 'Indústria'
  | 'Agronegócio'
  | 'Papel e Celulose'
  | 'Químico'
  | 'Logística'
  | 'Educação'
  | 'Turismo'
  | string;

export interface Dimensions {
  environmental: number; // 0–100
  social: number;        // 0–100
  governance: number;    // 0–100
}

export interface Evidence {
  type: EvidenceType;
  source: EvidenceSource;
  dimension: ESGDimension; // qual pilar é afetado
  description: string;
  impact: number;          // pontos somados/subtraídos
  date?: string;           // ISO 8601 (YYYY-MM-DD)
  link?: string;           // URL da fonte oficial
}

export interface Company {
  ticker: string;
  name: string;
  cnpj_root: string;
  sector: Sector;
  score_final: number;        // 0–100, calculado
  kill_switch?: boolean;      // true = MTE Lista Suja → score 0
  dimensions: Dimensions;
  indices_b3: string[];       // ex: ["ISE B3", "ICO2 B3", "IGC — Novo Mercado"]
  badges: string[];
  evidence_log: Evidence[];
  last_verified: string;      // ISO 8601 — data da última verificação
  data_quality: DataQuality;  // confiabilidade dos dados
}

export interface Meta {
  version: string;
  last_update: string;
  total_companies: number;
  methodology_version: string;
}

export interface RankingData {
  meta: Meta;
  companies: Company[];
}
