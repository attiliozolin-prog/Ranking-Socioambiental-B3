import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Leaf, FileText, Home } from 'lucide-react';
import HomePage from './pages/Home';
import AboutPage from './pages/About';

const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar Global */}
      <nav className="bg-slate-950 text-white sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Leaf className="text-emerald-400" size={24} />
            <span className="font-bold text-lg tracking-tight">Ranking Socioambiental <span className="text-emerald-400">B3</span></span>
          </Link>
          <div className="flex gap-1 sm:gap-4">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Início</span>
            </Link>
            <Link
              to="/sobre"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/sobre' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Sobre & Metodologia</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content (Routes) */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre" element={<AboutPage />} />
        </Routes>
      </div>

      {/* Footer Global */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-slate-500 text-sm mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Ranking Socioambiental B3. Projeto independente.</p>
          <div className="flex gap-4">
            <Link to="/sobre" className="hover:text-emerald-400 transition">Entenda a Metodologia</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
