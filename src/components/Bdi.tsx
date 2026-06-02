import { ReactNode } from 'react';

interface BdiProps {
  children: ReactNode;
  className?: string;
}

export default function Bdi({ children, className }: BdiProps) {
  return (
    <bdi className={className} style={{ unicodeBidi: 'isolate' }}>
      {children}
    </bdi>
  );
}
