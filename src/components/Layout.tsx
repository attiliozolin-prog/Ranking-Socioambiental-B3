import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { dataset } from '../lib/data';
import { formatDate } from '../lib/format';
import { REPO_URL, correctionUrl } from '../lib/site';
import { cx } from './ui';

const NAV = [
  { to: '/', label: 'Ranking', end: true },
  { to: '/comparar', label: 'Comparar' },
  { to: '/metodologia', label: 'Metodologia' },
  { to: '/sobre', label: 'Sobre' },
];

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Ranking Socioambiental B3 — página inicial">
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="fill-accent" />
        <path d="M8 22V10m0 12h16M12 22v-6m4 6v-9m4 9v-4" className="stroke-bg" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      </svg>
      <span className="leading-none">
        <span className="block font-serif text-[1.05rem] font-semibold tracking-tight text-ink">Ranking Socioambiental</span>
        <span className="eyebrow mt-0.5 block !text-[10px]">B3 · Due diligence aberta</span>
      </span>
    </Link>
  );
}

function ThemeButton() {
  const { pref, cycle } = useTheme();
  const Icon = pref === 'light' ? Sun : pref === 'dark' ? Moon : Monitor;
  const label = pref === 'light' ? 'Tema claro' : pref === 'dark' ? 'Tema escuro' : 'Tema do sistema';
  return (
    <button
      type="button"
      onClick={cycle}
      className="grid h-9 w-9 place-items-center rounded-lg text-ink-2 transition hover:bg-surface-2 hover:text-ink"
      aria-label={`${label} — clique para alternar`}
      title={label}
    >
      <Icon size={17} />
    </button>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Principal" className="flex items-center gap-1">
            <ul className="hidden items-center gap-1 sm:flex">
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      cx(
                        'rounded-lg px-3 py-2 text-sm font-medium transition',
                        isActive ? 'bg-surface-2 text-ink' : 'text-ink-2 hover:text-ink',
                      )
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ThemeButton />
          </nav>
        </div>
        {/* navegação compacta em telas pequenas */}
        <nav aria-label="Principal (móvel)" className="border-t border-line sm:hidden">
          <ul className="container-page flex justify-between">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cx('block border-b-2 px-2 py-2.5 text-[13px] font-medium', isActive ? 'border-accent text-ink' : 'border-transparent text-ink-3')
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="conteudo" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<div className="container-page py-24 text-center text-sm text-ink-3">Carregando…</div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="mt-24 border-t border-line">
        <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-2">
              Projeto independente, sem vínculo com a B3 ou com as empresas avaliadas. Conteúdo informativo:{' '}
              <strong className="font-semibold text-ink">não é recomendação de investimento</strong> nem relatório de análise nos termos da
              Resolução CVM nº 20/2021.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Navegar</p>
            <ul className="space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link className="text-ink-2 hover:text-ink" to={n.to}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Dados</p>
            <ul className="space-y-2 text-sm text-ink-2">
              <li>Referência: {formatDate(dataset.meta.as_of)}</li>
              <li>
                Dataset v{dataset.meta.dataset_version} · Metodologia v{dataset.meta.methodology_version}
              </li>
              <li>
                <a className="hover:text-ink" href={correctionUrl()} target="_blank" rel="noopener noreferrer">
                  Reportar uma correção ↗
                </a>
              </li>
              <li>
                <a className="hover:text-ink" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                  Código aberto no GitHub ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
