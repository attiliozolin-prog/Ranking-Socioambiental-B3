import { describe, expect, it } from 'vitest';
import { decayFactor, scoreAll, scoreCompany, scoreEvent } from './scoring';
import { SEVERITY, STATUS } from './methodology';
import type { Company, CompanyEvent } from './types';

const AS_OF = '2026-03-06';

const base: Company = {
  ticker: 'TEST3',
  name: 'Empresa Teste',
  cnpj_root: '12345678',
  cnpj_verified: true,
  sector: 'Indústria',
  segment: 'BASICO',
  indices: [],
  disclosures: [],
  events: [],
  tags: [],
  last_verified: AS_OF,
};

const ev = (over: Partial<CompanyEvent>): CompanyEvent => ({
  id: 'e1',
  source: 'IBAMA',
  pillars: ['E'],
  severity: 2,
  status: 'condenacao',
  date: AS_OF,
  description: 'Teste',
  link: 'https://example.gov.br/x',
  link_type: 'primaria',
  ...over,
});

describe('motor de score', () => {
  it('empresa neutra (sem práticas e sem controvérsias) fica em 50', () => {
    const r = scoreCompany(base, AS_OF);
    expect(r.score).toBe(50);
    expect(r.pillars.E.score).toBe(50);
    expect(r.rating).toBe('C');
  });

  it('todas as práticas reconhecidas levam a 100', () => {
    const r = scoreCompany(
      {
        ...base,
        segment: 'NM',
        indices: ['ISE B3', 'ICO2 B3', 'IDiversa B3', 'IGPTW B3'],
        disclosures: [{ type: 'GRI' }, { type: 'CDP', grade: 'A' }],
      },
      AS_OF,
    );
    expect(r.pillars.E.practices).toBe(100);
    expect(r.pillars.S.practices).toBe(100);
    expect(r.pillars.G.practices).toBe(100);
    expect(r.score).toBe(100);
  });

  it('ISE B3 e S&P/B3 ESG não são contados em dobro', () => {
    const only = scoreCompany({ ...base, indices: ['ISE B3'] }, AS_OF);
    const both = scoreCompany({ ...base, indices: ['ISE B3', 'S&P/B3 ESG'] }, AS_OF);
    expect(both.score).toBe(only.score);
  });

  it('ITAG só pontua fora do Novo Mercado', () => {
    const nm = scoreCompany({ ...base, segment: 'NM', indices: ['ITAG'] }, AS_OF);
    const nmNo = scoreCompany({ ...base, segment: 'NM' }, AS_OF);
    expect(nm.pillars.G.score).toBe(nmNo.pillars.G.score);
    const n1 = scoreCompany({ ...base, segment: 'N1', indices: ['ITAG'] }, AS_OF);
    const n1No = scoreCompany({ ...base, segment: 'N1' }, AS_OF);
    expect(n1.pillars.G.score).toBeGreaterThan(n1No.pillars.G.score);
  });

  it('dedução = gravidade × peso do status × decaimento', () => {
    const e = scoreEvent(ev({ severity: 3, status: 'processo' }), AS_OF);
    expect(e.decay).toBe(1);
    expect(e.deduction).toBe(SEVERITY[3].points * STATUS.processo.weight);
  });

  it('investigação pesa menos que condenação (presunção de inocência)', () => {
    const inv = scoreCompany({ ...base, events: [ev({ status: 'investigacao' })] }, AS_OF);
    const con = scoreCompany({ ...base, events: [ev({ status: 'condenacao' })] }, AS_OF);
    expect(inv.pillars.E.score).toBeGreaterThan(con.pillars.E.score);
  });

  it('decaimento: metade do peso após uma meia-vida, sem cair abaixo do piso', () => {
    expect(decayFactor(2, SEVERITY[2].halfLife)).toBeCloseTo(0.5, 5);
    expect(decayFactor(5, 100)).toBe(SEVERITY[5].floor);
    expect(decayFactor(1, 100)).toBe(SEVERITY[1].floor);
  });

  it('evento em vários pilares deduz de cada um', () => {
    const r = scoreCompany({ ...base, events: [ev({ pillars: ['E', 'S'], severity: 3 })] }, AS_OF);
    expect(r.pillars.E.score).toBe(30);
    expect(r.pillars.S.score).toBe(30);
    expect(r.pillars.G.score).toBe(50);
  });

  it('eventos em quarentena e sinais de risco não afetam a nota', () => {
    const r = scoreCompany(
      {
        ...base,
        events: [
          ev({ id: 'q', severity: 5, review: 'quarentena', review_note: 'checar' }),
          ev({ id: 'r', severity: 0, review: 'sinal_de_risco', review_note: 'RJ' }),
        ],
      },
      AS_OF,
    );
    expect(r.score).toBe(50);
    expect(r.scoredEvents).toHaveLength(0);
    expect(r.riskSignals.map((e) => e.id)).toEqual(['r']);
  });

  it('teto de controvérsia catastrófica ativa limita a nota mesmo com ótimas práticas', () => {
    const r = scoreCompany(
      {
        ...base,
        segment: 'NM',
        indices: ['ISE B3', 'ICO2 B3', 'IDiversa B3', 'IGPTW B3'],
        disclosures: [{ type: 'GRI' }, { type: 'CDP', grade: 'A' }],
        events: [ev({ severity: 5, status: 'acordo', pillars: ['G'] })],
      },
      AS_OF,
    );
    expect(r.uncappedScore).toBeGreaterThan(40);
    expect(r.score).toBe(40);
    expect(r.cap?.limit).toBe(40);
  });

  it('teto não se aplica a controvérsia antiga (decaimento abaixo de 50%)', () => {
    const r = scoreCompany(
      { ...base, segment: 'NM', indices: ['ISE B3'], events: [ev({ severity: 4, status: 'acordo', pillars: ['G'], date: '2000-01-01' })] },
      AS_OF,
    );
    expect(r.cap).toBeUndefined();
  });

  it('Lista Suja do MTE zera a nota e marca como excluída', () => {
    const r = scoreCompany({ ...base, segment: 'NM', indices: ['ISE B3'], dirty_list: { date: '2025-01-01', link: 'https://www.gov.br/trabalho-e-emprego' } }, AS_OF);
    expect(r.score).toBe(0);
    expect(r.rating).toBe('X');
    expect(r.excluded).toBe(true);
  });

  it('peso de materialidade muda a nota final, não os pilares', () => {
    const e = [ev({ severity: 3, status: 'condenacao' })];
    const mining = scoreCompany({ ...base, sector: 'Mineração', events: e }, AS_OF);
    const bank = scoreCompany({ ...base, sector: 'Financeiro', events: e }, AS_OF);
    expect(mining.pillars.E.score).toBe(bank.pillars.E.score);
    expect(mining.score).toBeLessThan(bank.score);
  });

  it('é determinístico e as notas ficam sempre entre 0 e 100', () => {
    const r1 = scoreCompany({ ...base, events: [ev({ severity: 5, pillars: ['E', 'S', 'G'] })] }, AS_OF);
    const r2 = scoreCompany({ ...base, events: [ev({ severity: 5, pillars: ['E', 'S', 'G'] })] }, AS_OF);
    expect(r1).toEqual(r2);
    expect(r1.score).toBeGreaterThanOrEqual(0);
  });

  it('ranking: empates dividem a posição e desempate é estável', () => {
    const list = scoreAll(
      [
        { ...base, ticker: 'BBBB3', name: 'B' },
        { ...base, ticker: 'AAAA3', name: 'A' },
        { ...base, ticker: 'CCCC3', name: 'C', segment: 'NM' },
      ],
      AS_OF,
    );
    expect(list.map((c) => c.ticker)).toEqual(['CCCC3', 'AAAA3', 'BBBB3']);
    expect(list.map((c) => c.rank)).toEqual([1, 2, 2]);
    expect(list[0].percentile).toBe(100);
  });
});
