import { ReactNode } from 'react';
import Navigation from '../Navigation';
import Footer from '../Footer';
import { MobileStickyBar } from './MobileStickyBar';

interface HomeShellProps {
  children: ReactNode;
}

export function HomeShell({ children }: HomeShellProps) {
  return (
    <div className="min-h-screen bg-[#FAFBF9] text-slate-950">
      <Navigation />
      <main id="main-content" className="pt-16 pb-16 sm:pb-0">
        {children}
      </main>
      <MobileStickyBar />
      <Footer />
    </div>
  );
}
