// ============================================================
// Motor de score v4 — determinístico e puro.
// Mesma entrada (dados + data de referência) => mesma nota.
// A data de referência é `meta.as_of`, nunca o relógio do usuário.
// ============================================================
import {
  BROAD_ESG,
  CAP_ACTIVE_DECAY,
  CDP_POINTS,
  CONTROVERSY_CAPS,
  GROUP_DEDUCTION_CAP,
  MATERIALITY,
  PILLAR_BASELINE,
  PRACTICES_FACTOR,
  SECTOR_PROFILE,
  SEGMENT_LABEL,
  SEGMENT_POINTS,
  SEVERITY,
  STATUS,
  ratingFor,
} from './methodology';
import { parseISODate } from './format';
import type {
  CapInfo,
  Company,
  CompanyEvent,
  Confidence,
  Contribution,
  Pillar,
  PillarResult,
  ScoredCompany,
  ScoredEvent,
} from './types';

const PILLARS: Pillar[] = ['E', 'S', 'G'];
const YEAR_MS = 365.25 * 24 * 3600 * 1000;

export const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export function eventAgeYears(date: string, asOf: string): number {
  const age = (parseISODate(asOf).getTime() - parseISODate(date).getTime()) / YEAR_MS;
  return Math.max(0, age);
}

export function decayFactor(severity: number, ageYears: number): number {
  if (severity < 1) return 0;
  const s = SEVERITY[severity as 1 | 2 | 3 | 4 | 5];
  return Math.max(s.floor, Math.pow(0.5, ageYears / s.halfLife));
}

/** Eventos que entram na nota: exclui quarentena e sinais de risco. */
export function isScoredEvent(e: CompanyEvent): boolean {
  return !e.review && e.severity >= 1;
}

export function scoreEvent(e: CompanyEvent, asOf: string): ScoredEvent {
  const ageYears = eventAgeYears(e.date, asOf);
  const decay = decayFactor(e.severity, ageYears);
  const statusWeight = STATUS[e.status].weight;
  const base = e.severity >= 1 ? SEVERITY[e.severity as 1 | 2 | 3 | 4 | 5].points : 0;
  return { ...e, ageYears, decay, statusWeight, deduction: round1(base * statusWeight * decay) };
}

function broadEsg(company: Company): { label: string; points: number } | null {
  let best: { label: string; points: number } | null = null;
  for (const idx of company.indices) {
    const pts = BROAD_ESG[idx];
    if (pts && (!best || pts > best.points)) best = { label: idx, points: pts };
  }
  return best;
}

/** Práticas reconhecidas por pilar, em pontos de 0–100. */
export function practicesFor(company: Company): Record<Pillar, { label: string; points: number }[]> {
  const out: Record<Pillar, { label: string; points: number }[]> = { E: [], S: [], G: [] };
  const broad = broadEsg(company);
  if (broad) for (const p of PILLARS) out[p].push(broad);

  if (company.indices.includes('ICO2 B3')) out.E.push({ label: 'ICO2 B3', points: 25 });
  if (company.indices.includes('IDiversa B3')) out.S.push({ label: 'IDiversa B3', points: 20 });
  if (company.indices.includes('IGPTW B3')) out.S.push({ label: 'IGPTW B3', points: 35 });

  const seg = SEGMENT_POINTS[company.segment];
  if (seg > 0) out.G.push({ label: SEGMENT_LABEL[company.segment], points: seg });
  if (company.indices.includes('ITAG') && company.segment !== 'NM') out.G.push({ label: 'ITAG', points: 10 });

  for (const d of company.disclosures) {
    if (d.type === 'GRI') for (const p of PILLARS) out[p].push({ label: 'Relato GRI', points: 10 });
    if (d.type === 'CDP') out.E.push({ label: `CDP Clima ${d.grade}`, points: CDP_POINTS[d.grade] });
  }
  return out;
}

function confidenceFor(company: Company, scored: ScoredEvent[]): { level: Confidence; reasons: string[] } {
  const reasons: string[] = [];
  let penalty = 0;
  if (!company.cnpj_verified) {
    reasons.push('CNPJ ainda não conferido no cadastro da CVM');
    penalty += 1;
  }
  if (company.segment === 'VERIFICAR') {
    reasons.push('Segmento de listagem em verificação');
    penalty += 1;
  }
  const secondary = scored.filter((e) => e.link_type !== 'primaria').length;
  if (secondary > 0) {
    reasons.push(`${secondary} de ${scored.length} controvérsia(s) sem link para fonte primária`);
    penalty += secondary === scored.length ? 2 : 1;
  }
  if (company.notice) {
    reasons.push('Evento societário recente a confirmar');
    penalty += 1;
  }
  if (company.coverage_note) {
    reasons.push('Controvérsias ainda não pesquisadas sistematicamente');
    penalty += 3;
  }
  const level: Confidence = penalty === 0 ? 'alta' : penalty <= 2 ? 'media' : 'baixa';
  return { level, reasons };
}

