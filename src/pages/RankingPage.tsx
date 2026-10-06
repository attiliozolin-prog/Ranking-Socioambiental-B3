import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowDownUp, Check, GitCompareArrows, Plus, Search, X } from 'lucide-react';
import { companies, dataset, sectors, stats } from '../lib/data';
import { formatDate } from '../lib/format';
import { RATINGS, ratingMeta } from '../lib/methodology';
import { matchesQuery } from '../lib/search';
import type { Pillar, Rating, ScoredCompany } from '../lib/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ConfidenceBadge, PillarMini, RATING_TEXT, RatingBadge, Stat, cx } from '../components/ui';

type SortKey = 'nota' | Pillar | 'nome';
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'nota', label: 'Nota final' },
  { key: 'E', label: 'Ambiental' },
  { key: 'S', label: 'Social' },
  { key: 'G', label: 'Governança' },
  { key: 'nome', label: 'Nome' },
];
const ALL_RATINGS: Rating[] = ['A', 'B', 'C', 'D', 'E', 'X'];
const MAX_COMPARE = 4;

const RATING_FILL: Record<Rating, string> = {
  A: 'bg-r-a',
  B: 'bg-r-b',
  C: 'bg-r-c',
  D: 'bg-r-d',
  E: 'bg-r-e',
  X: 'bg-r-x',
};

function useFilters() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const sector = params.get('setor') ?? '';
  const ratings = (params.get('faixa') ?? '').split(',').filter((r): r is Rating => ALL_RATINGS.includes(r as Rating));
  const sortRaw = params.get('ordem') as SortKey | null;
  const sort: SortKey = SORTS.some((s) => s.key === sortRaw) ? sortRaw! : 'nota';
  const asc = params.get('dir') === 'asc';
  const onlyControversy = params.get('controversias') === '1';

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  return { q, sector, ratings, sort, asc, onlyControversy, update, active: Boolean(q || sector || ratings.length || onlyControversy) };
}

function sortValue(c: ScoredCompany, key: SortKey): number {
  if (key === 'nota') return c.exactScore;
  if (key === 'nome') return 0;
  return c.pillars[key].score;
}

function Hero() {
  return (
    <section className="border-b border-line">
      <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.35fr_1fr] lg:items-end">
        <div>
          <p className="eyebrow mb-4">
            Edição de {formatDate(dataset.meta.as_of, 'month')} · {stats.n} empresas · Metodologia v{dataset.meta.methodology_version}
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Quem financia o futuro e <span className="italic text-danger">quem destrói o presente?</span>
          </h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-2">
            Notas socioambientais das maiores empresas da B3, calculadas a partir de índices da bolsa e de registros de órgãos públicos. Cada
            ponto tem origem, peso e data, e a conta é aberta.{' '}
            <Link to="/metodologia" className="font-medium text-accent underline underline-offset-4">
              Veja como calculamos
            </Link>
            .
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-2xl border border-line bg-surface p-6">
          <Stat label="Nota mediana" value={Math.round(stats.median)} hint="de 0 a 100" />
          <Stat label="Com controvérsias" value={stats.withControversy} hint={`de ${stats.n} empresas`} />
          <Stat label="Casos graves ativos" value={stats.severeActive} hint="gravidade ≥ 4, ainda recentes" />
          <Stat
            label="Fontes primárias"
            value={`${stats.primaryEvents}/${stats.totalEvents}`}
            hint="controvérsias com link oficial"
          />
        </dl>
      </div>
    </section>
  );
}

