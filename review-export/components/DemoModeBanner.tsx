import { Eye, X, Lock, Map } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDemo } from '../contexts/DemoContext';
import { useState } from 'react';

const ROUTE_MAP = [
  {
    section: 'Public Pages',
    routes: [
      { path: '/', label: 'Home' },
      { path: '/features', label: 'Features' },
      { path: '/pricing', label: 'Pricing' },
      { path: '/about', label: 'About' },
      { path: '/contact', label: 'Contact' },
      { path: '/how-it-works', label: 'How It Works' },
      { path: '/ezreads', label: 'Legal Guides (EZReads)' },
      { path: '/find-attorney', label: 'Attorney Directory' },
      { path: '/negotiate', label: 'Negotiation Planner' },
      { path: '/ask', label: 'Ask (Free)' },
      { path: '/chatbot', label: 'AI Chatbot' },
      { path: '/espanol', label: 'Español Landing' },
    ],
  },
  {
    section: 'Trust & Safety',
    routes: [
      { path: '/trust-center', label: 'Trust Center' },
      { path: '/how-it-works', label: 'How AI Works' },
      { path: '/ai-governance', label: 'AI Governance' },
      { path: '/scope-disclaimers', label: 'Scope & Disclaimers' },
      { path: '/enterprise-security', label: 'Enterprise Security' },
      { path: '/how-reports-are-reviewed', label: 'How Reports Are Reviewed' },
      { path: '/emergency-resources', label: 'Emergency Resources' },
      { path: '/pro-bono', label: 'Pro Bono Intake' },
    ],
  },
  {
    section: 'Legal & Compliance',
    routes: [
      { path: '/terms', label: 'Terms of Service' },
      { path: '/privacy', label: 'Privacy Policy' },
      { path: '/accessibility', label: 'Accessibility Statement' },
    ],
  },
  {
    section: 'ICP Landing Pages',
    routes: [
      { path: '/for-individuals', label: 'For Individuals' },
      { path: '/for-business', label: 'For Business' },
      { path: '/for-organizations', label: 'For Organizations' },
      { path: '/for-partners', label: 'For Partners' },
      { path: '/partner-hub', label: 'Partner Hub' },
      { path: '/schedule-demo', label: 'Schedule Demo' },
      { path: '/media-kit', label: 'Media Kit' },
      { path: '/share-perspective', label: 'Share Perspective' },
    ],
  },
  {
    section: 'Authenticated - Dashboard',
    routes: [
      { path: '/dashboard', label: 'Dashboard Home' },
      { path: '/dashboard/ai-assistant', label: 'AI Lawyer Match' },
      { path: '/dashboard/history', label: 'Chat History' },
      { path: '/dashboard/documents', label: 'Documents' },
      { path: '/dashboard/research', label: 'Research' },
      { path: '/dashboard/cases', label: 'Cases' },
      { path: '/dashboard/matters', label: 'Matters' },
      { path: '/dashboard/clients', label: 'Clients' },
      { path: '/dashboard/lawyer-profiles', label: 'Lawyer Profiles' },
      { path: '/dashboard/profile', label: 'User Profile' },
      { path: '/dashboard/website-integration', label: 'Widget Integration' },
    ],
  },
  {
    section: 'Authenticated - Admin',
    routes: [
      { path: '/admin', label: 'Admin Panel' },
    ],
  },
  {
    section: 'LSO / Grant Reporting',
    routes: [
      { path: '/lso-dashboard', label: 'LSO Dashboard' },
      { path: '/grant-reporting', label: 'Grant Reporting' },
    ],
  },
];

export default function DemoModeBanner() {
  const { isDemoMode, exitDemo } = useDemo();
  const [showSiteMap, setShowSiteMap] = useState(false);
  const location = useLocation();

  if (!isDemoMode) return null;

  return (
    <>
      <div id="demo-banner-spacer" className="h-10" aria-hidden="true" />
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-amber-500 text-navy-900" role="status">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Eye className="w-4 h-4" />
              <span className="font-bold text-sm">AUDIT MODE</span>
            </div>
            <span className="text-sm hidden sm:inline">
              Read-only access for QA review. All authenticated routes are visible.
            </span>
            <div className="flex items-center gap-1 text-amber-800 flex-shrink-0">
              <Lock className="w-3 h-3" />
              <span className="text-xs font-medium">No data writes</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSiteMap(!showSiteMap)}
              className="flex items-center gap-1.5 bg-navy-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-navy-800 transition-colors"
            >
              <Map className="w-3 h-3" />
              Site Map
            </button>
            <button
              onClick={exitDemo}
              className="flex items-center gap-1 bg-navy-900/20 hover:bg-navy-900/30 px-2 py-1 rounded text-xs font-bold transition-colors"
              aria-label="Exit audit mode"
            >
              <X className="w-3 h-3" />
              Exit
            </button>
          </div>
        </div>
      </div>

      {showSiteMap && (
        <div className="fixed inset-0 z-[9999] bg-navy-900/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Complete Route Inventory</h2>
                <p className="text-sm text-navy-500">
                  {ROUTE_MAP.reduce((acc, s) => acc + s.routes.length, 0)} routes across {ROUTE_MAP.length} sections
                </p>
              </div>
              <button
                onClick={() => setShowSiteMap(false)}
                className="p-2 hover:bg-navy-100 rounded-lg transition-colors"
                aria-label="Close site map"
              >
                <X className="w-5 h-5 text-navy-500" />
              </button>
            </div>
            <div className="p-6 grid sm:grid-cols-2 gap-6">
              {ROUTE_MAP.map((section) => (
                <div key={section.section}>
                  <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide mb-3">
                    {section.section}
                  </h3>
                  <ul className="space-y-1">
                    {section.routes.map((route) => (
                      <li key={route.path}>
                        <Link
                          to={route.path}
                          onClick={() => setShowSiteMap(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            location.pathname === route.path
                              ? 'bg-teal-50 text-teal-700 font-semibold'
                              : 'text-navy-700 hover:bg-navy-50'
                          }`}
                        >
                          <span>{route.label}</span>
                          <code className="text-xs text-navy-400 font-mono">{route.path}</code>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
