import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Users,
  Shield,
  Home,
  X,
  MapPin,
  ShieldCheck,
  Landmark,
  ChevronDown,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import Footer from '../components/Footer';
import ArticleModal from '../components/ArticleModal';
import ShareButton from '../components/ShareButton';
import GuidesSearch from '../components/guides/GuidesSearch';
import UrgentHelpBanner from '../components/guides/UrgentHelpBanner';
import SafetyEscalationStrip from '../components/guides/SafetyEscalationStrip';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { US_STATES, getJurisdictionName } from '../data/jurisdictions';
import { getArticleImage, onArticleImageError } from '../lib/article-images';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  image_url: string | null;
  is_featured: boolean;
  author_name: string;
  published_at: string;
  jurisdiction: string | null;
  review_status: string;
  sources: string | null;
  updated_at: string;
  last_reviewed_at: string | null;
}

const FALLBACK_ARTICLES_EN = [
  {
    slug: 'tenant-protection-laws',
    title: 'Understanding Your Rights: A Complete Guide to Tenant Protection Laws',
    excerpt: 'Learn about your rights as a tenant, from security deposits to eviction protection. This comprehensive guide breaks down complex housing laws into plain English.',
    category: 'Housing Law',
    read_time: '12 min read',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'security-deposit-rights',
    title: 'Security Deposits: What Landlords Can and Cannot Deduct',
    excerpt: 'Understand the rules around security deposits, including legal limits, what can be deducted, and how to get your full deposit back when you move out.',
    category: 'Housing Law',
    read_time: '8 min read',
    image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'eviction-process-guide',
    title: 'Eviction Process Explained: Know Your Rights and Timeline',
    excerpt: 'A step-by-step guide to the eviction process, including required notices, court procedures, and how to respond if you receive an eviction notice.',
    category: 'Housing Law',
    read_time: '15 min read',
    image_url: 'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'small-claims-court-guide',
    title: 'Small Claims Court: How to File and Prepare Your Case',
    excerpt: 'A step-by-step guide to navigating small claims court without an attorney. Learn what cases qualify, how to file, and tips for presenting your case.',
    category: 'Civil Law',
    read_time: '8 min read',
    image_url: 'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'employment-rights-guide',
    title: 'Employment Rights Every Worker Should Know',
    excerpt: 'From minimum wage to workplace discrimination, understand your fundamental rights as an employee and when to take action.',
    category: 'Employment Law',
    read_time: '10 min read',
    image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'creating-will-guide',
    title: 'Creating a Will Without a Lawyer: What You Need to Know',
    excerpt: 'Essential information about estate planning for individuals and families. Learn what makes a will legally valid and common mistakes to avoid.',
    category: 'Estate Planning',
    read_time: '15 min read',
    image_url: 'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const FALLBACK_ARTICLES_ES = [
  {
    slug: 'leyes-proteccion-inquilinos',
    title: 'Entendiendo Tus Derechos: Guia Completa de Leyes de Proteccion al Inquilino',
    excerpt: 'Aprende sobre tus derechos como inquilino, desde depositos de seguridad hasta proteccion contra desalojos.',
    category: 'Derecho de Vivienda',
    read_time: '12 min de lectura',
    image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-deposito-seguridad',
    title: 'Depositos de Seguridad: Que Puede y No Puede Descontar Tu Arrendador',
    excerpt: 'Entiende las reglas sobre depositos de seguridad, incluyendo limites legales y como recuperar tu deposito.',
    category: 'Derecho de Vivienda',
    read_time: '8 min de lectura',
    image_url: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-proceso-desalojo',
    title: 'Proceso de Desalojo Explicado: Conoce Tus Derechos y Plazos',
    excerpt: 'Una guia paso a paso del proceso de desalojo, incluyendo avisos requeridos y como responder.',
    category: 'Derecho de Vivienda',
    read_time: '15 min de lectura',
    image_url: 'https://images.pexels.com/photos/7578901/pexels-photo-7578901.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'guia-reclamos-menores',
    title: 'Tribunal de Reclamos Menores: Como Presentar y Preparar Tu Caso',
    excerpt: 'Guia paso a paso para navegar el tribunal de reclamos menores sin abogado.',
    category: 'Derecho Civil',
    read_time: '8 min de lectura',
    image_url: 'https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'derechos-laborales-guia',
    title: 'Derechos Laborales que Todo Trabajador Debe Conocer',
    excerpt: 'Desde el salario minimo hasta la discriminacion laboral, entiende tus derechos fundamentales.',
    category: 'Derecho Laboral',
    read_time: '10 min de lectura',
    image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    slug: 'crear-testamento-guia',
    title: 'Crear un Testamento Sin Abogado: Lo Que Necesitas Saber',
    excerpt: 'Informacion esencial sobre planificacion patrimonial para individuos y familias.',
    category: 'Testamentos y Sucesiones',
    read_time: '15 min de lectura',
    image_url: 'https://images.pexels.com/photos/4057663/pexels-photo-4057663.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

function formatUpdatedDate(dateStr: string, lang: 'en' | 'es'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (lang === 'es') {
    if (diffDays < 1) return 'Actualizado hoy';
    if (diffDays < 7) return `Actualizado hace ${diffDays}d`;
    if (diffDays < 30) return `Actualizado hace ${Math.floor(diffDays / 7)}sem`;
    return `Actualizado ${date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
  }
  if (diffDays < 1) return 'Updated today';
  if (diffDays < 7) return `Updated ${diffDays}d ago`;
  if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
  return `Updated ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function toArticle(a: (typeof FALLBACK_ARTICLES_EN)[number], i: number): Article {
  return {
    ...a,
    id: `fallback-${i}`,
    content: '',
    is_featured: i === 0,
    author_name: 'EZLegal.ai',
    published_at: '2026-04-15T00:00:00.000Z',
    jurisdiction: null,
    review_status: 'editorial_review',
    sources: null,
    updated_at: '2026-05-20T00:00:00.000Z',
    last_reviewed_at: '2026-05-20T00:00:00.000Z',
  };
}

interface CategoryConfig {
  name: string;
  icon: typeof Home;
  count: number;
  examples: string;
  dbName: string;
}

function useCategories(t: (key: string) => string, articles: Article[]): CategoryConfig[] {
  return useMemo(() => {
    const countByCategory = (dbName: string): number =>
      articles.filter((a: Article) => a.category === dbName).length || 0;

    return [
      { name: t('ezreads.category.housingLaw'), icon: Home, count: countByCategory('Housing Law'), examples: t('ezreads.category.housingExamples'), dbName: 'Housing Law' },
      { name: t('ezreads.category.employmentLaw'), icon: Users, count: countByCategory('Employment Law'), examples: t('ezreads.category.employmentExamples'), dbName: 'Employment Law' },
      { name: t('ezreads.category.consumerProtection'), icon: Shield, count: countByCategory('Consumer Protection'), examples: t('ezreads.category.consumerExamples'), dbName: 'Consumer Protection' },
      { name: t('ezreads.category.familyLaw'), icon: FileText, count: countByCategory('Family Law'), examples: t('ezreads.category.familyExamples'), dbName: 'Family Law' },
      { name: t('ezreads.category.willsProbate'), icon: BookOpen, count: countByCategory('Wills & Probate'), examples: t('ezreads.category.willsExamples'), dbName: 'Wills & Probate' },
      { name: t('ezreads.category.civilLaw'), icon: Scale, count: countByCategory('Civil Law'), examples: t('ezreads.category.civilExamples'), dbName: 'Civil Law' },
    ];
  }, [t, articles]);
}

export default function EZReads() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArticleLoading, setIsArticleLoading] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const { language, t } = useLanguage();

  const lang = language === 'es' ? 'es' : 'en' as const;
  const categories = useCategories(t, articles);
  const fallbackArticles = language === 'es' ? FALLBACK_ARTICLES_ES : FALLBACK_ARTICLES_EN;
  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, selectedJurisdiction, language]);

  async function fetchArticles() {
    setIsLoading(true);

    if (language === 'es') {
      setArticlesFromFallback();
      setIsLoading(false);
      return;
    }

    try {
      const dbCategory = selectedCategory
        ? categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory
        : null;

      let query = supabase
        .from('ezreads_articles')
        .select(
          'id, slug, title, excerpt, category, read_time, image_url, is_featured, author_name, published_at, jurisdiction, review_status, sources, updated_at, last_reviewed_at'
        )
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (dbCategory) {
        query = query.eq('category', dbCategory);
      }
      if (selectedJurisdiction) {
        query = query.or(`jurisdiction.eq.${selectedJurisdiction},jurisdiction.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        setArticles(data.map((a) => ({ ...a, content: '' })));
      } else {
        setArticlesFromFallback();
      }
    } catch {
      setArticlesFromFallback();
    } finally {
      setIsLoading(false);
    }
  }

  function setArticlesFromFallback() {
    if (!selectedCategory) {
      setArticles(fallbackArticles.map(toArticle));
      return;
    }
    const dbCategory = categories.find(c => c.name === selectedCategory)?.dbName || selectedCategory;
    const filtered = fallbackArticles.filter(
      (a) => a.category === dbCategory || a.category === selectedCategory
    );
    setArticles(filtered.map(toArticle));
  }

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  async function openArticle(articleSlug: string) {
    setIsModalOpen(true);
    setIsArticleLoading(true);
    setSelectedArticle(null);

    try {
      const { data, error } = await supabase
        .from('ezreads_articles')
        .select('*')
        .eq('slug', articleSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSelectedArticle(data);
      } else {
        loadFallbackArticle(articleSlug);
      }
    } catch {
      loadFallbackArticle(articleSlug);
    } finally {
      setIsArticleLoading(false);
    }
  }

  function loadFallbackArticle(slug: string) {
    const fallback = fallbackArticles.find((a) => a.slug === slug);
    if (fallback) {
      setSelectedArticle({
        ...toArticle(fallback, 0),
        content: generatePlaceholderContent(fallback.title, fallback.excerpt),
      });
    }
  }

  function generatePlaceholderContent(title: string, excerpt: string): string {
    if (language === 'es') {
      return `<p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
<h2>Resumen</h2>
<p>Esta guia explica ${title.toLowerCase()} en pasos cortos. Conocer tus derechos te ayuda a tomar buenas decisiones.</p>
<h2>Puntos Clave</h2>
<ul>
<li>Conoce tus derechos bajo las leyes federales y estatales aplicables</li>
<li>Documenta todo por escrito cuando sea posible</li>
<li>Busca asistencia legal si crees que tus derechos han sido violados</li>
<li>Los plazos pueden aplicar - actua rapidamente para preservar tus opciones</li>
</ul>
<blockquote><strong>Importante:</strong> Esto es informacion general, no consejo legal. Cada caso es distinto y las leyes cambian segun el lugar. Habla con un abogado para tu caso.</blockquote>`;
    }
    return `<p class="text-lg font-medium text-navy-800 mb-6">${excerpt}</p>
<h2>Overview</h2>
<p>This article provides comprehensive information about ${title.toLowerCase()}. Understanding your legal rights is essential for making informed decisions.</p>
<h2>Key Points</h2>
<ul>
<li>Know your rights under applicable federal and state laws</li>
<li>Document everything in writing whenever possible</li>
<li>Seek legal assistance if you believe your rights have been violated</li>
<li>Time limits may apply - act promptly to preserve your options</li>
</ul>
<blockquote><strong>Important:</strong> This article provides general legal information, not legal advice. Every situation is unique. For guidance specific to your circumstances, consult with a qualified attorney.</blockquote>`;
  }

  function handleSearch(query: string, category?: string) {
    setSearchQuery(query);
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  }

  function handleSearchClear() {
    setSearchQuery('');
  }

  function handleClearAllFilters() {
    setSelectedCategory(null);
    setSelectedJurisdiction('');
    setSearchQuery('');
  }

  const featuredArticle = filteredArticles.find((a) => a.is_featured) || filteredArticles[0];
  const regularArticles = filteredArticles.filter((a) => a !== featuredArticle);
  const hasActiveFilters = !!selectedCategory || !!selectedJurisdiction || !!searchQuery;

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8" />
              <span className="text-xl font-semibold">{t('ezreads.title')}</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">{t('ezreads.heroTitle')}</h1>
            <p className="text-xl text-navy-100 leading-relaxed mb-10">
              {t('ezreads.heroSubtitle')}
            </p>
            <GuidesSearch onSearch={handleSearch} onClear={handleSearchClear} />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-navy-900">{t('ezreads.browseByCategory')}</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm border border-navy-200 rounded-lg bg-white text-navy-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer"
                  aria-label={t('ezreads.allStates')}
                >
                  <option value="">{t('ezreads.allStates')}</option>
                  {US_STATES.map((state) => (
                    <option key={state.code} value={state.code}>{state.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-600 hover:text-navy-900 bg-navy-100 hover:bg-navy-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('ezreads.clearAll')}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(selectedCategory === category.name ? null : category.name)}
                className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all group ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 border-teal-600'
                    : 'bg-navy-50 hover:bg-teal-50 border-navy-200 hover:border-teal-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  selectedCategory === category.name ? 'bg-teal-500' : 'bg-teal-50 group-hover:bg-teal-600'
                }`}>
                  <category.icon className={`w-6 h-6 transition-colors ${
                    selectedCategory === category.name ? 'text-white' : 'text-teal-600 group-hover:text-white'
                  }`} />
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm ${selectedCategory === category.name ? 'text-white' : 'text-navy-900'}`}>
                    {category.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${selectedCategory === category.name ? 'text-teal-200' : 'text-navy-500'}`}>
                    {category.count} {language === 'es' ? 'articulos' : 'articles'}
                  </div>
                  <div className={`text-xs mt-1 leading-tight ${selectedCategory === category.name ? 'text-teal-100' : 'text-navy-400'}`}>
                    {category.examples}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="mt-6">
              <UrgentHelpBanner category={selectedCategory} />
            </div>
          )}
        </div>
      </section>

      <SafetyEscalationStrip />

      {searchQuery && (
        <section className="py-4 bg-teal-50 border-b border-teal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy-700">
                {t('ezreads.showingResults')}{' '}
                <span className="font-semibold">&ldquo;{searchQuery}&rdquo;</span>
                {selectedCategory && <span> {language === 'es' ? 'en' : 'in'} {selectedCategory}</span>}
                <span className="text-navy-500 ml-2">
                  ({filteredArticles.length}{' '}
                  {filteredArticles.length === 1
                    ? (language === 'es' ? 'articulo' : 'article')
                    : (language === 'es' ? 'articulos' : 'articles')})
                </span>
              </p>
              <button onClick={handleSearchClear} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t('ezreads.clearSearch')}
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <section className="py-24 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-navy-600">{t('ezreads.loadingArticles')}</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {!selectedCategory && !searchQuery && featuredArticle && (
            <section className="py-16 bg-navy-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-navy-900 mb-2">{t('ezreads.featuredArticle')}</h2>
                  <p className="text-navy-600">{t('ezreads.popularThisWeek')}</p>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-navy-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <img
                        src={getArticleImage(featuredArticle.image_url, featuredArticle.category)}
                        alt={featuredArticle.title}
                        loading="lazy"
                        onError={onArticleImageError(featuredArticle.category)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                          {featuredArticle.category}
                        </span>
                        {featuredArticle.jurisdiction && (
                          <span className="px-3 py-1 bg-navy-700/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {getJurisdictionName(featuredArticle.jurisdiction)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-8 lg:p-12 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-navy-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredArticle.read_time}
                        </div>
                        <span className="text-navy-300">|</span>
                        <span>
                          {new Date(featuredArticle.published_at).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        {featuredArticle.review_status === 'attorney_reviewed' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <ShieldCheck className="w-4 h-4" />
                              {t('ezreads.attorneyReviewed')}
                            </span>
                          </>
                        )}
                        {featuredArticle.review_status === 'official_sources' && (
                          <>
                            <span className="text-navy-300">|</span>
                            <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                              <Landmark className="w-4 h-4" />
                              {t('ezreads.officialSources')}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-3xl font-bold text-navy-900 mb-4 leading-tight">{featuredArticle.title}</h3>
                      <p className="text-lg text-navy-600 mb-4 leading-relaxed">{featuredArticle.excerpt}</p>
                      {!featuredArticle.jurisdiction && (
                        <p className="text-xs text-navy-400 mb-4 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t('ezreads.generalGuidance')}
                        </p>
                      )}
                      <button
                        onClick={() => openArticle(featuredArticle.slug)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors group w-fit"
                      >
                        {t('ezreads.readArticle')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-2">
                  {selectedCategory
                    ? selectedCategory
                    : searchQuery
                      ? t('ezreads.searchResults')
                      : t('ezreads.recentArticles')}
                </h2>
                <p className="text-navy-600">
                  {selectedCategory
                    ? `${filteredArticles.length} ${t('ezreads.articlesAbout')} ${selectedCategory.toLowerCase()}`
                    : searchQuery
                      ? `${filteredArticles.length} ${t('ezreads.articlesMatching')}`
                      : t('ezreads.latestGuides')}
                </p>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto text-navy-300 mb-4" />
                  <h3 className="text-xl font-semibold text-navy-900 mb-2">{t('ezreads.noArticles')}</h3>
                  <p className="text-navy-600 mb-6">
                    {searchQuery ? t('ezreads.noArticlesSearch') : t('ezreads.noArticlesCategory')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                    >
                      {t('ezreads.clearAllFilters')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(selectedCategory || searchQuery ? filteredArticles : regularArticles).map((article) => (
                    <article
                      key={article.id}
                      className="bg-white border border-navy-200 rounded-xl overflow-hidden hover:shadow-xl transition-all group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getArticleImage(article.image_url, article.category)}
                          alt={article.title}
                          loading="lazy"
                          onError={onArticleImageError(article.category)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-teal-600 text-xs font-semibold rounded-full">
                            {article.category}
                          </span>
                          {article.jurisdiction && (
                            <span className="px-2 py-1 bg-navy-800/80 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {getJurisdictionName(article.jurisdiction)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-navy-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.read_time}
                          </div>
                          {article.review_status === 'attorney_reviewed' && (
                            <>
                              <span className="text-navy-300">|</span>
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                {t('ezreads.attorneyReviewed')}
                              </span>
                            </>
                          )}
                          {article.review_status === 'official_sources' && (
                            <>
                              <span className="text-navy-300">|</span>
                              <span className="inline-flex items-center gap-1 text-teal-600 font-medium">
                                <Landmark className="w-3 h-3" />
                                {t('ezreads.officialSources')}
                              </span>
                            </>
                          )}
                        </div>
                        <details className="mb-3 text-xs text-navy-500">
                          <summary className="cursor-pointer select-none text-navy-500 hover:text-navy-700 list-none inline-flex items-center gap-1">
                            <span className="underline-offset-2 hover:underline">
                              {language === 'es' ? 'Detalles' : 'Details'}
                            </span>
                          </summary>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span>
                              {language === 'es' ? 'Publicado ' : 'Published '}
                              {new Date(article.published_at).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {article.updated_at !== article.published_at && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span>{formatUpdatedDate(article.updated_at, lang)}</span>
                              </>
                            )}
                            {article.jurisdiction && (
                              <>
                                <span className="text-navy-300">|</span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {getJurisdictionName(article.jurisdiction)}
                                </span>
                              </>
                            )}
                          </div>
                        </details>
                        <h3 className="text-xl font-bold text-navy-900 mb-3 leading-tight group-hover:text-teal-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-navy-600 mb-4 leading-relaxed text-sm">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => openArticle(article.slug)}
                            className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all"
                          >
                            {t('ezreads.readMore')}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <ShareButton
                            variant="compact"
                            context="article"
                            title={article.title}
                            url={`${window.location.origin}/ezreads#${article.slug}`}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <section className="py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-orange-200" />
          <h2 className="text-4xl font-bold mb-6">{t('ezreads.stayInformed')}</h2>
          <p className="text-xl text-navy-100 mb-8 max-w-2xl mx-auto">
            {t('ezreads.stayInformedDesc')}
          </p>
          {newsletterSubmitted ? (
            <p className="text-teal-300 font-medium">{lang === 'es' ? 'Gracias por suscribirte.' : 'Thank you for subscribing.'}</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail.includes('@')) {
                  supabase.from('email_captures').insert({ email: newsletterEmail, source: 'ezreads_newsletter', language: lang }).then(() => {});
                  setNewsletterSubmitted(true);
                }
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t('ezreads.enterEmail')}
                required
                className="flex-1 px-4 py-3 rounded-lg text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
              <button type="submit" className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap">
                {t('ezreads.subscribe')}
              </button>
            </form>
          )}
          <p className="text-navy-200 text-sm mt-4">{t('ezreads.freeResources')}</p>
        </div>
      </section>

      <RelatedLinks />
      <Footer />

      <ArticleModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedArticle(null); }}
        isLoading={isArticleLoading}
      />
    </div>
  );
}
