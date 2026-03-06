import React from 'react';
import { Evidence } from '../types';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface EvidenceLogProps {
  evidence: Evidence[];
}

const SOURCE_COLORS: Record<string, string> = {
  'IBAMA': 'bg-green-100 text-green-800',
  'ICMBio': 'bg-green-100 text-green-800',
  'MTE — Lista Suja': 'bg-red-200 text-red-900 font-bold',
  'MTE': 'bg-red-100 text-red-800',
  'MPT': 'bg-orange-100 text-orange-800',
  'CADE': 'bg-purple-100 text-purple-800',
  'CVM': 'bg-blue-100 text-blue-800',
  'SEC': 'bg-blue-100 text-blue-800',
  'Tribunal Federal': 'bg-yellow-100 text-yellow-800',
  'Tribunal Estadual': 'bg-yellow-100 text-yellow-800',
  'ISE B3': 'bg-emerald-100 text-emerald-800',
  'ICO2 B3': 'bg-teal-100 text-teal-800',
  'IDiversa B3': 'bg-pink-100 text-pink-800',
  'IGPTW B3': 'bg-indigo-100 text-indigo-800',
  'IGC — Novo Mercado': 'bg-violet-100 text-violet-800',
};

export const EvidenceLog: React.FC<EvidenceLogProps> = ({ evidence }) => {
  return (
    <div>
      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        Evidence Log
        <span className="text-xs font-normal text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
          Histórico de Auditoria
        </span>
      </h4>
      <div className="space-y-3">
        {evidence.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start group">
            <div className={`mt-0.5 flex-shrink-0 ${item.type === 'BONUS' ? 'text-emerald-500' : 'text-red-500'}`}>
              {item.type === 'BONUS' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            </div>

            <div className="flex-1 pb-3 border-b border-slate-200 last:border-0 group-last:pb-0">
              <div className="flex justify-between items-start gap-2">
                <span className="font-semibold text-sm text-slate-800">{item.description}</span>
                <span className={`font-mono text-xs font-bold flex-shrink-0 ${item.type === 'BONUS' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.impact > 0 ? `+${item.impact}` : item.impact} pts
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-500">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[item.source] ?? 'bg-slate-100 text-slate-600'}`}>
                  {item.source}
                </span>
                {item.date && (
                  <span className="text-slate-400">
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Ver fonte <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
