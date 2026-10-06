import type { ReactNode } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { PILLAR_LABEL, SEVERITY, STATUS, ratingMeta } from '../lib/methodology';
import type { Confidence, LegalStatus, LinkType, Pillar, Rating } from '../lib/types';

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

const RATING_BG: Record<Rating, string> = {
  A: 'bg-r-a',
  B: 'bg-r-b',
  C: 'bg-r-c',
  D: 'bg-r-d',
  E: 'bg-r-e',
  X: 'bg-r-x',
};
export const RATING_TEXT: Record<Rating, string> = {
  A: 'text-r-a',
  B: 'text-r-b',
  C: 'text-r-c',
  D: 'text-r-d',
  E: 'text-r-e',
  X: 'text-r-x',
};
export const PILLAR_BG: Record<Pillar, string> = { E: 'bg-pillar-e', S: 'bg-pillar-s', G: 'bg-pillar-g' };
export const PILLAR_TEXT: Record<Pillar, string> = { E: 'text-pillar-e', S: 'text-pillar-s', G: 'text-pillar-g' };

/** Selo de faixa: letra + rótulo. Cor nunca é o único sinal. */
export function RatingBadge({ rating, size = 'md', showLabel = true }: { rating: Rating; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }) {
  const meta = ratingMeta(rating);
  const box = size === 'lg' ? 'h-9 w-9 text-lg' : size === 'sm' ? 'h-5 w-5 text-[11px]' : 'h-6 w-6 text-xs';
  return (
    <span className="inline-flex items-center gap-1.5" title={`${meta.label}: ${meta.desc}`}>
      <span
        className={cx(
          'inline-grid place-items-center rounded-md font-bold text-bg',
          box,
          RATING_BG[rating],
        )}
        aria-hidden="true"
      >
        {rating}
      </span>
      {showLabel ? (
        <span className={cx('font-medium', size === 'sm' ? 'text-xs' : 'text-sm', RATING_TEXT[rating])}>{meta.label}</span>
      ) : (
        <span className="sr-only">Faixa {rating} — {meta.label}</span>
      )}
    </span>
  );
}

/** Barra horizontal 0–100 com marcador opcional (ex.: média do setor). */
export function Meter({
  value,
  color = 'bg-ink',
  marker,
  height = 'h-1.5',
  label,
}: {
  value: number;
  color?: string;
  marker?: number;
  height?: string;
  label?: string;
}) {
  return (
    <div
      className={cx('relative w-full rounded-full bg-surface-2', height)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <div className={cx('absolute inset-y-0 left-0 rounded-full', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      {marker !== undefined && (
        <div
          className="absolute -top-1 -bottom-1 w-0.5 rounded bg-ink/70"
          style={{ left: `calc(${marker}% - 1px)` }}
          title={`Média do setor: ${Math.round(marker)}`}
        />
      )}
    </div>
  );
}

/** Três mini-barras E/S/G para tabelas. */
export function PillarMini({ pillars }: { pillars: Record<Pillar, { score: number }> }) {
  return (
    <div className="grid w-full grid-cols-3 gap-2">
      {(['E', 'S', 'G'] as Pillar[]).map((p) => (
        <div key={p} className="min-w-0" title={`${PILLAR_LABEL[p]}: ${Math.round(pillars[p].score)}`}>
          <div className="mb-1 flex items-baseline justify-between text-[11px] leading-none">
            <span className={cx('font-semibold', PILLAR_TEXT[p])}>{p}</span>
            <span className="tabular text-ink-2">{Math.round(pillars[p].score)}</span>
          </div>
          <Meter value={pillars[p].score} color={PILLAR_BG[p]} height="h-1" label={`${PILLAR_LABEL[p]}`} />
        </div>
      ))}
    </div>
  );
}

const STATUS_STYLE: Record<LegalStatus, string> = {
  investigacao: 'bg-surface-2 text-ink-2 border-line',
  processo: 'bg-warn-soft text-warn border-transparent',
  acordo: 'bg-danger-soft text-danger border-transparent',
  reconhecido: 'bg-danger-soft text-danger border-transparent',
  condenacao: 'bg-danger text-bg border-transparent',
};

export function StatusChip({ status }: { status: LegalStatus }) {
  return (
    <span
      className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', STATUS_STYLE[status])}
      title={STATUS[status].desc}
    >
      {STATUS[status].label}
    </span>
  );
}

/** Gravidade 1–5 em pontos preenchidos + rótulo textual. */
export function SeverityDots({ severity }: { severity: number }) {
  const s = Math.max(1, Math.min(5, severity)) as 1 | 2 | 3 | 4 | 5;
  return (
    <span className="inline-flex items-center gap-1.5" title={`Gravidade ${s}/5 — ${SEVERITY[s].label}`}>
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={cx('h-2 w-2 rounded-full', i <= s ? (s >= 4 ? 'bg-danger' : 'bg-warn') : 'bg-line-strong')} />
        ))}
      </span>
      <span className="text-[11px] font-medium text-ink-2">{SEVERITY[s].label}</span>
    </span>
  );
}

const CONF: Record<Confidence, { label: string; cls: string; bars: number }> = {
  alta: { label: 'Confiança alta', cls: 'bg-accent', bars: 3 },
  media: { label: 'Confiança média', cls: 'bg-warn', bars: 2 },
  baixa: { label: 'Confiança baixa', cls: 'bg-danger', bars: 1 },
};

export function ConfidenceBadge({ level, reasons, compact }: { level: Confidence; reasons?: string[]; compact?: boolean }) {
  const c = CONF[level];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2" title={reasons?.length ? reasons.join('\n') : 'Dados conferidos'}>
      <span className="flex items-end gap-px" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={cx('w-1 rounded-sm', i <= c.bars ? c.cls : 'bg-line-strong')} style={{ height: 4 + i * 3 }} />
        ))}
      </span>
      <span className={compact ? 'sr-only' : ''}>{c.label}</span>
    </span>
  );
}

export function SourceLink({ href, type }: { href?: string | null; type: LinkType }) {
  if (!href) return <span className="text-xs text-ink-3">Sem link de fonte</span>;
  const isSearch = type === 'busca';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      referrerPolicy="no-referrer"
      className={cx(
        'inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline',
        isSearch ? 'text-ink-3' : 'text-info',
      )}
      title={isSearch ? 'Fonte primária pendente — link abre uma busca de apoio' : 'Abrir fonte primária'}
    >
      {isSearch ? <Search size={12} aria-hidden="true" /> : null}
      {isSearch ? 'Busca de apoio (fonte primária pendente)' : 'Fonte oficial'}
      <ArrowUpRight size={12} aria-hidden="true" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'warn' | 'danger' | 'info' }) {
  const tones = {
    neutral: 'bg-surface-2 text-ink-2',
    accent: 'bg-accent-soft text-accent',
    warn: 'bg-warn-soft text-warn',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
  };
  return <span className={cx('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function SectionTitle({ eyebrow, title, children, id }: { eyebrow?: string; title: string; children?: ReactNode; id?: string }) {
  return (
    <div className="mb-5">
      {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
      <h2 id={id} className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
        {title}
      </h2>
      {children && <div className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-serif text-3xl font-semibold tabular text-ink">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-ink-3">{hint}</dd>}
    </div>
  );
}
