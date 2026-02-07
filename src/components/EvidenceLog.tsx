import React from 'react';
import { Evidence } from '../types';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface EvidenceLogProps {
  evidence: Evidence[];
}

export const EvidenceLog: React.FC<EvidenceLogProps> = ({ evidence }) => {
  return (
    <div>
      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
        Evidence Log <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Histórico de Auditoria</span>
      </h4>
      <div className="space-y-3">
        {evidence.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-start group">
            <div className={`mt-0.5 flex-shrink-0 ${item.type === 'BONUS' ? 'text-emerald-500' : 'text-red-500'}`}>
              {item.type === 'BONUS' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            </div>
            
            <div className="flex-1 pb-3 border-b border-slate-200 last:border-0 group-last:pb-0">
               <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-slate-800">{item.description}</span>
                  <span className={`font-mono text-xs font-bold ${item.type === 'BONUS' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {item.impact > 0 ? `+${item.impact}` : item.impact} pts
                  </span>
               </div>
               
               <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span className="font-medium bg-slate-100 px-1.5 rounded text-slate-600">{item.source}</span>
                  {item.date && <span>{item.date}</span>}
                  {item.link_ref && (
                    <a href={item.link_ref} target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-600 hover:underline">
                      Ver fonte <ExternalLink size={10} className="ml-1" />
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
