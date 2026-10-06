import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  CAP_ACTIVE_DECAY,
  CHANGELOG,
  CONTROVERSY_CAPS,
  EXCLUDED_RATING,
  GROUP_DEDUCTION_CAP,
  IBAMA_RULES,
  MATERIALITY,
  METHODOLOGY_VERSION,
  PILLAR_BASELINE,
  PILLAR_LABEL,
  PILLAR_PRACTICES,
  RATINGS,
  SECTOR_PROFILE,
  SEVERITY,
  STATUS,
} from '../lib/methodology';
import { decayFactor } from '../lib/scoring';
import { formatPercent } from '../lib/format';
import type { Pillar } from '../lib/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { PILLAR_TEXT, RatingBadge, SectionTitle, cx } from '../components/ui';

const PILLARS: Pillar[] = ['E', 'S', 'G'];
const TOC = [
  ['principios', 'Princípios'],
  ['fontes', 'Universo e fontes'],
  ['formula', 'Fórmula'],
  ['praticas', 'Práticas reconhecidas'],
  ['controversias', 'Controvérsias'],
  ['decaimento', 'Decaimento no tempo'],
  ['tetos', 'Tetos e exclusão'],
  ['materialidade', 'Materialidade setorial'],
  ['faixas', 'Faixas'],
  ['limites', 'Limitações'],
  ['versoes', 'Histórico de versões'],
];

/** Curvas de decaimento por gravidade — geradas a partir da mesma função usada no cálculo. */
function DecayChart() {
  const W = 560;
  const H = 220;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const years = 20;
  const x = (y: number) => pad.l + (y / years) * (W - pad.l - pad.r);
  const yv = (v: number) => pad.t + (1 - v) * (H - pad.t - pad.b);
  const colors: Record<number, string> = { 1: 'var(--ink-3)', 2: 'var(--ink-3)', 3: 'var(--warn)', 4: 'var(--danger)', 5: 'var(--ink)' };
  return (
    <figure className="card p-5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-labelledby="decay-title decay-desc">
        <title id="decay-title">Peso de uma controvérsia ao longo do tempo</title>
        <desc id="decay-desc">
          Curvas de meia-vida por gravidade: leve e moderada caem pela metade a cada 3 anos; catastrófica a cada 12 anos e nunca abaixo de 50%.
        </desc>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={yv(v)} y2={yv(v)} stroke="var(--line)" />
            <text x={pad.l - 6} y={yv(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-3)">
              {v * 100}%
            </text>
          </g>
        ))}
        {[0, 5, 10, 15, 20].map((y) => (
          <text key={y} x={x(y)} y={H - 8} textAnchor={y === 0 ? 'start' : y === years ? 'end' : 'middle'} fontSize="10" fill="var(--ink-3)">
            {y === 0 ? 'hoje' : `${y} anos`}
          </text>
        ))}
        {[2, 3, 4, 5].map((s) => {
          const pts = Array.from({ length: 81 }, (_, i) => {
            const yr = (i / 80) * years;
            return `${x(yr).toFixed(1)},${yv(decayFactor(s, yr)).toFixed(1)}`;
          }).join(' ');
          return <polyline key={s} points={pts} fill="none" stroke={colors[s]} strokeWidth={s === 5 ? 2.5 : 1.75} />;
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {[2, 3, 4, 5].map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: colors[s] }} />
            {SEVERITY[s as 2 | 3 | 4 | 5].label}
            {s === 2 ? ' (e leve)' : ''}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return <div className="card overflow-x-auto px-5 py-4 font-mono text-sm leading-relaxed text-ink">{children}</div>;
}

function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return <th className={cx('eyebrow border-b border-line px-4 py-2.5 font-semibold', right ? 'text-right' : 'text-left')}>{children}</th>;
}

