import {
  Scale, Code, Terminal, Globe, Shield, Lock, Award,
  CheckCircle, Copy, Settings, Smartphone, Monitor,
  ArrowRight, ExternalLink, Wifi, Database, Key,
  Eye, Fingerprint, Server, FileText, MousePointer
} from 'lucide-react';

export function TechGuidePreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="flex">
        <div className="w-40 bg-[#0A1628] py-4 px-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-5">
            <Scale className="w-4 h-4 text-teal-400" />
            <span className="text-white font-bold text-[10px]">ezLegal.ai</span>
          </div>
          <p className="text-[8px] text-navy-500 uppercase tracking-wider font-bold mb-2">Contents</p>
          {[
            { label: 'Widget Integration', active: false },
            { label: 'REST API Reference', active: true },
            { label: 'Authentication', active: false },
            { label: 'Error Handling', active: false },
            { label: 'Webhooks', active: false },
            { label: 'White-Label Config', active: false },
            { label: 'SDKs & Libraries', active: false },
            { label: 'Troubleshooting', active: false },
          ].map((item, i) => (
            <div key={i} className={`text-[9px] py-1.5 px-2 rounded mb-0.5 cursor-default ${
              item.active ? 'bg-teal-600/20 text-teal-400 font-semibold' : 'text-navy-400 hover:text-navy-300'
            }`}>
              {item.label}
            </div>
          ))}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded font-bold">API</span>
            <p className="text-[9px] text-navy-400">Technical Integration Guide</p>
          </div>
          <h3 className="text-navy-900 font-bold text-base mb-3">REST API Reference</h3>

          <div className="bg-navy-50 rounded-lg border border-navy-200 mb-4 overflow-hidden">
            <div className="px-3 py-1.5 bg-navy-100 border-b border-navy-200 flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-navy-500">Base URL</span>
            </div>
            <div className="px-3 py-2">
              <code className="text-[10px] font-mono text-teal-600">https://api.ezlegal.ai/v1</code>
            </div>
          </div>

          <p className="text-[9px] font-bold text-navy-500 mb-2">Endpoints</p>
          <div className="space-y-1 mb-4">
            {[
              { method: 'POST', path: '/chat/completions', desc: 'Send question, get AI response' },
              { method: 'GET', path: '/documents/{id}', desc: 'Retrieve documents' },
              { method: 'POST', path: '/documents/generate', desc: 'Generate legal docs' },
              { method: 'GET', path: '/jurisdictions', desc: 'List jurisdictions' },
              { method: 'POST', path: '/webhooks', desc: 'Register webhooks' },
              { method: 'GET', path: '/analytics/usage', desc: 'Query usage metrics' },
            ].map((ep, i) => (
              <div key={i} className="flex items-center gap-2 text-[9px]">
                <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                  ep.method === 'POST' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{ep.method}</span>
                <code className="font-mono text-navy-700">{ep.path}</code>
                <span className="text-navy-400">-- {ep.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-bold text-navy-500 mb-2">Example Request</p>
          <div className="bg-[#1a2332] rounded-lg p-3 overflow-hidden">
            <pre className="text-[8px] font-mono leading-relaxed">
              <span className="text-green-400">curl</span><span className="text-navy-400"> -X POST </span><span className="text-amber-300">https://api.ezlegal.ai/v1/chat/completions</span>{'\n'}
              <span className="text-navy-400">  -H </span><span className="text-amber-300">"Authorization: Bearer YOUR_KEY"</span>{'\n'}
              <span className="text-navy-400">  -H </span><span className="text-amber-300">"Content-Type: application/json"</span>{'\n'}
              <span className="text-navy-400">  -d </span><span className="text-teal-300">{'\'{"question": "Tenant rights in AZ?"}\''}</span>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetGuidePreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d4a] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">Widget Installation Guide</p>
          <p className="text-navy-400 text-[10px]">5-minute setup for any website platform</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </span>
        </div>
      </div>

      <div className="px-6 py-3 bg-teal-50 border-b border-teal-200 flex items-center gap-3">
        <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
        <p className="text-[10px] text-teal-700 font-medium">
          You need: Partner ID + admin access to your site + 5 minutes. No coding required.
        </p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {[
          {
            num: 1,
            title: 'Copy Your Embed Code',
            detail: 'Partner Dashboard > Settings > Widget > Embed Code',
            code: '<script src="https://widget.ezlegal.ai/v1/embed.js"\n  data-partner-id="YOUR_ID" async></script>',
          },
          {
            num: 2,
            title: 'Add to Your Website',
            detail: null,
            platforms: ['WordPress', 'Squarespace', 'Wix', 'Shopify', 'Custom HTML'],
          },
          {
            num: 3,
            title: 'Customize Appearance',
            detail: null,
            options: ['Primary Color', 'Position', 'Button Text', 'Welcome Message', 'Language'],
          },
        ].map((step) => (
          <div key={step.num} className="flex gap-3">
            <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{step.num}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-navy-900 text-xs">{step.title}</p>
              {step.detail && <p className="text-[10px] text-navy-500 mt-0.5">{step.detail}</p>}
              {step.code && (
                <div className="bg-[#1a2332] rounded-lg p-2 mt-2 flex items-start justify-between">
                  <pre className="text-[8px] font-mono text-teal-300 leading-relaxed">{step.code}</pre>
                  <Copy className="w-3 h-3 text-navy-500 flex-shrink-0 mt-0.5" />
                </div>
              )}
              {step.platforms && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {step.platforms.map((p, i) => (
                    <span key={i} className="text-[9px] px-2 py-1 bg-navy-100 rounded text-navy-600 font-medium">{p}</span>
                  ))}
                </div>
              )}
              {step.options && (
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {step.options.map((o, i) => (
                    <div key={i} className="text-center bg-navy-50 rounded px-1 py-1.5">
                      <Settings className="w-3 h-3 text-navy-400 mx-auto mb-0.5" />
                      <p className="text-[7px] text-navy-600 font-medium">{o}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-3">
          <div className="w-7 h-7 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">4</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-900 text-xs">Test Your Widget</p>
            <div className="mt-2 bg-navy-50 rounded-lg p-3 relative">
              <div className="flex items-center gap-2 text-[9px] text-navy-400">
                <Monitor className="w-3.5 h-3.5" /> <span>Your website</span>
              </div>
              <div className="absolute bottom-2 right-2 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <p className="text-[8px] text-navy-400 mt-4">Widget button appears here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SecurityWhitepaperPreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-[#0A1628] px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-6 h-6 text-teal-400" />
          <span className="text-white font-bold text-sm">ezLegal.ai</span>
        </div>
        <h2 className="text-white font-bold text-lg">Security & Compliance</h2>
        <p className="text-navy-400 text-xs mt-1">Whitepaper -- Enterprise Due Diligence</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          {[
            { icon: Award, label: 'SOC 2 Type II' },
            { icon: Lock, label: 'AES-256' },
            { icon: Globe, label: 'US Hosted' },
            { icon: Fingerprint, label: 'Zero Training' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-1 text-[9px] text-teal-300">
              <b.icon className="w-3 h-3" />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Infrastructure</p>
            <div className="space-y-1.5">
              {[
                { icon: Server, text: 'Supabase on AWS' },
                { icon: Globe, text: 'US-East (Virginia)' },
                { icon: Database, text: 'PostgreSQL 15 + RLS' },
                { icon: Wifi, text: 'Cloudflare CDN' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-navy-600">
                  <item.icon className="w-3 h-3 text-teal-600" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Encryption</p>
            <div className="space-y-1.5">
              {[
                { icon: Lock, text: 'AES-256 at rest' },
                { icon: Shield, text: 'TLS 1.3 in transit' },
                { icon: Key, text: 'bcrypt key hashing' },
                { icon: Eye, text: 'JWT + refresh rotation' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-navy-600">
                  <item.icon className="w-3 h-3 text-green-600" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Compliance Framework</p>
        <div className="grid grid-cols-5 gap-2 mb-5">
          {['SOC 2\nType II', 'CCPA\nCompliant', 'ABA\nGuidelines', 'WCAG\n2.1 AA', 'OWASP\nTop 10'].map((label, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <p className="text-[8px] text-green-700 font-semibold whitespace-pre-line leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Vendor Security Q&A (Sample)</p>
        <div className="space-y-1">
          {[
            { q: 'Encrypt data at rest?', a: 'Yes, AES-256' },
            { q: 'Support MFA?', a: 'Yes, TOTP-based' },
            { q: 'Where is data hosted?', a: 'US (AWS Virginia)' },
            { q: 'SOC 2 report available?', a: 'Yes, via Supabase' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-navy-50 rounded px-3 py-1.5">
              <span className="text-[9px] text-navy-600">{item.q}</span>
              <span className="text-[9px] font-semibold text-green-600">{item.a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingTemplatePreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-navy-200 rounded-t-lg px-3 py-1.5 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-2 py-0.5 flex items-center gap-1">
          <Lock className="w-2.5 h-2.5 text-green-600" />
          <span className="text-[8px] text-navy-400 font-mono">ezlegal.ai/p/your-partner</span>
        </div>
      </div>

      <div className="border-b border-navy-200 px-4 py-2 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-navy-300 rounded px-2 py-1 text-[8px] text-white font-bold">Partner Logo</div>
          <div className="w-px h-4 bg-navy-200" />
          <div className="flex items-center gap-1">
            <Scale className="w-3 h-3 text-teal-600" />
            <span className="font-bold text-navy-900 text-[9px]">ezLegal<span className="text-teal-600">.ai</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-navy-400">EN</span>
          <span className="text-[8px] text-teal-600 font-bold">ES</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0A1628] to-teal-900 px-6 py-6 text-center">
        <h2 className="text-white font-bold text-sm">[Partner Name] + ezLegal.ai</h2>
        <p className="text-teal-200 text-[10px] mt-1 max-w-xs mx-auto">
          Free Legal Information for Your Community -- Available 24/7 in English and Spanish
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="bg-teal-600 text-white text-[9px] px-3 py-1.5 rounded font-bold">Ask a Legal Question</span>
          <span className="border border-white/30 text-white text-[9px] px-3 py-1.5 rounded font-medium">Learn More</span>
        </div>
      </div>

      <div className="px-4 py-2 bg-navy-50 flex items-center justify-center gap-4 border-b border-navy-100">
        {[
          { icon: Award, label: 'SOC 2' },
          { icon: Lock, label: 'Encrypted' },
          { icon: Globe, label: 'Bilingual' },
        ].map((b, i) => (
          <span key={i} className="flex items-center gap-1 text-[8px] text-navy-400">
            <b.icon className="w-3 h-3" /> {b.label}
          </span>
        ))}
      </div>

      <div className="px-6 py-4">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider text-center mb-3">How It Works</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: MousePointer, title: 'Ask Your Question', desc: 'Type in English or Spanish' },
            { icon: Scale, title: 'Get AI Answer', desc: 'With statute citations' },
            { icon: FileText, title: 'Connect if Needed', desc: 'Attorney referral available' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <s.icon className="w-4 h-4 text-teal-600" />
              </div>
              <p className="text-[9px] font-bold text-navy-900">{s.title}</p>
              <p className="text-[8px] text-navy-400 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['Housing', 'Family Law', 'Employment', 'Immigration', 'Consumer', 'Small Claims'].map((area, i) => (
            <div key={i} className="bg-navy-50 rounded px-2 py-1.5 text-center">
              <p className="text-[9px] font-semibold text-navy-700">{area}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-2 bg-navy-50 border-t border-navy-100 text-center">
        <p className="text-[7px] text-navy-400">
          Legal information, not legal advice. Consult a licensed attorney for specific advice.
        </p>
      </div>
    </div>
  );
}
