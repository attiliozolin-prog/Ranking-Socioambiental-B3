import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X, Scale, ShieldCheck, FileWarning, TrendingDown, TrendingUp } from 'lucide-react';

const BONUS_TABLE = [
  { source: 'ISE B3', dimension: 'E+S+G', pts: '+20', desc: 'Índice de Sustentabilidade Empresarial — referência ESG do Brasil desde 2005' },
  { source: 'S&P/B3 ESG', dimension: 'E+S+G', pts: '+12', desc: 'Metodologia global S&P Dow Jones — exclui tabaco e armas' },
  { source: 'ICO2 B3', dimension: 'Ambiental', pts: '+10', desc: 'Empresas com maior eficiência de emissões de carbono (GEE/receita)' },
  { source: 'IDiversa B3', dimension: 'Social', pts: '+10', desc: 'Diversidade de gênero e raça em cargos executivos e conselhos' },
  { source: 'IGC — Novo Mercado', dimension: 'Governança', pts: '+8', desc: 'Nível máximo de governança corporativa da B3' },
  { source: 'IGPTW B3', dimension: 'Social', pts: '+8', desc: 'Certificação Great Place to Work — cultura e relação com colaboradores' },
  { source: 'IGC — Nível 2', dimension: 'Governança', pts: '+6', desc: 'Governança diferenciada Nível 2 da B3' },
  { source: 'IGCT', dimension: 'Governança', pts: '+5', desc: 'Governança corporativa com critério adicional de liquidez' },
  { source: 'UN Global Compact', dimension: 'S+G', pts: '+5', desc: 'Compromisso público com os 10 princípios de conduta empresarial da ONU' },
  { source: 'CDP Score A', dimension: 'Ambiental', pts: '+5', desc: 'Pontuação máxima no Carbon Disclosure Project' },
  { source: 'ITAG', dimension: 'Governança', pts: '+4', desc: 'Tag along — proteção ao acionista minoritário' },
  { source: 'IGC — Nível 1', dimension: 'Governança', pts: '+4', desc: 'Governança diferenciada Nível 1 da B3' },
  { source: 'TCFD', dimension: 'Ambiental', pts: '+3', desc: 'Relatório de riscos e métricas climáticas publicado' },
  { source: 'GRI', dimension: 'Transparência', pts: '+3', desc: 'Relatório de Sustentabilidade GRI publicado' },
  { source: 'CDP Score B', dimension: 'Ambiental', pts: '+3', desc: 'Pontuação B no Carbon Disclosure Project' },
];

const PENALTY_TABLE = [
  { source: 'MTE — Lista Suja', tipo: 'Trabalho Análogo à Escravidão', pts: 'ZERO', color: 'bg-red-200 text-red-900 font-black' },
  { source: 'CVM / SEC', tipo: 'Processo sancionador por fraude contábil', pts: '-20 a -55', color: 'bg-red-100 text-red-800' },
  { source: 'Tribunal Federal/Estadual', tipo: 'Condenação ambiental (desastre)', pts: '-20 a -50', color: 'bg-red-100 text-red-800' },
  { source: 'IBAMA', tipo: 'Auto de infração grave / Embargo', pts: '-15 a -30', color: 'bg-orange-100 text-orange-800' },
  { source: 'CADE', tipo: 'Condenação antitruste', pts: '-15 a -25', color: 'bg-orange-100 text-orange-800' },
  { source: 'MPT', tipo: 'Ação civil pública / TAC trabalhista', pts: '-8 a -20', color: 'bg-yellow-100 text-yellow-800' },
  { source: 'MTE', tipo: 'Auto de infração trabalhista', pts: '-10 a -25', color: 'bg-yellow-100 text-yellow-800' },
  { source: 'IBAMA', tipo: 'Multa ambiental (leve/média)', pts: '-5 a -15', color: 'bg-yellow-100 text-yellow-800' },
  { source: 'ICMBio', tipo: 'Infração em unidades de conservação', pts: '-10 a -20', color: 'bg-orange-100 text-orange-800' },
  { source: 'Banco Central', tipo: 'Infração regulatória financeira', pts: '-5 a -15', color: 'bg-slate-100 text-slate-700' },
];

export const MethodologyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'bonus' | 'penalty'>('bonus');

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsOpen(false)} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="text-blue-600" />
              Como calculamos a nota?
            </h2>
            <p className="text-sm text-slate-500 mt-1">Transparência total: dados públicos e verificáveis.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Fórmula */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm text-center text-slate-700">
            <span className="font-bold text-slate-900">Nota Final</span>
            {' = '}
            <span className="text-blue-600 font-bold">Base 50</span>
            {' + '}
            <span className="text-emerald-600 font-bold">Σ Bônus</span>
            {' − '}
            <span className="text-red-600 font-bold">Σ Penalidades</span>
            <div className="text-xs text-slate-400 mt-1">(limitada entre 0 e 100)</div>
          </div>

          {/* Kill Switch */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
            <div className="bg-white p-2 rounded-full border border-red-100 text-red-600 flex-shrink-0">
              <FileWarning size={20} />
            </div>
            <div>
              <h4 className="font-bold text-red-900 text-sm">Critério de Exclusão — Nota Zero</h4>
              <p className="text-xs text-red-700 mt-1">
                Empresas na <strong>Lista Suja do Trabalho Escravo</strong> (MTE) têm a nota zerada automaticamente, independentemente de outros fatores.
              </p>
            </div>
          </div>

          {/* Tabs de conteúdo */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('bonus')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeSection === 'bonus' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <TrendingUp size={15} /> Bônus — Índices B3
            </button>
            <button
              onClick={() => setActiveSection('penalty')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeSection === 'penalty' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <TrendingDown size={15} /> Penalidades — Fontes Oficiais
            </button>
          </div>

          {/* Bonus Table */}
          {activeSection === 'bonus' && (
            <div className="space-y-2">
              {BONUS_TABLE.map((row) => (
                <div key={row.source} className="flex gap-3 items-start p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-800">{row.source}</span>
                      <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex-shrink-0">{row.pts} pts</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-emerald-700 bg-emerald-100 px-1.5 rounded">{row.dimension}</span>
                      <span className="text-xs text-slate-500">{row.desc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Penalty Table */}
          {activeSection === 'penalty' && (
            <div className="space-y-2">
              {PENALTY_TABLE.map((row) => (
                <div key={row.source + row.tipo} className="flex gap-3 items-start p-3 rounded-lg bg-red-50 border border-red-100">
                  <FileWarning size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-800">{row.source}</span>
                      <span className={`text-xs font-mono font-black px-2 py-0.5 rounded flex-shrink-0 ${row.color}`}>{row.pts} pts</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{row.tipo}</p>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
                <strong>Fontes consultadas:</strong> CVM, SEC, IBAMA, ICMBio, MTE, MPT, CADE, Tribunais Federais e Estaduais, Banco Central, OECD, OIT, GRI, TCFD, CDP, UN Global Compact.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
