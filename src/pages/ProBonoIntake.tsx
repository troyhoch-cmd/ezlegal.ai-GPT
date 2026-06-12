import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Scale,
  Heart,
  CheckCircle,
  AlertCircle,
  Languages,
  Mail,
  MapPin,
  Sparkles,
  DollarSign,
  Clock,
  Info,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Building2,
  Save
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PrivacyMicroPanel from '../components/PrivacyMicroPanel';
import { supabase } from '../lib/supabase';

const WIZARD_STEPS = [
  { id: 1, title: 'Contact', icon: Mail },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Finances', icon: DollarSign },
  { id: 4, title: 'Legal Issue', icon: Scale },
  { id: 5, title: 'Review', icon: CheckCircle }
];

export default function ProBonoIntake() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [aiEligibility, setAiEligibility] = useState<{score: number, recommendation: string} | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    preferred_language: 'en',
    state: '',
    county: '',
    zip_code: '',
    household_income: '',
    household_size: '',
    legal_issue_category: '',
    legal_issue_description: '',
    urgency_level: 'normal',
    opposing_party_name: '',
    case_deadline: '',
    previous_attorney: false,
    current_court_case: false,
    referral_source: ''
  });
  const [savedDraft, setSavedDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('probono_intake_draft');
    const savedStep = localStorage.getItem('probono_intake_step');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData);
        if (savedStep) setCurrentStep(parseInt(savedStep));
        setLastSaved(new Date(parsed.savedAt));
        setSavedDraft(true);
      } catch {
        localStorage.removeItem('probono_intake_draft');
        localStorage.removeItem('probono_intake_step');
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = {
      formData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('probono_intake_draft', JSON.stringify(draft));
    localStorage.setItem('probono_intake_step', currentStep.toString());
    setLastSaved(new Date());
    setSavedDraft(true);
  };

  const clearDraft = () => {
    localStorage.removeItem('probono_intake_draft');
    localStorage.removeItem('probono_intake_step');
    setSavedDraft(false);
    setLastSaved(null);
  };

  const text = {
    en: {
      title: 'Apply for Pro Bono Legal Services',
      subtitle: 'Check your eligibility and connect with volunteer attorneys who provide free legal assistance to qualifying individuals',
      helpText: 'This form takes 3-5 minutes. All fields are confidential.',
      submit: 'Submit Application',
      submitting: 'Submitting...',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number (Optional)',
      state: 'State',
      county: 'County',
      zipCode: 'Zip Code (Optional)',
      householdIncome: 'Annual Household Income',
      householdSize: 'Number of People in Household',
      legalCategory: 'Type of Legal Issue',
      description: 'Describe Your Legal Issue',
      urgency: 'How Urgent Is This?',
      urgencyNormal: 'Normal - Within 30 days',
      urgencyUrgent: 'Urgent - Within 7 days',
      urgencyImmediate: 'Immediate - Within 24 hours',
      opposingParty: 'Opposing Party Name (if applicable)',
      deadline: 'Court Deadline (if any)',
      previousAttorney: 'Have you had an attorney for this issue before?',
      currentCourtCase: 'Is there currently a court case?',
      referralSource: 'How did you hear about us? (Optional)',
      instantCheck: 'Check My Eligibility',
      eligible: 'You may qualify for pro bono legal services!',
      notEligible: 'You may still qualify based on other factors. Please submit your application.',
      successTitle: 'Application Submitted Successfully!',
      successMessage: 'We will contact you within 24-48 hours to discuss your case.',
      switchLanguage: 'Cambiar a español',
      contactInfo: 'Your Contact Information',
      contactHelp: 'We need this to reach you about your case',
      locationInfo: 'Your Location',
      locationHelp: 'We serve clients in specific counties and states',
      financialInfo: 'Household Financial Information',
      financialHelp: 'Most pro bono programs serve households earning up to 200% of Federal Poverty Guidelines',
      legalIssueInfo: 'Your Legal Issue',
      legalIssueHelp: 'Tell us about your legal problem so we can match you with the right attorney',
      additionalInfo: 'Additional Details (Optional)',
      additionalHelp: 'This information helps us better understand your situation'
    },
    es: {
      title: 'Solicitar Servicios Legales Pro Bono',
      subtitle: 'Verifique su elegibilidad y conéctese con abogados voluntarios que brindan asistencia legal gratuita a personas que califiquen',
      helpText: 'Este formulario toma 3-5 minutos. Todos los campos son confidenciales.',
      submit: 'Enviar Solicitud',
      submitting: 'Enviando...',
      fullName: 'Nombre Completo',
      email: 'Correo Electrónico',
      phone: 'Número de Teléfono (Opcional)',
      state: 'Estado',
      county: 'Condado',
      zipCode: 'Código Postal (Opcional)',
      householdIncome: 'Ingreso Anual del Hogar',
      householdSize: 'Número de Personas en el Hogar',
      legalCategory: 'Tipo de Problema Legal',
      description: 'Describa Su Problema Legal',
      urgency: '¿Qué Tan Urgente Es Esto?',
      urgencyNormal: 'Normal - Dentro de 30 días',
      urgencyUrgent: 'Urgente - Dentro de 7 días',
      urgencyImmediate: 'Inmediato - Dentro de 24 horas',
      opposingParty: 'Nombre de la Parte Contraria (si aplica)',
      deadline: 'Fecha Límite de la Corte (si hay)',
      previousAttorney: '¿Ha tenido un abogado para este problema antes?',
      currentCourtCase: '¿Hay actualmente un caso en la corte?',
      referralSource: '¿Cómo se enteró de nosotros? (Opcional)',
      instantCheck: 'Verificar Mi Elegibilidad',
      eligible: '¡Puede calificar para ayuda legal gratuita!',
      notEligible: 'Aún puede calificar según otros factores. Por favor envíe su solicitud.',
      successTitle: '¡Solicitud Enviada Exitosamente!',
      successMessage: 'Nos comunicaremos con usted dentro de 24-48 horas para discutir su caso.',
      switchLanguage: 'Switch to English',
      contactInfo: 'Su Información de Contacto',
      contactHelp: 'Necesitamos esto para comunicarnos con usted sobre su caso',
      locationInfo: 'Su Ubicación',
      locationHelp: 'Servimos a clientes en condados y estados específicos',
      financialInfo: 'Información Financiera del Hogar',
      financialHelp: 'La mayoría de los programas pro bono sirven a hogares que ganan hasta el 200% de las Pautas Federales de Pobreza',
      legalIssueInfo: 'Su Problema Legal',
      legalIssueHelp: 'Cuéntenos sobre su problema legal para que podamos conectarlo con el abogado adecuado',
      additionalInfo: 'Detalles Adicionales (Opcional)',
      additionalHelp: 'Esta información nos ayuda a entender mejor su situación'
    }
  };

  const t = text[language];

  const legalCategories = [
    { value: 'housing', label: { en: 'Housing (Eviction, Landlord Issues)', es: 'Vivienda (Desalojo, Problemas con Propietario)' } },
    { value: 'employment', label: { en: 'Employment (Wage Theft, Discrimination)', es: 'Empleo (Robo de Salarios, Discriminación)' } },
    { value: 'family', label: { en: 'Family Law (Custody, Divorce)', es: 'Derecho Familiar (Custodia, Divorcio)' } },
    { value: 'consumer', label: { en: 'Consumer Protection', es: 'Protección del Consumidor' } },
    { value: 'benefits', label: { en: 'Public Benefits (SSI, SNAP)', es: 'Beneficios Públicos (SSI, SNAP)' } },
    { value: 'debt', label: { en: 'Debt Collection', es: 'Cobro de Deudas' } },
    { value: 'civil_rights', label: { en: 'Civil Rights', es: 'Derechos Civiles' } },
    { value: 'other', label: { en: 'Other Civil Legal Matter', es: 'Otro Asunto Legal Civil' } }
  ];

  const calculateEligibility = async () => {
    const income = parseFloat(formData.household_income);
    const size = parseInt(formData.household_size);

    if (!income || !size) return;

    const federalPovertyGuidelines: { [key: number]: number } = {
      1: 15060,
      2: 20440,
      3: 25820,
      4: 31200,
      5: 36580,
      6: 41960,
      7: 47340,
      8: 52720
    };

    const guideline = size <= 8 ? federalPovertyGuidelines[size] : federalPovertyGuidelines[8] + (size - 8) * 5380;
    const threshold = guideline * 2;
    const percentage = (income / threshold) * 100;

    let score = 0;
    let recommendation = '';

    if (income <= threshold) {
      score = Math.max(0, 100 - percentage);
      recommendation = language === 'en'
        ? `Based on your household income and size, you appear to meet the financial eligibility requirements for free legal services. Your income is ${percentage.toFixed(0)}% of the eligibility threshold.`
        : `Según el tamaño y los ingresos de su hogar, parece cumplir con los requisitos de elegibilidad financiera para servicios legales gratuitos. Su ingreso es ${percentage.toFixed(0)}% del umbral de elegibilidad.`;
    } else {
      score = Math.max(0, 50 - (percentage - 100) / 2);
      recommendation = language === 'en'
        ? `Your income is ${percentage.toFixed(0)}% of our typical eligibility threshold. While you may not automatically qualify, we encourage you to submit your application as other factors may be considered.`
        : `Su ingreso es ${percentage.toFixed(0)}% de nuestro umbral de elegibilidad típico. Si bien es posible que no califique automáticamente, le recomendamos que envíe su solicitud ya que se pueden considerar otros factores.`;
    }

    if (formData.urgency_level === 'immediate') {
      score += 10;
    } else if (formData.urgency_level === 'urgent') {
      score += 5;
    }

    setAiEligibility({ score: Math.min(100, score), recommendation });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.full_name.trim()) errors.full_name = 'Name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    }

    if (step === 2) {
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.county.trim()) errors.county = 'County is required';
    }

    if (step === 3) {
      if (!formData.household_income) errors.household_income = 'Income is required';
      if (!formData.household_size) errors.household_size = 'Household size is required';
    }

    if (step === 4) {
      if (!formData.legal_issue_category) errors.legal_issue_category = 'Please select a category';
      if (!formData.legal_issue_description.trim()) errors.legal_issue_description = 'Please describe your issue';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3 && !aiEligibility) {
        calculateEligibility();
      }
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setStepErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const applicationData = {
        ...formData,
        user_id: user?.id || null,
        household_income: parseFloat(formData.household_income),
        household_size: parseInt(formData.household_size),
        ai_eligibility_score: aiEligibility?.score || null,
        ai_recommendation: aiEligibility?.recommendation || null
      };

      const { error } = await supabase
        .from('pro_bono_applications')
        .insert([applicationData]);

      if (error) throw error;

      clearDraft();
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-600" />
            </div>
            <h1 className="text-4xl font-bold text-navy-900 mb-4">{t.successTitle}</h1>
            <p className="text-xl text-navy-600 mb-8">{t.successMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              {language === 'en' ? 'Return Home' : 'Volver al Inicio'}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-12 pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full">
              <Heart className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-semibold">{language === 'en' ? 'Pro Bono Services' : 'Servicios Pro Bono'}</span>
            </div>
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'es' : 'en');
                setFormData(prev => ({ ...prev, preferred_language: language === 'en' ? 'es' : 'en' }));
              }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Languages className="w-4 h-4" />
              <span className="text-sm font-semibold">{t.switchLanguage}</span>
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
          <p className="text-lg text-white/90 mb-4">{t.subtitle}</p>

          <div className="bg-white/10 rounded-xl p-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">
                {language === 'en' ? `Step ${currentStep} of 5` : `Paso ${currentStep} de 5`}
              </span>
              <span className="text-sm text-white/60">
                {language === 'en' ? '~3-5 minutes' : '~3-5 minutos'}
              </span>
            </div>
            <div className="flex gap-2">
              {WIZARD_STEPS.map((step) => (
                <div key={step.id} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      step.id < currentStep
                        ? 'bg-success-400'
                        : step.id === currentStep
                        ? 'bg-gold-400'
                        : 'bg-white/20'
                    }`}
                  />
                  <div className="flex items-center gap-1 mt-2">
                    <step.icon className={`w-3 h-3 ${step.id <= currentStep ? 'text-white' : 'text-white/40'}`} />
                    <span className={`text-xs hidden sm:inline ${step.id <= currentStep ? 'text-white' : 'text-white/40'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-navy-900 mb-2">
                {language === 'en' ? 'Important: What is Pro Bono Legal Aid?' : 'Importante: Que es Ayuda Legal Pro Bono?'}
              </h2>
              <p className="text-navy-700 text-sm mb-3">
                {language === 'en'
                  ? 'Pro bono legal services are FREE legal help provided by volunteer attorneys through legal aid organizations. These services are reserved for individuals and families who meet strict income eligibility requirements (typically 200% or less of Federal Poverty Guidelines).'
                  : 'Los servicios legales pro bono son ayuda legal GRATUITA proporcionada por abogados voluntarios a traves de organizaciones de asistencia legal. Estos servicios estan reservados para personas y familias que cumplen con estrictos requisitos de elegibilidad de ingresos (tipicamente 200% o menos de las Pautas Federales de Pobreza).'}
              </p>
              <p className="text-navy-600 text-sm">
                {language === 'en'
                  ? 'If you don\'t qualify for pro bono services, you can still access free unlimited questions through our AI legal assistant. Issue Packs from $29 when you need detailed action plans.'
                  : 'Si no califica para servicios pro bono, aun puede acceder a preguntas ilimitadas gratis a traves de nuestro asistente legal de IA. Paquetes de Ayuda desde $29 cuando necesite planes de accion detallados.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-navy-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-bold text-navy-900 mb-4 text-center">
            {language === 'en' ? 'Not sure if you qualify? Try these options first:' : 'No esta seguro si califica? Pruebe estas opciones primero:'}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              to="/chat"
              className="flex items-center gap-3 p-4 bg-navy-50 border-2 border-navy-200 rounded-xl hover:border-navy-400 hover:bg-teal-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                <MessageSquare className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'Free AI Chat' : 'Chat IA Gratis'}</div>
                <div className="text-xs text-navy-600">{language === 'en' ? 'Get instant answers' : 'Respuestas instantaneas'}</div>
              </div>
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-3 p-4 bg-gold-50 border-2 border-gold-200 rounded-xl hover:border-gold-400 hover:bg-gold-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center group-hover:bg-gold-200 transition-colors">
                <Sparkles className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <div className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'Free Questions' : 'Preguntas Gratis'}</div>
                <div className="text-xs text-navy-600">{language === 'en' ? 'Unlimited, free to start' : 'Ilimitadas, gratis para comenzar'}</div>
              </div>
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-3 p-4 bg-navy-50 border-2 border-navy-200 rounded-xl hover:border-navy-400 hover:bg-navy-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                <DollarSign className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <div className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'View Pricing' : 'Ver Precios'}</div>
                <div className="text-xs text-navy-600">{language === 'en' ? 'Compare all plans' : 'Comparar planes'}</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8 bg-navy-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <PrivacyMicroPanel context="intake" className="mb-6" />
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-navy-200 pb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-teal-600" />
                    {t.contactInfo}
                  </h2>
                  <p className="text-sm text-navy-600 mt-1">{t.contactHelp}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.fullName} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.full_name ? 'border-red-500' : 'border-navy-300'}`}
                  />
                  {stepErrors.full_name && <p className="text-red-500 text-sm mt-1">{stepErrors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.email} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.email ? 'border-red-500' : 'border-navy-300'}`}
                  />
                  {stepErrors.email && <p className="text-red-500 text-sm mt-1">{stepErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">{t.phone}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-navy-200 pb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    {t.locationInfo}
                  </h2>
                  <p className="text-sm text-navy-600 mt-1">{t.locationHelp}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.state} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.state ? 'border-red-500' : 'border-navy-300'}`}
                  />
                  {stepErrors.state && <p className="text-red-500 text-sm mt-1">{stepErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.county} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.county ? 'border-red-500' : 'border-navy-300'}`}
                  />
                  {stepErrors.county && <p className="text-red-500 text-sm mt-1">{stepErrors.county}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">{t.zipCode}</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-navy-200 pb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                    {t.financialInfo}
                  </h2>
                  <p className="text-sm text-navy-600 mt-1">{t.financialHelp}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.householdIncome} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.household_income}
                    onChange={(e) => setFormData({ ...formData, household_income: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.household_income ? 'border-red-500' : 'border-navy-300'}`}
                    placeholder="$0"
                  />
                  {stepErrors.household_income && <p className="text-red-500 text-sm mt-1">{stepErrors.household_income}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.householdSize} <span className="text-teal-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.household_size}
                    onChange={(e) => setFormData({ ...formData, household_size: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.household_size ? 'border-red-500' : 'border-navy-300'}`}
                    placeholder="1"
                    min="1"
                  />
                  {stepErrors.household_size && <p className="text-red-500 text-sm mt-1">{stepErrors.household_size}</p>}
                </div>

                {aiEligibility && (
                  <div className={`border-2 rounded-lg p-4 ${aiEligibility.score >= 50 ? 'bg-success-50 border-success-300' : 'bg-warning-50 border-warning-300'}`}>
                    <div className="flex items-start gap-3">
                      {aiEligibility.score >= 50 ? (
                        <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-navy-900 mb-1">{aiEligibility.score >= 50 ? t.eligible : t.notEligible}</h3>
                        <p className="text-navy-700 text-sm">{aiEligibility.recommendation}</p>
                        <div className="mt-3">
                          <div className="w-full bg-navy-200 rounded-full h-2">
                            <div className="bg-success-600 h-2 rounded-full" style={{ width: `${aiEligibility.score}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-navy-200 pb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                    <Scale className="w-5 h-5 text-teal-600" />
                    {t.legalIssueInfo}
                  </h2>
                  <p className="text-sm text-navy-600 mt-1">{t.legalIssueHelp}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.legalCategory} <span className="text-teal-600">*</span>
                  </label>
                  <select
                    value={formData.legal_issue_category}
                    onChange={(e) => setFormData({ ...formData, legal_issue_category: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.legal_issue_category ? 'border-red-500' : 'border-navy-300'}`}
                  >
                    <option value="">{language === 'en' ? 'Select a category' : 'Seleccione una categoria'}</option>
                    {legalCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label[language]}</option>
                    ))}
                  </select>
                  {stepErrors.legal_issue_category && <p className="text-red-500 text-sm mt-1">{stepErrors.legal_issue_category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    {t.description} <span className="text-teal-600">*</span>
                  </label>
                  <textarea
                    value={formData.legal_issue_description}
                    onChange={(e) => setFormData({ ...formData, legal_issue_description: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${stepErrors.legal_issue_description ? 'border-red-500' : 'border-navy-300'}`}
                    placeholder={language === 'en' ? 'Please describe your legal issue...' : 'Por favor describa su problema legal...'}
                  />
                  {stepErrors.legal_issue_description && <p className="text-red-500 text-sm mt-1">{stepErrors.legal_issue_description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {t.urgency}
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'normal', label: t.urgencyNormal },
                      { value: 'urgent', label: t.urgencyUrgent },
                      { value: 'immediate', label: t.urgencyImmediate }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 p-3 border border-navy-200 rounded-lg cursor-pointer hover:border-teal-300 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50">
                        <input
                          type="radio"
                          name="urgency"
                          value={option.value}
                          checked={formData.urgency_level === option.value}
                          onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
                          className="w-4 h-4 text-teal-600"
                        />
                        <span className="text-navy-700 text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-navy-200 pb-4">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    {language === 'en' ? 'Review Your Application' : 'Revise su Solicitud'}
                  </h2>
                  <p className="text-sm text-navy-600 mt-1">
                    {language === 'en' ? 'Please review the information below before submitting.' : 'Por favor revise la información antes de enviar.'}
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="bg-navy-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-teal-600" /> {t.contactInfo}
                    </h4>
                    <p><strong>{t.fullName}:</strong> {formData.full_name}</p>
                    <p><strong>{t.email}:</strong> {formData.email}</p>
                    {formData.phone && <p><strong>{t.phone}:</strong> {formData.phone}</p>}
                  </div>

                  <div className="bg-navy-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-600" /> {t.locationInfo}
                    </h4>
                    <p><strong>{t.state}:</strong> {formData.state}</p>
                    <p><strong>{t.county}:</strong> {formData.county}</p>
                    {formData.zip_code && <p><strong>{t.zipCode}:</strong> {formData.zip_code}</p>}
                  </div>

                  <div className="bg-navy-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-teal-600" /> {t.financialInfo}
                    </h4>
                    <p><strong>{t.householdIncome}:</strong> ${parseInt(formData.household_income).toLocaleString()}</p>
                    <p><strong>{t.householdSize}:</strong> {formData.household_size}</p>
                    {aiEligibility && (
                      <p className={`mt-2 font-semibold ${aiEligibility.score >= 50 ? 'text-success-600' : 'text-warning-600'}`}>
                        {aiEligibility.score >= 50 ? t.eligible : t.notEligible}
                      </p>
                    )}
                  </div>

                  <div className="bg-navy-50 rounded-lg p-4">
                    <h4 className="font-semibold text-navy-900 mb-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-teal-600" /> {t.legalIssueInfo}
                    </h4>
                    <p><strong>{t.legalCategory}:</strong> {legalCategories.find(c => c.value === formData.legal_issue_category)?.label[language]}</p>
                    <p><strong>{t.urgency}:</strong> {formData.urgency_level}</p>
                    <p className="mt-2"><strong>{t.description}:</strong></p>
                    <p className="text-navy-600 mt-1">{formData.legal_issue_description}</p>
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-sm text-teal-800">
                    {language === 'en'
                      ? 'By submitting this form, you agree to our privacy policy and terms of service. We will contact you within 24-48 hours.'
                      : 'Al enviar este formulario, acepta nuestra politica de privacidad y terminos de servicio. Nos comunicaremos con usted dentro de 24-48 horas.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-navy-200">
              {savedDraft && lastSaved && (
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-4 py-2 text-sm">
                  <div className="flex items-center gap-2 text-teal-700">
                    <Save className="w-4 h-4" />
                    <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearDraft}
                    className="text-teal-600 hover:text-teal-800 text-xs font-medium"
                  >
                    Clear draft
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-navy-700 bg-navy-100 hover:bg-navy-200 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === 'en' ? 'Back' : 'Atras'}
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-navy-600 border border-navy-300 hover:bg-navy-50 rounded-lg font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {language === 'en' ? 'Save' : 'Guardar'}
              </button>
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {language === 'en' ? 'Continue' : 'Continuar'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-success-600 hover:bg-success-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t.submit}
                    </>
                  )}
                </button>
              )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-t border-navy-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 px-4 py-2 rounded-full mb-4">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span className="text-navy-700 text-sm font-semibold">
                {language === 'en' ? 'How It Works' : 'Como Funciona'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              {language === 'en' ? 'How We Connect You to Legal Aid' : 'Como Lo Conectamos con Asistencia Legal'}
            </h2>
            <p className="text-navy-600">
              {language === 'en'
                ? 'Your application is reviewed and matched with the right legal aid organization'
                : 'Su solicitud es revisada y emparejada con la organizacion de asistencia legal adecuada'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-navy-700 font-bold text-lg">1</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">
                {language === 'en' ? 'Submit Application' : 'Enviar Solicitud'}
              </h3>
              <p className="text-navy-600 text-sm">
                {language === 'en'
                  ? 'Complete this form with your information and legal issue details'
                  : 'Complete este formulario con su información y detalles del problema legal'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-navy-700 font-bold text-lg">2</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">
                {language === 'en' ? 'Eligibility Review' : 'Revision de Elegibilidad'}
              </h3>
              <p className="text-navy-600 text-sm">
                {language === 'en'
                  ? 'We verify your eligibility and match you with appropriate legal aid organizations in your area'
                  : 'Verificamos su elegibilidad y lo emparejamos con organizaciones de asistencia legal apropiadas en su area'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-navy-700 font-bold text-lg">3</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-2">
                {language === 'en' ? 'Get Connected' : 'Conectarse'}
              </h3>
              <p className="text-navy-600 text-sm">
                {language === 'en'
                  ? 'Receive contact information for legal aid organizations that can help with your specific issue'
                  : 'Reciba información de contacto para organizaciones de asistencia legal que pueden ayudar con su problema especifico'}
              </p>
            </div>
          </div>

          <div className="mt-10 bg-navy-50 rounded-xl p-6 border border-navy-200">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <Info className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-navy-900 mb-1">
                  {language === 'en' ? 'Note: Pro Bono Network' : 'Nota: Red Pro Bono'}
                </h4>
                <p className="text-navy-600 text-sm">
                  {language === 'en'
                    ? 'ezLegal.ai™ partners with legal aid organizations and bar associations to help connect eligible individuals with volunteer attorneys. Availability of free legal services depends on your location, type of legal issue, and current capacity of local legal aid providers.'
                    : 'ezLegal.ai™ se asocia con organizaciones de asistencia legal y colegios de abogados para ayudar a conectar personas elegibles con abogados voluntarios. La disponibilidad de servicios legales gratuitos depende de su ubicacion, tipo de problema legal y capacidad actual de los proveedores de asistencia legal locales.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
