import { useState } from 'react';
import { FileText, ListChecks, BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface Source {
  title: string;
  url?: string;
  citation?: string;
  confidence?: number;
}

interface ActionStep {
  step: number;
  title: string;
  description: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface TabbedResponseProps {
  summary: string;
  actionSteps: ActionStep[];
  sources: Source[];
  fullContent?: string;
  jurisdiction?: string;
}

type TabId = 'summary' | 'actions' | 'sources';

export default function TabbedResponse({
  summary,
  actionSteps,
  sources,
  fullContent,
  jurisdiction,
}: TabbedResponseProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [showFullContent, setShowFullContent] = useState(false);

  const tabs: { id: TabId; label: string; icon: typeof FileText; count?: number }[] = [
    {
      id: 'summary',
      label: en ? 'Summary' : 'Resumen',
      icon: FileText,
    },
    {
      id: 'actions',
      label: en ? 'Action Steps' : 'Pasos a Seguir',
      icon: ListChecks,
      count: actionSteps.length,
    },
    {
      id: 'sources',
      label: en ? 'Sources' : 'Fuentes',
      icon: BookOpen,
      count: sources.length,
    },
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200" role="tablist" aria-label="Response sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all relative min-h-[44px] ${
                isActive
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-200 text-teal-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {activeTab === 'summary' && (
          <div
            role="tabpanel"
            id="panel-summary"
            aria-labelledby="tab-summary"
            className="animate-in fade-in duration-200"
          >
            {jurisdiction && (
              <div className="mb-3 px-3 py-1.5 bg-slate-100 rounded-lg inline-flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium">{en ? 'Jurisdiction:' : 'Jurisdicción:'}</span>
                {jurisdiction}
              </div>
            )}

            <div className="prose prose-sm max-w-none text-slate-700">
              <p className="leading-relaxed">{summary}</p>
            </div>

            {fullContent && fullContent !== summary && (
              <div className="mt-4">
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {showFullContent ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show less' : 'Mostrar menos'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      {en ? 'Show full response' : 'Mostrar respuesta completa'}
                    </>
                  )}
                </button>
                {showFullContent && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 animate-in slide-in-from-top-2 duration-200">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {fullContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div
            role="tabpanel"
            id="panel-actions"
            aria-labelledby="tab-actions"
            className="animate-in fade-in duration-200"
          >
            {actionSteps.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {en
                  ? 'No specific action steps identified for this query.'
                  : 'No se identificaron pasos de accion especificos para esta consulta.'}
              </p>
            ) : (
              <ol className="space-y-3">
                {actionSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-800">{step.title}</h4>
                        {step.priority && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(
                              step.priority
                            )}`}
                          >
                            {step.priority === 'high'
                              ? en
                                ? 'Urgent'
                                : 'Urgente'
                              : step.priority === 'medium'
                              ? en
                                ? 'Important'
                                : 'Importante'
                              : en
                              ? 'Suggested'
                              : 'Sugerido'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      {step.deadline && (
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          {en ? 'Deadline: ' : 'Fecha limite: '}
                          {step.deadline}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div
            role="tabpanel"
            id="panel-sources"
            aria-labelledby="tab-sources"
            className="animate-in fade-in duration-200"
          >
            {sources.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                {en
                  ? 'No specific sources available for this response.'
                  : 'No hay fuentes especificas disponibles para esta respuesta.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                  >
                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-slate-800 text-sm">{source.title}</p>
                        {source.confidence !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              source.confidence >= 0.8
                                ? 'bg-green-100 text-green-700'
                                : source.confidence >= 0.5
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {Math.round(source.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      {source.citation && (
                        <p className="text-xs text-slate-500 mt-1">{source.citation}</p>
                      )}
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1"
                        >
                          {en ? 'View source' : 'Ver fuente'}
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/how-it-works"
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                {en
                  ? 'Learn how we cite sources and verify information'
                  : 'Conozca como citamos fuentes y verificamos la información'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