type Unranked = Omit<ScoredCompany, 'rank' | 'sectorRank' | 'sectorSize' | 'percentile'>;

export function scoreCompany(company: Company, asOf: string): Unranked {
  const profileKey = SECTOR_PROFILE[company.sector] ?? 'equilibrado';
  const weights = MATERIALITY[profileKey].weights;
  const practices = practicesFor(company);

  const scoredEvents = company.events.filter(isScoredEvent).map((e) => scoreEvent(e, asOf));
  const riskSignals = company.events.filter((e) => e.review === 'sinal_de_risco');

  const pillars = {} as Record<Pillar, PillarResult>;
  for (const p of PILLARS) {
    const practiceTotal = clamp(practices[p].reduce((s, x) => s + x.points, 0));
    const additions: Contribution[] = practices[p].map((x) => ({
      label: x.label,
      points: round1(x.points * PRACTICES_FACTOR),
    }));
    const inPillar = scoredEvents.filter((e) => e.pillars.includes(p) && e.deduction > 0);
    // teto conjunto para eventos do mesmo grupo (ex.: autos do IBAMA)
    const groupTotals = new Map<string, number>();
    for (const e of inPillar) if (e.group) groupTotals.set(e.group, (groupTotals.get(e.group) ?? 0) + e.deduction);
    const deductions: Contribution[] = inPillar.map((e) => {
      const total = e.group ? groupTotals.get(e.group)! : 0;
      const factor = e.group && total > GROUP_DEDUCTION_CAP ? GROUP_DEDUCTION_CAP / total : 1;
      return {
        label: e.source,
        points: -round1(e.deduction * factor),
        detail: factor < 1 ? `${e.description} (reduzido pelo teto do grupo)` : e.description,
        eventId: e.id,
      };
    });
    const raw = PILLAR_BASELINE + practiceTotal * PRACTICES_FACTOR + deductions.reduce((s, d) => s + d.points, 0);
    pillars[p] = {
      pillar: p,
      practices: practiceTotal,
      score: round1(clamp(raw)),
      weight: weights[p],
      additions,
      deductions,
    };
  }

  const uncapped = round1(PILLARS.reduce((s, p) => s + pillars[p].score * pillars[p].weight, 0));

  let cap: CapInfo | undefined;
  for (const e of scoredEvents) {
    if (e.decay < CAP_ACTIVE_DECAY) continue;
    for (const rule of CONTROVERSY_CAPS) {
      if (rule.test(e.severity, e.status) && (!cap || rule.limit < cap.limit)) {
        cap = { limit: rule.limit, reason: rule.when, eventId: e.id };
      }
    }
  }

  const excluded = Boolean(company.dirty_list);
  let exact = cap ? Math.min(uncapped, cap.limit) : uncapped;
  if (excluded) exact = 0;
  exact = round1(exact);
  const score = Math.round(exact);
  if (cap && uncapped <= cap.limit) cap = undefined; // teto não alterou a nota

  const conf = confidenceFor(company, scoredEvents);

  return {
    ...company,
    score,
    exactScore: exact,
    uncappedScore: uncapped,
    rating: excluded ? 'X' : ratingFor(score),
    pillars,
    scoredEvents: scoredEvents.sort((a, b) => b.date.localeCompare(a.date)),
    riskSignals,
    cap,
    excluded,
    confidence: conf.level,
    confidenceReasons: conf.reasons,
    materialityProfile: profileKey,
  };
}

/** Ordenação canônica: nota desc, depois nome (desempate estável). */
export const byScore = (
  a: { score: number; exactScore: number; name: string },
  b: { score: number; exactScore: number; name: string },
) => b.score - a.score || b.exactScore - a.exactScore || a.name.localeCompare(b.name, 'pt-BR');

export function scoreAll(companies: Company[], asOf: string): ScoredCompany[] {
  const scored = companies.map((c) => scoreCompany(c, asOf)).sort(byScore);
  const n = scored.length;
  const bySector = new Map<string, Unranked[]>();
  for (const c of scored) bySector.set(c.sector, [...(bySector.get(c.sector) ?? []), c]);

  return scored.map((c) => {
    // empates recebem a mesma posição (ranking "1224")
    const rank = scored.findIndex((x) => x.score === c.score) + 1;
    const peers = bySector.get(c.sector)!;
    const sectorRank = peers.findIndex((x) => x.score === c.score) + 1;
    const below = scored.filter((x) => x.score < c.score).length;
    return {
      ...c,
      rank,
      sectorRank,
      sectorSize: peers.length,
      percentile: n > 1 ? Math.round((below / (n - 1)) * 100) : 100,
    };
  });
}
