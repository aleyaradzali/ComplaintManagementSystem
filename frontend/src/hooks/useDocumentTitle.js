import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Resolv` : 'Resolv · MCMC Complaint Management';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
