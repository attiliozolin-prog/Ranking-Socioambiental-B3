import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './styles/index.css';
import { Layout } from './components/Layout';
import RankingPage from './pages/RankingPage';

// Ranking carrega junto; demais rotas sob demanda.
const CompanyPage = lazy(() => import('./pages/CompanyPage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <RankingPage /> },
      { path: 'empresa/:ticker', element: <CompanyPage /> },
      { path: 'comparar', element: <ComparePage /> },
      { path: 'metodologia', element: <MethodologyPage /> },
      { path: 'sobre', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
