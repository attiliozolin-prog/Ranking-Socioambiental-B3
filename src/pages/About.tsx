import React from 'react';
import { ShieldCheck, Leaf, Scale, AlertTriangle, HelpCircle } from 'lucide-react';

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

    return (
        <main className="max-w-4xl mx-auto px-4 py-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 text-center">
                Democratizando a <span className="text-emerald-600">Due Diligence</span>
            </h1>

            <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
                Entenda como o Ranking Socioambiental ajuda o investidor brasileiro a separar empresas realmente sustentáveis daquelas que praticam Greenwashing.
            </p>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="text-blue-500" /> Nossa Missão
                </h2>
                <div className="space-y-4 text-slate-700 leading-relaxed">
                    <p>
                        No Brasil, é comum encontrar empresas com campanhas milionárias de marketing em favor do meio ambiente, mas que nos bastidores acumulam passivos gigantescos. O <strong>Greenwashing</strong> (lavagem verde) virou regra.
                    </p>
                    <p>
                        Acreditamos que o investidor final (pessoa física) muitas vezes não tem tempo ou recursos para cruzar dados de 3 ou 4 portais governamentais cruciais antes de tomar sua decisão.
                    </p>
                    <p>
                        O <strong>Ranking Socioambiental B3</strong> foi criado para unificar, de forma 100% transparente, as certificações da bolsa com os dados brutos de órgãos fiscais, entregando uma nota fria e objetiva do real comprometimento da empresa.
                    </p>
                </div>
            </section>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                    <Leaf className="text-emerald-600 mb-3 h-8 w-8" />
                    <h3 className="font-bold text-emerald-900 mb-2">Pilar Ambiental</h3>
                    <p className="text-sm text-emerald-700">
                        Penaliza empresas com histórico de multas ou embargos do IBAMA. Premia inventários transparentes de GEE (ICO2).
                    </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                    <Scale className="text-amber-600 mb-3 h-8 w-8" />
                    <h3 className="font-bold text-amber-900 mb-2">Pilar Social</h3>
                    <p className="text-sm text-amber-800">
                        Cruza dados do Ministério Público do Trabalho, mortes operacionais e diversidade do quadro corporativo (IDiversa B3).
                    </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <AlertTriangle className="text-blue-600 mb-3 h-8 w-8" />
                    <h3 className="font-bold text-blue-900 mb-2">Pilar Governança</h3>
                    <p className="text-sm text-blue-800">
                        Considera processos éticos pela CVM, punições do CADE, e processos na SEC por pagamentos indevidos.
                    </p>
                </div>
            </div>

            <section className="mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-8 text-center flex items-center justify-center gap-2">
                    <HelpCircle className="text-slate-400" /> Perguntas Frequentes (FAQ)
                </h2>

                <div className="space-y-4">
                    {faqData.map((faq, index) => (
                        <article key={index} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{faq.question}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                                {faq.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

        </main>
    );
};

export default AboutPage;
