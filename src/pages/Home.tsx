import React, { useState, useMemo, useEffect } from 'react';
import { Search, Info, Leaf, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import rankingDataRaw from '../ranking_db.json';
import { CompanyCard } from '../components/CompanyCard';
import { MethodologyModal } from '../components/MethodologyModal';
import { RankingData } from '../types';

const rankingData = rankingDataRaw as RankingData;

enum Tab {
  GENERAL = 'GERAL',
  BEST = 'TOP_BEST',
  WORST = 'TOP_WORST'
}

type SortKey = 'score_final' | 'environmental' | 'social' | 'governance';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'score_final', label: 'Nota Final' },
  { value: 'environmental', label: 'Ambiental' },
  { value: 'social', label: 'Social' },
  { value: 'governance', label: 'Governança' },
];

// Collect unique sectors from data
const ALL_SECTORS: string[] = ['Todos os Setores', ...Array.from(
  new Set(rankingData.companies.map(c => c.sector))
).sort()];

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score_final');
  const [selectedSector, setSelectedSector] = useState<string>('Todos os Setores');
  const [highlightedTicker, setHighlightedTicker] = useState<string | null>(null);

  // Read ?ticker= from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get('ticker');
    if (ticker) {
      setHighlightedTicker(ticker.toUpperCase());
      setSearchTerm(ticker.toUpperCase());
      // Scroll to card after render
      setTimeout(() => {
        const el = document.getElementById(`card-${ticker.toUpperCase()}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, []);

  const filteredCompanies = useMemo(() => {
    let companies = [...rankingData.companies];

    // Text search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      companies = companies.filter(c =>
        c.name.toLowerCase().includes(lower) ||
        c.ticker.toLowerCase().includes(lower)
      );
    }

    // Sector filter
    if (selectedSector !== 'Todos os Setores') {
      companies = companies.filter(c => c.sector === selectedSector);
    }

    // Tab logic
    switch (activeTab) {
      case Tab.BEST:
        companies = companies.filter(c => c.score_final >= 70);
        break;
      case Tab.WORST:
        companies = companies.filter(c => c.score_final < 50);
        break;
    }

    // Sort
    companies.sort((a, b) => {
      const valA = sortKey === 'score_final' ? a.score_final : a.dimensions[sortKey];
      const valB = sortKey === 'score_final' ? b.score_final : b.dimensions[sortKey];
      if (activeTab === Tab.WORST) return valA - valB; // ascending for worst
      return valB - valA; // descending for others
    });

    return companies;
  }, [searchTerm, activeTab, sortKey, selectedSector]);

  return (
    <div className="pb-20">
      <header className="bg-slate-900 text-white pt-8 pb-14 sm:pt-12 sm:pb-16 px-4 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Leaf size={200} />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              B3 • IBAMA • MTE • CVM • CADE • MPT
            </div>
            <MethodologyModal />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Quem financia o futuro e <br className="hidden md:block" />
            <span className="text-red-400">quem destrói o presente?</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Democratizando a Due Diligence. Veja o ranking de responsabilidade socioambiental das <strong className="text-white">100 maiores empresas listadas na B3</strong>.
          </p>

          <div className="mt-8 text-xs text-slate-500">
            Atualizado em: {rankingData.meta.last_update} • {rankingData.meta.total_companies} Empresas Analisadas
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto -mt-8 px-4 relative z-20">

        {/* Search + Filters Card */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-6 ring-1 ring-slate-900/5 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              placeholder="Buscar por nome ou ticker (ex: PETR4, Gerdau...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sector + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <select
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none shadow-sm"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                {ALL_SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              </div>
              <select
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none shadow-sm"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>Ordenar por: {o.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab(Tab.GENERAL)}
            className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === Tab.GENERAL
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab(Tab.BEST)}
            className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === Tab.BEST
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
              }`}
          >
            Top Responsáveis
          </button>
          <button
            onClick={() => setActiveTab(Tab.WORST)}
            className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === Tab.WORST
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-red-700 hover:bg-red-50 border border-slate-200'
              }`}
          >
            Top Piores
          </button>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-semibold text-slate-500">
            {filteredCompanies.length} empresas encontradas
          </span>
          {activeTab === Tab.WORST && (
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
              <ShieldAlert className="w-3 h-3 mr-1" />
              Atenção: Alto Risco
            </span>
          )}
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <CompanyCard
                key={company.ticker}
                company={company}
                isHighlighted={highlightedTicker === company.ticker}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <Info className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhuma empresa encontrada</h3>
              <p className="mt-1 text-sm text-slate-500">Tente buscar por outro termo ou remover filtros.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
