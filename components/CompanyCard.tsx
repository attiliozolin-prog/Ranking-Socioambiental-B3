import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertOctagon, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import { Company } from '../types';
import { Badge } from './Badge';
import { EvidenceLog } from './EvidenceLog';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to determine Score Color
  const getScoreColor = (score: number) => {
    if (score === 0) return 'bg-black text-white border-red-600 border-2'; // Kill Switch
    if (score >= 70) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const scoreColorClass = getScoreColor(company.score_final);

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden ${isExpanded ? 'ring-2 ring-slate-400 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
      
      {/* Header / Summary */}
      <div 
        className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Score Circle */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border ${scoreColorClass}`}>
            {company.score_final}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 truncate">{company.name}</h3>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {company.ticker}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <Building2 size={14} />
              <span className="truncate">CNPJ Raiz: {company.cnpj_root}</span>
            </div>
          </div>
        </div>

        {/* Desktop Badges (Hidden on mobile when collapsed sometimes, but here we show) */}
        <div className="flex flex-wrap gap-2 sm:justify-end max-w-xs">
          {company.badges.slice(0, 3).map((badge, idx) => (
            <Badge key={idx} text={badge} />
          ))}
          {company.badges.length > 3 && (
            <span className="text-xs text-slate-400 py-1">+ {company.badges.length - 3}</span>
          )}
        </div>

        <div className="hidden sm:block text-slate-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             {/* Dimensions */}
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-slate-400 mb-2 block tracking-wider">Ambiental</span>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${company.dimensions.environmental}%` }}></div>
                </div>
                <div className="text-right text-sm font-bold text-emerald-700">{company.dimensions.environmental}/100</div>
             </div>
             
             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-slate-400 mb-2 block tracking-wider">Social</span>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${company.dimensions.social}%` }}></div>
                </div>
                <div className="text-right text-sm font-bold text-blue-700">{company.dimensions.social}/100</div>
             </div>

             <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-slate-400 mb-2 block tracking-wider">Governança</span>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                  <div className="bg-purple-500 h-2.5 rounded-full" style={{ width: `${company.dimensions.governance}%` }}></div>
                </div>
                <div className="text-right text-sm font-bold text-purple-700">{company.dimensions.governance}/100</div>
             </div>
          </div>

          <EvidenceLog evidence={company.evidence_log} />
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-sm text-slate-500 hover:text-slate-800 underline"
            >
              Recolher detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};