export default function MethodologyPage() {
  useDocumentMeta(
    'Metodologia',
    'Como o Ranking Socioambiental B3 calcula as notas: pilares E, S e G, práticas reconhecidas, controvérsias ponderadas por status jurídico e tempo, e materialidade setorial.',
  );
  const sectorsByProfile = Object.keys(MATERIALITY).map((k) => ({
    key: k,
    sectors: Object.entries(SECTOR_PROFILE)
      .filter(([, p]) => p === k)
      .map(([s]) => s),
  }));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3">Metodologia v{METHODOLOGY_VERSION}</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Como calculamos as notas</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-2">
          Esta página é gerada a partir do mesmo arquivo de configuração que o motor de cálculo usa. O que está escrito aqui é exatamente o que
          produz cada nota do ranking.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="Nesta página" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 border-l border-line text-sm">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="-ml-px block border-l border-transparent pl-4 text-ink-3 hover:border-ink hover:text-ink">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-16">
          <section id="principios" className="scroll-mt-24">
            <SectionTitle title="Princípios" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                ['Fatos, não opiniões', 'A base guarda apenas fatos verificáveis: índices, segmento de listagem e registros de órgãos públicos. Nenhuma nota é digitada à mão.'],
                ['Presunção de inocência', 'Investigação não é condenação. O peso de cada registro depende do seu status jurídico.'],
                ['Proporcionalidade no tempo', 'Fatos antigos perdem peso, exceto catástrofes, que nunca caem abaixo de 50%.'],
                ['Materialidade', 'O que importa para uma mineradora não é o mesmo que importa para um banco; os pesos de cada pilar variam por setor.'],
              ].map(([t, d]) => (
                <li key={t} className="card p-5">
                  <p className="font-medium text-ink">{t}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{d}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="fontes" className="scroll-mt-24">
            <SectionTitle title="Universo e fontes">
              Os dados oficiais são coletados por scripts abertos no repositório, que qualquer pessoa pode rodar para reproduzir a base.
            </SectionTitle>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr>
                    <Th>O quê</Th>
                    <Th>Fonte oficial</Th>
                    <Th>Como</Th>
                  </tr>
                </thead>
                <tbody className="[&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-0">
                  <tr>
                    <td className="font-medium text-ink">Universo</td>
                    <td className="text-ink-2">B3 — carteira do dia do IBrX 100</td>
                    <td className="text-ink-2">Empresas com ao menos uma ação no índice; vale a classe de maior peso</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Índices</td>
                    <td className="text-ink-2">B3 — carteiras do ISE, ICO2, IDiversa, IGPTW e ITAG</td>
                    <td className="text-ink-2">Participação na data de referência</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">CNPJ e segmento</td>
                    <td className="text-ink-2">CVM — Formulário Cadastral (dados abertos) e cadastro de emissores da B3</td>
                    <td className="text-ink-2">Por código de negociação</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Autos ambientais</td>
                    <td className="text-ink-2">IBAMA — autos de infração (dados abertos)</td>
                    <td className="text-ink-2">
                      Por CNPJ raiz, últimos {IBAMA_RULES.windowYears} anos, um registro por ano. Gravidade pelo total anual:{' '}
                      {IBAMA_RULES.thresholds.map((t) => `≥ R$ ${t.minTotal / 1e6} mi → ${t.severity}`).join(' · ')}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Trabalho escravo</td>
                    <td className="text-ink-2">MTE — Cadastro de Empregadores (Lista Suja)</td>
                    <td className="text-ink-2">Por CNPJ raiz; presença zera a nota</td>
                  </tr>
                  <tr>
                    <td className="font-medium text-ink">Demais controvérsias</td>
                    <td className="text-ink-2">CVM, CADE, MPF, STF, SEC/DOJ, governos e tribunais</td>
                    <td className="text-ink-2">Curadoria manual; só entra com link para documento oficial</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="formula" className="scroll-mt-24 space-y-4">
            <SectionTitle title="Fórmula">
              Cada pilar (Ambiental, Social, Governança) recebe uma nota de 0 a 100. A nota final é a média ponderada dos três pilares pelos pesos
              do setor, sujeita a tetos por controvérsia ativa.
            </SectionTitle>
            <Formula>
              Pilar = {PILLAR_BASELINE} + ½ × Práticas(0–100) − Σ Deduções <span className="text-ink-3">· limitado a 0–100</span>
            </Formula>
            <Formula>
              Dedução = Gravidade × Peso do status × Decaimento(idade)
            </Formula>
            <Formula>
              Nota = min(Σ Pilarᵢ × Pesoᵢ<sub>setor</sub>, Teto) <span className="text-ink-3">· 0 se na Lista Suja do MTE</span>
            </Formula>
            <p className="text-sm leading-relaxed text-ink-2">
              Uma empresa sem nenhum reconhecimento e sem controvérsias fica em {PILLAR_BASELINE}. A idade dos eventos é medida até a data de
              referência da edição, nunca até o dia em que você abre a página, para que a nota seja reproduzível.
            </p>
          </section>

          <section id="praticas" className="scroll-mt-24">
            <SectionTitle title="Práticas reconhecidas">
              Pontos de 0 a 100 por pilar, a partir das carteiras oficiais da B3 no dia da edição. O ISE B3 vale nos três pilares por ser uma avaliação
              ESG ampla. O IGCT não pontua porque seu critério de entrada é liquidez, não qualidade de governança.
            </SectionTitle>
            <div className="grid gap-4 xl:grid-cols-3">
              {PILLARS.map((p) => (
                <div key={p} className="card overflow-hidden">
                  <p className={cx('border-b border-line px-4 py-3 text-sm font-semibold', PILLAR_TEXT[p])}>{PILLAR_LABEL[p]}</p>
                  <table className="w-full text-sm">
                    <tbody>
                      {PILLAR_PRACTICES[p].map((r) => (
                        <tr key={r.key} className="border-b border-line last:border-0">
                          <td className="px-4 py-2.5">
                            <p className="text-ink">{r.label}</p>
                            <p className="text-xs text-ink-3">{r.desc}</p>
                          </td>
                          <td className="px-4 py-2.5 text-right align-top font-semibold tabular text-accent">{r.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>

          <section id="controversias" className="scroll-mt-24 space-y-6">
            <SectionTitle title="Controvérsias">
              Registros de órgãos como IBAMA, ICMBio, MTE, MPT, MPF, CVM, CADE, Banco Central, agências reguladoras e tribunais. Um evento pode
              afetar mais de um pilar (ex.: rompimento de barragem afeta Ambiental e Social) e deduz o valor integral de cada um.
            </SectionTitle>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr>
                    <Th>Gravidade</Th>
                    <Th>Exemplos</Th>
                    <Th right>Pontos</Th>
                    <Th right>Meia-vida</Th>
                    <Th right>Piso</Th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SEVERITY).map(([k, s]) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-medium text-ink">
                        {k} · {s.label}
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">{s.example}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular text-danger">−{s.points}</td>
                      <td className="px-4 py-2.5 text-right tabular text-ink-2">{s.halfLife} anos</td>
                      <td className="px-4 py-2.5 text-right tabular text-ink-2">{formatPercent(s.floor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[30rem] text-sm">
                <thead>
                  <tr>
                    <Th>Status jurídico</Th>
                    <Th>Quando se aplica</Th>
                    <Th right>Peso</Th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(STATUS).map(([k, s]) => (
                    <tr key={k} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-medium text-ink">{s.label}</td>
                      <td className="px-4 py-2.5 text-ink-2">{s.desc}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular text-ink">× {s.weight.toString().replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong className="text-ink">Exemplo:</strong> um auto de infração grave (20 pontos) ainda sem julgamento (× 0,5), de 5 anos atrás
              (decaimento {formatPercent(decayFactor(3, 5))}), deduz {(20 * 0.5 * decayFactor(3, 5)).toFixed(0)} pontos do pilar.
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong className="text-ink">Registros repetidos:</strong> eventos do mesmo grupo, como os autos anuais do IBAMA, somam no máximo{' '}
              {GROUP_DEDUCTION_CAP} pontos de dedução por pilar. O histórico pesa, mas a escala operacional de uma grande empresa não vira, sozinha,
              nota zero.
            </p>
            <p className="text-sm leading-relaxed text-ink-2">
              <strong className="text-ink">Não são penalidades:</strong> recuperação judicial e dificuldades financeiras (exibidas como sinal de
              risco, sem pontuar), indeferimento de licenças e reportagens sem processo formal. Registros com inconsistência factual ficam em
              quarentena, fora da nota e da exibição, até checagem em fonte primária.
            </p>
          </section>

          <section id="decaimento" className="scroll-mt-24">
            <SectionTitle title="Decaimento no tempo">
              Peso = máx(piso, 0,5^(idade ÷ meia-vida)). Quanto mais grave, mais lentamente o evento é esquecido.
            </SectionTitle>
            <DecayChart />
          </section>

          <section id="tetos" className="scroll-mt-24 space-y-4">
            <SectionTitle title="Tetos e exclusão">
              Bons índices não podem compensar um desastre recente. Enquanto o decaimento do evento for de pelo menos{' '}
              {formatPercent(CAP_ACTIVE_DECAY)}, a nota final fica limitada:
            </SectionTitle>
            <ul className="space-y-2">
              {CONTROVERSY_CAPS.map((c) => (
                <li key={c.limit} className="card flex items-center justify-between gap-4 p-4 text-sm">
                  <span className="text-ink-2">{c.when}</span>
                  <span className="shrink-0 font-semibold tabular text-danger">máx. {c.limit}</span>
                </li>
              ))}
              <li className="card flex items-center justify-between gap-4 border-danger/40 p-4 text-sm">
                <span className="text-ink-2">{EXCLUDED_RATING.desc}</span>
                <span className="shrink-0 font-semibold text-danger">nota 0 · faixa X</span>
              </li>
            </ul>
          </section>

          <section id="materialidade" className="scroll-mt-24">
            <SectionTitle title="Materialidade setorial">
              Pesos inspirados nos mapas de materialidade usados por padrões internacionais de relato (SASB/ISSB), simplificados em quatro perfis.
            </SectionTitle>
            <div className="grid gap-4 md:grid-cols-2">
              {sectorsByProfile.map(({ key, sectors }) => {
                const m = MATERIALITY[key];
                return (
                  <div key={key} className="card p-5">
                    <p className="font-medium text-ink">{m.label}</p>
                    <p className="mt-1 text-xs text-ink-3">{m.desc}</p>
                    <div className="mt-4 flex h-2.5 overflow-hidden rounded-full">
                      {PILLARS.map((p) => (
                        <div key={p} className={cx(p === 'E' ? 'bg-pillar-e' : p === 'S' ? 'bg-pillar-s' : 'bg-pillar-g')} style={{ width: `${m.weights[p] * 100}%` }} />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      {PILLARS.map((p) => (
                        <span key={p} className={PILLAR_TEXT[p]}>
                          {PILLAR_LABEL[p]} {formatPercent(m.weights[p])}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-ink-2">{sectors.join(' · ')}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="faixas" className="scroll-mt-24">
            <SectionTitle title="Faixas" />
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {RATINGS.map((r, i) => (
                <li key={r.rating} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                  <RatingBadge rating={r.rating} />
                  <span className="text-sm tabular text-ink-3">
                    {r.min}–{i === 0 ? 100 : RATINGS[i - 1].min - 1}
                  </span>
                  <span className="text-sm text-ink-2 sm:ml-auto">{r.desc}</span>
                </li>
              ))}
              <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                <RatingBadge rating="X" />
                <span className="text-sm text-ink-2 sm:ml-auto">{EXCLUDED_RATING.desc}</span>
              </li>
            </ul>
          </section>

          <section id="limites" className="scroll-mt-24">
            <SectionTitle title="Limitações" />
            <div className="prose-ink max-w-3xl text-[0.95rem]">
              <p>
                <strong>Ausência de registro não é ausência de problema.</strong> A cobertura depende das fontes pesquisadas; empresas menos
                expostas na imprensa tendem a ter menos registros encontrados.
              </p>
              <p>
                <strong>Índices são proxies.</strong> Participar do ISE ou do ICO2 indica práticas e divulgação acima da média, mas não garante
                desempenho real.
              </p>
              <p>
                <strong>Só entra o que tem fonte oficial.</strong> Registros herdados da v1 que não puderam ser localizados em documento
                oficial ficam em quarentena, fora da nota. Empresas que entraram recentemente no IBrX 100 ainda não tiveram suas controvérsias
                pesquisadas sistematicamente; isso aparece na página da empresa e reduz o indicador de confiança.
              </p>
              <p>
                <strong>Não é recomendação de investimento.</strong> A nota mede responsabilidade socioambiental com base em dados públicos; não
                avalia preço, risco financeiro ou retorno esperado.
              </p>
            </div>
          </section>

          <section id="versoes" className="scroll-mt-24">
            <SectionTitle title="Histórico de versões" />
            <ol className="space-y-6">
              {CHANGELOG.map((v) => (
                <li key={v.version} className="card p-5">
                  <p className="font-medium text-ink">
                    v{v.version} <span className="font-normal text-ink-3">· {v.date}</span>
                  </p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-2">
                    {v.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-ink-2">
              Encontrou um erro?{' '}
              <Link to="/sobre#contribuir" className="font-medium text-accent underline underline-offset-2">
                Veja como contribuir
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
