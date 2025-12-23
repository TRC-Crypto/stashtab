'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-zinc-600 border-t-yield rounded-full animate-spin ${className}`}
    />
  );
}

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      {message && <p className="text-zinc-400">{message}</p>}
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-300 rounded ${className}`} />;
}

