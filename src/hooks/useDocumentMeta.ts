import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_NAME, SITE_URL } from '../lib/site';

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  const el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
  if (el) el.setAttribute(attr, value);
}

/** Título, descrição e canonical por rota (o HTML estático de cada empresa é gerado no build). */
export function useDocumentMeta(title: string | null, description?: string) {
  const { pathname } = useLocation();
  useEffect(() => {
    const full = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — notas ESG auditáveis das maiores empresas da bolsa`;
    document.title = full;
    setMeta('meta[property="og:title"]', 'content', full);
    setMeta('link[rel="canonical"]', 'href', `${SITE_URL}${pathname}`);
    setMeta('meta[property="og:url"]', 'content', `${SITE_URL}${pathname}`);
    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
    }
  }, [title, description, pathname]);
}
