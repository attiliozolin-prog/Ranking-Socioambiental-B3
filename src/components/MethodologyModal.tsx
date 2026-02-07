// src/components/MethodologyModal.tsx
import React, { useState } from 'react';
import { Info, X, Scale, Siren, ShieldCheck, FileWarning } from 'lucide-react';

export const MethodologyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all border border-white/10 backdrop-blur-sm"
      >
        <Info size={16} />
        <span>Entenda a Metodologia</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Janela Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="text-blue-600" />
              Como calculamos a nota?
            </h2>
            <p className="text-sm text-slate-500">Transparência total sobre nossos critérios de avaliação.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">
          
          {/* Seção 1: Filosofia */}
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">
              O <strong>Ranking Socioambiental B3</strong> não utiliza opiniões subjetivas. Nossa nota de <strong>0 a 100</strong> é resultado de um algoritmo matemático que cruza dados públicos oficiais do Governo Federal com certificações de mercado da B3.
            </p>
          </div>

          {/* Seção 2: A Matemática */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">A Fórmula de Integridade</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded text-blue-700 font-bold text-xs">BASE</div>
                <div>
                  <span className="font-bold text-slate-900">50 Pontos Iniciais</span>
                  <p className="text-xs text-slate-500">Toda empresa listada começa com nota neutra.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-emerald-100 p-2 rounded text-emerald-700 font-bold text-xs">+ BÔNUS</div>
                <div>
                  <span className="font-bold text-slate-900">Boas Práticas (Até +50 pts)</span>
                  <p className="text-xs text-slate-500">Presença no <strong>ISE B3</strong> (Sustentabilidade), <strong>Novo Mercado</strong> (Governança) e <strong>ICO2</strong> (Carbono).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded text-red-700 font-bold text-xs">- PENALIDADES</div>
                <div>
                  <span className="font-bold text-slate-900">Sanções Reais (Sem limite)</span>
                  <p className="text-xs text-slate-500">Multas do <strong>IBAMA</strong> (-10 a -50 pts), Processos no <strong>CADE</strong> (-15 pts) e Irregularidades na <strong>CVM</strong>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Fontes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold">
                <ShieldCheck size={18} />
                <span>Fontes Positivas</span>
              </div>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>B3 (Índices Oficiais)</li>
                <li>Relatórios GRI Auditados</li>
                <li>CDP (Carbon Disclosure Project)</li>
              </ul>
            </div>

            <div className="border border-slate-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                <Siren size={18} />
                <span>Fontes de Risco</span>
              </div>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>IBAMA (Autos de Infração)</li>
                <li>Ministério do Trabalho (MTE)</li>
                <li>CADE (Defesa Econômica)</li>
                <li>CVM (Valores Mobiliários)</li>
              </ul>
            </div>
          </div>

          {/* Seção 4: Kill Switch */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 items-start">
            <FileWarning className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-800 text-sm">Critério de Exclusão (Nota Zero)</h4>
              <p className="text-xs text-red-700 mt-1 leading-relaxed">
                Empresas incluídas na <strong>"Lista Suja do Trabalho Escravo"</strong> (Cadastro de Empregadores do MTE) têm sua nota automaticamente zerada, independente de quaisquer outros bônus ou certificações.
              </p>
            </div>
          </div>
          
          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
            Aviso Legal: Este ranking é uma ferramenta informativa baseada em dados históricos. Não constitui recomendação de compra ou venda de ativos financeiros.
          </p>

        </div>
      </div>
    </div>
  );
};
