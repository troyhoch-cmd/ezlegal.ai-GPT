import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  MessageSquare, CheckCircle, Shield, ArrowRight,
  Users, FileText, Home, Briefcase, Car, Heart,
  Scale, Sparkles, Globe,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StandardDisclaimer } from '../components/templates/LegalDisclosureModule';
import TrustModule from '../components/templates/TrustModule';
import { useLanguage } from '../contexts/LanguageContext';
import { getAffordabilityMessage } from '../lib/microcopy';

const PRACTICE_AREAS = [
  {
    icon: Home,
    name: 'Housing & Tenant Rights',
    description: 'Eviction defense, lease disputes, security deposits, habitability issues',
    examples: ['My landlord is trying to evict me', 'How do I get my security deposit back?', 'Can my landlord enter without notice?']
  },
  {
    icon: Briefcase,
    name: 'Employment & Workplace',
    description: 'Wrongful termination, discrimination, wage theft, harassment',
    examples: ['Was I wrongfully terminated?', 'My employer owes me overtime', 'How do I file a discrimination complaint?']
  },
  {
    icon: Heart,
    name: 'Family Law',
    description: 'Divorce basics, custody questions, child support, domestic issues',
    examples: ['What are my rights in a divorce?', 'How is child support calculated?', 'What is the custody process?']
  },
  {
    icon: Car,
    name: 'Consumer Protection',
    description: 'Debt collection, lemon law, scams, credit disputes',
    examples: ['A debt collector is harassing me', 'I bought a defective car', 'How do I dispute a credit error?']
  },
  {
    icon: FileText,
    name: 'Contracts & Agreements',
    description: 'Understanding terms, breach of contract, negotiations',
    examples: ['Is this contract enforceable?', 'What happens if I break a lease?', 'Can I get out of this agreement?']
  },
  {
    icon: Scale,
    name: 'Small Claims & Civil',
    description: 'Filing claims, collecting judgments, court procedures',
    examples: ['How do I sue in small claims court?', 'What can I recover?', 'How do I collect a judgment?']
  },
];

