import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ROUTES } from '../constants/routes';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app px-4 text-center">
      <p className="text-5xl font-bold tracking-tight text-primary">404</p>
      <p className="text-sm text-muted">The page you are looking for does not exist.</p>
      <Link to={ROUTES.COMPLAINTS}>
        <Button variant="secondary" className="mt-2">
          Back to complaints
        </Button>
      </Link>
    </div>
  );
}
