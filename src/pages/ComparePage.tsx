import { useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Minus, Plus, Search, X } from 'lucide-react';
import { companies, getCompany } from '../lib/data';
import { PILLAR_LABEL, SEGMENT_LABEL } from '../lib/methodology';
import { matchesQuery } from '../lib/search';
import type { IndexMembership, Pillar, ScoredCompany } from '../lib/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Meter, PILLAR_BG, PILLAR_TEXT, RATING_TEXT, RatingBadge, SectionTitle, cx } from '../components/ui';

const MAX = 4;
const INDICES: IndexMembership[] = ['ISE B3', 'S&P/B3 ESG', 'ICO2 B3', 'IDiversa B3', 'IGPTW B3'];

function Picker({ selected, onAdd }: { selected: string[]; onAdd: (t: string) => void }) {
  const [q, setQ] = useState('');
  const options = useMemo(
    () => (q.trim() ? companies.filter((c) => !selected.includes(c.ticker) && matchesQuery(q, c.name, c.ticker, c.sector)).slice(0, 6) : []),
    [q, selected],
  );
  const full = selected.length >= MAX;
  return (
    <div className="relative max-w-md">
      <label className="relative block">
        <span className="sr-only">Adicionar empresa à comparação</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
        <input
          type="search"
          value={q}
          disabled={full}
          maxLength={60}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && options[0]) {
              onAdd(options[0].ticker);
              setQ('');
            }
          }}
          placeholder={full ? `Máximo de ${MAX} empresas` : 'Adicionar empresa (nome ou ticker)'}
          className="h-11 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none disabled:opacity-60"
          aria-autocomplete="list"
          aria-controls="compare-options"
        />
      </label>
      {options.length > 0 && (
        <ul id="compare-options" role="listbox" className="card absolute inset-x-0 top-full z-20 mt-1 overflow-hidden p-1 shadow-xl">
          {options.map((c) => (
            <li key={c.ticker} role="option" aria-selected={false}>
              <button
                type="button"
                onClick={() => {
                  onAdd(c.ticker);
                  setQ('');
                }}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                <span className="truncate">
                  <span className="font-medium text-ink">{c.name}</span> <span className="font-mono text-xs text-ink-3">{c.ticker}</span>
                </span>
                <Plus size={14} className="shrink-0 text-ink-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, children, cols }: { label: string; children: ReactNode; cols: number }) {
  return (
    <tr className="border-t border-line align-top">
      <th scope="row" className="sticky left-0 z-10 w-40 bg-surface py-3 pr-4 text-left text-xs font-medium text-ink-3">
        {label}
      </th>
      {children}
      {Array.from({ length: Math.max(0, MAX - cols) }).map((_, i) => (
        <td key={i} className="hidden lg:table-cell" />
      ))}
    </tr>
  );
}

const best = (xs: ScoredCompany[], f: (c: ScoredCompany) => number) => Math.max(...xs.map(f));

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const tickers = [...new Set((params.get('t') ?? '').split(',').map((t) => t.trim().toUpperCase()))]
    .filter((t) => getCompany(t))
    .slice(0, MAX);
  const list = tickers.map((t) => getCompany(t)!);

  useDocumentMeta(list.length ? `Comparar ${tickers.join(', ')}` : 'Comparar empresas', 'Compare lado a lado as notas socioambientais de até 4 empresas da B3.');

  const set = (ts: string[]) => {
    const next = new URLSearchParams(params);
    if (ts.length) next.set('t', ts.join(','));
    else next.delete('t');
    setParams(next, { replace: true });
  };

  const maxScore = list.length ? best(list, (c) => c.score) : 0;

  return (
    <div className="container-page py-10 sm:py-14">
      <SectionTitle eyebrow="Ferramenta" title="Comparar empresas">
        Escolha até {MAX} empresas para comparar notas, pilares, práticas e controvérsias. O link desta página guarda a seleção e pode ser
        compartilhado.
      </SectionTitle>

      <Picker selected={tickers} onAdd={(t) => set([...tickers, t])} />

      {list.length === 0 ? (
        <div className="card mt-8 px-6 py-16 text-center">
          <p className="font-serif text-xl text-ink">Nenhuma empresa selecionada</p>
          <p className="mt-2 text-sm text-ink-2">Busque acima ou experimente uma comparação pronta:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              ['Bancos', 'ITUB4,BBDC4,BBAS3,SANB11'],
              ['Mineração e siderurgia', 'VALE3,CMIN3,GGBR4,CSNA3'],
              ['Proteína animal', 'JBSS3,BRFS3,MRFG3,BEEF3'],
              ['Varejo', 'LREN3,MGLU3,AMER3,ASAI3'],
            ].map(([label, ts]) => (
              <button
                key={label}
                type="button"
                onClick={() => set(ts.split(','))}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-2 hover:border-line-strong hover:text-ink"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card mt-8 overflow-x-auto p-5">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-40 bg-surface" />
                {list.map((c) => (
                  <th key={c.ticker} scope="col" className="min-w-[10rem] px-3 pb-4 text-left align-top font-normal">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/empresa/${c.ticker}`} className="font-medium text-ink hover:underline">
                        {c.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => set(tickers.filter((t) => t !== c.ticker))}
                        className="shrink-0 rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
                        aria-label={`Remover ${c.ticker}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span className="font-mono text-xs text-ink-3">{c.ticker}</span>
                  </th>
                ))}
                {Array.from({ length: MAX - list.length }).map((_, i) => (
                  <th key={i} className="hidden min-w-[10rem] lg:table-cell" />
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Nota final" cols={list.length}>
                {list.map((c) => (
                  <td key={c.ticker} className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cx('font-serif text-4xl font-semibold tabular', RATING_TEXT[c.rating])}>{c.score}</span>
                      {c.score === maxScore && list.length > 1 && <span className="text-xs font-medium text-accent">maior</span>}
                    </div>
                    <div className="mt-1.5">
                      <RatingBadge rating={c.rating} size="sm" />
                    </div>
                  </td>
                ))}
              </Row>
              {(['E', 'S', 'G'] as Pillar[]).map((p) => (
                <Row key={p} label={PILLAR_LABEL[p]} cols={list.length}>
                  {list.map((c) => (
                    <td key={c.ticker} className="px-3 py-3">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className={cx('font-semibold tabular', PILLAR_TEXT[p])}>{Math.round(c.pillars[p].score)}</span>
                        <span className="text-ink-3">peso {Math.round(c.pillars[p].weight * 100)}%</span>
                      </div>
                      <Meter value={c.pillars[p].score} color={PILLAR_BG[p]} label={`${PILLAR_LABEL[p]} ${c.ticker}`} />
                    </td>
                  ))}
                </Row>
              ))}
              <Row label="Posição" cols={list.length}>
                {list.map((c) => (
                  <td key={c.ticker} className="px-3 py-3 tabular text-ink-2">
                    {c.rank}º geral · {c.sectorRank}º de {c.sectorSize} em {c.sector}
                  </td>
                ))}
              </Row>
              <Row label="Segmento" cols={list.length}>
                {list.map((c) => (
                  <td key={c.ticker} className="px-3 py-3 text-ink-2">
                    {SEGMENT_LABEL[c.segment]}
                  </td>
                ))}
              </Row>
              {INDICES.map((i) => (
                <Row key={i} label={i} cols={list.length}>
                  {list.map((c) => (
                    <td key={c.ticker} className="px-3 py-3">
                      {c.indices.includes(i) ? (
                        <Check size={16} className="text-accent" aria-label="Sim" />
                      ) : (
                        <Minus size={16} className="text-line-strong" aria-label="Não" />
                      )}
                    </td>
                  ))}
                </Row>
              ))}
              <Row label="Controvérsias" cols={list.length}>
                {list.map((c) => {
                  const sev = Math.max(0, ...c.scoredEvents.map((e) => e.severity));
                  return (
                    <td key={c.ticker} className="px-3 py-3 text-ink-2">
                      {c.scoredEvents.length === 0 ? (
                        <span className="text-ink-3">Nenhuma</span>
                      ) : (
                        <>
                          <span className={cx('font-medium', sev >= 4 ? 'text-danger' : 'text-warn')}>{c.scoredEvents.length}</span>
                          <span className="text-ink-3"> · gravidade máx. {sev}/5</span>
                        </>
                      )}
                      {c.cap && <p className="mt-1 text-xs text-danger">Teto de {c.cap.limit} aplicado</p>}
                    </td>
                  );
                })}
              </Row>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
