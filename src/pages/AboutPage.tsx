import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { stats } from '../lib/data';
import { REPO_URL, correctionUrl } from '../lib/site';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { SectionTitle } from '../components/ui';

const FAQ = [
  {
    q: 'O que é ESG e por que importa para o investidor?',
    a: 'ESG reúne critérios ambientais, sociais e de governança. Passivos ambientais, trabalhistas e de governança costumam virar multas, acordos bilionários, perda de licença e de reputação. São riscos que nem sempre aparecem no balanço do trimestre.',
  },
  {
    q: 'Por que uma empresa com ISE B3 pode ter nota baixa?',
    a: 'Porque índices medem práticas e divulgação, enquanto controvérsias medem o que aconteceu de fato. Uma controvérsia catastrófica recente aplica um teto à nota, independentemente dos índices. É justamente esse descompasso que o ranking quer tornar visível.',
  },
  {
    q: 'Uma investigação já derruba a nota?',
    a: 'Pouco. Investigação pesa 20% do valor de uma condenação; processo, 50%; acordo ou TAC, 75%; fato reconhecido pela própria empresa, 90%. Eventos antigos também perdem peso com o tempo.',
  },
  {
    q: 'As fontes são confiáveis?',
    a: 'Índices e segmentos vêm da B3. Controvérsias vêm de órgãos públicos e tribunais. Quando o link oficial ainda não foi localizado, o registro mostra isso explicitamente e a confiança da empresa é reduzida. Registros com erro factual identificado ficam em quarentena.',
  },
  {
    q: 'Com que frequência os dados são atualizados?',
    a: 'Cada edição tem uma data de referência, e toda nota é calculada até essa data. Isso garante que a mesma base produza sempre o mesmo resultado. A data de verificação de cada empresa aparece na sua página.',
  },
  {
    q: 'A nota é uma recomendação de compra ou venda?',
    a: 'Não. O ranking é informativo e não constitui recomendação de investimento nem relatório de análise de valores mobiliários (Resolução CVM nº 20/2021). Ele não avalia preço, risco financeiro ou retorno.',
  },
];

export default function AboutPage() {
  useDocumentMeta('Sobre', 'Por que o Ranking Socioambiental B3 existe, como usar e como contribuir com correções.');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <div className="container-page py-10 sm:py-14">
      {/* JSON-LD: conteúdo estático e escapado — nenhum dado do usuário entra aqui */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <div className="max-w-3xl">
        <p className="eyebrow mb-3">Sobre o projeto</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Democratizando a due diligence</h1>
        <div className="prose-ink mt-6 text-[1.05rem]">
          <p>
            No Brasil, é comum ver campanhas milionárias de sustentabilidade convivendo com passivos ambientais e trabalhistas gigantescos. O
            investidor pessoa física raramente tem tempo de cruzar índices da bolsa com autos do IBAMA, ações do MPT e processos na CVM antes de
            decidir.
          </p>
          <p>
            O <strong>Ranking Socioambiental B3</strong> faz esse cruzamento para as {stats.n} empresas do IBrX 100, que reúne as ações mais negociadas da bolsa, e entrega uma nota com a
            conta aberta: cada ponto ganho ou perdido tem origem, peso e data.
          </p>
        </div>
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-label="Como usar">
        {[
          ['1', 'Explore o ranking', 'Filtre por setor ou faixa e ordene por pilar para achar líderes e retardatários.', '/'],
          ['2', 'Abra a conta', 'Na página de cada empresa, veja de onde vem cada ponto e cada dedução.', '/empresa/ITUB4'],
          ['3', 'Compare', 'Coloque até quatro empresas lado a lado e compartilhe o link.', '/comparar?t=VALE3,CMIN3,GGBR4'],
        ].map(([n, t, d, to]) => (
          <Link key={n} to={to} className="card group p-6 transition hover:border-line-strong">
            <span className="font-serif text-3xl font-semibold text-accent">{n}</span>
            <p className="mt-3 font-medium text-ink group-hover:underline">{t}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{d}</p>
          </Link>
        ))}
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="faq">
        <SectionTitle id="faq" eyebrow="Dúvidas" title="Perguntas frequentes" />
        <div className="divide-y divide-line rounded-xl border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink">
                {f.q}
                <ChevronDown size={18} className="shrink-0 text-ink-3 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contribuir" className="mt-16 max-w-3xl scroll-mt-24" aria-labelledby="contribuir-t">
        <SectionTitle id="contribuir-t" eyebrow="Colabore" title="Encontrou um erro?">
          Correções são bem-vindas, desde que acompanhadas de fonte primária (documento oficial, decisão judicial, publicação da B3 ou do órgão
          regulador). Todo o código e os dados são abertos.
        </SectionTitle>
        <div className="flex flex-wrap gap-3">
          <a
            href={correctionUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink"
          >
            Reportar correção ↗
          </a>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
          >
            Ver código e dados ↗
          </a>
        </div>
      </section>

      <section className="mt-16 max-w-3xl rounded-xl border border-line bg-surface-2/60 p-6 text-sm leading-relaxed text-ink-2">
        <p className="eyebrow mb-2">Aviso legal</p>
        <p>
          Projeto independente, sem vínculo com a B3, com órgãos públicos ou com as empresas avaliadas. As informações são compiladas de fontes
          públicas e podem conter imprecisões; registros sob apuração são apresentados com seu status jurídico, sem presunção de culpa. Este
          conteúdo não constitui recomendação de investimento nem relatório de análise nos termos da Resolução CVM nº 20/2021.
        </p>
      </section>
    </div>
  );
}