export default function ForIndividuals() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedArea, setExpandedArea] = useState<number | null>(null);
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                  <Users className="w-4 h-4 text-teal-200" />
                  <span className="text-sm font-semibold">For Individuals</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                  Get Answers to Your
                  <span className="text-teal-200"> Legal Questions</span> Instantly
                </h1>
                <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                  Understanding your legal rights shouldn't require expensive consultations
                  or confusing research. Get clear guidance based on your state's laws, in plain
                  language - available 24/7.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/chat"
                    className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-bold hover:bg-teal-50 transition-all shadow-lg text-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start Free Chat
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-teal-400 transition-all border border-teal-400 text-lg"
                  >
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                <p className="text-teal-200 text-sm font-medium mb-6">
                  {getAffordabilityMessage('FREE_GUIDANCE', lang)}. {getAffordabilityMessage('LOW_COST_OPTIONS', lang)}.
                </p>

                <TrustModule signals={['NO_SIGNUP', 'AVAILABLE_24_7', 'SECURE']} variant="list" className="text-teal-100" />
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-navy-200">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-navy-200">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">AI Legal Assistant</p>
                      <p className="text-xs text-navy-500">Online now</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-navy-100 rounded-lg p-3 max-w-[85%]">
                      <p className="text-navy-700 text-sm">
                        My landlord just gave me 3 days to move out. Is this legal?
                      </p>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-3 max-w-[85%] ml-auto">
                      <p className="text-white text-sm">
                        I can help you understand your rights. First, what state do you live in?
                        Eviction notice requirements vary significantly by location.
                      </p>
                    </div>
                    <div className="bg-navy-100 rounded-lg p-3 max-w-[85%]">
                      <p className="text-navy-700 text-sm">California</p>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-3 max-w-[90%] ml-auto">
                      <p className="text-white text-sm">
                        In California, landlords must typically provide 30-60 days notice depending
                        on how long you've lived there. A 3-day notice is only valid for specific
                        reasons like unpaid rent. Let me explain your options...
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-navy-200">
                    <StandardDisclaimer variant="compact" />
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                  Response in 5 seconds
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-b border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">$350</div>
                <p className="text-navy-600 text-sm">Average hourly lawyer rate</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
                <p className="text-navy-600 text-sm">ezLegal.ai™ unlimited questions</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">5 sec</div>
                <p className="text-navy-600 text-sm">Average response time</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">24/7</div>
                <p className="text-navy-600 text-sm">Always available</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Common Legal Questions We Help With
              </h2>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                From everyday issues to complex situations, get clear guidance on the
                legal matters that affect your life
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRACTICE_AREAS.map((area, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-navy-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <button
                    onClick={() => setExpandedArea(expandedArea === index ? null : index)}
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <area.icon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-900 mb-1">{area.name}</h3>
                          <p className="text-sm text-navy-600">{area.description}</p>
                        </div>
                      </div>
                      {expandedArea === index ? (
                        <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {expandedArea === index && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="bg-navy-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">
                          Example Questions
                        </p>
                        <ul className="space-y-2">
                          {area.examples.map((example, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                              <MessageSquare className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                              <span>"{example}"</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/chat"
                          className="mt-4 inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:text-teal-700"
                        >
                          Ask about {area.name.toLowerCase()}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How ezLegal.ai™ Helps You</h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                Your personal legal front door - understand your situation before deciding next steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-teal-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">1</div>
                <h3 className="text-xl font-bold mb-3">Describe Your Situation</h3>
                <p className="text-navy-300">
                  Tell us what's happening in your own words. Our AI understands context
                  and asks clarifying questions to fully understand your situation.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">2</div>
                <h3 className="text-xl font-bold mb-3">Get Local Guidance</h3>
                <p className="text-navy-300">
                  Receive information tailored to your jurisdiction. Laws vary by location,
                  and our AI knows the differences that matter for your case.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">3</div>
                <h3 className="text-xl font-bold mb-3">Know Your Options</h3>
                <p className="text-navy-300">
                  Understand your rights, deadlines, and next steps. Generate documents,
                  or connect with a licensed attorney when needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Designed for Real Legal Challenges
              </h2>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                ezLegal.ai is built to help people navigate the legal situations that feel most overwhelming.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Housing & Eviction</h3>
                <p className="text-navy-700 mb-4">
                  Facing an eviction notice or landlord dispute? Get instant guidance on
                  your tenant rights, response deadlines, and next steps to protect your home.
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Free to ask unlimited questions</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Employment & Wages</h3>
                <p className="text-navy-700 mb-4">
                  Dealing with unpaid wages, wrongful termination, or workplace issues?
                  Understand your options and get help drafting demand letters.
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Attorney referrals when needed</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Family Law</h3>
                <p className="text-navy-700 mb-4">
                  Navigating divorce, custody, or support issues? Get clear explanations
                  of the process so you know what to expect at every step.
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>Compassionate, judgment-free help</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-lg text-navy-600">
                Start free, upgrade when you need more
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border-2 border-navy-200 p-8">
                <h3 className="text-xl font-bold text-navy-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-navy-900 mb-4">
                  $0
                  <span className="text-lg text-navy-500 font-normal">/month</span>
                </div>
                <p className="text-navy-600 mb-6">Unlimited questions forever</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Unlimited free questions</span>
                  </li>
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Basic legal information</span>
                  </li>
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Attorney directory access</span>
                  </li>
                </ul>
                <Link
                  to="/ask"
                  className="block w-full text-center bg-navy-100 hover:bg-navy-200 text-navy-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try Free
                </Link>
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-400 text-navy-900 px-3 py-1 rounded-full text-sm font-bold">
                  PAY AS NEEDED
                </div>
                <h3 className="text-xl font-bold mb-2">Issue Packs</h3>
                <div className="text-4xl font-bold mb-4">
                  $29-$49
                  <span className="text-lg text-teal-200 font-normal"> one-time</span>
                </div>
                <p className="text-teal-100 mb-6">When you need action plans</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Detailed action plan for your issue</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Document templates included</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Deadline checklists</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Jurisdiction-specific guidance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>Attorney referrals included</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="block w-full text-center bg-white hover:bg-teal-50 text-teal-600 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  View Issue Packs
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/pricing"
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                View all Issue Packs and pricing options
                <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Is ezLegal.ai™ a replacement for a lawyer?",
                  a: "No. We provide legal information to help you understand your situation, but we cannot provide legal advice or represent you. For complex matters, litigation, or when you need someone to act on your behalf, you'll need a licensed attorney. We can help you find one."
                },
                {
                  q: "How is this different from just Googling my legal question?",
                  a: "Our AI understands context, asks clarifying questions, and provides jurisdiction-specific information. Instead of sifting through generic articles, you get personalized guidance based on your specific situation and location."
                },
                {
                  q: "Is my information private?",
                  a: "Yes. We use TLS 1.3 + AES-256 encryption and never share or sell your data. Your conversations are not used to train AI models. However, since we're not a law firm, conversations are not protected by attorney-client privilege."
                },
                {
                  q: "What if I need an actual attorney?",
                  a: "We'll always tell you when your situation would benefit from professional representation. Our directory includes verified, bar-licensed attorneys you can contact directly."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Yes, cancel anytime with no penalties. If you're not satisfied, we offer a 30-day money-back guarantee."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-50 transition-colors"
                  >
                    <span className="font-semibold text-navy-900 pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-navy-50 border-t border-navy-200">
                      <p className="text-navy-600 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Understand Your Legal Situation?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Stop wondering and start getting answers. Our AI is ready to help you
              navigate your legal questions right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-bold hover:bg-teal-50 transition-all shadow-lg text-lg"
              >
                <MessageSquare className="w-5 h-5" />
                Start Free Chat Now
              </Link>
            </div>
            <p className="text-teal-200 text-sm mt-6">
              No account required | Answers in seconds | Free questions, always
            </p>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
