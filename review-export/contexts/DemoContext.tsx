import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

const DEMO_PARAM = 'demo';
const DEMO_VALUE = 'audit';
const STORAGE_KEY = 'ezlegal_demo_mode';

function checkDemoFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get(DEMO_PARAM) === DEMO_VALUE;
}

interface DemoContextType {
  isDemoMode: boolean;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({ isDemoMode: false, exitDemo: () => {} });

export function DemoProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') return true;
    if (checkDemoFromUrl()) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      return true;
    }
    return false;
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get(DEMO_PARAM) === DEMO_VALUE && !isDemoMode) {
      setIsDemoMode(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [location.search, isDemoMode]);

  const exitDemo = () => {
    setIsDemoMode(false);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}
