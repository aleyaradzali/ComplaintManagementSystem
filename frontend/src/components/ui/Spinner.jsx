import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Spinner({ size = 20, className }) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-primary', className)}
      aria-hidden="true"
    />
  );
}
