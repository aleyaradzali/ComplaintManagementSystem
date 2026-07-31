import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ClipboardCheck, Users, BarChart3 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ROUTES } from '../constants/routes';
import mcmcLogo from '../assets/mcmc-logo.png';

const HIGHLIGHTS = [
  { icon: ClipboardCheck, text: 'Track every complaint from intake to resolution' },
  { icon: Users, text: 'Assign cases to officers and monitor workload' },
  { icon: BarChart3, text: 'See status and category trends at a glance' },
];

export function LoginPage() {
  useDocumentTitle('Sign in');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    try {
      await login({ email, password });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      if (err.data?.errors) {
        const fieldErrors = {};
        err.data.errors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setErrors(fieldErrors);
      } else {
        setFormError(err.message ?? 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-app">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-10 text-white lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 70%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-2.5">
        <img src={mcmcLogo} alt="MCMC" className="h-10 w-auto flex-none" />
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-3xl font-extrabold tracking-wide italic">
            Resolv
          </p>
        </div>
      </div>

        <div className="relative">
          <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            MCMC Complaint Management System (Mini)
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/15">
                  <Icon size={16} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
            <p className="mt-1 text-sm text-muted">
              Enter your credentials to manage complaints.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@email.my"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="••••••••"
            />
            {formError && (
              <p className="rounded border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
                {formError}
              </p>
            )}
            <Button
              type="submit"
              loading={submitting}
              disabled={submitting}
              size="lg"
              className="mt-2 w-full"
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
