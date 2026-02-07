// src/components/MethodologyModal.tsx
import React, { useState } from 'react';
import { Info, X, Scale, Siren, ShieldCheck, FileWarning, ArrowRight } from 'lucide-react';

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
    // FIX 1: z-[999] garante que o modal fique ACIMA de tudo (Header, Busca, etc)
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      
      {/* Backdrop Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Janela Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="text-blue-600" />
              Como calculamos a nota?
            </h2>
            <p className="text-sm text-slate-500 mt-1">Transparência total: sem opiniões, apenas dados.</p>
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
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600 text-sm leading-relaxed">
            O <strong>Ranking Socioambiental B3</strong> é resultado de um algoritmo matemático que cruza dados públicos oficiais do Governo Federal com certificações de mercado da B3. A nota varia de <strong>0 a 100</strong>.
          </div>

          {/* Seção 2: A Matemática (Diagramação Melhorada) */}
          <div>
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wider border-b pb-2 border-slate-100">
              A Fórmula de Integridade
            </h3>
            
            {/* FIX 2: Layout em Grid para alinhar perfeitamente */}
            <div className="space-y-4">
              
              {/* Passo 1: Base */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-blue-100 text-blue-700 py-2 px-0 text-center rounded-lg font-bold text-xs border border-blue-200">
                  BASE
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-lg">50 Pontos</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 rounded-full">Neutro</span>
                  </div>
                  <p className="text-sm text-slate-600">Toda empresa listada na bolsa começa com esta nota base.</p>
                </div>
              </div>

              {/* Conector Visual */}
              <div className="pl-11 opacity-20">
                <ArrowRight className="rotate-90" size={20} />
              </div>

              {/* Passo 2: Bônus */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-emerald-100 text-emerald-700 py-2 px-0 text-center rounded-lg font-bold text-xs border border-emerald-200">
                  + BÔNUS
                </div>
                <div className="flex-1 pt-1">
                   <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-lg">Até +50 Pontos</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Acumula pontos por certificações de mercado:</p>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> ISE B3 (Sustentabilidade)</li>
                    <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> Novo Mercado (Governança)</li>
                    <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> ICO2 (Carbono Eficiente)</li>
                  </ul>
                </div>
              </div>

              {/* Conector Visual */}
              <div className="pl-11 opacity-20">
                <ArrowRight className="rotate-90" size={20} />
              </div>

              {/* Passo 3: Penalidades */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-red-100 text-red-700 py-2 px-0 text-center rounded-lg font-bold text-xs border border-red-200">
                  - SANÇÕES
                </div>
                <div className="flex-1 pt-1">
                   <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-lg">Sem Limite</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Perde pontos por infrações reais:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs font-bold text-red-600 block">IBAMA (Ambiental)</span>
                      <span className="text-[10px] text-slate-500">-10 a -50 pts por multa</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-xs font-bold text-red-600 block">CADE (Econômico)</span>
                      <span className="text-[10px] text-slate-500">-15 pts por processo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Kill Switch */}
          <div className="bg-red-50 border border-red-100 p-5 rounded-xl flex gap-4 items-start shadow-sm">
            <div className="bg-white p-2 rounded-full border border-red-100 shadow-sm">
              <FileWarning className="text-red-600" size={24} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-base">Critério de Exclusão (Nota Zero)</h4>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">
                Empresas incluídas na <strong>"Lista Suja do Trabalho Escravo"</strong> (Cadastro de Empregadores do MTE) têm sua nota automaticamente zerada, independente de quaisquer outros bônus.
              </p>
            </div>
          </div>
          
          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
            Aviso Legal: Este ranking é uma ferramenta informativa baseada em dados históricos (Data-base: Fev/2026). Não constitui recomendação de investimento.
          </p>

        </div>
      </div>
    </div>
  );
};
