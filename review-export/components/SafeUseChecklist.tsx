import { ShieldAlert, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const doItems = [
  'Use general descriptions of your situation instead of exact names and addresses',
  'Confirm your state/jurisdiction so the AI can provide location-relevant information',
  'Verify AI-provided citations by checking the original statute or regulation',
  'Consult a licensed attorney before acting on any guidance for high-stakes matters',
  'Use the "Report Concern" tool if you receive information that seems wrong or biased',
  'Export or delete your data anytime from your Profile settings',
];

const dontItems = [
  'Share Social Security numbers, bank account numbers, or government ID numbers',
  'Upload unredacted documents containing sensitive personal identifiers',
  'Assume conversations are privileged -- they are not protected by attorney-client privilege',
  'Rely solely on AI for court filings, criminal defense, or immigration proceedings',
  'Share login credentials or access tokens in chat messages',
];

export default function SafeUseChecklist() {
  return (
    <section className="py-10 bg-navy-50 border-b border-navy-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900">Safe Use Checklist</h2>
            <p className="text-navy-600 text-sm">Protect yourself while using ezLegal.ai</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
            <div className="bg-green-50 px-5 py-3 border-b border-green-200">
              <h3 className="font-bold text-green-800 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Do
              </h3>
            </div>
            <ul className="p-5 space-y-3">
              {doItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-navy-700">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-5 py-3 border-b border-red-200">
              <h3 className="font-bold text-red-800 flex items-center gap-2">
                <X className="w-4 h-4" />
                Don't
              </h3>
            </div>
            <ul className="p-5 space-y-3">
              {dontItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-navy-700">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-red-600" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link
            to="/scope-disclaimers"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
          >
            Scope & Disclaimers
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            to="/emergency-resources"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
          >
            Emergency Resources
            <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            to="/how-reports-are-reviewed"
            className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold"
          >
            How Reports Are Reviewed
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
