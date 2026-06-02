import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, ExternalLink, MessageSquare, Search, FileText, Mail,
  Play, ChevronRight, Code2, Sparkles, CheckCircle2, ArrowRight,
  Globe, Users, Building2, Scale, Target, Shield, TrendingUp,
  BarChart3, AlertCircle
} from 'lucide-react';

interface WidgetDemoModalProps {
  onClose: () => void;
  initialWidget?: string;
}

const WIDGET_DEMOS = [
  {
    id: 'chat',
    name: 'AI Legal Assistant',
    icon: MessageSquare,
    description: 'Embed intelligent legal Q&A on your website',
    color: '#0067FF',
  },
  {
    id: 'negotiation_planner',
    name: 'Negotiation Planner',
    icon: Target,
    description: 'AI scripts for disputes and settlements',
    color: '#0891B2',
  },
  {
    id: 'outcome_predictor',
    name: 'Outcome Predictor',
    icon: BarChart3,
    description: 'Show case success likelihood with AI',
    color: '#059669',
  },
  {
    id: 'lawyer_search',
    name: 'Attorney Directory',
    icon: Search,
    description: 'Help visitors find the right attorney',
    color: '#0D9488',
  },
  {
    id: 'contact_form',
    name: 'Client Intake Form',
    icon: Mail,
    description: 'Streamlined case intake with AI triage',
    color: '#DC2626',
  },
  {
    id: 'document_analyzer',
    name: 'Document Analyzer',
    icon: FileText,
    description: 'Upload and analyze legal documents',
    color: '#475569',
  },
];

const WIDGET_TRUST_INFO: Record<string, {
  dataCollected: string;
  dataStored: string;
  retention: string;
  disclaimers: string;
  spanishReady: 'full' | 'partial' | 'ui-only';
  platforms: string[];
  setupTime: string;
}> = {
  chat: {
    dataCollected: 'Chat messages, selected jurisdiction, session metadata',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: '90 days for free users, 1 year for paid',
    disclaimers: 'Non-attorney legal information only. Not legal advice. No attorney-client privilege.',
    spanishReady: 'full',
    platforms: ['WordPress', 'Webflow', 'Squarespace', 'Custom HTML'],
    setupTime: '< 5 minutes',
  },
  negotiation_planner: {
    dataCollected: 'Dispute details, settlement parameters, strategy preferences',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: '1 year',
    disclaimers: 'AI-generated negotiation strategies. Not legal advice. Consult an attorney before signing.',
    spanishReady: 'full',
    platforms: ['WordPress', 'Webflow', 'Squarespace', 'Custom HTML'],
    setupTime: '< 5 minutes',
  },
  outcome_predictor: {
    dataCollected: 'Case type, jurisdiction, key factors',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: '1 year',
    disclaimers: 'Statistical estimates only. Not a guarantee of outcome. Consult an attorney.',
    spanishReady: 'partial',
    platforms: ['WordPress', 'Webflow', 'Squarespace', 'Custom HTML'],
    setupTime: '< 5 minutes',
  },
  lawyer_search: {
    dataCollected: 'Search criteria (practice area, location)',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: 'Search logs retained 30 days',
    disclaimers: 'Directory listing only. Not a referral or endorsement.',
    spanishReady: 'full',
    platforms: ['WordPress', 'Webflow', 'Squarespace', 'Custom HTML'],
    setupTime: '< 5 minutes',
  },
  contact_form: {
    dataCollected: 'Name, email, case description, jurisdiction',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: '1 year or until case resolved',
    disclaimers: 'Intake only. Does not create attorney-client relationship.',
    spanishReady: 'full',
    platforms: ['WordPress', 'Webflow', 'Squarespace', 'Custom HTML'],
    setupTime: '< 10 minutes',
  },
  document_analyzer: {
    dataCollected: 'Uploaded documents, analysis results',
    dataStored: 'Supabase (US-hosted, SOC 2 Type II)',
    retention: 'Documents deleted after 24 hours for free, 1 year for paid',
    disclaimers: 'AI analysis only. Not a substitute for attorney document review.',
    spanishReady: 'ui-only',
    platforms: ['WordPress', 'Webflow', 'Custom HTML'],
    setupTime: '< 10 minutes',
  },
};

