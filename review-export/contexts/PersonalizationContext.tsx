import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'ez_preferences';

interface UserPreferences {
  visitorId: string;
  lastVisit: string | null;
  visitCount: number;
  preferredLanguage: string;
  lastCaseType: string | null;
  lastPage: string | null;
  intakeProgress: Record<string, unknown>;
  isReturningVisitor: boolean;
}

interface PersonalizationContextType {
  preferences: UserPreferences;
  isLoading: boolean;
  updatePreference: (key: keyof UserPreferences, value: unknown) => void;
  trackPageVisit: (page: string) => void;
  trackCaseType: (caseType: string) => void;
  saveIntakeProgress: (formId: string, data: Record<string, unknown>) => void;
  getPersonalizedGreeting: () => string;
  getRecommendedActions: () => { label: string; link: string; icon: string }[];
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem('ez_visitor_id');
  if (!visitorId) {
    visitorId = `v_${crypto.randomUUID()}`;
    localStorage.setItem('ez_visitor_id', visitorId);
  }
  return visitorId;
}

function loadFromStorage(): Partial<UserPreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(prefs: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* quota exceeded - ignore */ }
}

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    visitorId: '',
    lastVisit: null,
    visitCount: 1,
    preferredLanguage: 'en',
    lastCaseType: null,
    lastPage: null,
    intakeProgress: {},
    isReturningVisitor: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializePreferences();
    }
  }, []);

  const initializePreferences = () => {
    const visitorId = getOrCreateVisitorId();
    const stored = loadFromStorage();

    const isReturning = (stored.visitCount ?? 0) > 0 ||
      (stored.lastVisit != null && new Date(stored.lastVisit).getTime() < Date.now() - 60000);

    const updated: UserPreferences = {
      visitorId,
      lastVisit: new Date().toISOString(),
      visitCount: (stored.visitCount ?? 0) + 1,
      preferredLanguage: stored.preferredLanguage ?? 'en',
      lastCaseType: stored.lastCaseType ?? null,
      lastPage: stored.lastPage ?? null,
      intakeProgress: stored.intakeProgress ?? {},
      isReturningVisitor: isReturning
    };

    setPreferences(updated);
    saveToStorage(updated);
    setIsLoading(false);
  };

  const updatePreference = useCallback((key: keyof UserPreferences, value: unknown) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value };
      saveToStorage(next);
      return next;
    });
  }, []);

  const trackPageVisit = useCallback((page: string) => {
    setPreferences(prev => {
      const next = { ...prev, lastPage: page };
      saveToStorage(next);
      return next;
    });
  }, []);

  const trackCaseType = useCallback((caseType: string) => {
    setPreferences(prev => {
      const next = { ...prev, lastCaseType: caseType };
      saveToStorage(next);
      return next;
    });
  }, []);

  const saveIntakeProgress = useCallback((formId: string, data: Record<string, unknown>) => {
    setPreferences(prev => {
      const newProgress = {
        ...prev.intakeProgress,
        [formId]: {
          data,
          savedAt: new Date().toISOString()
        }
      };
      const next = { ...prev, intakeProgress: newProgress };
      saveToStorage(next);
      return next;
    });
  }, []);

  const getPersonalizedGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    if (preferences.isReturningVisitor) {
      if (preferences.lastCaseType) {
        const caseTypeLabels: Record<string, string> = {
          housing: 'housing',
          employment: 'employment',
          family: 'family law',
          injury: 'personal injury',
          debt: 'debt',
          criminal: 'criminal',
          contract: 'contract'
        };
        const label = caseTypeLabels[preferences.lastCaseType] || preferences.lastCaseType;
        return `${timeGreeting}! Welcome back. Ready to continue with your ${label} question?`;
      }
      return `${timeGreeting}! Welcome back to ezLegal.ai.`;
    }

    return `${timeGreeting}! Get instant legal information from AI + find attorneys when you need them.`;
  }, [preferences.isReturningVisitor, preferences.lastCaseType]);

  const getRecommendedActions = useCallback((): { label: string; link: string; icon: string }[] => {
    const actions: { label: string; link: string; icon: string }[] = [];

    if (preferences.isReturningVisitor && preferences.lastCaseType) {
      const actionMap: Record<string, { label: string; link: string; icon: string }> = {
        housing: { label: 'Continue Housing Question', link: '/chatbot?topic=housing', icon: 'home' },
        employment: { label: 'Continue Employment Question', link: '/chatbot?topic=employment', icon: 'briefcase' },
        family: { label: 'Continue Family Law Question', link: '/chatbot?topic=family', icon: 'users' },
        injury: { label: 'Continue Injury Claim', link: '/chatbot?topic=injury', icon: 'activity' },
        debt: { label: 'Continue Debt Question', link: '/chatbot?topic=debt', icon: 'dollar-sign' },
        contracts: { label: 'Continue Contract Question', link: '/chatbot?topic=contracts', icon: 'file-text' }
      };

      if (actionMap[preferences.lastCaseType]) {
        actions.push(actionMap[preferences.lastCaseType]);
      }
    }

    const hasIntakeProgress = Object.keys(preferences.intakeProgress).length > 0;
    if (hasIntakeProgress) {
      actions.push({
        label: 'Resume Application',
        link: '/pro-bono',
        icon: 'clipboard'
      });
    }

    if (actions.length === 0) {
      actions.push(
        { label: 'Start Free Chat', link: '/', icon: 'message-circle' },
        { label: 'View Pricing', link: '/pricing', icon: 'tag' }
      );
    }

    return actions.slice(0, 3);
  }, [preferences.isReturningVisitor, preferences.lastCaseType, preferences.intakeProgress]);

  return (
    <PersonalizationContext.Provider value={{
      preferences,
      isLoading,
      updatePreference,
      trackPageVisit,
      trackCaseType,
      saveIntakeProgress,
      getPersonalizedGreeting,
      getRecommendedActions
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}
