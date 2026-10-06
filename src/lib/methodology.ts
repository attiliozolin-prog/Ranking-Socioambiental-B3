// ============================================================
// Metodologia v4.0 — fonte única de verdade.
// O motor (scoring.ts) e a página /metodologia leem DESTE arquivo,
// então o que é publicado é exatamente o que é calculado.
// ============================================================
import type { IndexMembership, LegalStatus, Pillar, Rating, Segment, Severity } from './types';

export const METHODOLOGY_VERSION = '4.0';

export const PILLAR_LABEL: Record<Pillar, string> = {
  E: 'Ambiental',
  S: 'Social',
  G: 'Governança',
};

/** Nota de partida de cada pilar: empresa sem reconhecimentos e sem controvérsias. */
export const PILLAR_BASELINE = 50;
/** Práticas reconhecidas (0–100) somam até +50 pontos no pilar. */
export const PRACTICES_FACTOR = 0.5;

// ---------- Práticas reconhecidas (pontos de 0–100 por pilar) ----------

/**
 * ISE B3 e S&P/B3 Brasil ESG avaliam a empresa de forma ampla e se sobrepõem.
 * Contamos apenas o MAIOR dos dois (sem dupla contagem).
 */
export const BROAD_ESG: Partial<Record<IndexMembership, number>> = {
  'ISE B3': 35,
  'S&P/B3 ESG': 21,
};

export const PILLAR_PRACTICES: Record<Pillar, { key: string; label: string; points: number; desc: string }[]> = {
  E: [
    { key: 'broad', label: 'ISE B3 (ou S&P/B3 ESG: 21)', points: 35, desc: 'Avaliação ESG ampla — conta só o maior dos dois índices' },
    { key: 'ICO2 B3', label: 'ICO2 B3', points: 30, desc: 'Inventário de emissões de GEE publicado e eficiência de carbono' },
    { key: 'CDP', label: 'CDP Clima (A: 25 · B: 15 · C: 5)', points: 25, desc: 'Nota no Carbon Disclosure Project' },
    { key: 'GRI', label: 'Relato GRI', points: 10, desc: 'Relatório de sustentabilidade no padrão GRI' },
  ],
  S: [
    { key: 'broad', label: 'ISE B3 (ou S&P/B3 ESG: 21)', points: 35, desc: 'Avaliação ESG ampla — conta só o maior dos dois índices' },
    { key: 'IDiversa B3', label: 'IDiversa B3', points: 30, desc: 'Diversidade de gênero e raça na liderança e no quadro' },
    { key: 'IGPTW B3', label: 'IGPTW B3', points: 25, desc: 'Certificação Great Place to Work' },
    { key: 'GRI', label: 'Relato GRI', points: 10, desc: 'Relatório de sustentabilidade no padrão GRI' },
  ],
  G: [
    { key: 'segment', label: 'Segmento de listagem (NM: 55 · N2: 30 · N1: 15)', points: 55, desc: 'Regras de governança exigidas pela B3 — no Novo Mercado inclui o tag along de 100%' },
    { key: 'broad', label: 'ISE B3 (ou S&P/B3 ESG: 21)', points: 35, desc: 'Avaliação ESG ampla — conta só o maior dos dois índices' },
    { key: 'GRI', label: 'Relato GRI', points: 10, desc: 'Relatório de sustentabilidade no padrão GRI' },
    { key: 'ITAG', label: 'ITAG (fora do Novo Mercado)', points: 10, desc: 'Tag along diferenciado — no Novo Mercado já está contado no segmento' },
  ],
};

export const SEGMENT_POINTS: Record<Segment, number> = {
  NM: 55,
  N2: 30,
  N1: 15,
  BASICO: 0,
  BDR: 0,
  VERIFICAR: 0,
};

export const SEGMENT_LABEL: Record<Segment, string> = {
  NM: 'Novo Mercado',
  N2: 'Nível 2',
  N1: 'Nível 1',
  BASICO: 'Básico',
  BDR: 'BDR (emissor estrangeiro)',
  VERIFICAR: 'Em verificação',
};

export const CDP_POINTS = { A: 25, B: 15, C: 5 } as const;

// ---------- Controvérsias ----------

export const SEVERITY: Record<Exclude<Severity, 0>, { label: string; points: number; halfLife: number; floor: number; example: string }> = {
  1: { label: 'Leve', points: 4, halfLife: 3, floor: 0.1, example: 'Notificação administrativa isolada' },
  2: { label: 'Moderada', points: 10, halfLife: 3, floor: 0.1, example: 'Auto de infração, ação trabalhista coletiva' },
  3: { label: 'Grave', points: 20, halfLife: 5, floor: 0.1, example: 'Embargo, dano ambiental relevante, cadeia ligada a desmatamento' },
  4: { label: 'Muito grave', points: 35, halfLife: 8, floor: 0.25, example: 'Corrupção transnacional, morte por violência, fraude' },
  5: { label: 'Catastrófica', points: 50, halfLife: 12, floor: 0.5, example: 'Rompimento de barragem, colapso geológico, fraude sistêmica' },
};

/** Presunção de inocência: quanto menos conclusivo o status, menor o peso. */
export const STATUS: Record<LegalStatus, { label: string; weight: number; desc: string }> = {
  investigacao: { label: 'Investigação', weight: 0.2, desc: 'Apuração aberta, sem acusação formal' },
  processo: { label: 'Processo / autuação', weight: 0.5, desc: 'Auto de infração ou ação judicial sem decisão final' },
  acordo: { label: 'Acordo / TAC', weight: 0.75, desc: 'Acordo, TAC ou termo de reparação firmado' },
  reconhecido: { label: 'Reconhecido pela empresa', weight: 0.9, desc: 'A própria empresa admitiu o fato em comunicado oficial (ex.: fato relevante)' },
  condenacao: { label: 'Condenação', weight: 1, desc: 'Decisão condenatória judicial ou sanção administrativa aplicada' },
};

