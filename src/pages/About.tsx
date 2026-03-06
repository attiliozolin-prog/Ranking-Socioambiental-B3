import React from 'react';
import { ShieldCheck, Leaf, Scale, AlertTriangle, HelpCircle, TrendingUp } from 'lucide-react';

const AboutPage: React.FC = () => {
    const faqData = [
        {
            question: "O que é ESG e por que importa?",
            answer: "ESG (Environmental, Social, and Governance) refere-se aos critérios ambientais, sociais e de governança corporativa. No contexto de investimentos, importa porque empresas com boas práticas ESG tendem a ter menor risco em longo prazo, menores passivos jurídicos e ambientais, e maior resiliência em crises."
        },
        {
            question: "O que é o Ranking Socioambiental B3?",
            answer: "É uma ferramenta de due diligence focada no investidor pessoa física. O objetivo principal do Ranking é escancarar a realidade por trás dos relatórios de sustentabilidade, cruzando os índices oficiais da B3 com fontes governamentais independentes, e assim combater o 'greenwashing' (falsa sustentabilidade)."
        },
        {
            question: "Como as notas são calculadas?",
            answer: "A nota base é 50. Empresas ganham pontos extras se participarem de índices de excelência da B3 (como o ISE ou ICO2). Em contrapartida, perdem pontos se possuírem autos de infração julgados no IBAMA, condenações no CADE, processos na CVM por fraude contábil, ou estiverem na 'Lista Suja' do Trabalho Escravo do MTE (o que zera a nota)."
        },
        {
            question: "As fontes são confiáveis?",
            answer: "Sim. Nenhuma penalidade é baseada em boatos ou opiniões. O Ranking utiliza exclusivamente links de entidades reguladoras como o Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis (IBAMA), Comissão de Valores Mobiliários (CVM), Ministério Público do Trabalho (MPT) e sentenças de Tribunais Superiores."
        },
        {
            question: "Com que frequência os dados são atualizados?",
            answer: "Cada empresa possui uma data de última verificação visível no card expandido. O objetivo é revisar os dados mensalmente. O campo 'Qualidade do dado' (Verificado / Parcial / Estimado) indica o nível de confiança das informações de cada empresa."
        }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    const pillars = [
        {
            icon: <Leaf className="h-6 w-6" />,
            title: "Pilar Ambiental",
            color: "bg-emerald-50 border-emerald-100",
            iconColor: "text-emerald-600",
            titleColor: "text-emerald-900",
            textColor: "text-emerald-700",
            desc: "Penaliza empresas com histórico de multas ou embargos do IBAMA. Premia inventários transparentes de GEE via ICO2 B3."
        },
        {
            icon: <Scale className="h-6 w-6" />,
            title: "Pilar Social",
            color: "bg-amber-50 border-amber-100",
            iconColor: "text-amber-600",
            titleColor: "text-amber-900",
            textColor: "text-amber-800",
            desc: "Cruza dados do Ministério Público do Trabalho, mortes operacionais e diversidade do quadro corporativo (IDiversa B3)."
        },
        {
            icon: <AlertTriangle className="h-6 w-6" />,
            title: "Pilar Governança",
            color: "bg-blue-50 border-blue-100",
            iconColor: "text-blue-600",
            titleColor: "text-blue-900",
            textColor: "text-blue-800",
            desc: "Considera processos éticos pela CVM, punições do CADE, e processos na SEC (EUA) por pagamentos indevidos."
        }
    ];

    return (
        <div>
            {/* Hero da Página Sobre */}
            <section className="bg-slate-900 text-white py-14 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                </div>
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-6">
                        <TrendingUp size={12} /> Metodologia Transparente
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-5">
                        Democratizando a <span className="text-emerald-400">Due Diligence</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Entenda como o Ranking Socioambiental ajuda o investidor brasileiro a separar empresas realmente sustentáveis daquelas que praticam Greenwashing.
                    </p>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-4 py-12">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                {/* Nossa Missão */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                        <ShieldCheck className="text-blue-500 flex-shrink-0" size={24} /> Nossa Missão
                    </h2>
                    <div className="space-y-4 text-slate-600 leading-relaxed">
                        <p>
                            No Brasil, é comum encontrar empresas com campanhas milionárias de marketing em favor do meio ambiente, mas que nos bastidores acumulam passivos gigantescos. O <strong className="text-slate-800">Greenwashing</strong> (lavagem verde) virou regra.
                        </p>
                        <p>
                            Acreditamos que o investidor final (pessoa física) muitas vezes não tem tempo para cruzar dados de 3 ou 4 portais governamentais cruciais antes de tomar sua decisão.
                        </p>
                        <p>
                            O <strong className="text-slate-800">Ranking Socioambiental B3</strong> foi criado para unificar, de forma 100% transparente, as certificações da bolsa com os dados brutos de órgãos fiscais, entregando uma nota fria e objetiva do real comprometimento de cada empresa.
                        </p>
                    </div>
                </section>

                {/* Os 3 Pilares */}
                <div className="grid md:grid-cols-3 gap-5 mb-12">
                    {pillars.map((p, i) => (
                        <article key={i} className={`rounded-xl p-6 border ${p.color}`}>
                            <div className={`${p.iconColor} mb-3`}>{p.icon}</div>
                            <h3 className={`font-bold mb-2 ${p.titleColor}`}>{p.title}</h3>
                            <p className={`text-sm ${p.textColor}`}>{p.desc}</p>
                        </article>
                    ))}
                </div>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
                        <HelpCircle className="text-slate-400" size={28} /> Perguntas Frequentes
                    </h2>

                    <div className="space-y-4">
                        {faqData.map((faq, index) => (
                            <article key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                    {faq.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
