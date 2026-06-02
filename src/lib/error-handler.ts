import { supabase } from './supabase';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'fatal';
export type ErrorCategory = 'network' | 'api' | 'validation' | 'render' | 'unknown';

export interface ClassifiedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string | null;
  userMessage: { en: string; es: string };
  originalMessage: string;
  retryable: boolean;
}

const SESSION_KEY = (() => {
  if (typeof window === 'undefined') return null;
  const existing = sessionStorage.getItem('ezlegal.error.session');
  if (existing) return existing;
  const fresh =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  sessionStorage.setItem('ezlegal.error.session', fresh);
  return fresh;
})();

const OFFLINE_QUEUE_KEY = 'ezlegal.error.queue';

function loadQueue(): unknown[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveQueue(q: unknown[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q.slice(-50)));
  } catch {
    /* storage full */
  }
}

export function classifyError(err: unknown): ClassifiedError {
  if (err instanceof TypeError && /fetch|network|failed to fetch/i.test(err.message)) {
    return {
      category: 'network',
      severity: 'warning',
      code: null,
      userMessage: {
        en: "We can't reach the internet right now. Check your connection and try again.",
        es: 'No podemos conectarnos ahora. Revisa tu conexion e intenta de nuevo.',
      },
      originalMessage: err.message,
      retryable: true,
    };
  }

  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = Number((err as { status: number }).status);
    if (status >= 500) {
      return {
        category: 'api',
        severity: 'error',
        code: String(status),
        userMessage: {
          en: 'Our servers hit a snag. We logged it and the team is notified. Please try again in a moment.',
          es: 'Nuestros servidores tuvieron un problema. Lo registramos. Intenta de nuevo en un momento.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: true,
      };
    }
    if (status === 401 || status === 403) {
      return {
        category: 'api',
        severity: 'warning',
        code: String(status),
        userMessage: {
          en: "You'll need to sign in again to continue.",
          es: 'Necesitas iniciar sesion de nuevo para continuar.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: false,
      };
    }
    if (status === 404) {
      return {
        category: 'api',
        severity: 'info',
        code: '404',
        userMessage: {
          en: "We couldn't find what you were looking for.",
          es: 'No pudimos encontrar lo que buscabas.',
        },
        originalMessage: 'HTTP 404',
        retryable: false,
      };
    }
    if (status === 429) {
      return {
        category: 'api',
        severity: 'warning',
        code: '429',
        userMessage: {
          en: 'Too many requests at once. Please wait a few seconds and try again.',
          es: 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.',
        },
        originalMessage: 'HTTP 429',
        retryable: true,
      };
    }
    if (status >= 400) {
      return {
        category: 'validation',
        severity: 'warning',
        code: String(status),
        userMessage: {
          en: 'Please review the information and try again.',
          es: 'Revisa la información e intenta de nuevo.',
        },
        originalMessage: `HTTP ${status}`,
        retryable: false,
      };
    }
  }

  const msg = err instanceof Error ? err.message : String(err ?? '');
  return {
    category: 'unknown',
    severity: 'error',
    code: null,
    userMessage: {
      en: 'Something went wrong on our end. Please try again in a moment.',
      es: 'Algo salio mal. Intenta de nuevo en un momento.',
    },
    originalMessage: msg || 'Unknown error',
    retryable: true,
  };
}

export interface LogErrorOptions {
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  context?: Record<string, unknown>;
}

export async function logError(err: unknown, options: LogErrorOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;
  const classified = classifyError(err);
  const stack = err instanceof Error ? err.stack ?? null : null;

  const { data: auth } = await supabase.auth.getUser().catch(() => ({ data: { user: null } } as const));
  const userId = auth?.user?.id ?? null;

  const row = {
    user_id: userId,
    session_key: SESSION_KEY,
    severity: options.severity ?? classified.severity,
    category: options.category ?? classified.category,
    code: classified.code,
    message: classified.originalMessage.slice(0, 2000),
    stack: stack?.slice(0, 4000) ?? null,
    url: window.location.href,
    user_agent: navigator.userAgent.slice(0, 512),
    context: options.context ?? {},
  };

  if (!navigator.onLine) {
    const queue = loadQueue();
    queue.push(row);
    saveQueue(queue);
    return;
  }

  try {
    await supabase.from('client_error_logs').insert(row);
  } catch {
    const queue = loadQueue();
    queue.push(row);
    saveQueue(queue);
  }
}

export async function flushErrorQueue(): Promise<void> {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  const queue = loadQueue();
  if (!queue.length) return;
  try {
    await supabase.from('client_error_logs').insert(queue);
    saveQueue([]);
  } catch {
    /* leave queued for next attempt */
  }
}

export function friendlyMessage(err: unknown, locale: 'en' | 'es' = 'en'): string {
  return classifyError(err).userMessage[locale];
}

export interface SafeFetchOptions extends RequestInit {
  retries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export async function safeFetch(url: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { retries = 2, retryDelayMs = 600, timeoutMs = 20000, ...init } = options;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: init.signal ?? controller.signal });
      clearTimeout(timer);
      if (res.status >= 500 && attempt < retries) {
        lastError = { status: res.status };
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
        continue;
      }
      if (!res.ok) {
        const err = { status: res.status, statusText: res.statusText };
        void logError(err, { category: 'api', context: { url } });
        throw err;
      }
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < retries && classifyError(err).retryable) {
        await new Promise((r) => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
        continue;
      }
      void logError(err, { category: 'network', context: { url, attempt } });
      throw err;
    }
  }
  throw lastError ?? new Error('safeFetch failed');
}

export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (event) => {
    void logError(event.error ?? new Error(event.message), {
      category: 'render',
      severity: 'error',
      context: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    void logError(event.reason, { category: 'render', severity: 'error', context: { unhandled: true } });
  });
  window.addEventListener('online', () => {
    void flushErrorQueue();
  });
  void flushErrorQueue();
}
