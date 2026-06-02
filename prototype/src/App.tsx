import { useEffect, useMemo, useState } from "react";

type Lang = "es" | "en";
type Persona = "individual" | "smb" | "org";
type IssueType =
  | "housing"
  | "immigration"
  | "family"
  | "debt"
  | "employment"
  | "benefits"
  | "smallBusiness"
  | "other";
type Urgency = "today" | "week" | "month" | "none";
type Route = "home" | "intake" | "partners" | "admin";
type StepKey = "persona" | "issue" | "location" | "facts" | "consent" | "plan";
type FontScale = "normal" | "large";

type Localized = Record<Lang, string>;

type ChoiceOption<T extends string> = {
  value: T;
  icon: string;
  label: Localized;
  desc: Localized;
};

type IntakeForm = {
  persona: Persona | "";
  preferredLanguage: Lang;
  issueType: IssueType | "";
  state: string;
  county: string;
  zip: string;
  urgency: Urgency | "";
  incomeBand: string;
  householdSize: string;
  businessSize: string;
  orgType: string;
  story: string;
  goal: string;
  contact: string;
  consent: boolean;
  shareWithPartner: boolean;
};

type Plan = {
  risk: "low" | "medium" | "high";
  title: string;
  summary: string;
  actions: string[];
  documents: string[];
  questionsForHuman: string[];
  referrals: Array<{ title: string; desc: string; cta: string }>;
  sourceChecklist: string[];
  ethicsDisclosure: string;
  cta: string;
};

type AnalyticsEvent = {
  id: string;
  name: string;
  createdAt: string;
  payload?: Record<string, unknown>;
};

type TrackFn = (name: string, payload?: Record<string, unknown>) => void;

const STORAGE = {
  form: "a2j-intake-form",
  events: "a2j-events",
  lang: "a2j-lang",
  font: "a2j-font",
  governance: "a2j-governance"
};

const initialForm: IntakeForm = {
  persona: "",
  preferredLanguage: "es",
  issueType: "",
  state: "",
  county: "",
  zip: "",
  urgency: "",
  incomeBand: "",
  householdSize: "",
  businessSize: "",
  orgType: "",
  story: "",
  goal: "",
  contact: "",
  consent: false,
  shareWithPartner: false
};

const I18N: Record<Lang, Record<string, string>> = {
  es: {
    appName: "Justicia Access AI",
    home: "Inicio",
    intake: "Evaluacion",
    partners: "Alianzas",
    admin: "Gobernanza",
    start: "Empezar gratis",
    continue: "Continuar",
    back: "Atras",
    restart: "Reiniciar",
    language: "Idioma",
    largerText: "Texto grande",
    normalText: "Texto normal",
    heroTitle: "Ayuda legal mas clara, en espanol primero.",
    heroSubtitle:
      "Un flujo guiado para identificar el problema, reducir estres, preparar proximos pasos y conectar a personas, pequenas empresas y organizaciones con apoyo humano.",
    notAdvice:
      "Informacion legal general. No sustituye a un abogado ni crea una relacion abogado-cliente.",
    privacy:
      "Privacidad: este prototipo guarda datos solo en este navegador. No envia informacion a un proveedor de IA.",
    urgent:
      "Si hay peligro inmediato, una orden judicial, desalojo inminente o plazo de horas, busque ayuda humana urgente.",
    validationRequired: "Complete los campos requeridos antes de continuar.",
    stepPersona: "Para quien es la ayuda?",
    stepIssue: "Que tipo de problema tiene?",
    stepLocation: "Donde ocurre y que tan urgente es?",
    stepFacts: "Cuentenos lo esencial.",
    stepConsent: "Consentimiento y privacidad",
    stepPlan: "Plan de proximos pasos",
    conversionThanks:
      "CTA registrado. En produccion, esto abriria una agenda, derivacion segura o formulario del socio.",
    adminGap:
      "Brecha verificada: este prototipo no contiene fuentes legales jurisdiccionales verificadas ni certificacion de proveedor IA. Deben anadirse antes de afirmar cobertura legal o abastecimiento etico.",
    partnerWarning:
      "Todo modelo de reparto de ingresos, referencia o tarifa debe revisarse por cumplimiento de UPL, reglas de honorarios, privacidad y normas estatales/locales."
  },
  en: {
    appName: "Justicia Access AI",
    home: "Home",
    intake: "Assessment",
    partners: "Partnerships",
    admin: "Governance",
    start: "Start free",
    continue: "Continue",
    back: "Back",
    restart: "Restart",
    language: "Language",
    largerText: "Large text",
    normalText: "Normal text",
    heroTitle: "Clearer legal help, Spanish-first.",
    heroSubtitle:
      "A guided flow to identify the issue, reduce stress, prepare next steps, and connect individuals, small businesses, and organizations with human support.",
    notAdvice:
      "General legal information only. This does not replace a lawyer or create an attorney-client relationship.",
    privacy:
      "Privacy: this prototype stores data only in this browser. It does not send information to an AI provider.",
    urgent:
      "If there is immediate danger, a court order, imminent eviction, or a deadline within hours, seek urgent human help.",
    validationRequired: "Complete required fields before continuing.",
    stepPersona: "Who needs help?",
    stepIssue: "What kind of problem is this?",
    stepLocation: "Where is this happening and how urgent is it?",
    stepFacts: "Tell us the essentials.",
    stepConsent: "Consent and privacy",
    stepPlan: "Next-step plan",
    conversionThanks:
      "CTA recorded. In production, this would open scheduling, secure referral, or a partner form.",
    adminGap:
      "Verified gap: this prototype does not contain jurisdiction-specific verified legal sources or AI vendor certification. Add those before claiming legal coverage or ethical sourcing.",
    partnerWarning:
      "Every revenue-share, referral, or fee model must be reviewed for UPL, fee-sharing, privacy, and state/local professional rules."
  }
};

const personaOptions: ChoiceOption<Persona>[] = [
  {
    value: "individual",
    icon: "\u{1F9ED}",
    label: { es: "Persona / familia", en: "Individual / family" },
    desc: {
      es: "Para personas que prefieren espanol y necesitan opciones gratuitas o de bajo costo.",
      en: "For people who prefer Spanish and need free or low-cost options."
    }
  },
  {
    value: "smb",
    icon: "\u{1F3EA}",
    label: { es: "Pequena empresa", en: "Small business" },
    desc: {
      es: "Para duenos de negocios que necesitan entender riesgos, documentos y opciones.",
      en: "For business owners who need to understand risks, documents, and options."
    }
  },
  {
    value: "org",
    icon: "\u{1F91D}",
    label: { es: "Organizacion legal / pro bono", en: "Legal aid / pro bono org" },
    desc: {
      es: "Para equipos que desean clasificar casos, medir demanda y derivar con seguridad.",
      en: "For teams that want to triage cases, measure demand, and refer safely."
    }
  }
];

