import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowUpRight, Ban, Check, CircleSlash, Flag, GitCompareArrows, Info, ShieldCheck } from 'lucide-react';
import { companies, dataset, getCompany, sectorAverage, sectorPeers } from '../lib/data';
import { formatCnpjRoot, formatDate, formatPoints, formatPercent, plural } from '../lib/format';
import { MATERIALITY, PILLAR_BASELINE, PILLAR_LABEL, SEGMENT_LABEL, SEVERITY, STATUS, ratingMeta } from '../lib/methodology';
import { B3_SEGMENTS, INDEX_INFO } from '../lib/sources';
import { correctionUrl } from '../lib/site';
import type { Pillar, ScoredCompany, ScoredEvent } from '../lib/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  ConfidenceBadge,
  Meter,
  PILLAR_BG,
  PILLAR_TEXT,
  RATING_TEXT,
  RatingBadge,
  SectionTitle,
  SeverityDots,
  SourceLink,
  StatusChip,
  Tag,
  cx,
} from '../components/ui';
import NotFoundPage from './NotFoundPage';

const PILLARS: Pillar[] = ['E', 'S', 'G'];

function Banner({ tone, icon, children }: { tone: 'warn' | 'danger' | 'info'; icon: ReactNode; children: ReactNode }) {
  const tones = {
    warn: 'border-warn/30 bg-warn-soft text-warn',
    danger: 'border-danger/30 bg-danger-soft text-danger',
    info: 'border-info/30 bg-info-soft text-info',
  };
  return (
    <div className={cx('flex gap-3 rounded-xl border px-4 py-3 text-sm', tones[tone])} role="note">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function Header({ c }: { c: ScoredCompany }) {
  return (
    <header className="border-b border-line">
      <div className="container-page py-8 sm:py-10">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft size={15} /> Ranking
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-xs font-semibold text-bg">{c.ticker}</span>
          <Link to={`/?setor=${encodeURIComponent(c.sector)}`} className="hover:text-ink hover:underline">
            {c.sector}
          </Link>
          <span aria-hidden="true">·</span>
          <span>{SEGMENT_LABEL[c.segment]}</span>
          {c.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{c.name}</h1>

        <div className="mt-6 space-y-3">
          {c.excluded && c.dirty_list && (
            <Banner tone="danger" icon={<Ban size={16} />}>
              <strong>Excluída do ranking:</strong> empresa presente no Cadastro de Empregadores que submeteram trabalhadores a condições
              análogas à escravidão (MTE), desde {formatDate(c.dirty_list.date)}. A nota é zerada independentemente de outros fatores.
            </Banner>
          )}
          {c.cap && (
            <Banner tone="danger" icon={<CircleSlash size={16} />}>
              <strong>Teto de {c.cap.limit} pontos aplicado.</strong> {c.cap.reason}. Sem o teto, a nota seria{' '}
              <span className="tabular">{Math.round(c.uncappedScore)}</span>.{' '}
              <a href={`#evento-${c.cap.eventId}`} className="underline underline-offset-2">
                Ver o registro
              </a>
            </Banner>
          )}
          {c.notice && (
            <Banner tone="warn" icon={<AlertTriangle size={16} />}>
              <strong>Evento societário a confirmar:</strong> {c.notice}
            </Banner>
          )}
        </div>
      </div>
    </header>
  );
}

function ScorePanel({ c }: { c: ScoredCompany }) {
  const avg = sectorAverage(c.sector);
  const meta = ratingMeta(c.rating);
  const profile = MATERIALITY[c.materialityProfile];
  return (
    <section className="container-page grid gap-4 py-8 lg:grid-cols-[1fr_1.6fr]" aria-label="Nota">
      <div className="card flex flex-col justify-between p-6">
        <div>
          <p className="eyebrow">Nota final</p>
          <div className="mt-2 flex items-end gap-3">
            <span className={cx('font-serif text-7xl font-semibold leading-none tabular', RATING_TEXT[c.rating])}>{c.score}</span>
            <span className="mb-2 text-sm text-ink-3">/ 100</span>
          </div>
          <div className="mt-3">
            <RatingBadge rating={c.rating} size="md" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{meta.desc}.</p>
        </div>
        <div className="mt-6 space-y-3 border-t border-line pt-5">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="eyebrow">Posição geral</dt>
              <dd className="mt-1 font-semibold tabular text-ink">
                {c.rank}º <span className="font-normal text-ink-3">de {companies.length}</span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">No setor</dt>
              <dd className="mt-1 font-semibold tabular text-ink">
                {c.sectorRank}º <span className="font-normal text-ink-3">de {c.sectorSize}</span>
              </dd>
            </div>
          </dl>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-ink-3">
              <span>Comparação com o setor</span>
              <span className="tabular">média {Math.round(avg)}</span>
            </div>
            <Meter value={c.score} marker={avg} color="bg-ink" height="h-2" label="Nota em relação ao setor" />
          </div>
          <p className="text-xs text-ink-3">
            Melhor que <span className="tabular">{c.percentile}%</span> das empresas avaliadas.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="eyebrow">Pilares</p>
          <p className="text-xs text-ink-3">
            Pesos do perfil <span className="font-medium text-ink-2">“{profile.label}”</span>
          </p>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {PILLARS.map((p) => {
            const r = c.pillars[p];
            return (
              <div key={p}>
                <div className="flex items-baseline justify-between">
                  <span className={cx('text-sm font-semibold', PILLAR_TEXT[p])}>{PILLAR_LABEL[p]}</span>
                  <span className="text-xs text-ink-3">peso {formatPercent(r.weight)}</span>
                </div>
                <p className="mt-1 font-serif text-4xl font-semibold tabular text-ink">{Math.round(r.score)}</p>
                <div className="mt-2">
                  <Meter value={r.score} color={PILLAR_BG[p]} height="h-2" label={PILLAR_LABEL[p]} />
                </div>
                <dl className="mt-3 space-y-1 text-xs text-ink-2">
                  <div className="flex justify-between">
                    <dt>Práticas reconhecidas</dt>
                    <dd className="tabular">{Math.round(r.practices)}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Deduções</dt>
                    <dd className={cx('tabular', r.deductions.length > 0 && 'text-danger')}>
                      {formatPoints(r.deductions.reduce((s, d) => s + d.points, 0))}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-3">{profile.desc}. Os pesos refletem a materialidade de cada pilar para o setor.</p>
      </div>
    </section>
  );
}

function Breakdown({ c }: { c: ScoredCompany }) {
  return (
    <section className="container-page py-8" aria-labelledby="conta">
      <SectionTitle id="conta" eyebrow="Transparência" title="Como chegamos a essa nota">
        Cada pilar parte de {PILLAR_BASELINE} pontos. Práticas reconhecidas somam até +50 e controvérsias deduzem pontos conforme gravidade,
        status jurídico e idade. <Link to="/metodologia" className="font-medium text-accent underline underline-offset-2">Metodologia completa</Link>.
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-3">
        {PILLARS.map((p) => {
          const r = c.pillars[p];
          return (
            <div key={p} className="card p-5">
              <p className={cx('mb-3 text-sm font-semibold', PILLAR_TEXT[p])}>{PILLAR_LABEL[p]}</p>
              <table className="w-full text-sm">
                <tbody className="[&_td]:py-1.5 [&_td:last-child]:text-right [&_td:last-child]:tabular">
                  <tr className="text-ink-3">
                    <td>Ponto de partida</td>
                    <td>{PILLAR_BASELINE}</td>
                  </tr>
                  {r.additions.map((a) => (
                    <tr key={a.label} className="text-ink-2">
                      <td>{a.label}</td>
                      <td className="text-accent">{formatPoints(a.points)}</td>
                    </tr>
                  ))}
                  {r.deductions.map((d) => (
                    <tr key={d.eventId} className="text-ink-2">
                      <td>
                        <a href={`#evento-${d.eventId}`} className="hover:underline">
                          {d.label}
                        </a>
                      </td>
                      <td className="text-danger">{formatPoints(d.points)}</td>
                    </tr>
                  ))}
                  {r.additions.length === 0 && r.deductions.length === 0 && (
                    <tr>
                      <td colSpan={2} className="!text-left text-xs text-ink-3">
                        Sem práticas reconhecidas nem controvérsias registradas.
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-line font-semibold text-ink">
                    <td className="!pt-2.5">Nota do pilar {r.score === 0 || r.score === 100 ? '(limitada a 0–100)' : ''}</td>
                    <td className="!pt-2.5">{Math.round(r.score)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
      <div className="card mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 p-5 font-mono text-sm text-ink-2">
        {PILLARS.map((p, i) => (
          <span key={p} className="inline-flex items-center gap-3">
            {i > 0 && <span className="text-ink-3">+</span>}
            <span>
              <span className={PILLAR_TEXT[p]}>{p}</span> {Math.round(c.pillars[p].score)} × {formatPercent(c.pillars[p].weight)}
            </span>
          </span>
        ))}
        <span className="text-ink-3">=</span>
        <span className="tabular">{c.uncappedScore.toFixed(1).replace('.', ',')}</span>
        {c.cap && (
          <>
            <span className="text-ink-3">→ teto</span>
            <span className="text-danger">{c.cap.limit}</span>
          </>
        )}
        {c.excluded && (
          <>
            <span className="text-ink-3">→ exclusão</span>
            <span className="text-danger">0</span>
          </>
        )}
        <span className="ml-auto font-sans font-semibold text-ink">
          Nota final: <span className={cx('tabular', RATING_TEXT[c.rating])}>{c.score}</span>
        </span>
      </div>
    </section>
  );
}

function EventItem({ e }: { e: ScoredEvent }) {
  const sev = SEVERITY[Math.max(1, e.severity) as 1 | 2 | 3 | 4 | 5];
  const years = e.ageYears < 1 ? 'menos de 1 ano' : `${e.ageYears.toFixed(1).replace('.', ',')} anos`;
  return (
    <li id={`evento-${e.id}`} className="relative scroll-mt-24 pb-8 pl-8 last:pb-0">
      <span className="absolute left-[7px] top-2 bottom-0 w-px bg-line" aria-hidden="true" />
      <span
        className={cx('absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-bg', e.severity >= 4 ? 'bg-danger' : 'bg-warn')}
        aria-hidden="true"
      />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
        <time dateTime={e.date} className="font-medium text-ink-2">
          {formatDate(e.date, e.date_precision)}
        </time>
        <span>{e.source}</span>
        <span className="flex gap-1">
          {e.pillars.map((p) => (
            <span key={p} className={cx('font-semibold', PILLAR_TEXT[p])} title={PILLAR_LABEL[p]}>
              {p}
            </span>
          ))}
        </span>
      </div>
      <p className="mt-1.5 font-medium leading-snug text-ink">{e.description}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusChip status={e.status} />
        <SeverityDots severity={e.severity} />
        <SourceLink href={e.link} type={e.link_type} />
      </div>
      <p className="mt-2.5 text-xs text-ink-3">
        <span className="font-semibold text-danger tabular">{formatPoints(-e.deduction)} pts</span>
        {e.pillars.length > 1 ? ' em cada pilar' : ''} ={' '}
        <span className="tabular">
          {sev.points} (gravidade) × {STATUS[e.status].weight.toString().replace('.', ',')} ({STATUS[e.status].label.toLowerCase()}) ×{' '}
          {formatPercent(e.decay)} (decaimento, {years})
        </span>
      </p>
    </li>
  );
}

function Controversies({ c }: { c: ScoredCompany }) {
  const quarantined = c.events.filter((e) => e.review === 'quarentena').length;
  return (
    <section className="container-page py-8" aria-labelledby="controversias">
      <SectionTitle id="controversias" eyebrow="Registros" title="Controvérsias">
        Investigações pesam menos que condenações, e eventos antigos perdem peso com o tempo. Desastres catastróficos nunca caem abaixo de 50%.
      </SectionTitle>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          {c.scoredEvents.length ? (
            <ol className="[&>li:last-child>span:first-child]:hidden">
              {c.scoredEvents.map((e) => (
                <EventItem key={e.id} e={e} />
              ))}
            </ol>
          ) : (
            <div className="flex items-start gap-3 text-sm text-ink-2">
              <Check size={18} className="mt-0.5 shrink-0 text-accent" />
              <p>
                Nenhuma controvérsia registrada na base até {formatDate(dataset.meta.as_of)}. A ausência de registro não garante a ausência de
                problemas: a cobertura depende das fontes pesquisadas.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {c.riskSignals.length > 0 && (
            <div className="card p-5">
              <p className="eyebrow mb-3">Sinais de risco (sem efeito na nota)</p>
              <ul className="space-y-3 text-sm">
                {c.riskSignals.map((e) => (
                  <li key={e.id}>
                    <p className="font-medium text-ink">{e.description}</p>
                    <p className="mt-0.5 text-xs text-ink-3">
                      {formatDate(e.date, e.date_precision)} · {e.review_note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {quarantined > 0 && (
            <div className="card p-5 text-sm text-ink-2">
              <p className="eyebrow mb-2">Em revisão</p>
              <p>
                {plural(quarantined, 'registro foi retirado', 'registros foram retirados')} da nota e da exibição até checagem em fonte primária,
                por inconsistência factual identificada na auditoria da v2.
              </p>
            </div>
          )}
          <div className="card p-5 text-sm text-ink-2">
            <p className="eyebrow mb-2">Status jurídico</p>
            <ul className="space-y-1.5">
              {Object.entries(STATUS).map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span>{v.label}</span>
                  <span className="tabular text-ink-3">× {v.weight.toString().replace('.', ',')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Practices({ c }: { c: ScoredCompany }) {
  const items = [
    ...c.indices.map((i) => ({ key: i, title: i, desc: INDEX_INFO[i].desc, url: INDEX_INFO[i].url })),
    ...c.disclosures.map((d) => ({
      key: d.type,
      title: d.type === 'CDP' ? `CDP Clima — nota ${d.grade}` : 'Relato GRI',
      desc: d.type === 'CDP' ? 'Divulgação climática ao Carbon Disclosure Project' : 'Relatório de sustentabilidade no padrão GRI',
      url: d.link ?? undefined,
    })),
  ];
  return (
    <section className="container-page py-8" aria-labelledby="praticas">
      <SectionTitle id="praticas" eyebrow="Reconhecimentos" title="Práticas reconhecidas" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a href={B3_SEGMENTS} target="_blank" rel="noopener noreferrer" className="card group p-4 transition hover:border-line-strong">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-ink">Segmento: {SEGMENT_LABEL[c.segment]}</p>
            <ArrowUpRight size={14} className="text-ink-3 group-hover:text-ink" />
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {c.segment === 'VERIFICAR'
              ? 'Segmento ainda não confirmado. Não pontua até a verificação.'
              : c.segment === 'BDR'
                ? 'Emissor estrangeiro: regras de governança da B3 não se aplicam.'
                : 'Regras de governança exigidas pela B3 para o segmento.'}
          </p>
        </a>
        {items.map((it) => (
          <a
            key={it.key}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card group p-4 transition hover:border-line-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="flex items-center gap-1.5 font-medium text-ink">
                <ShieldCheck size={15} className="text-accent" /> {it.title}
              </p>
              <ArrowUpRight size={14} className="text-ink-3 group-hover:text-ink" />
            </div>
            <p className="mt-1 text-sm text-ink-2">{it.desc}</p>
          </a>
        ))}
        {items.length === 0 && (
          <div className="card p-4 text-sm text-ink-2 sm:col-span-2">
            Nenhum índice de sustentabilidade da B3 ou relato padronizado registrado para esta empresa.
          </div>
        )}
      </div>
    </section>
  );
}

function Peers({ c }: { c: ScoredCompany }) {
  const peers = sectorPeers(c);
  const others = peers.filter((p) => p.ticker !== c.ticker).slice(0, 3).map((p) => p.ticker);
  return (
    <section className="container-page py-8" aria-labelledby="setor">
      <SectionTitle id="setor" eyebrow={c.sector} title="Comparação no setor" />
      <div className="card divide-y divide-line">
        {peers.map((p) => (
          <Link
            key={p.ticker}
            to={`/empresa/${p.ticker}`}
            aria-current={p.ticker === c.ticker ? 'page' : undefined}
            className={cx(
              'grid grid-cols-[2rem_1fr_3rem] items-center gap-3 px-5 py-3 text-sm transition sm:grid-cols-[2rem_14rem_1fr_3rem]',
              p.ticker === c.ticker ? 'bg-accent-soft/60' : 'hover:bg-surface-2/60',
            )}
          >
            <span className="tabular text-ink-3">{p.sectorRank}º</span>
            <span className="truncate">
              <span className={cx('font-medium', p.ticker === c.ticker ? 'text-ink' : 'text-ink-2')}>{p.name}</span>{' '}
              <span className="font-mono text-xs text-ink-3">{p.ticker}</span>
            </span>
            <span className="hidden sm:block">
              <Meter value={p.score} color={p.ticker === c.ticker ? 'bg-accent' : 'bg-line-strong'} height="h-1.5" label={p.name} />
            </span>
            <span className={cx('text-right font-semibold tabular', RATING_TEXT[p.rating])}>{p.score}</span>
          </Link>
        ))}
      </div>
      {others.length > 0 && (
        <Link
          to={`/comparar?t=${[c.ticker, ...others].join(',')}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <GitCompareArrows size={15} /> Comparar com {others.join(', ')}
        </Link>
      )}
    </section>
  );
}

function DataQuality({ c }: { c: ScoredCompany }) {
  return (
    <section className="container-page py-8" aria-labelledby="dados">
      <SectionTitle id="dados" eyebrow="Procedência" title="Qualidade dos dados" />
      <div className="card grid gap-6 p-6 md:grid-cols-[1fr_1fr_auto] md:items-start">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">CNPJ raiz</dt>
            <dd className="flex items-center gap-2 font-mono text-ink">
              {formatCnpjRoot(c.cnpj_root)}
              {c.cnpj_verified ? <Tag tone="accent">conferido</Tag> : <Tag tone="warn">a conferir</Tag>}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Última verificação</dt>
            <dd className="text-ink">{formatDate(c.last_verified)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Data de referência da nota</dt>
            <dd className="text-ink">{formatDate(dataset.meta.as_of)}</dd>
          </div>
        </dl>
        <div className="text-sm">
          <ConfidenceBadge level={c.confidence} />
          {c.confidenceReasons.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2">
              {c.confidenceReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-ink-2">CNPJ, segmento e fontes conferidos.</p>
          )}
        </div>
        <a
          href={correctionUrl(c.ticker)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:border-line-strong hover:bg-surface-2"
        >
          <Flag size={15} /> Reportar correção
        </a>
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs text-ink-3">
        <Info size={13} className="mt-0.5 shrink-0" />
        Informação de caráter público e informativo. Não constitui recomendação de investimento.
      </p>
    </section>
  );
}

export default function CompanyPage() {
  const { ticker = '' } = useParams();
  const c = getCompany(ticker);
  useDocumentMeta(
    c ? `${c.name} (${c.ticker}) — nota ${c.score}` : 'Empresa não encontrada',
    c
      ? `${c.name} (${c.ticker}) tem nota socioambiental ${c.score}/100 (faixa ${c.rating}) e ocupa a ${c.rank}ª posição entre ${companies.length} empresas da B3. Veja a conta completa.`
      : undefined,
  );
  if (!c) return <NotFoundPage what={`a empresa “${ticker.toUpperCase()}”`} />;
  return (
    <article>
      <Header c={c} />
      <ScorePanel c={c} />
      <Breakdown c={c} />
      <Controversies c={c} />
      <Practices c={c} />
      <Peers c={c} />
      <DataQuality c={c} />
    </article>
  );
}
