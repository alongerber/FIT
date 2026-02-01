import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-primary rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}