const issueOptions: ChoiceOption<IssueType>[] = [
  {
    value: "housing",
    icon: "\u{1F3E0}",
    label: { es: "Vivienda / desalojo", en: "Housing / eviction" },
    desc: {
      es: "Renta, avisos, reparaciones, depositos, amenazas de desalojo.",
      en: "Rent, notices, repairs, deposits, eviction threats."
    }
  },
  {
    value: "immigration",
    icon: "\u{1F6C2}",
    label: { es: "Inmigracion", en: "Immigration" },
    desc: {
      es: "Citas, formularios, plazos, documentos o miedo a consecuencias migratorias.",
      en: "Appointments, forms, deadlines, documents, or immigration consequences."
    }
  },
  {
    value: "family",
    icon: "\u{1F46A}",
    label: { es: "Familia / seguridad", en: "Family / safety" },
    desc: {
      es: "Custodia, manutencion, violencia, ordenes de proteccion.",
      en: "Custody, support, violence, protective orders."
    }
  },
  {
    value: "debt",
    icon: "\u{1F4B3}",
    label: { es: "Deuda / cobros", en: "Debt / collections" },
    desc: {
      es: "Demandas, llamadas de cobro, embargos, credito.",
      en: "Lawsuits, collection calls, garnishment, credit."
    }
  },
  {
    value: "employment",
    icon: "\u{1F9F0}",
    label: { es: "Trabajo", en: "Employment" },
    desc: {
      es: "Salarios, despido, discriminacion, licencias, seguridad laboral.",
      en: "Wages, firing, discrimination, leave, workplace safety."
    }
  },
  {
    value: "benefits",
    icon: "\u{1F3E5}",
    label: { es: "Beneficios publicos", en: "Public benefits" },
    desc: {
      es: "Medicaid, SNAP, desempleo, discapacidad, cartas de negacion.",
      en: "Medicaid, SNAP, unemployment, disability, denial letters."
    }
  },
  {
    value: "smallBusiness",
    icon: "\u{1F4C4}",
    label: { es: "Contrato / negocio", en: "Contract / business" },
    desc: {
      es: "Contratos, clientes, proveedores, arrendamientos comerciales.",
      en: "Contracts, customers, vendors, commercial leases."
    }
  },
  {
    value: "other",
    icon: "\u{2753}",
    label: { es: "No estoy seguro", en: "Not sure" },
    desc: {
      es: "Use esta opcion si no sabe como clasificar el problema.",
      en: "Use this if you are not sure how to classify the issue."
    }
  }
];

const stepKeys: StepKey[] = ["persona", "issue", "location", "facts", "consent", "plan"];

const stepLabels: Record<StepKey, Localized> = {
  persona: { es: "Perfil", en: "Profile" },
  issue: { es: "Tema", en: "Issue" },
  location: { es: "Lugar", en: "Location" },
  facts: { es: "Hechos", en: "Facts" },
  consent: { es: "Privacidad", en: "Privacy" },
  plan: { es: "Plan", en: "Plan" }
};

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function getIssueLabel(value: IssueType | "", lang: Lang): string {
  return issueOptions.find((item) => item.value === value)?.label[lang] ?? "";
}

function generatePlan(form: IntakeForm, lang: Lang): Plan {
  const issue = (form.issueType || "other") as IssueType;
  const immediate = form.urgency === "today";
  const sensitiveIssue = issue === "immigration" || issue === "family";
  const risk: Plan["risk"] = immediate ? "high" : sensitiveIssue || form.persona === "smb" ? "medium" : "low";

  const issueName = getIssueLabel(issue, lang);

  const baseActions =
    lang === "es"
      ? [
          "Guarde copias de avisos, cartas, mensajes, contratos y fechas importantes.",
          "Escriba una linea de tiempo corta: que paso, cuando paso y quien estuvo involucrado.",
          "No firme documentos que no entienda. Pida tiempo para revisarlos con ayuda humana.",
          "Revise si existe un plazo. Si no esta seguro, trate el asunto como urgente."
        ]
      : [
          "Save copies of notices, letters, messages, contracts, and important dates.",
          "Write a short timeline: what happened, when it happened, and who was involved.",
          "Do not sign documents you do not understand. Ask for time to review them with human help.",
          "Check whether a deadline exists. If unsure, treat the matter as urgent."
        ];

  const docsByIssue: Record<IssueType, Localized[]> = {
    housing: [
      { es: "Contrato de renta o lease", en: "Lease or rental agreement" },
      { es: "Aviso de desalojo, aumento de renta o reparacion", en: "Eviction, rent increase, or repair notice" },
      { es: "Recibos de pago y fotos de condiciones", en: "Payment receipts and photos of conditions" }
    ],
    immigration: [
      { es: "Cualquier aviso oficial o cita", en: "Any official notice or appointment letter" },
      { es: "Identificacion y documentos migratorios", en: "Identification and immigration documents" },
      { es: "Pruebas de fechas de entrada, salida o presentacion", en: "Proof of entry, exit, or filing dates" }
    ],
    family: [
      { es: "Ordenes judiciales existentes", en: "Existing court orders" },
      { es: "Mensajes, reportes o evidencia de seguridad", en: "Messages, reports, or safety evidence" },
      { es: "Informacion de hijos, ingresos y horarios", en: "Child, income, and schedule information" }
    ],
    debt: [
      { es: "Demanda, carta de cobro o estado de cuenta", en: "Lawsuit, collection letter, or account statement" },
      { es: "Pruebas de pago o disputa", en: "Proof of payment or dispute" },
      { es: "Fechas de llamadas y nombres de cobradores", en: "Call dates and collector names" }
    ],
    employment: [
      { es: "Talones de pago y horario trabajado", en: "Pay stubs and hours worked" },
      { es: "Contrato, manual o mensajes del empleador", en: "Contract, handbook, or employer messages" },
      { es: "Fechas de despido, reduccion o incidente", en: "Dates of firing, reduction, or incident" }
    ],
    benefits: [
      { es: "Carta de aprobacion, reduccion o negacion", en: "Approval, reduction, or denial letter" },
      { es: "Ingresos, gastos y tamano del hogar", en: "Income, expenses, and household size" },
      { es: "Fecha limite de apelacion", en: "Appeal deadline" }
    ],
    smallBusiness: [
      { es: "Contrato, factura u orden de compra", en: "Contract, invoice, or purchase order" },
      { es: "Mensajes con cliente, proveedor o arrendador", en: "Messages with customer, vendor, or landlord" },
      { es: "Datos de entidad, seguro y pagos", en: "Entity, insurance, and payment records" }
    ],
    other: [
      { es: "Cualquier documento o aviso relacionado", en: "Any related document or notice" },
      { es: "Nombres de personas u organizaciones involucradas", en: "Names of people or organizations involved" },
      { es: "Fechas y resultados deseados", en: "Dates and desired outcomes" }
    ]
  };

  const referralsByPersona: Record<Persona, Plan["referrals"]> = {
    individual:
      lang === "es"
        ? [
            {
              title: "Evaluacion de elegibilidad",
              desc: "Ruta gratuita o de bajo costo basada en ingresos, idioma, lugar y urgencia.",
              cta: "Buscar ayuda legal gratuita"
            },
            {
              title: "Preparar una llamada",
              desc: "Resumen descargable para explicar el problema a una organizacion o abogado.",
              cta: "Preparar resumen"
            }
          ]
        : [
            {
              title: "Eligibility screen",
              desc: "Free or low-cost path based on income, language, location, and urgency.",
              cta: "Find free legal help"
            },
            {
              title: "Prepare for a call",
              desc: "Downloadable summary for explaining the issue to an organization or lawyer.",
              cta: "Prepare summary"
            }
          ],
    smb:
      lang === "es"
        ? [
            {
              title: "Consulta de tarifa fija",
              desc: "Opcion comercial para revisar documentos, riesgos y proximos pasos.",
              cta: "Solicitar consulta"
            },
            {
              title: "Checklist de cumplimiento",
              desc: "Preparar documentos antes de hablar con un abogado o asesor.",
              cta: "Ver checklist"
            }
          ]
        : [
            {
              title: "Fixed-fee consult",
              desc: "Commercial option to review documents, risks, and next steps.",
              cta: "Request consult"
            },
            {
              title: "Compliance checklist",
              desc: "Prepare documents before speaking with a lawyer or advisor.",
              cta: "View checklist"
            }
          ],
    org:
      lang === "es"
        ? [
            {
              title: "Piloto de triage",
              desc: "Flujo configurable para clasificar demanda, idioma, riesgo y derivaciones.",
              cta: "Solicitar piloto"
            },
            {
              title: "Panel de datos",
              desc: "Metricas agregadas para capacidad, tiempos de respuesta y brechas.",
              cta: "Ver panel"
            }
          ]
        : [
            {
              title: "Triage pilot",
              desc: "Configurable flow for demand, language, risk, and referrals.",
              cta: "Request pilot"
            },
            {
              title: "Data dashboard",
              desc: "Aggregated metrics for capacity, response times, and gaps.",
              cta: "View dashboard"
            }
          ]
  };

  const persona = form.persona || "individual";

  return {
    risk,
    title:
      lang === "es"
        ? `Plan preliminar: ${issueName || "problema legal"}`
        : `Preliminary plan: ${issueName || "legal issue"}`,
    summary:
      lang === "es"
        ? `Este resumen usa reglas de triage y la informacion que usted proporciono. No verifica leyes locales ni reemplaza ayuda humana. Nivel de riesgo estimado: ${risk}.`
        : `This summary uses triage rules and the information you provided. It does not verify local law or replace human help. Estimated risk level: ${risk}.`,
    actions:
      risk === "high"
        ? [
            lang === "es"
              ? "Busque ayuda humana hoy. Si hay peligro fisico, contacte servicios de emergencia o una organizacion local de crisis."
              : "Seek human help today. If there is physical danger, contact emergency services or a local crisis organization.",
            ...baseActions
          ]
        : baseActions,
    documents: docsByIssue[issue].map((doc) => doc[lang]),
    questionsForHuman:
      lang === "es"
        ? [
            "Que plazo aplica en mi condado o estado?",
            "Existe un formulario oficial o proceso local?",
            "Que riesgos tendria esperar?",
            "Que informacion falta para evaluar mi caso?"
          ]
        : [
            "What deadline applies in my county or state?",
            "Is there an official form or local process?",
            "What risks would come from waiting?",
            "What information is missing to evaluate my situation?"
          ],
    referrals: referralsByPersona[persona],
    sourceChecklist:
      lang === "es"
        ? [
            "Agregar fuentes legales oficiales por jurisdiccion antes de produccion.",
            "Agregar revision por abogados o representantes acreditados cuando aplique.",
            "Registrar fecha de revision, idioma, lectura y limitaciones de cada fuente.",
            "Bloquear respuestas que inventen plazos, derechos o formularios."
          ]
        : [
            "Add official jurisdiction-specific legal sources before production.",
            "Add review by lawyers or accredited representatives where applicable.",
            "Record review date, language, reading level, and limitations for each source.",
            "Block answers that invent deadlines, rights, or forms."
          ],
    ethicsDisclosure:
      lang === "es"
        ? "IA en este prototipo: generador deterministico de informacion general. No hay proveedor externo conectado. Antes de usar un LLM real, use proxy del servidor, consentimiento explicito, minimizacion de datos, registros de auditoria y evaluacion de sesgo."
        : "AI in this prototype: deterministic general-information generator. No external provider is connected. Before using a real LLM, use a server proxy, explicit consent, data minimization, audit logs, and bias evaluation.",
    cta:
      persona === "individual"
        ? lang === "es"
          ? "Conectarme con ayuda gratuita o de bajo costo"
          : "Connect me with free or low-cost help"
        : persona === "smb"
          ? lang === "es"
            ? "Agendar revision de bajo costo"
            : "Schedule low-cost review"
          : lang === "es"
            ? "Solicitar piloto para organizacion"
            : "Request organization pilot"
  };
}

