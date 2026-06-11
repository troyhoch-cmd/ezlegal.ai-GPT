import { createContext, useContext, useState, useCallback, useRef } from 'react';

type ModalPriority = 'critical' | 'high' | 'medium' | 'low';

interface ModalEntry {
  id: string;
  priority: ModalPriority;
  timestamp: number;
}

const PRIORITY_ORDER: Record<ModalPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

interface ModalContextType {
  activeModal: string | null;
  requestModal: (id: string, priority?: ModalPriority) => boolean;
  releaseModal: (id: string) => void;
  isModalActive: (id: string) => boolean;
  suppressionCount: number;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [suppressionCount, setSuppressionCount] = useState(0);
  const activeEntry = useRef<ModalEntry | null>(null);

  const requestModal = useCallback((id: string, priority: ModalPriority = 'medium'): boolean => {
    if (!activeEntry.current) {
      activeEntry.current = { id, priority, timestamp: Date.now() };
      setActiveModal(id);
      return true;
    }

    const currentWeight = PRIORITY_ORDER[activeEntry.current.priority];
    const requestWeight = PRIORITY_ORDER[priority];

    if (requestWeight > currentWeight) {
      activeEntry.current = { id, priority, timestamp: Date.now() };
      setActiveModal(id);
      return true;
    }

    setSuppressionCount(prev => prev + 1);
    return false;
  }, []);

  const releaseModal = useCallback((id: string) => {
    if (activeEntry.current?.id === id) {
      activeEntry.current = null;
      setActiveModal(null);
    }
  }, []);

  const isModalActive = useCallback((id: string) => {
    return activeEntry.current?.id === id;
  }, []);

  return (
    <ModalContext.Provider value={{ activeModal, requestModal, releaseModal, isModalActive, suppressionCount }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalManager() {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModalManager must be used within ModalProvider');
  return context;
}
