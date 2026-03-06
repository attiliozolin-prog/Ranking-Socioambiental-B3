import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, ShieldCheck } from 'lucide-react';
import { Company } from '../types';
import { Badge } from './Badge';
import { EvidenceLog } from './EvidenceLog';

interface CompanyCardProps {
  company: Company;
  isHighlighted?: boolean;
}

const getScoreColor = (score: number, killSwitch?: boolean) => {
  if (killSwitch || score === 0) return 'bg-black text-white border-red-600 border-2';
  if (score >= 70) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const getDataQualityLabel = (q: string) => {
  if (q === 'alto') return { label: 'Dados verificados', color: 'text-emerald-600' };
  if (q === 'medio') return { label: 'Dados parciais', color: 'text-yellow-600' };
  return { label: 'Dados estimados', color: 'text-slate-400' };
};

const DIMENSION_COLORS = {
  environmental: { bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Ambiental' },
  social: { bar: 'bg-blue-500', text: 'text-blue-700', label: 'Social' },
  governance: { bar: 'bg-purple-500', text: 'text-purple-700', label: 'Governança' },
};

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, isHighlighted }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const scoreColorClass = getScoreColor(company.score_final, company.kill_switch);
  const dq = getDataQualityLabel(company.data_quality);

  return (
    <div
      id={`card-${company.ticker}`}
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 overflow-hidden ${isExpanded ? 'ring-2 ring-slate-400 shadow-md' : 'border-slate-200 hover:border-slate-300'
        } ${isHighlighted ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Score Circle */}
          <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl border ${scoreColorClass}`}>
            {company.kill_switch ? '0' : company.score_final}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{company.name}</h3>
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {company.ticker}
              </span>
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {company.sector}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Building2 size={12} />
                CNPJ: {company.cnpj_root}
              </span>
              <span className={`${dq.color}`}>● {dq.label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end max-w-xs">
          {company.badges.slice(0, 3).map((badge, idx) => (
            <Badge key={idx} text={badge} />
          ))}
          {company.badges.length > 3 && (
            <span className="text-xs text-slate-400 py-1">+{company.badges.length - 3}</span>
          )}
        </div>

        <div className="hidden sm:block text-slate-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">

          {/* Índices B3 */}
          {company.indices_b3.length > 0 && (
            <div className="mb-6">
              <span className="text-xs uppercase font-bold text-slate-400 mb-2 block tracking-wider">
                Índices B3 / Certificações
              </span>
              <div className="flex flex-wrap gap-2">
                {company.indices_b3.map((idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck size={11} />
                    {idx}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dimensões E S G */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(Object.entries(DIMENSION_COLORS) as [keyof typeof DIMENSION_COLORS, (typeof DIMENSION_COLORS)[keyof typeof DIMENSION_COLORS]][]).map(([key, styles]) => (
              <div key={key} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs uppercase font-bold text-slate-400 mb-2 block tracking-wider">
                  {styles.label}
                </span>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                  <div
                    className={`${styles.bar} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${company.dimensions[key]}%` }}
                  />
                </div>
                <div className={`text-right text-sm font-bold ${styles.text}`}>
                  {company.dimensions[key]}/100
                </div>
              </div>
            ))}
          </div>

          <EvidenceLog evidence={company.evidence_log} />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Verificado em: {company.last_verified ? new Date(company.last_verified).toLocaleDateString('pt-BR') : '—'}
            </span>
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