function validateStep(step: StepKey, form: IntakeForm, lang: Lang): string[] {
  const errors: string[] = [];
  const req = lang === "es" ? "Requerido" : "Required";

  if (step === "persona" && !form.persona) errors.push(`${req}: ${lang === "es" ? "perfil" : "profile"}.`);
  if (step === "issue" && !form.issueType) errors.push(`${req}: ${lang === "es" ? "tipo de problema" : "issue type"}.`);
  if (step === "location") {
    if (!form.state.trim()) errors.push(`${req}: ${lang === "es" ? "estado" : "state"}.`);
    if (!form.urgency) errors.push(`${req}: ${lang === "es" ? "urgencia" : "urgency"}.`);
  }
  if (step === "facts") {
    if (form.story.trim().length < 24) {
      errors.push(lang === "es" ? "Describa el problema en al menos una oracion." : "Describe the issue in at least one sentence.");
    }
    if (!form.goal.trim()) errors.push(`${req}: ${lang === "es" ? "resultado deseado" : "desired outcome"}.`);
  }
  if (step === "consent" && !form.consent) {
    errors.push(
      lang === "es"
        ? "Debe aceptar el uso de la informacion para generar este plan."
        : "You must consent to use the information to generate this plan."
    );
  }

  return errors;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => loadJSON<Lang>(STORAGE.lang, "es"));
  const [fontScale, setFontScale] = useState<FontScale>(() => loadJSON<FontScale>(STORAGE.font, "normal"));
  const [route, setRoute] = useState<Route>("home");
  const [form, setForm] = useState<IntakeForm>(() =>
    loadJSON<IntakeForm>(STORAGE.form, { ...initialForm, preferredLanguage: lang })
  );
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => loadJSON<AnalyticsEvent[]>(STORAGE.events, []));

  const t = I18N[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.dataset.font = fontScale;
    localStorage.setItem(STORAGE.lang, JSON.stringify(lang));
    localStorage.setItem(STORAGE.font, JSON.stringify(fontScale));
  }, [lang, fontScale]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, preferredLanguage: lang }));
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE.form, JSON.stringify(form));
  }, [form]);

  const track: TrackFn = (name, payload = {}) => {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      payload
    };

    setEvents((prev) => {
      const next = [...prev, event].slice(-250);
      localStorage.setItem(STORAGE.events, JSON.stringify(next));
      return next;
    });
  };

  const startForPersona = (persona?: Persona) => {
    if (persona) {
      setForm((prev) => ({ ...prev, persona }));
      track("intake_started", { persona, source: "home_card" });
    } else {
      track("intake_started", { source: "primary_cta" });
    }
    setRoute("intake");
  };

  const resetData = () => {
    localStorage.removeItem(STORAGE.form);
    localStorage.removeItem(STORAGE.events);
    setForm({ ...initialForm, preferredLanguage: lang });
    setEvents([]);
    track("local_data_reset", {});
  };

  return (
    <div className="app-shell">
      <Header
        lang={lang}
        route={route}
        fontScale={fontScale}
        setLang={setLang}
        setRoute={setRoute}
        setFontScale={setFontScale}
      />

      <main id="main">
        {route === "home" && <Home lang={lang} onStart={startForPersona} onRoute={setRoute} />}
        {route === "intake" && (
          <IntakeWizard lang={lang} form={form} setForm={setForm} track={track} />
        )}
        {route === "partners" && <PartnersPage lang={lang} track={track} />}
        {route === "admin" && <AdminPage lang={lang} events={events} resetData={resetData} />}
      </main>

      <footer className="footer">
        <p>{t.notAdvice}</p>
        <p>{t.privacy}</p>
      </footer>
    </div>
  );
}

