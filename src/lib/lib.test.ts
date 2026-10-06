import { describe, expect, it } from 'vitest';
import { formatCnpjRoot, formatDate, formatPoints, parseISODate } from './format';
import { matchesQuery, normalize } from './search';
import { validateDataset } from './validate';
import { companies, dataset } from './data';
import { ratingFor } from './methodology';

describe('formatação', () => {
  it('não desloca datas para o dia anterior (bug de fuso da v1)', () => {
    expect(formatDate('2023-03-15')).toBe('15 mar 2023');
    expect(formatDate('2024-01-01', 'year')).toBe('2024');
    expect(formatDate('2023-08-01', 'month')).toBe('ago/2023');
  });

  it('rejeita datas fora do padrão', () => {
    expect(() => parseISODate('06/03/2026')).toThrow();
  });

  it('formata pontos com sinal e vírgula decimal', () => {
    expect(formatPoints(12.5)).toBe('+12,5');
    expect(formatPoints(-10)).toBe('−10');
    expect(formatPoints(0)).toBe('0');
  });

  it('formata CNPJ raiz', () => {
    expect(formatCnpjRoot('33592510')).toBe('33.592.510');
  });
});

describe('busca', () => {
  it('ignora acentos e caixa', () => {
    expect(normalize('Itaú Unibanco')).toBe('itau unibanco');
    expect(matchesQuery('itau', 'Itaú Unibanco', 'ITUB4')).toBe(true);
    expect(matchesQuery('SAO MARTINHO', 'São Martinho S.A.')).toBe(true);
  });

  it('encontra por ticker e por termos combinados', () => {
    expect(matchesQuery('petr4', 'Petrobras', 'PETR4')).toBe(true);
    expect(matchesQuery('lojas renner', 'Lojas Renner S.A.')).toBe(true);
    expect(matchesQuery('renner vale', 'Lojas Renner S.A.')).toBe(false);
  });

  it('busca vazia retorna tudo', () => {
    expect(matchesQuery('   ', 'qualquer')).toBe(true);
  });
});

describe('dataset publicado', () => {
  it('passa na validação sem erros', () => {
    expect(validateDataset(dataset).errors).toEqual([]);
  });

  it('toda nota publicada é reproduzível pelo motor e coerente com a faixa', () => {
    for (const c of companies) {
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(100);
      if (!c.excluded) expect(c.rating).toBe(ratingFor(c.score));
    }
  });

  it('ranking está ordenado e sem posições inválidas', () => {
    for (let i = 1; i < companies.length; i++) {
      expect(companies[i - 1].score).toBeGreaterThanOrEqual(companies[i].score);
      expect(companies[i].rank).toBeGreaterThanOrEqual(companies[i - 1].rank);
    }
  });
});
