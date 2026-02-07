import React, { useState, useMemo } from 'react';
import { Search, Info, Leaf, ShieldAlert } from 'lucide-react';
import rankingDataRaw from './ranking_db.json';
import { CompanyCard } from './components/CompanyCard';
import { MethodologyModal } from './components/MethodologyModal';
import { RankingData } from './types';

// Cast the imported JSON to the correct type
const rankingData = rankingDataRaw as RankingData;

enum Tab {
  GENERAL = 'GERAL',
  BEST = 'TOP_BEST',
  WORST = 'TOP_WORST'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GENERAL);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = useMemo(() => {
    let companies = [...rankingData.companies];

    // 1. Text Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      companies = companies.filter(c => 
        c.name.toLowerCase().includes(lowerTerm) || 
        c.ticker.toLowerCase().includes(lowerTerm)
      );
    }

    // 2. Tab Logic Sorting/Filtering
    switch (activeTab) {
      case Tab.BEST:
        // Filter for good scores and sort descending
        return companies
          .filter(c => c.score_final >= 60)
          .sort((a, b) => b.score_final - a.score_final);
      
      case Tab.WORST:
        // Filter for bad scores and sort ascending (worst first)
        return companies
          .filter(c => c.score_final < 50)
          .sort((a, b) => a.score_final - b.score_final); // Ascending: 0, 10, 20...
      
      case Tab.GENERAL:
      default:
        // Default sort by score descending
        return companies.sort((a, b) => b.score_final - a.score_final);
    }
  }, [searchTerm, activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section - A CORREÇÃO ESTÁ NA LINHA ABAIXO (z-50) */}
      <header className="bg-slate-900 text-white pt-12 pb-16 px-4 relative z-50 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Leaf size={200} />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          
          {/* Badge de Dados + Botão de Metodologia */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              DADOS PÚBLICOS B3 • IBAMA • MTE
            </div>
            
            <MethodologyModal />
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Quem financia o futuro e <br className="hidden md:block"/>
            <span className="text-red-400">quem destrói o presente?</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Democratizando a Due Diligence. Veja o ranking de responsabilidade socioambiental das empresas listadas na bolsa.
          </p>
          
          <div className="mt-8 text-xs text-slate-500">
             Atualizado em: {rankingData.meta.last_update} • {rankingData.meta.total_companies} Empresas Analisadas
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto -mt-8 px-4 relative z-20">
        
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-6 ring-1 ring-slate-900/5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm"
              placeholder="Buscar por nome ou ticker (ex: PETR4, Vale...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab(Tab.GENERAL)}
            className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === Tab.GENERAL
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab(Tab.BEST)}
            className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === Tab.BEST
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Top Responsáveis
          </button>
          <button
            onClick={() => setActiveTab(Tab.WORST)}
            className={`flex-1 min-w-[140px] py-2 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === Tab.WORST
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
              <CompanyCard key={company.ticker} company={company} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300">
              <Info className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Nenhuma empresa encontrada</h3>
              <p className="mt-1 text-sm text-slate-500">Tente buscar por outro termo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