function Distribution({ selected, onToggle }: { selected: Rating[]; onToggle: (r: Rating) => void }) {
  const visible = stats.byRating.filter((b) => b.count > 0);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="eyebrow">Distribuição por faixa</p>
        <p className="text-xs text-ink-3">Clique para filtrar</p>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
        {visible.map((b) => (
          <div
            key={b.rating}
            className={cx(RATING_FILL[b.rating], 'transition-opacity', selected.length > 0 && !selected.includes(b.rating) && 'opacity-25')}
            style={{ width: `${(b.count / stats.n) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filtrar por faixa">
        {visible.map((b) => {
          const on = selected.includes(b.rating);
          return (
            <button
              key={b.rating}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(b.rating)}
              className={cx(
                'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition',
                on ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink-2 hover:border-line-strong',
              )}
            >
              <span className={cx('h-2 w-2 rounded-full', RATING_FILL[b.rating])} />
              <span className="font-semibold">{b.rating}</span>
              <span className={on ? 'text-bg/80' : 'text-ink-3'}>{ratingMeta(b.rating).label}</span>
              <span className="tabular font-medium">{b.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CompanyRow({
  c,
  selected,
  onToggleCompare,
  compareDisabled,
}: {
  c: ScoredCompany;
  selected: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
}) {
  const severe = c.scoredEvents.filter((e) => e.severity >= 3).length;
  return (
    <li className="group relative grid grid-cols-[2.25rem_1fr_auto] items-center gap-x-3 gap-y-3 px-4 py-4 transition hover:bg-surface-2/60 sm:px-5 md:grid-cols-[2.5rem_minmax(0,2.2fr)_7.5rem_minmax(0,1.6fr)_7rem_6.5rem_2.5rem]">
      <span className="tabular text-sm font-medium text-ink-3">{c.rank}º</span>

      <div className="min-w-0">
        <Link
          to={`/empresa/${c.ticker}`}
          className="block truncate font-medium text-ink after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-has-[a:focus-visible]:underline"
        >
          {c.name}
        </Link>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
          <span className="font-mono font-semibold text-ink-2">{c.ticker}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{c.sector}</span>
          {c.notice && (
            <AlertTriangle size={12} className="shrink-0 text-warn" aria-label="Evento societário a confirmar" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 justify-self-end md:justify-self-start">
        <span className={cx('font-serif text-[1.75rem] font-semibold leading-none tabular', RATING_TEXT[c.rating])}>{c.score}</span>
        <RatingBadge rating={c.rating} size="sm" showLabel={false} />
      </div>

      <div className="col-span-3 md:col-span-1">
        <PillarMini pillars={c.pillars} />
      </div>

      <div className="hidden text-xs md:block">
        {c.scoredEvents.length === 0 ? (
          <span className="text-ink-3">Nenhuma</span>
        ) : (
          <span className={cx('font-medium', severe ? 'text-danger' : 'text-warn')}>
            {c.scoredEvents.length} {c.scoredEvents.length === 1 ? 'registro' : 'registros'}
            {severe > 0 && <span className="block font-normal text-ink-3">{severe} grave(s)</span>}
          </span>
        )}
      </div>

      <div className="hidden md:block">
        <ConfidenceBadge level={c.confidence} reasons={c.confidenceReasons} />
      </div>

      <button
        type="button"
        onClick={onToggleCompare}
        disabled={compareDisabled && !selected}
        aria-pressed={selected}
        aria-label={selected ? `Remover ${c.ticker} da comparação` : `Adicionar ${c.ticker} à comparação`}
        title={compareDisabled && !selected ? `Máximo de ${MAX_COMPARE} empresas` : 'Comparar'}
        className={cx(
          'relative z-10 hidden h-8 w-8 place-items-center rounded-lg border transition md:grid',
          selected ? 'border-accent bg-accent text-accent-ink' : 'border-line text-ink-3 hover:border-line-strong hover:text-ink',
          'disabled:cursor-not-allowed disabled:opacity-40',
        )}
      >
        {selected ? <Check size={15} /> : <Plus size={15} />}
      </button>
    </li>
  );
}

export default function RankingPage() {
  useDocumentMeta(null);
  const f = useFilters();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(f.q);
  const [compare, setCompare] = useState<string[]>([]);

  // Atalho "/" foca a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Debounce leve para não reescrever a URL a cada tecla
  useEffect(() => {
    const id = setTimeout(() => {
      if (query !== f.q) f.update({ q: query.trim() || null });
    }, 150);
    return () => clearTimeout(id);
  }, [query]);

  // Compatibilidade com links da v1: /?ticker=PETR4
  const [params] = useSearchParams();
  useEffect(() => {
    const legacy = params.get('ticker');
    if (legacy && companies.some((c) => c.ticker === legacy.toUpperCase())) {
      navigate(`/empresa/${legacy.toUpperCase()}`, { replace: true });
    }
  }, [params, navigate]);

  const results = useMemo(() => {
    const list = companies.filter(
      (c) =>
        matchesQuery(f.q, c.name, c.ticker, c.sector) &&
        (!f.sector || c.sector === f.sector) &&
        (!f.ratings.length || f.ratings.includes(c.rating)) &&
        (!f.onlyControversy || c.scoredEvents.length > 0),
    );
    const dir = f.asc ? -1 : 1;
    return [...list].sort((a, b) => {
      if (f.sort === 'nome') return a.name.localeCompare(b.name, 'pt-BR') * (f.asc ? -1 : 1);
      return (sortValue(b, f.sort) - sortValue(a, f.sort)) * dir || a.name.localeCompare(b.name, 'pt-BR');
    });
  }, [f.q, f.sector, f.ratings, f.onlyControversy, f.sort, f.asc]);

  const toggleRating = (r: Rating) => {
    const next = f.ratings.includes(r) ? f.ratings.filter((x) => x !== r) : [...f.ratings, r];
    f.update({ faixa: next.join(',') || null });
  };

  const toggleCompare = (t: string) =>
    setCompare((xs) => (xs.includes(t) ? xs.filter((x) => x !== t) : xs.length < MAX_COMPARE ? [...xs, t] : xs));

  const clearAll = () => {
    setQuery('');
    f.update({ q: null, setor: null, faixa: null, controversias: null });
  };

  return (
    <>
      <Hero />

      <section className="container-page pt-10" aria-labelledby="ranking-title">
        <h2 id="ranking-title" className="sr-only">
          Ranking
        </h2>

        <div className="mb-6 grid gap-6">
          <Distribution selected={f.ratings} onToggle={toggleRating} />

          <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <label className="relative block">
              <span className="sr-only">Buscar empresa, ticker ou setor</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                inputMode="search"
                autoComplete="off"
                spellCheck={false}
                maxLength={60}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar: Itaú, VALE3, energia…"
                className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[10px] text-ink-3 sm:block">
                /
              </kbd>
            </label>
            <label className="block">
              <span className="sr-only">Setor</span>
              <select
                value={f.sector}
                onChange={(e) => f.update({ setor: e.target.value || null })}
                className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
              >
                <option value="">Todos os setores</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <label className="block flex-1">
                <span className="sr-only">Ordenar por</span>
                <select
                  value={f.sort}
                  onChange={(e) => f.update({ ordem: e.target.value === 'nota' ? null : e.target.value })}
                  className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => f.update({ dir: f.asc ? null : 'asc' })}
                className={cx(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition',
                  f.asc ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink-2 hover:text-ink',
                )}
                aria-pressed={f.asc}
                aria-label={f.asc ? 'Ordem crescente (piores primeiro)' : 'Ordem decrescente (melhores primeiro)'}
                title={f.asc ? 'Piores primeiro' : 'Melhores primeiro'}
              >
                <ArrowDownUp size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-ink-2" aria-live="polite">
              <span className="font-semibold text-ink tabular">{results.length}</span> {results.length === 1 ? 'empresa' : 'empresas'}
            </p>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={f.onlyControversy}
                onChange={(e) => f.update({ controversias: e.target.checked ? '1' : null })}
                className="h-4 w-4 rounded border-line accent-[var(--accent)]"
              />
              Só com controvérsias
            </label>
            {f.active && (
              <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
          <p className="hidden text-xs text-ink-3 md:block">Use + para comparar até {MAX_COMPARE} empresas</p>
        </div>

        <div className="card overflow-hidden">
          <div
            className="hidden grid-cols-[2.5rem_minmax(0,2.2fr)_7.5rem_minmax(0,1.6fr)_7rem_6.5rem_2.5rem] gap-x-3 border-b border-line bg-surface-2/50 px-5 py-2.5 md:grid"
            aria-hidden="true"
          >
            {['#', 'Empresa', 'Nota', 'Pilares E · S · G', 'Controvérsias', 'Dados', ''].map((h) => (
              <span key={h} className="eyebrow">
                {h}
              </span>
            ))}
          </div>

          {results.length > 0 ? (
            <ol className="divide-y divide-line" aria-label="Empresas ranqueadas">
              {results.map((c) => (
                <CompanyRow
                  key={c.ticker}
                  c={c}
                  selected={compare.includes(c.ticker)}
                  compareDisabled={compare.length >= MAX_COMPARE}
                  onToggleCompare={() => toggleCompare(c.ticker)}
                />
              ))}
            </ol>
          ) : (
            <div className="px-6 py-20 text-center">
              <p className="font-serif text-xl text-ink">Nenhuma empresa encontrada</p>
              <p className="mt-2 text-sm text-ink-2">Tente outro termo ou remova filtros.</p>
              <button type="button" onClick={clearAll} className="mt-4 text-sm font-medium text-accent hover:underline">
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-3">
          Faixas: {RATINGS.map((r) => `${r.rating} ≥ ${r.min}`).join(' · ')}. Empresas no Cadastro de Empregadores do MTE (trabalho análogo à
          escravidão) recebem nota zero e faixa X. Nota não é recomendação de compra ou venda.
        </p>
      </section>

      {compare.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/95 p-2 pl-4 shadow-2xl shadow-black/10 backdrop-blur">
            <span className="text-sm text-ink-2">
              <span className="font-mono font-semibold text-ink">{compare.join(' · ')}</span>
            </span>
            <button type="button" onClick={() => setCompare([])} className="rounded-lg px-2 py-1.5 text-sm text-ink-3 hover:text-ink">
              Limpar
            </button>
            <Link
              to={`/comparar?t=${compare.join(',')}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink"
            >
              <GitCompareArrows size={15} /> Comparar {compare.length}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
