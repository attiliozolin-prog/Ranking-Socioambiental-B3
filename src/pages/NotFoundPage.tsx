import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function NotFoundPage({ what = 'esta página' }: { what?: string }) {
  useDocumentMeta('Não encontrado');
  return (
    <div className="container-page py-28 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-ink">Não encontramos {what}</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-2">
        Ela pode ter mudado de ticker ou saído da base. Busque pelo nome no ranking.
      </p>
      <Link to="/" className="mt-8 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
        Voltar ao ranking
      </Link>
    </div>
  );
}
