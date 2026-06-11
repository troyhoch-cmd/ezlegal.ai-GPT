import { useEffect, useRef } from 'react';
import {
  X,
  Clock,
  User,
  Calendar,
  ArrowLeft,
  Share2,
  BookmarkPlus,
  MapPin,
  ShieldCheck,
  Landmark,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { getJurisdictionName } from '../data/jurisdictions';
import { useLanguage } from '../contexts/LanguageContext';
import SmartImage from './SmartImage';
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
  author_name: string;
  published_at: string;
  jurisdiction?: string | null;
  review_status?: string;
  sources?: string | null;
  updated_at?: string;
  last_reviewed_at?: string | null;
}

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ArticleModal({ article, isOpen, onClose, isLoading }: ArticleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const dateLocale = language === 'es' ? 'es-ES' : 'en-US';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('article.closeArticle')}
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          aria-label={t('article.closeArticle')}
        >
          <X className="w-5 h-5 text-navy-600" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-navy-600">{t('article.loading')}</p>
            </div>
          </div>
        ) : article ? (
          <>
            {(article.image_url || article.category) && (
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
                <SmartImage
                  src={getArticleImage(article.image_url, article.category)}
                  alt={article.title}
                  width={1200}
                  height={630}
                  priority
                  sizes="(min-width: 768px) 800px, 100vw"
                  className="w-full h-full object-cover"
                  onError={onArticleImageError(article.category)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-full">
                    {article.category}
                  </span>
                  {article.jurisdiction && (
                    <span className="px-3 py-1 bg-navy-700/80 backdrop-blur-sm text-white text-sm font-medium rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {getJurisdictionName(article.jurisdiction)}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 md:p-10">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-navy-500 hover:text-navy-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('article.backToArticles')}
              </button>

              <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-6 leading-tight">
                {article.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-navy-500 mb-4 pb-4 border-b border-navy-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {article.author_name}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.published_at)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {article.read_time}
                </div>
                <div className="flex-1" />
                <button className="flex items-center gap-2 px-3 py-1.5 text-navy-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                  {t('article.share')}
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-navy-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                  <BookmarkPlus className="w-4 h-4" />
                  {t('article.save')}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                {article.review_status === 'attorney_reviewed' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t('article.attorneyReviewed')}
                  </span>
                )}
                {article.review_status === 'official_sources' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-200">
                    <Landmark className="w-3.5 h-3.5" />
                    {t('article.officialSources')}
                  </span>
                )}
                {!article.jurisdiction && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 text-navy-600 text-xs font-medium rounded-full border border-navy-200">
                    <MapPin className="w-3.5 h-3.5" />
                    {t('article.generalGuidance')}
                  </span>
                )}
                {article.last_reviewed_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 text-navy-600 text-xs font-medium rounded-full border border-navy-200">
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t('article.lastReviewed')} {formatDate(article.last_reviewed_at)}
                  </span>
                )}
                {article.sources && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 text-navy-600 text-xs font-medium rounded-full border border-navy-200">
                    <FileText className="w-3.5 h-3.5" />
                    {article.sources}
                  </span>
                )}
              </div>

              <div
                className="max-w-none text-navy-700 leading-relaxed
                  [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy-900 [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy-900 [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_strong]:text-navy-900
                  [&_a]:text-teal-600 hover:[&_a]:underline
                  [&_blockquote]:border-l-4 [&_blockquote]:border-teal-600 [&_blockquote]:bg-teal-50 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-lg
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-12 pt-8 border-t border-navy-200">
                <div className="bg-teal-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">
                    {t('article.needGuidance')}
                  </h3>
                  <p className="text-navy-600 mb-4">
                    {t('article.aiCanHelp')}
                  </p>
                  <a
                    href="/chat"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    {t('article.askAiAssistant')}
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-xl text-navy-600 mb-4">{t('article.notFound')}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {t('article.goBack')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