export default function WidgetDemoModal({ onClose, initialWidget }: WidgetDemoModalProps) {
  const [activeWidget, setActiveWidget] = useState(initialWidget || 'chat');
  const [chatOpen, setChatOpen] = useState(true);
  const [demoMessages, setDemoMessages] = useState([
    { role: 'assistant', content: "Hello! I'm the Step Up to Justice AI assistant. How can I help you with your legal questions today?" },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setDemoMessages([
      ...demoMessages,
      { role: 'user', content: inputValue },
      { role: 'assistant', content: "Thank you for your question. Based on Arizona law, I can help guide you through this issue. Our attorneys at Step Up to Justice specialize in cases like yours. Would you like me to connect you with a pro bono attorney?" }
    ]);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="widget-demo-title">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-[#0067FF] to-[#0052CC] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h2 id="widget-demo-title" className="text-xl font-bold">See ezLegal.ai Widgets in Action</h2>
              <p className="text-blue-100 text-sm">Experience how our widgets transform any website</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close demo"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-80 bg-slate-50 border-r border-slate-200 p-4 flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 mb-1">Widget Types</h3>
              <p className="text-sm text-slate-600">Select a widget to see it in action</p>
            </div>

            <div className="space-y-2 flex-1">
              {WIDGET_DEMOS.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => setActiveWidget(widget.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    activeWidget === widget.id
                      ? 'bg-white shadow-md border-2 border-[#0067FF]'
                      : 'bg-white/50 border-2 border-transparent hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${widget.color}15` }}
                  >
                    <widget.icon className="w-5 h-5" style={{ color: widget.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${activeWidget === widget.id ? 'text-[#0067FF]' : 'text-slate-900'}`}>
                      {widget.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>
                  </div>
                  {activeWidget === widget.id && (
                    <ChevronRight className="w-4 h-4 text-[#0067FF] flex-shrink-0 mt-1" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold text-sm">Professional Plan</span>
                </div>
                <p className="text-xs text-emerald-100 mb-3">
                  Unlock unlimited widgets with full customization and analytics.
                </p>
                <a
                  href="/pricing"
                  className="flex items-center justify-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors"
                >
                  View Pricing
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">Live Demo: Step Up to Justice</h3>
                  <p className="text-sm text-slate-600">Interactive preview — try typing a question in the widget below</p>
                </div>
                <a
                  href="https://www.stepuptojustice.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#0067FF] hover:text-[#0052CC] font-medium"
                >
                  Visit Original Site
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="relative rounded-xl border-2 border-slate-200 overflow-hidden bg-white shadow-lg">
                <div className="bg-slate-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-slate-700 rounded-md px-4 py-1 text-xs text-slate-300 flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      stepuptojustice.org
                    </div>
                  </div>
                </div>

                <div className="relative h-[500px] bg-gradient-to-b from-slate-100 to-white overflow-hidden">
                  <div className="bg-[#1a365d] text-white">
                    <div className="bg-[#0067FF] px-4 py-2 text-xs text-center">
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        NEW: Free AI-powered legal assistance now available!
                        <button className="underline font-semibold">Try it now</button>
                      </span>
                    </div>

                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Scale className="w-8 h-8 text-yellow-400" />
                        <div>
                          <div className="font-bold text-lg">STEP UP TO JUSTICE</div>
                          <div className="text-xs text-slate-300">Free Legal Help for Arizonans</div>
                        </div>
                      </div>
                      <nav className="hidden md:flex items-center gap-6 text-sm">
                        <span className="hover:text-yellow-400 cursor-pointer">About Us</span>
                        <span className="hover:text-yellow-400 cursor-pointer">Services</span>
                        <span className="hover:text-yellow-400 cursor-pointer">Resources</span>
                        <span className="hover:text-yellow-400 cursor-pointer">Contact</span>
                        <button className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-400">
                          Get Help Now
                        </button>
                      </nav>
                    </div>
                  </div>

                  <div className="relative bg-gradient-to-br from-[#1a365d] to-[#2d3748] text-white px-8 py-12">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-bold mb-4">
                        Free Legal Help When You Need It Most
                      </h2>
                      <p className="text-slate-300 mb-6">
                        Step Up to Justice provides free legal assistance to Arizonans who cannot afford an attorney. Our volunteer lawyers help with housing, family, consumer, and civil matters.
                      </p>
                      <div className="flex gap-4">
                        <button className="bg-yellow-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Find a Lawyer
                        </button>
                        <button className="bg-white/10 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/20 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Our Services
                        </button>
                      </div>
                    </div>

                    <div className="absolute right-8 top-8 bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">5,000+</div>
                        <div className="text-sm text-slate-300">People Helped</div>
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-6">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: Scale, title: 'Free Consultations', desc: 'Talk to a real attorney' },
                        { icon: FileText, title: 'Document Review', desc: 'Get legal documents reviewed' },
                        { icon: Users, title: 'Pro Bono Network', desc: '200+ volunteer attorneys' },
                      ].map((item, i) => (
                        <div key={i} className="bg-slate-50 rounded-lg p-4 text-center">
                          <item.icon className="w-8 h-8 text-[#1a365d] mx-auto mb-2" />
                          <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                          <div className="text-xs text-slate-600">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeWidget === 'chat' && (
                    <div className="absolute bottom-4 right-4">
                      {chatOpen ? (
                        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                          <div className="bg-gradient-to-r from-[#0067FF] to-[#0052CC] text-white px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Scale className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-semibold text-sm">ezLegal.ai</div>
                                <div className="text-xs text-blue-100">by Legalbreeze®</div>
                              </div>
                            </div>
                            <button
                              onClick={() => setChatOpen(false)}
                              className="p-1 hover:bg-white/20 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="h-48 overflow-y-auto p-3 space-y-3 bg-slate-50">
                            {demoMessages.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                                    msg.role === 'user'
                                      ? 'bg-[#0067FF] text-white'
                                      : 'bg-white border border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-3 border-t border-slate-200 bg-white">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask a legal question..."
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0067FF]"
                              />
                              <button
                                onClick={handleSendMessage}
                                className="bg-[#0067FF] text-white px-3 py-2 rounded-lg hover:bg-[#0052CC]"
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setChatOpen(true)}
                          className="w-14 h-14 bg-gradient-to-r from-[#0067FF] to-[#0052CC] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform animate-in zoom-in duration-200"
                        >
                          <MessageSquare className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  )}

                  {activeWidget === 'negotiation_planner' && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          <span className="font-semibold text-sm">Negotiation Planner</span>
                        </div>
                        <p className="text-xs text-cyan-100 mt-1">AI-powered scripts for your dispute</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Dispute Type</label>
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                            <option>Landlord Dispute</option>
                            <option>Insurance Claim</option>
                            <option>Medical Bill</option>
                            <option>Debt Collection</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Your Goal</label>
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                            <option>Get Security Deposit Back</option>
                            <option>Reduce Amount Owed</option>
                            <option>Request Payment Plan</option>
                          </select>
                        </div>
                        <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-cyan-600" />
                            <span className="text-xs font-semibold text-cyan-800">What You Get</span>
                          </div>
                          <ul className="text-xs text-cyan-700 space-y-1">
                            <li className="flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3" /> Opening statement script
                            </li>
                            <li className="flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3" /> Counter-offer strategies
                            </li>
                          </ul>
                        </div>
                        <button className="w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-cyan-700 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Generate Strategy
                        </button>
                      </div>
                    </div>
                  )}

                  {activeWidget === 'outcome_predictor' && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          <span className="font-semibold text-sm">Outcome Predictor</span>
                        </div>
                        <p className="text-xs text-emerald-100 mt-1">AI analysis of case success factors</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-slate-600 mb-1 block">Case Type</label>
                          <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                            <option>Eviction Defense</option>
                            <option>Security Deposit</option>
                            <option>Wage Claim</option>
                            <option>Consumer Dispute</option>
                          </select>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-800">Predicted Outcome</span>
                            <span className="text-lg font-bold text-emerald-600">72%</span>
                          </div>
                          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                          </div>
                          <p className="text-xs text-emerald-700 mt-2">Favorable outcome likelihood based on similar Arizona cases</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Documentation strength</span>
                            <span className="font-medium text-emerald-600">Strong</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Timeline compliance</span>
                            <span className="font-medium text-emerald-600">Good</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Similar case wins</span>
                            <span className="font-medium text-slate-900">847 of 1,203</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">This is an estimate only. Consult an attorney for legal advice.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWidget === 'lawyer_search' && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Search className="w-5 h-5" />
                          <span className="font-semibold text-sm">Find an Attorney</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                          <option>Select Practice Area</option>
                          <option>Family Law</option>
                          <option>Housing / Landlord-Tenant</option>
                          <option>Consumer Protection</option>
                        </select>
                        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                          <option>Select Location</option>
                          <option>Phoenix</option>
                          <option>Tucson</option>
                          <option>Mesa</option>
                        </select>
                        <button className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-teal-700">
                          Search Attorneys
                        </button>
                      </div>
                    </div>
                  )}

                  {activeWidget === 'contact_form' && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5" />
                          <span className="font-semibold text-sm">Request Legal Help</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        />
                        <textarea
                          placeholder="Briefly describe your legal issue..."
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                        />
                        <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-red-700">
                          Submit Request
                        </button>
                      </div>
                    </div>
                  )}

                  {activeWidget === 'document_analyzer' && (
                    <div className="absolute bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          <span className="font-semibold text-sm">Document Analyzer</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 transition-colors cursor-pointer">
                          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-slate-700">Drop your document here</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, DOC, or DOCX up to 10MB</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 text-center">
                          AI-powered analysis of contracts, leases, and legal documents
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Code2 className="w-5 h-5 text-[#0067FF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Easy Integration</p>
                      <p className="text-xs text-slate-600">Single line of code</p>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2 overflow-x-auto">
                    <code className="text-xs text-green-400 whitespace-nowrap">
                      {'<script src="ezlegal.ai/widget.js"></script>'}
                    </code>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Full Customization</p>
                      <p className="text-xs text-slate-600">Match your brand</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['#0067FF', '#0891B2', '#059669', '#DC2626', '#475569'].map((color) => (
                      <div
                        key={color}
                        className="w-6 h-6 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Real-time Analytics</p>
                      <p className="text-xs text-slate-600">Track engagement</p>
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-8">
                    {[40, 60, 45, 80, 65, 90, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-amber-400 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {(() => {
                const trustInfo = WIDGET_TRUST_INFO[activeWidget];
                if (!trustInfo) return null;
                const activeDemo = WIDGET_DEMOS.find(w => w.id === activeWidget);
                return (
                  <div className="mt-6 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-5 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-slate-900 text-sm">Trust & Compliance Details</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        trustInfo.spanishReady === 'full' ? 'bg-green-100 text-green-700' :
                        trustInfo.spanishReady === 'partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        <Globe className="w-3 h-3" />
                        Spanish: {trustInfo.spanishReady === 'full' ? 'Full Support' : trustInfo.spanishReady === 'partial' ? 'Partial' : 'UI Only'}
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Collected</p>
                        <p className="text-sm text-slate-700">{trustInfo.dataCollected}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Data Storage</p>
                        <p className="text-sm text-slate-700">{trustInfo.dataStored}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Retention Policy</p>
                        <p className="text-sm text-slate-700">{trustInfo.retention}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Legal Boundaries</p>
                        <p className="text-sm text-slate-700">{trustInfo.disclaimers}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Supported Platforms</p>
                        <div className="flex flex-wrap gap-1">
                          {trustInfo.platforms.map((p) => (
                            <span key={p} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">{p}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Setup Time</p>
                        <p className="text-sm text-slate-700">{trustInfo.setupTime}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Ready to add AI-powered legal assistance to your website?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
            >
              Close Demo
            </button>
            <Link
              to="/schedule-demo"
              className="flex items-center gap-2 px-5 py-2 bg-white text-navy-700 border border-navy-300 font-semibold rounded-lg hover:bg-navy-50 transition-colors"
            >
              Request a Pilot
            </Link>
            <Link
              to="/dashboard/website-integration"
              className="flex items-center gap-2 px-5 py-2 bg-[#0067FF] text-white font-semibold rounded-lg hover:bg-[#0052CC] transition-colors"
            >
              Create Your Widget
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