/**
 * Limite de nota por controvérsia ativa (decaimento ≥ 50%).
 * Impede que bons índices "compensem" um desastre recente.
 */
const CONCLUSIVE: LegalStatus[] = ['acordo', 'reconhecido', 'condenacao'];
export const CONTROVERSY_CAPS: { limit: number; when: string; test: (sev: number, status: LegalStatus) => boolean }[] = [
  { limit: 40, when: 'Controvérsia catastrófica com acordo, reconhecimento ou condenação', test: (s, st) => s >= 5 && CONCLUSIVE.includes(st) },
  { limit: 55, when: 'Controvérsia catastrófica em processo, ou muito grave com acordo, reconhecimento ou condenação', test: (s, st) => (s >= 5 && st === 'processo') || (s === 4 && CONCLUSIVE.includes(st)) },
];
export const CAP_ACTIVE_DECAY = 0.5;

// ---------- Materialidade setorial ----------

export const MATERIALITY: Record<string, { label: string; weights: Record<Pillar, number>; desc: string }> = {
  ambiental: { label: 'Alto impacto ambiental', weights: { E: 0.45, S: 0.3, G: 0.25 }, desc: 'Extração, transformação de recursos naturais, energia e proteína animal' },
  pessoas: { label: 'Intensivo em pessoas', weights: { E: 0.25, S: 0.45, G: 0.3 }, desc: 'Varejo, saúde, educação e serviços com grande força de trabalho e clientes' },
  capital: { label: 'Intensivo em capital financeiro', weights: { E: 0.2, S: 0.3, G: 0.5 }, desc: 'Bancos, seguradoras, holdings e plataformas, onde governança domina o risco' },
  equilibrado: { label: 'Equilibrado', weights: { E: 1 / 3, S: 1 / 3, G: 1 / 3 }, desc: 'Indústria e transporte com riscos distribuídos' },
};

export const SECTOR_PROFILE: Record<string, keyof typeof MATERIALITY> = {
  'Mineração': 'ambiental',
  'Siderurgia': 'ambiental',
  'Petróleo e Gás': 'ambiental',
  'Químico': 'ambiental',
  'Papel e Celulose': 'ambiental',
  'Agronegócio': 'ambiental',
  'Agroindústria': 'ambiental',
  'Alimentos e Bebidas': 'ambiental',
  'Energia': 'ambiental',
  'Saneamento': 'ambiental',
  'Materiais': 'ambiental',
  'Transporte Aéreo': 'ambiental',
  'Varejo': 'pessoas',
  'Saúde': 'pessoas',
  'Educação': 'pessoas',
  'Serviços': 'pessoas',
  'Telecomunicações': 'pessoas',
  'Construção Civil': 'pessoas',
  'Financeiro': 'capital',
  'Holding': 'capital',
  'Tecnologia': 'capital',
  'Imobiliário': 'capital',
  'Indústria': 'equilibrado',
  'Transporte': 'equilibrado',
};

// ---------- Faixas de classificação ----------

export const RATINGS: { rating: Rating; min: number; label: string; desc: string }[] = [
  { rating: 'A', min: 80, label: 'Liderança', desc: 'Práticas amplamente reconhecidas e sem controvérsias relevantes' },
  { rating: 'B', min: 65, label: 'Avançado', desc: 'Boas práticas, controvérsias pontuais ou antigas' },
  { rating: 'C', min: 50, label: 'Intermediário', desc: 'Reconhecimentos limitados ou controvérsias moderadas' },
  { rating: 'D', min: 35, label: 'Atenção', desc: 'Controvérsias relevantes pesam sobre as práticas' },
  { rating: 'E', min: 0, label: 'Crítico', desc: 'Controvérsias graves ou catastróficas ativas' },
];
export const EXCLUDED_RATING = { rating: 'X' as const, label: 'Excluída', desc: 'Presente no Cadastro de Empregadores do MTE (trabalho análogo à escravidão)' };

export function ratingFor(score: number): Rating {
  return RATINGS.find((r) => score >= r.min)?.rating ?? 'E';
}

export function ratingMeta(rating: Rating) {
  if (rating === 'X') return EXCLUDED_RATING;
  return RATINGS.find((r) => r.rating === rating)!;
}

export const CHANGELOG = [
  {
    version: '4.0',
    date: '2026-10',
    items: [
      'Notas passam a ser calculadas pelo motor a partir dos fatos — antes, 93 de 100 notas publicadas não batiam com a fórmula divulgada.',
      'Nota por pilar (E, S, G) com pesos de materialidade por setor, em vez de soma única de bônus.',
      'Penalidades ponderadas por status jurídico (investigação ≠ condenação) e com decaimento temporal.',
      'Teto de nota para controvérsias catastróficas ou muito graves ainda ativas.',
      'Fim da dupla contagem entre ISE B3 e S&P/B3 ESG; IGCT (critério de liquidez) deixa de pontuar.',
      'Segmento de listagem corrigido: Novo Mercado só admite ações ON; 15 papéis PN, units ou BDR estavam marcados como NM.',
      'Recuperação judicial deixa de ser penalidade socioambiental e vira sinal de risco informativo.',
      '8 CNPJs corrigidos e eventos com erro factual colocados em quarentena até checagem em fonte primária.',
    ],
  },
  {
    version: '3.0',
    date: '2026-03',
    items: ['Nota = 50 + Σ bônus − Σ penalidades, limitada a 0–100; Lista Suja zera a nota.'],
  },
];
