import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type PersonaType = 'individual' | 'business' | 'legal-aid' | null;

interface PersonaContextValue {
  persona: PersonaType;
  setPersona: (persona: PersonaType) => void;
  clearPersona: () => void;
}

const PersonaContext = createContext<PersonaContextValue | undefined>(undefined);

const PERSONA_STORAGE_KEY = 'ez_selected_persona';

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaType>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PERSONA_STORAGE_KEY);
      if (stored && ['individual', 'business', 'legal-aid'].includes(stored)) {
        setPersonaState(stored as PersonaType);
      }
    } catch {
      // sessionStorage disabled
    }
  }, []);

  const setPersona = (newPersona: PersonaType) => {
    setPersonaState(newPersona);
    try {
      if (newPersona) {
        sessionStorage.setItem(PERSONA_STORAGE_KEY, newPersona);
      } else {
        sessionStorage.removeItem(PERSONA_STORAGE_KEY);
      }
    } catch {
      // sessionStorage disabled
    }
  };

  const clearPersona = () => {
    setPersona(null);
  };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, clearPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}
