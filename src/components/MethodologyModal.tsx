import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // <--- O SEGREDO ESTÁ AQUI
import { Info, X, Scale, ShieldCheck, FileWarning, ArrowRight } from 'lucide-react';

export const MethodologyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Parte 1: O Botão (Continua onde você colocar ele)
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-all border border-white/10 backdrop-blur-sm relative z-50"
      >
        <Info size={16} />
        <span>Entenda a Metodologia</span>
      </button>
    );
  }

  // Parte 2: A Janela Modal (Teletransportada para o body)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      
      {/* Fundo Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Janela Branca */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Topo da Janela */}
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

        {/* Conteúdo Organizado em Lista */}
        <div className="p-6 space-y-6">
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600 text-sm leading-relaxed">
            O <strong>Ranking Socioambiental B3</strong> é resultado de um algoritmo matemático que cruza dados públicos oficiais do Governo Federal com certificações de mercado.
          </div>

          <div className="space-y-4">
              
              {/* Item 1: Base */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-blue-100 text-blue-700 py-2 text-center rounded-lg font-bold text-xs border border-blue-200">
                  BASE
                </div>
                <div className="flex-1 pt-1">
                  <div className="font-bold text-slate-900 text-lg">50 Pontos</div>
                  <p className="text-sm text-slate-600">Nota inicial neutra para toda empresa listada.</p>
                </div>
              </div>

              {/* Seta */}
              <div className="pl-11 opacity-20"><ArrowRight className="rotate-90" size={20} /></div>

              {/* Item 2: Bônus */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-emerald-100 text-emerald-700 py-2 text-center rounded-lg font-bold text-xs border border-emerald-200">
                  + BÔNUS
                </div>
                <div className="flex-1 pt-1">
                   <div className="font-bold text-slate-900 text-lg">Até +50 Pontos</div>
                   <ul className="text-xs text-slate-500 mt-1 space-y-1">
                    <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> ISE B3 (Sustentabilidade)</li>
                    <li className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-emerald-500"/> Novo Mercado (Governança)</li>
                  </ul>
                </div>
              </div>

              {/* Seta */}
              <div className="pl-11 opacity-20"><ArrowRight className="rotate-90" size={20} /></div>

              {/* Item 3: Sanções */}
              <div className="flex gap-4 items-start">
                <div className="w-24 flex-shrink-0 bg-red-100 text-red-700 py-2 text-center rounded-lg font-bold text-xs border border-red-200">
                  - SANÇÕES
                </div>
                <div className="flex-1 pt-1">
                   <div className="font-bold text-slate-900 text-lg">Sem Limite</div>
                   <p className="text-sm text-slate-600 mb-2">Multas ambientais e processos:</p>
                   <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-50 p-2 rounded border border-red-100 text-xs text-red-800 font-medium">
                      IBAMA (-10 a -50 pts)
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-100 text-xs text-red-800 font-medium">
                      CADE (-15 pts)
                    </div>
                   </div>
                </div>
              </div>
          </div>

          {/* Kill Switch */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start mt-4">
            <div className="bg-white p-2 rounded-full border border-red-100 text-red-600">
              <FileWarning size={20} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-sm">Critério de Exclusão (Nota Zero)</h4>
              <p className="text-xs text-red-700 mt-1">
                Empresas na <strong>"Lista Suja do Trabalho Escravo"</strong> (MTE) têm a nota zerada automaticamente.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body // <--- Isso joga o modal para fora de tudo, no nível mais alto do site
  );
};