function Header(props: {
  lang: Lang;
  route: Route;
  fontScale: FontScale;
  setLang: (lang: Lang) => void;
  setRoute: (route: Route) => void;
  setFontScale: (font: FontScale) => void;
}) {
  const { lang, route, fontScale, setLang, setRoute, setFontScale } = props;
  const t = I18N[lang];

  const nav: Array<{ route: Route; label: string }> = [
    { route: "home", label: t.home },
    { route: "intake", label: t.intake },
    { route: "partners", label: t.partners },
    { route: "admin", label: t.admin }
  ];

  return (
    <header className="topbar">
      <div className="brand" aria-label={t.appName}>
        <span className="brand-mark">{"\u2696\uFE0F"}</span>
        <span>{t.appName}</span>
      </div>

      <nav className="nav" aria-label="Primary navigation">
        {nav.map((item) => (
          <button
            key={item.route}
            className={`nav-btn ${route === item.route ? "active" : ""}`}
            onClick={() => setRoute(item.route)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="top-actions">
        <div className="segmented" aria-label={t.language}>
          <button className={lang === "es" ? "active" : ""} onClick={() => setLang("es")} type="button">
            ES
          </button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} type="button">
            EN
          </button>
        </div>
        <button
          className="btn ghost small"
          type="button"
          onClick={() => setFontScale(fontScale === "normal" ? "large" : "normal")}
        >
          {fontScale === "normal" ? t.largerText : t.normalText}
        </button>
      </div>
    </header>
  );
}

function Home({ lang, onStart, onRoute }: { lang: Lang; onStart: (persona?: Persona) => void; onRoute: (route: Route) => void }) {
  const t = I18N[lang];

  return (
    <section className="page">
      <div className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{lang === "es" ? "Acceso a justicia + triage responsable" : "Access to justice + responsible triage"}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>

          <div className="hero-actions">
            <button className="btn primary" type="button" onClick={() => onStart()}>
              {t.start}
            </button>
            <button className="btn secondary" type="button" onClick={() => onRoute("partners")}>
              {lang === "es" ? "Ver modelos de alianza" : "View partnership models"}
            </button>
          </div>

          <div className="trust-row" aria-label="Trust indicators">
            <span>{"\u{1F30E}"} {lang === "es" ? "Espanol primero" : "Spanish-first"}</span>
            <span>{"\u{1F9E9}"} {lang === "es" ? "Paso a paso" : "Step-by-step"}</span>
            <span>{"\u{1F6E1}\uFE0F"} {lang === "es" ? "Consentimiento antes de IA" : "Consent before AI"}</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="Prototype limitations">
          <h2>{lang === "es" ? "Lo que este prototipo si hace" : "What this prototype does"}</h2>
          <ul className="clean-list">
            <li>{lang === "es" ? "Reduce carga cognitiva con una pregunta por pantalla." : "Reduces cognitive load with one question per screen."}</li>
            <li>{lang === "es" ? "Distingue individuos, SMBs y organizaciones." : "Separates individuals, SMBs, and organizations."}</li>
            <li>{lang === "es" ? "Muestra brechas antes de afirmar IA etica." : "Shows gaps before claiming ethical AI."}</li>
            <li>{lang === "es" ? "Instrumenta eventos de conversion." : "Tracks conversion events."}</li>
          </ul>
        </aside>
      </div>

      <div className="section-heading">
        <p className="eyebrow">{lang === "es" ? "Rutas por ICP" : "ICP paths"}</p>
        <h2>{lang === "es" ? "Elija la ruta mas cercana" : "Choose the closest path"}</h2>
      </div>

      <div className="grid three">
        {personaOptions.map((item) => (
          <button className="persona-card" key={item.value} type="button" onClick={() => onStart(item.value)}>
            <span className="option-icon">{item.icon}</span>
            <strong>{item.label[lang]}</strong>
            <span>{item.desc[lang]}</span>
          </button>
        ))}
      </div>

      <div className="grid three">
        <FeatureCard
          icon={"\u{1F9E0}"}
          title={lang === "es" ? "Menos carga mental" : "Lower cognitive load"}
          body={
            lang === "es"
              ? "Preguntas cortas, progreso visible, lenguaje simple, ayuda contextual y opcion de texto grande."
              : "Short questions, visible progress, plain language, contextual help, and large-text mode."
          }
        />
        <FeatureCard
          icon={"\u{1F4C8}"}
          title={lang === "es" ? "Conversion mas clara" : "Clearer conversion"}
          body={
            lang === "es"
              ? "CTAs por segmento, captura opcional, indicadores de confianza y analitica de embudo."
              : "Segmented CTAs, optional capture, trust indicators, and funnel analytics."
          }
        />
        <FeatureCard
          icon={"\u{1F9FE}"}
          title={lang === "es" ? "A2J y etica" : "A2J and ethics"}
          body={
            lang === "es"
              ? "No afirma cobertura legal sin fuentes verificadas, revision humana y controles de sesgo."
              : "Does not claim legal coverage without verified sources, human review, and bias controls."
          }
        />
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <article className="card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function IntakeWizard({
  lang,
  form,
  setForm,
  track
}: {
  lang: Lang;
  form: IntakeForm;
  setForm: React.Dispatch<React.SetStateAction<IntakeForm>>;
  track: TrackFn;
}) {
  const t = I18N[lang];
  const [step, setStep] = useState<StepKey>(form.persona ? "issue" : "persona");
  const [errors, setErrors] = useState<string[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [notice, setNotice] = useState("");

  const stepIndex = stepKeys.indexOf(step);
  const progress = Math.round(((stepIndex + 1) / stepKeys.length) * 100);

  const update = <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => {
    const nextErrors = validateStep(step, form, lang);
    setErrors(nextErrors);

    if (nextErrors.length) return;

    if (step === "consent") {
      const generated = generatePlan(form, lang);
      setPlan(generated);
      setStep("plan");
      track("plan_generated", {
        persona: form.persona,
        issueType: form.issueType,
        urgency: form.urgency,
        risk: generated.risk
      });
      return;
    }

    const nextStep = stepKeys[stepIndex + 1];
    if (nextStep) {
      setStep(nextStep);
      track("wizard_step_completed", { step, persona: form.persona, issueType: form.issueType });
    }
  };

  const back = () => {
    const prevStep = stepKeys[stepIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const restart = () => {
    setForm({ ...initialForm, preferredLanguage: lang });
    setStep("persona");
    setPlan(null);
    setErrors([]);
    setNotice("");
    track("intake_restarted", {});
  };

  const clickConversion = (label: string) => {
    track("conversion_cta_clicked", {
      label,
      persona: form.persona,
      issueType: form.issueType,
      risk: plan?.risk
    });
    setNotice(t.conversionThanks);
  };

  return (
    <section className="page narrow">
      <div className="wizard-shell">
        <div className="wizard-header">
          <div>
            <p className="eyebrow">{lang === "es" ? "Evaluacion guiada" : "Guided assessment"}</p>
            <h1>{stepTitle(step, lang)}</h1>
            <p>{t.notAdvice}</p>
          </div>
          <div className={`risk-chip ${step === "plan" && plan ? `risk-${plan.risk}` : ""}`}>
            {step === "plan" && plan
              ? `${lang === "es" ? "Riesgo" : "Risk"}: ${plan.risk}`
              : `${progress}%`}
          </div>
        </div>

        <div className="progress" aria-label="Progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <ol className="step-list" aria-label="Steps">
          {stepKeys.map((key) => (
            <li key={key} className={stepKeys.indexOf(key) <= stepIndex ? "done" : ""}>
              {stepLabels[key][lang]}
            </li>
          ))}
        </ol>

        {errors.length > 0 && (
          <div className="alert error" role="alert">
            <strong>{t.validationRequired}</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="step-panel">
          {step === "persona" && <PersonaStep lang={lang} form={form} update={update} />}
          {step === "issue" && <IssueStep lang={lang} form={form} update={update} />}
          {step === "location" && <LocationStep lang={lang} form={form} update={update} />}
          {step === "facts" && <FactsStep lang={lang} form={form} update={update} />}
          {step === "consent" && <ConsentStep lang={lang} form={form} update={update} />}
          {step === "plan" && (
            <PlanStep
              lang={lang}
              plan={plan ?? generatePlan(form, lang)}
              form={form}
              onConversion={clickConversion}
            />
          )}
        </div>

        {notice && (
          <div className="alert success" role="status">
            {notice}
          </div>
        )}

        <div className="wizard-actions">
          <button className="btn ghost" type="button" onClick={restart}>
            {t.restart}
          </button>
          <div className="wizard-actions-right">
            {stepIndex > 0 && step !== "plan" && (
              <button className="btn secondary" type="button" onClick={back}>
                {t.back}
              </button>
            )}
            {step !== "plan" && (
              <button className="btn primary" type="button" onClick={next}>
                {t.continue}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function stepTitle(step: StepKey, lang: Lang): string {
  const t = I18N[lang];
  const map: Record<StepKey, string> = {
    persona: t.stepPersona,
    issue: t.stepIssue,
    location: t.stepLocation,
    facts: t.stepFacts,
    consent: t.stepConsent,
    plan: t.stepPlan
  };
  return map[step];
}

function PersonaStep({
  lang,
  form,
  update
}: {
  lang: Lang;
  form: IntakeForm;
  update: <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => void;
}) {
  return (
    <div className="choice-grid">
      {personaOptions.map((option) => (
        <button
          key={option.value}
          className={`choice-card ${form.persona === option.value ? "selected" : ""}`}
          type="button"
          aria-pressed={form.persona === option.value}
          onClick={() => update("persona", option.value)}
        >
          <span className="option-icon">{option.icon}</span>
          <strong>{option.label[lang]}</strong>
          <span>{option.desc[lang]}</span>
        </button>
      ))}
    </div>
  );
}

function IssueStep({
  lang,
  form,
  update
}: {
  lang: Lang;
  form: IntakeForm;
  update: <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => void;
}) {
  return (
    <>
      <p className="helper">
        {lang === "es"
          ? "Elija la opcion mas cercana. No necesita usar palabras legales."
          : "Choose the closest option. You do not need to use legal terms."}
      </p>
      <div className="choice-grid two">
        {issueOptions.map((option) => (
          <button
            key={option.value}
            className={`choice-card ${form.issueType === option.value ? "selected" : ""}`}
            type="button"
            aria-pressed={form.issueType === option.value}
            onClick={() => update("issueType", option.value)}
          >
            <span className="option-icon">{option.icon}</span>
            <strong>{option.label[lang]}</strong>
            <span>{option.desc[lang]}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function LocationStep({
  lang,
  form,
  update
}: {
  lang: Lang;
  form: IntakeForm;
  update: <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => void;
}) {
  const urgencyOptions: Array<{ value: Urgency; label: Localized; desc: Localized }> = [
    {
      value: "today",
      label: { es: "Hoy / horas", en: "Today / hours" },
      desc: { es: "Audiencia, desalojo, peligro o plazo inmediato.", en: "Hearing, eviction, danger, or immediate deadline." }
    },
    {
      value: "week",
      label: { es: "Esta semana", en: "This week" },
      desc: { es: "Hay aviso, carta o plazo pronto.", en: "There is a notice, letter, or upcoming deadline." }
    },
    {
      value: "month",
      label: { es: "Este mes", en: "This month" },
      desc: { es: "Necesito prepararme, pero no es hoy.", en: "I need to prepare, but not today." }
    },
    {
      value: "none",
      label: { es: "No se", en: "Not sure" },
      desc: { es: "No estoy seguro del plazo.", en: "I am not sure about the deadline." }
    }
  ];

  return (
    <div className="form-stack">
      <div className="alert warning">
        <strong>{lang === "es" ? "Importante" : "Important"}:</strong> {I18N[lang].urgent}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>{lang === "es" ? "Estado *" : "State *"}</span>
          <input
            value={form.state}
            onChange={(event) => update("state", event.target.value)}
            placeholder={lang === "es" ? "Ej. California" : "E.g., California"}
          />
        </label>

        <label className="field">
          <span>{lang === "es" ? "Condado" : "County"}</span>
          <input
            value={form.county}
            onChange={(event) => update("county", event.target.value)}
            placeholder={lang === "es" ? "Opcional" : "Optional"}
          />
        </label>

        <label className="field">
          <span>{lang === "es" ? "Codigo postal" : "ZIP code"}</span>
          <input
            value={form.zip}
            onChange={(event) => update("zip", event.target.value)}
            placeholder={lang === "es" ? "Opcional" : "Optional"}
          />
        </label>

        {form.persona === "individual" && (
          <>
            <label className="field">
              <span>{lang === "es" ? "Ingreso aproximado" : "Approximate income"}</span>
              <select value={form.incomeBand} onChange={(event) => update("incomeBand", event.target.value)}>
                <option value="">{lang === "es" ? "Prefiero no decir" : "Prefer not to say"}</option>
                <option value="veryLow">{lang === "es" ? "Muy bajo / sin ingresos" : "Very low / no income"}</option>
                <option value="low">{lang === "es" ? "Bajo" : "Low"}</option>
                <option value="moderate">{lang === "es" ? "Moderado" : "Moderate"}</option>
              </select>
            </label>

            <label className="field">
              <span>{lang === "es" ? "Tamano del hogar" : "Household size"}</span>
              <input
                value={form.householdSize}
                onChange={(event) => update("householdSize", event.target.value)}
                placeholder="1, 2, 3..."
              />
            </label>
          </>
        )}

        {form.persona === "smb" && (
          <label className="field">
            <span>{lang === "es" ? "Tamano del negocio" : "Business size"}</span>
            <select value={form.businessSize} onChange={(event) => update("businessSize", event.target.value)}>
              <option value="">{lang === "es" ? "Seleccione" : "Select"}</option>
              <option value="solo">{lang === "es" ? "Solo yo" : "Just me"}</option>
              <option value="2-10">2-10</option>
              <option value="11-50">11-50</option>
              <option value="51+">51+</option>
            </select>
          </label>
        )}

        {form.persona === "org" && (
          <label className="field">
            <span>{lang === "es" ? "Tipo de organizacion" : "Organization type"}</span>
            <select value={form.orgType} onChange={(event) => update("orgType", event.target.value)}>
              <option value="">{lang === "es" ? "Seleccione" : "Select"}</option>
              <option value="legalAid">{lang === "es" ? "Legal aid" : "Legal aid"}</option>
              <option value="proBono">{lang === "es" ? "Pro bono" : "Pro bono"}</option>
              <option value="court">{lang === "es" ? "Tribunal / self-help" : "Court / self-help"}</option>
              <option value="community">{lang === "es" ? "Organizacion comunitaria" : "Community organization"}</option>
            </select>
          </label>
        )}
      </div>

      <fieldset className="fieldset">
        <legend>{lang === "es" ? "Urgencia *" : "Urgency *"}</legend>
        <div className="choice-grid two">
          {urgencyOptions.map((option) => (
            <button
              key={option.value}
              className={`choice-card compact ${form.urgency === option.value ? "selected" : ""}`}
              type="button"
              onClick={() => update("urgency", option.value)}
              aria-pressed={form.urgency === option.value}
            >
              <strong>{option.label[lang]}</strong>
              <span>{option.desc[lang]}</span>
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function FactsStep({
  lang,
  form,
  update
}: {
  lang: Lang;
  form: IntakeForm;
  update: <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => void;
}) {
  return (
    <div className="form-stack">
      <div className="hint-card">
        <strong>{lang === "es" ? "Sugerencia" : "Tip"}</strong>
        <p>
          {lang === "es"
            ? "Use fechas, nombres, documentos recibidos y que quiere que pase. No incluya informacion que no sea necesaria."
            : "Use dates, names, documents received, and what you want to happen. Do not include unnecessary information."}
        </p>
      </div>

      <label className="field">
        <span>{lang === "es" ? "Que paso? *" : "What happened? *"}</span>
        <textarea
          value={form.story}
          onChange={(event) => update("story", event.target.value)}
          rows={7}
          placeholder={
            lang === "es"
              ? "Ej. Recibi un aviso el 3 de mayo y no entiendo cuanto tiempo tengo..."
              : "E.g., I received a notice on May 3 and I do not understand how much time I have..."
          }
        />
      </label>

      <label className="field">
        <span>{lang === "es" ? "Que resultado necesita? *" : "What outcome do you need? *"}</span>
        <input
          value={form.goal}
          onChange={(event) => update("goal", event.target.value)}
          placeholder={lang === "es" ? "Ej. detener un desalojo, entender un contrato..." : "E.g., stop an eviction, understand a contract..."}
        />
      </label>

      <label className="field">
        <span>{lang === "es" ? "Correo o telefono opcional" : "Optional email or phone"}</span>
        <input
          value={form.contact}
          onChange={(event) => update("contact", event.target.value)}
          placeholder={lang === "es" ? "Solo si quiere seguimiento" : "Only if you want follow-up"}
        />
      </label>
    </div>
  );
}

function ConsentStep({
  lang,
  form,
  update
}: {
  lang: Lang;
  form: IntakeForm;
  update: <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => void;
}) {
  return (
    <div className="form-stack">
      <div className="alert info">
        <strong>{lang === "es" ? "Transparencia de IA" : "AI transparency"}</strong>
        <p>
          {lang === "es"
            ? "Este prototipo usa reglas locales del navegador para crear un plan general. No llama a un LLM externo. Si se conecta IA real, debe hacerse desde servidor, con auditoria y consentimiento."
            : "This prototype uses browser-local rules to create a general plan. It does not call an external LLM. If real AI is connected, it must run server-side with auditing and consent."}
        </p>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update("consent", event.currentTarget.checked)}
        />
        <span>
          {lang === "es"
            ? "Acepto usar esta informacion para generar un plan de informacion legal general. Entiendo que no es asesoria legal."
            : "I agree to use this information to generate a general legal information plan. I understand this is not legal advice."}
        </span>
      </label>

      <label className="check-row">
        <input
          type="checkbox"
          checked={form.shareWithPartner}
          onChange={(event) => update("shareWithPartner", event.currentTarget.checked)}
        />
        <span>
          {lang === "es"
            ? "Opcional: permito compartir un resumen minimo con un socio humano si solicito una derivacion."
            : "Optional: I allow a minimal summary to be shared with a human partner if I request a referral."}
        </span>
      </label>

      <div className="mini-grid">
        <FeatureCard
          icon={"\u{1F512}"}
          title={lang === "es" ? "Minimizacion" : "Minimization"}
          body={lang === "es" ? "Pedir solo lo necesario para triage." : "Ask only what is needed for triage."}
        />
        <FeatureCard
          icon={"\u{1F9D1}\u200D\u2696\uFE0F"}
          title={lang === "es" ? "Escalacion humana" : "Human escalation"}
          body={lang === "es" ? "Casos urgentes o sensibles no deben depender solo de IA." : "Urgent or sensitive cases should not rely on AI alone."}
        />
      </div>
    </div>
  );
}

function PlanStep({
  lang,
  plan,
  form,
  onConversion
}: {
  lang: Lang;
  plan: Plan;
  form: IntakeForm;
  onConversion: (label: string) => void;
}) {
  return (
    <div className="form-stack">
      <div className={`plan-banner risk-${plan.risk}`}>
        <div>
          <p className="eyebrow">{lang === "es" ? "Resultado preliminar" : "Preliminary result"}</p>
          <h2>{plan.title}</h2>
          <p>{plan.summary}</p>
        </div>
        <span>{plan.risk}</span>
      </div>

      <div className="grid two">
        <ListCard title={lang === "es" ? "Proximos pasos" : "Next steps"} items={plan.actions} />
        <ListCard title={lang === "es" ? "Documentos utiles" : "Useful documents"} items={plan.documents} />
      </div>

      <ListCard title={lang === "es" ? "Preguntas para ayuda humana" : "Questions for human help"} items={plan.questionsForHuman} />

      <div className="card">
        <h3>{lang === "es" ? "Opciones de conexion" : "Connection options"}</h3>
        <div className="grid two">
          {plan.referrals.map((referral) => (
            <article className="referral-card" key={referral.title}>
              <h4>{referral.title}</h4>
              <p>{referral.desc}</p>
              <button className="btn primary full" type="button" onClick={() => onConversion(referral.cta)}>
                {referral.cta}
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{lang === "es" ? "Registro de fuentes requerido" : "Required source registry"}</h3>
        <p>
          {lang === "es"
            ? "No se debe lanzar produccion hasta conectar fuentes oficiales, fechas de revision y revision humana."
            : "Do not launch production until official sources, review dates, and human review are connected."}
        </p>
        <ul className="check-list">
          {plan.sourceChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="alert info">
        <strong>{lang === "es" ? "Divulgacion etica" : "Ethics disclosure"}</strong>
        <p>{plan.ethicsDisclosure}</p>
      </div>

      {form.contact && (
        <div className="alert success">
          {lang === "es"
            ? "Contacto capturado de forma local para seguimiento simulado."
            : "Contact captured locally for simulated follow-up."}
        </div>
      )}

      <button className="btn primary xl" type="button" onClick={() => onConversion(plan.cta)}>
        {plan.cta}
      </button>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <ul className="clean-list spaced">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PartnersPage({ lang, track }: { lang: Lang; track: TrackFn }) {
  const t = I18N[lang];
  const [monthlyUsers, setMonthlyUsers] = useState(1000);
  const [conversionRate, setConversionRate] = useState(18);
  const [pricePerQualified, setPricePerQualified] = useState(15);
  const [partnerShare, setPartnerShare] = useState(30);

  const revenue = useMemo(() => {
    const qualified = monthlyUsers * (conversionRate / 100);
    const gross = qualified * pricePerQualified;
    return {
      qualified,
      gross,
      partner: gross * (partnerShare / 100),
      platform: gross * (1 - partnerShare / 100)
    };
  }, [monthlyUsers, conversionRate, pricePerQualified, partnerShare]);

  const opportunities = [
    {
      icon: "\u{1F3E6}",
      title: lang === "es" ? "Bancos y cooperativas" : "Banks and credit unions",
      fit: lang === "es" ? "Clientes con deuda, fraude, vivienda, beneficios o crisis financiera." : "Customers with debt, fraud, housing, benefits, or financial distress.",
      model: lang === "es" ? "Acceso patrocinado, tarifa por usuario calificado o beneficio comunitario." : "Sponsored access, qualified-user fee, or community-benefit program."
    },
    {
      icon: "\u{1F4B8}",
      title: lang === "es" ? "Fintech / credito" : "Fintech / credit",
      fit: lang === "es" ? "Triage previo a cobros, disputas, hardship y educacion financiera." : "Pre-collections triage, disputes, hardship, and financial education.",
      model: lang === "es" ? "API white-label, reparto por derivacion permitida o SaaS mensual." : "White-label API, compliant referral share, or monthly SaaS."
    },
    {
      icon: "\u{1F454}",
      title: lang === "es" ? "Empleadores / beneficios" : "Employers / benefits",
      fit: lang === "es" ? "Ayuda a empleados con vivienda, familia, deuda y beneficios." : "Support employees with housing, family, debt, and benefits issues.",
      model: lang === "es" ? "PMPM, paquete EAP o beneficio de bienestar financiero." : "PMPM, EAP package, or financial-wellness benefit."
    },
    {
      icon: "\u{1F9FE}",
      title: lang === "es" ? "CPAs / nomina" : "CPAs / payroll",
      fit: lang === "es" ? "Pequenas empresas con contratos, empleo, impuestos y cumplimiento." : "Small businesses with contracts, employment, tax, and compliance needs.",
      model: lang === "es" ? "SaaS por firma, derivaciones revisadas o paquete SMB." : "Firm SaaS, reviewed referrals, or SMB bundle."
    },
    {
      icon: "\u{1F6E1}\uFE0F",
      title: lang === "es" ? "Aseguradoras" : "Insurers",
      fit: lang === "es" ? "Prevencion de reclamos, documentos y rutas de resolucion temprana." : "Claim prevention, documents, and early resolution paths.",
      model: lang === "es" ? "Licencia por poliza, triage embebido o portal de autoservicio." : "Per-policy license, embedded triage, or self-service portal."
    },
    {
      icon: "\u2696\uFE0F",
      title: lang === "es" ? "Legal aid / pro bono" : "Legal aid / pro bono",
      fit: lang === "es" ? "Clasificacion, capacidad, idioma, riesgo y derivaciones seguras." : "Triage, capacity, language, risk, and safe referrals.",
      model: lang === "es" ? "Subvencion, SaaS con descuento, implementacion o patrocinio filantropico." : "Grant, discounted SaaS, implementation, or philanthropic sponsorship."
    }
  ];

  const modelCards = [
    { title: lang === "es" ? "SaaS white-label" : "White-label SaaS", body: lang === "es" ? "Tarifa mensual por portal, sucursal, firma o volumen de usuarios." : "Monthly fee per portal, branch, firm, or user volume." },
    { title: lang === "es" ? "Acceso patrocinado" : "Sponsored access", body: lang === "es" ? "Un socio paga para que usuarios vulnerables accedan gratis." : "A partner pays so vulnerable users can access the product for free." },
    { title: lang === "es" ? "Pago por caso calificado" : "Qualified-case fee", body: lang === "es" ? "Pago cuando el usuario completa criterios objetivos y permitidos." : "Payment when the user completes objective and permitted criteria." },
    { title: lang === "es" ? "Implementacion + soporte" : "Implementation + support", body: lang === "es" ? "Ingresos por configuracion, capacitacion, analitica y mantenimiento." : "Revenue from configuration, training, analytics, and maintenance." }
  ];

  return (
    <section className="page">
      <div className="section-heading">
        <p className="eyebrow">{lang === "es" ? "Estrategia comercial" : "Commercial strategy"}</p>
        <h1>{lang === "es" ? "Alianzas y modelos de ingresos" : "Partnerships and revenue models"}</h1>
        <p>{t.partnerWarning}</p>
      </div>

      <div className="grid three">
        {opportunities.map((item) => (
          <article className="card" key={item.title}>
            <span className="feature-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.fit}</p>
            <p className="muted">
              <strong>{lang === "es" ? "Modelo:" : "Model:"}</strong> {item.model}
            </p>
          </article>
        ))}
      </div>

      <div className="grid two">
        <div className="card">
          <h2>{lang === "es" ? "Simulador de reparto" : "Revenue-share simulator"}</h2>
          <p>
            {lang === "es"
              ? "Use supuestos conservadores. Esto no valida cumplimiento legal ni reglas profesionales."
              : "Use conservative assumptions. This does not validate legal compliance or professional rules."}
          </p>

          <div className="form-grid single">
            <NumberField label={lang === "es" ? "Usuarios mensuales" : "Monthly users"} value={monthlyUsers} setValue={setMonthlyUsers} />
            <NumberField label={lang === "es" ? "Conversion calificada %" : "Qualified conversion %"} value={conversionRate} setValue={setConversionRate} />
            <NumberField label={lang === "es" ? "Ingreso por usuario calificado" : "Revenue per qualified user"} value={pricePerQualified} setValue={setPricePerQualified} />
            <NumberField label={lang === "es" ? "Participacion del socio %" : "Partner share %"} value={partnerShare} setValue={setPartnerShare} />
          </div>
        </div>

        <div className="card results-card">
          <h2>{lang === "es" ? "Resultado estimado" : "Estimated result"}</h2>
          <div className="metric-row">
            <span>{lang === "es" ? "Usuarios calificados" : "Qualified users"}</span>
            <strong>{Math.round(revenue.qualified)}</strong>
          </div>
          <div className="metric-row">
            <span>{lang === "es" ? "Ingreso bruto" : "Gross revenue"}</span>
            <strong>{formatMoney(revenue.gross)}</strong>
          </div>
          <div className="metric-row">
            <span>{lang === "es" ? "Socio" : "Partner"}</span>
            <strong>{formatMoney(revenue.partner)}</strong>
          </div>
          <div className="metric-row">
            <span>{lang === "es" ? "Plataforma" : "Platform"}</span>
            <strong>{formatMoney(revenue.platform)}</strong>
          </div>

          <button
            className="btn primary full"
            type="button"
            onClick={() =>
              track("partner_packet_requested", {
                monthlyUsers,
                conversionRate,
                pricePerQualified,
                partnerShare
              })
            }
          >
            {lang === "es" ? "Solicitar paquete de alianza" : "Request partnership packet"}
          </button>
        </div>
      </div>

      <div className="grid four">
        {modelCards.map((item) => (
          <article className="card compact-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="alert warning">
        <strong>{lang === "es" ? "Controles obligatorios" : "Required controls"}:</strong>{" "}
        {lang === "es"
          ? "Antes de activar reparto de ingresos, confirme reglas de referencia, no interferencia profesional, privacidad, consentimiento, conflictos y prohibiciones de fee-sharing."
          : "Before activating revenue share, confirm referral rules, professional independence, privacy, consent, conflicts, and fee-sharing restrictions."}
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  setValue
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => setValue(Math.max(0, Number(event.target.value)))}
      />
    </label>
  );
}

function AdminPage({ lang, events, resetData }: { lang: Lang; events: AnalyticsEvent[]; resetData: () => void }) {
  const t = I18N[lang];
  const [governance, setGovernance] = useState<Record<string, boolean>>(() =>
    loadJSON<Record<string, boolean>>(STORAGE.governance, {})
  );

  useEffect(() => {
    localStorage.setItem(STORAGE.governance, JSON.stringify(governance));
  }, [governance]);

  const count = (name: string) => events.filter((event) => event.name === name).length;
  const governanceItems = getGovernanceItems(lang);
  const completed = governanceItems.filter((item) => governance[item.id]).length;
  const score = Math.round((completed / governanceItems.length) * 100);

  const exportAudit = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      governance,
      events,
      note: lang === "es" ? "Exportacion local para auditoria. No contiene validacion legal." : "Local export for audit. Does not contain legal validation."
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "a2j-governance-audit.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="page">
      <div className="section-heading">
        <p className="eyebrow">{lang === "es" ? "Operaciones responsables" : "Responsible operations"}</p>
        <h1>{lang === "es" ? "Panel de gobernanza y conversion" : "Governance and conversion dashboard"}</h1>
        <p>{t.adminGap}</p>
      </div>

      <div className="grid four">
        <MetricCard label={lang === "es" ? "Inicios" : "Starts"} value={count("intake_started")} />
        <MetricCard label={lang === "es" ? "Planes generados" : "Plans generated"} value={count("plan_generated")} />
        <MetricCard label={lang === "es" ? "CTAs" : "CTAs"} value={count("conversion_cta_clicked")} />
        <MetricCard label={lang === "es" ? "Alianzas" : "Partnerships"} value={count("partner_packet_requested")} />
      </div>

      <div className="grid two">
        <div className="card">
          <h2>{lang === "es" ? "Checklist A2J / IA etica" : "A2J / ethical AI checklist"}</h2>
          <div className="score-ring" aria-label="Governance score">
            <strong>{score}%</strong>
            <span>{lang === "es" ? "listo" : "ready"}</span>
          </div>

          <div className="checklist">
            {governanceItems.map((item) => (
              <label className="check-row boxed" key={item.id}>
                <input
                  type="checkbox"
                  checked={Boolean(governance[item.id])}
                  onChange={(event) =>
                    setGovernance((prev) => ({ ...prev, [item.id]: event.currentTarget.checked }))
                  }
                />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>{lang === "es" ? "Brechas antes de produccion" : "Pre-production gaps"}</h2>
          <ul className="clean-list spaced">
            <li>{lang === "es" ? "Fuentes legales oficiales por jurisdiccion no conectadas." : "Official jurisdiction-specific legal sources are not connected."}</li>
            <li>{lang === "es" ? "No hay certificacion de proveedor IA, procedencia de datos ni DPA adjunto." : "No AI vendor certification, data provenance, or DPA is attached."}</li>
            <li>{lang === "es" ? "No hay revision documentada de UPL, fee-sharing, referencias o privacidad." : "No documented UPL, fee-sharing, referral, or privacy review is attached."}</li>
            <li>{lang === "es" ? "No hay pruebas de sesgo por idioma, ingresos, discapacidad o alfabetizacion." : "No bias testing by language, income, disability, or literacy is attached."}</li>
          </ul>

          <div className="button-stack">
            <button className="btn secondary full" type="button" onClick={exportAudit}>
              {lang === "es" ? "Exportar auditoria JSON" : "Export audit JSON"}
            </button>
            <button className="btn danger full" type="button" onClick={resetData}>
              {lang === "es" ? "Borrar datos locales" : "Delete local data"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>{lang === "es" ? "Eventos recientes" : "Recent events"}</h2>
        {events.length === 0 ? (
          <p className="muted">{lang === "es" ? "Sin eventos todavia." : "No events yet."}</p>
        ) : (
          <div className="event-table" role="table" aria-label="Recent events">
            <div className="event-row event-head" role="row">
              <span>{lang === "es" ? "Evento" : "Event"}</span>
              <span>{lang === "es" ? "Fecha" : "Date"}</span>
              <span>{lang === "es" ? "Datos" : "Data"}</span>
            </div>
            {events
              .slice()
              .reverse()
              .slice(0, 12)
              .map((event) => (
                <div className="event-row" role="row" key={event.id}>
                  <span>{event.name}</span>
                  <span>{new Date(event.createdAt).toLocaleString()}</span>
                  <code>{JSON.stringify(event.payload ?? {})}</code>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function getGovernanceItems(lang: Lang): Array<{ id: string; label: string; detail: string }> {
  return [
    { id: "sourceRegistry", label: lang === "es" ? "Registro de fuentes legales" : "Legal source registry", detail: lang === "es" ? "Fuentes oficiales, jurisdiccion, fecha de revision y responsable." : "Official sources, jurisdiction, review date, and owner." },
    { id: "humanReview", label: lang === "es" ? "Revision humana calificada" : "Qualified human review", detail: lang === "es" ? "Abogados, representantes acreditados o expertos autorizados revisan contenido." : "Lawyers, accredited representatives, or authorized experts review content." },
    { id: "spanishQA", label: lang === "es" ? "QA en espanol y lectura clara" : "Spanish QA and plain reading", detail: lang === "es" ? "Validacion de traduccion, tono, lectura y comprension." : "Translation, tone, reading level, and comprehension validation." },
    { id: "vendorProvenance", label: lang === "es" ? "Procedencia de IA / datos" : "AI / data provenance", detail: lang === "es" ? "Modelo, datos, licencias, DPA, retencion y politica de entrenamiento." : "Model, data, licenses, DPA, retention, and training policy." },
    { id: "biasTesting", label: lang === "es" ? "Pruebas de sesgo" : "Bias testing", detail: lang === "es" ? "Idioma, ingresos, discapacidad, alfabetizacion, geografia y estado migratorio." : "Language, income, disability, literacy, geography, and immigration status." },
    { id: "escalation", label: lang === "es" ? "Escalacion y crisis" : "Escalation and crisis", detail: lang === "es" ? "Rutas humanas para plazos, seguridad, menores, vivienda e inmigracion." : "Human paths for deadlines, safety, children, housing, and immigration." },
    { id: "privacy", label: lang === "es" ? "Privacidad y minimizacion" : "Privacy and minimization", detail: lang === "es" ? "Consentimiento, eliminacion, logs, cifrado y retencion minima." : "Consent, deletion, logs, encryption, and minimal retention." },
    { id: "commercialCompliance", label: lang === "es" ? "Cumplimiento comercial" : "Commercial compliance", detail: lang === "es" ? "UPL, fee-sharing, referencias, conflictos, publicidad y reglas locales." : "UPL, fee-sharing, referrals, conflicts, advertising, and local rules." }
  ];
}
