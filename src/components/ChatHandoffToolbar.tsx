import { useState } from 'react';
import { Users, Scale, Download, FileText, Phone, Heart, AlertTriangle, MoreHorizontal, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatHandoffToolbarProps {
  onExportTranscript: () => void;
  onExportSummary: () => void;
  hasMessages: boolean;
}

export default function ChatHandoffToolbar({
  onExportTranscript,
  onExportSummary,
  hasMessages,
}: ChatHandoffToolbarProps) {
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  return (
    <aside
      className="border-t-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white"
      aria-label="Help and export options"
      role="complementary"
    >
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 truncate">
                <span className="hidden sm:inline">AI provides information, not legal advice</span>
                <span className="sm:hidden">Not legal advice</span>
              </span>
            </div>
            <a
              href="tel:988"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex-shrink-0"
              aria-label="Call 988 crisis line"
            >
              <Phone className="w-3 h-3" aria-hidden="true" />
              <span className="hidden sm:inline">Crisis:</span> 988
            </a>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <Link
              to="/emergency-resources"
              className="flex items-center gap-2 px-2 sm:px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 min-h-[44px]"
              aria-label="Access crisis resources"
            >
              <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                <Heart className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-red-700 group-hover:text-red-800 truncate">
                Crisis Help
              </span>
            </Link>

            <Link
              to="/pro-bono"
              className="flex items-center gap-2 px-2 sm:px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 min-h-[44px]"
              aria-label="Check eligibility for free legal aid"
            >
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-green-700 group-hover:text-green-800 truncate">
                <span className="hidden xs:inline sm:inline">Free Legal Aid</span>
                <span className="xs:hidden sm:hidden">Free Aid</span>
              </span>
            </Link>

            <Link
              to="/find-attorney"
              className="flex items-center gap-2 px-2 sm:px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 min-h-[44px]"
              aria-label="Find a lawyer"
            >
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <Scale className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800 truncate">
                Find Lawyer
              </span>
            </Link>

            <Link
              to="/how-it-works"
              className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all group focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 min-h-[44px]"
              aria-label="Learn how our AI works"
            >
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors flex-shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 truncate">
                How AI Works
              </span>
            </Link>

            {hasMessages && (
              <>
                <button
                  onClick={onExportSummary}
                  className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-300 transition-all group focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 min-h-[44px]"
                  aria-label="Export conversation summary"
                >
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-amber-700 group-hover:text-amber-800 truncate">
                    Summary
                  </span>
                </button>

                <button
                  onClick={onExportTranscript}
                  className="hidden sm:flex items-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all group focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 min-h-[44px]"
                  aria-label="Export full conversation transcript"
                >
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors flex-shrink-0">
                    <Download className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 truncate">
                    Transcript
                  </span>
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMoreOpen(true)}
              className="sm:hidden flex items-center gap-2 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all min-h-[44px]"
              aria-label="More options"
            >
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-slate-600 truncate">More</span>
            </button>
          </div>
        </div>
      </div>

      {mobileMoreOpen && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
          onClick={() => setMobileMoreOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full bg-white rounded-t-2xl p-4 pb-8 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">More options</h3>
              <button
                onClick={() => setMobileMoreOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/how-it-works"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[52px]"
              >
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-slate-500" aria-hidden="true" />
                </div>
                <span className="text-sm font-semibold text-slate-700">How AI Works</span>
              </Link>
              {hasMessages && (
                <>
                  <button
                    onClick={() => {
                      onExportSummary();
                      setMobileMoreOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl min-h-[52px] text-left"
                  >
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-amber-700">Export Summary</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportTranscript();
                      setMobileMoreOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl min-h-[52px] text-left"
                  >
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">Export Transcript</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
