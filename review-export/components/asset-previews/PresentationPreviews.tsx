import {
  Scale, Users, BarChart3, ArrowRight, Shield, Zap,
  CheckCircle, Star, TrendingUp, Globe, Code,
  FileText, Building2, MessageSquare, Award
} from 'lucide-react';

export function PitchDeckPreview() {
  const slides = [
    {
      bg: 'bg-gradient-to-br from-[#0A1628] to-[#1a2d4a]',
      content: (
        <div className="text-center px-2">
          <Scale className="w-5 h-5 text-teal-400 mx-auto mb-1" />
          <p className="text-white font-bold text-[9px]">ezLegal.ai</p>
          <p className="text-teal-300 text-[7px]">Partner Program</p>
        </div>
      ),
      label: 'Title',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1">The Justice Gap</p>
          <p className="text-red-600 font-bold text-lg leading-none">80%</p>
          <p className="text-navy-400 text-[6px] mt-0.5">can't afford legal help</p>
        </div>
      ),
      label: 'Problem',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1.5">Our Solution</p>
          <div className="space-y-1">
            {['Self-Service', 'Guided Help', 'Attorney'].map((l, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span className="text-[6px] text-navy-600">{l}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      label: 'Solution',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1">Capabilities</p>
          <div className="grid grid-cols-2 gap-1">
            {[MessageSquare, FileText, Users, TrendingUp].map((Icon, i) => (
              <div key={i} className="bg-navy-50 rounded p-1 flex items-center justify-center">
                <Icon className="w-3 h-3 text-teal-600" />
              </div>
            ))}
          </div>
        </div>
      ),
      label: 'Platform',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1">Integration</p>
          <div className="space-y-1">
            {[
              { name: 'Widget', price: '$79' },
              { name: 'API', price: '$0.02' },
              { name: 'White Label', price: 'Custom' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[6px] text-navy-600">{t.name}</span>
                <span className="text-[6px] font-bold text-teal-600">{t.price}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      label: 'Pricing',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2 text-center">
          <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-navy-900 font-bold text-[8px]">Security</p>
          <p className="text-[6px] text-navy-400">SOC 2 + AES-256</p>
        </div>
      ),
      label: 'Security',
    },
    {
      bg: 'bg-green-50',
      content: (
        <div className="px-2 text-center">
          <p className="text-green-700 font-bold text-[8px]">Legal Aid</p>
          <p className="text-green-600 font-bold text-sm leading-none mt-0.5">FREE</p>
          <p className="text-[6px] text-green-600 mt-0.5">501(c)(3) orgs</p>
        </div>
      ),
      label: 'Legal Aid',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1">Impact</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[6px] text-navy-500">Partners</span>
              <span className="text-[7px] font-bold text-teal-600">50+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[6px] text-navy-500">Users/mo</span>
              <span className="text-[7px] font-bold text-teal-600">10K+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[6px] text-navy-500">After-hours</span>
              <span className="text-[7px] font-bold text-teal-600">67%</span>
            </div>
          </div>
        </div>
      ),
      label: 'Metrics',
    },
    {
      bg: 'bg-navy-50',
      content: (
        <div className="px-2">
          <Star className="w-3 h-3 text-amber-400 mb-1" />
          <p className="text-[6px] text-navy-600 italic leading-snug">"3x more families served"</p>
          <p className="text-[5px] text-navy-400 mt-0.5">-- CLS Arizona</p>
        </div>
      ),
      label: 'Story',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1.5">Get Started</p>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-teal-600 flex items-center justify-center">
                  <span className="text-white text-[5px] font-bold">{n}</span>
                </div>
                {n < 5 && <div className="w-2 h-px bg-teal-300" />}
              </div>
            ))}
          </div>
        </div>
      ),
      label: 'Process',
    },
    {
      bg: 'bg-gradient-to-br from-teal-600 to-teal-700',
      content: (
        <div className="text-center px-2">
          <p className="text-white font-bold text-[8px]">Let's Partner</p>
          <p className="text-teal-100 text-[6px] mt-0.5">ezlegal.ai/partners</p>
        </div>
      ),
      label: 'CTA',
    },
    {
      bg: 'bg-white',
      content: (
        <div className="px-2">
          <p className="text-navy-900 font-bold text-[8px] mb-1">Q&A</p>
          <div className="space-y-0.5">
            {['Legal advice?', 'Jurisdictions?', 'Data security?'].map((q, i) => (
              <p key={i} className="text-[5px] text-navy-400">{q}</p>
            ))}
          </div>
        </div>
      ),
      label: 'Appendix',
    },
  ];

  return (
    <div className="bg-navy-100 rounded-lg shadow-lg overflow-hidden border border-navy-200 p-5" style={{ maxWidth: 680 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-teal-600" />
          <span className="text-navy-900 font-bold text-xs">Partner Pitch Deck</span>
        </div>
        <span className="text-[10px] text-navy-400">{slides.length} slides</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {slides.map((slide, i) => (
          <div key={i} className="group">
            <div className={`${slide.bg} rounded-md shadow-sm border border-navy-200 aspect-[16/10] flex items-center justify-center overflow-hidden relative`}>
              {slide.content}
              <span className="absolute bottom-0.5 right-1 text-[5px] text-navy-300 font-medium">{i + 1}</span>
            </div>
            <p className="text-[8px] text-navy-500 text-center mt-1 font-medium">{slide.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ImpactReportPreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="flex">
        <div className="w-1/2 border-r border-navy-200">
          <div className="bg-gradient-to-br from-[#0A1628] to-teal-900 px-5 py-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Scale className="w-5 h-5 text-teal-400" />
                <span className="text-white font-bold text-[10px]">ezLegal.ai</span>
              </div>
              <p className="text-teal-300 text-[8px] uppercase tracking-widest font-bold mb-1">Impact Report</p>
              <h2 className="text-white font-bold text-base leading-tight">
                AI-Enhanced Legal Services
              </h2>
              <p className="text-navy-400 text-[10px] mt-2">
                [Organization Name]
              </p>
              <p className="text-navy-500 text-[9px] mt-1">
                Reporting Period: Q1 2026
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[8px] text-navy-500">Prepared in partnership with</span>
              <Scale className="w-3 h-3 text-teal-400" />
            </div>
          </div>
        </div>

        <div className="w-1/2 p-5">
          <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Key Metrics</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: 'Conversations', value: '2,847', change: '+34%' },
              { label: 'Unique Users', value: '1,203', change: '+28%' },
              { label: 'Spanish Users', value: '42%', change: '+5%' },
              { label: 'Referrals', value: '156', change: '+18%' },
            ].map((m, i) => (
              <div key={i} className="bg-navy-50 rounded-lg p-2">
                <p className="text-[7px] text-navy-400 uppercase font-medium">{m.label}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-bold text-navy-900 text-sm leading-none">{m.value}</span>
                  <span className="text-[8px] text-green-600 font-semibold">{m.change}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Top Practice Areas</p>
          <div className="space-y-1.5 mb-4">
            {[
              { area: 'Housing / Tenant Rights', pct: 38 },
              { area: 'Family Law', pct: 24 },
              { area: 'Employment', pct: 18 },
              { area: 'Immigration', pct: 12 },
              { area: 'Consumer Rights', pct: 8 },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[8px] text-navy-600 w-28 truncate">{p.area}</span>
                <div className="flex-1 bg-navy-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-[8px] font-bold text-navy-500 w-6 text-right">{p.pct}%</span>
              </div>
            ))}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-2.5">
            <Star className="w-3 h-3 text-teal-600 mb-1" />
            <p className="text-[8px] text-teal-700 italic leading-relaxed">
              "A single mother facing eviction used ezLegal.ai at 11pm to understand her rights. She successfully challenged an improper notice the next morning."
            </p>
            <p className="text-[7px] text-teal-500 mt-1">-- Anonymized Impact Story</p>
          </div>
        </div>
      </div>
    </div>
  );
}
