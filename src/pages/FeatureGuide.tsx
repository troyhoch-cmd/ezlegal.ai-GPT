import { MessageSquare, FileText, Search, Brain, Scale, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface Feature {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  bestFor: string[];
  examples: string[];
  actionUrl: string;
  color: string;
}

const features: Feature[] = [
  {
    id: 'chat',
    name: 'AI Legal Chat',
    icon: MessageSquare,
    description: 'Get instant answers to legal questions with AI-powered guidance',
    bestFor: [
      'Quick legal questions',
      'General guidance and explanations',
      'Understanding legal terms or processes',
      'Jurisdiction-specific information'
    ],
    examples: [
      '"What are my rights as a tenant in Arizona?"',
      '"Can my employer fire me for this reason?"',
      '"What does this legal term mean?"'
    ],
    actionUrl: '/chat',
    color: 'teal'
  },
  {
    id: 'documents',
    name: 'Document Generation',
    icon: FileText,
    description: 'Create professional legal documents using templates or AI',
    bestFor: [
      'Need forms or contracts',
      'Creating standard legal documents',
      'Templates for common situations',
      'Custom document generation'
    ],
    examples: [
      'LLC Formation Agreement',
      'Demand Letter',
      'Employment Agreement',
      'Non-Disclosure Agreement'
    ],
    actionUrl: '/dashboard/documents',
    color: 'blue'
  },
  {
    id: 'research',
    name: 'Legal Research',
    icon: Search,
    description: 'Search case law, statutes, and legal precedents',
    bestFor: [
      'Finding relevant cases',
      'Looking up statutes or regulations',
      'Understanding legal precedents',
      'Supporting your legal arguments'
    ],
    examples: [
      'Cases about wrongful termination',
      'Landlord-tenant law in your state',
      'Precedents for contract disputes'
    ],
    actionUrl: '/dashboard/research',
    color: 'purple'
  },
  {
    id: 'prediction',
    name: 'Case Predictor',
    icon: Brain,
    description: 'Estimate potential case outcomes based on similar cases',
    bestFor: [
      'Evaluating case strength',
      'Deciding whether to pursue legal action',
      'Understanding likelihood of success',
      'Settlement strategy planning'
    ],
    examples: [
      'Security deposit dispute chances',
      'Employment discrimination case strength',
      'Contract breach claim probability'
    ],
    actionUrl: '/case-predictor/start',
    color: 'amber'
  },
  {
    id: 'negotiation',
    name: 'Negotiation Planner',
    icon: Scale,
    description: 'Plan settlement strategies and negotiation tactics',
    bestFor: [
      'Planning settlement strategy',
      'Preparing for negotiations',
      'Understanding BATNA and ZOPA',
      'Structuring offers and counteroffers'
    ],
    examples: [
      'Debt settlement negotiation',
      'Landlord-tenant dispute resolution',
      'Insurance claim settlement'
    ],
    actionUrl: '/negotiate',
    color: 'green'
  }
];

const scenarios = [
  {
    situation: 'My landlord is keeping my security deposit unfairly',
    recommendation: 'Start with Chat to understand your rights, then use the Negotiation Planner to strategize your approach',
    features: ['chat', 'negotiation']
  },
  {
    situation: 'I need to create an LLC for my small business',
    recommendation: 'Use Document Generation to create formation documents, or Chat if you have questions first',
    features: ['documents', 'chat']
  },
  {
    situation: 'I think I have a discrimination case',
    recommendation: 'Start with Chat for general guidance, then use Case Predictor to evaluate your chances',
    features: ['chat', 'prediction']
  },
  {
    situation: 'I need to find cases similar to mine',
    recommendation: 'Use Legal Research to find relevant case law and precedents',
    features: ['research']
  }
];

export default function FeatureGuide() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20 pt-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-10 h-10 text-teal-400" />
            <h1 className="text-4xl font-bold">Which Feature Should I Use?</h1>
          </div>
          <p className="text-xl text-teal-100 text-center max-w-3xl mx-auto">
            Choose the right tool for your legal need. Each feature is designed for specific tasks.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-8">All Features Explained</h2>

          <div className="space-y-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const colorClasses = {
                teal: 'bg-teal-100 text-teal-700 border-teal-200',
                blue: 'bg-blue-100 text-blue-700 border-blue-200',
                purple: 'bg-purple-100 text-purple-700 border-purple-200',
                amber: 'bg-amber-100 text-amber-700 border-amber-200',
                green: 'bg-green-100 text-green-700 border-green-200'
              }[feature.color];

              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-xl border-2 border-navy-200 hover:border-teal-300 transition-all p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{feature.name}</h3>
                      <p className="text-navy-700 mb-4">{feature.description}</p>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2 text-sm">Best For:</h4>
                          <ul className="space-y-1">
                            {feature.bestFor.map((item, index) => (
                              <li key={index} className="text-sm text-navy-600 flex items-start gap-2">
                                <span className="text-teal-600 mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy-900 mb-2 text-sm">Examples:</h4>
                          <ul className="space-y-1">
                            {feature.examples.map((example, index) => (
                              <li key={index} className="text-sm text-navy-600 italic">
                                "{example}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <Link
                        to={feature.actionUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        Try {feature.name}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">Common Scenarios</h2>
          <p className="text-navy-600 mb-8">Not sure where to start? Here are some common situations and recommended features:</p>

          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="bg-white rounded-xl border border-navy-200 p-6">
                <h3 className="font-bold text-navy-900 mb-2">{scenario.situation}</h3>
                <p className="text-navy-700 mb-3">{scenario.recommendation}</p>
                <div className="flex flex-wrap gap-2">
                  {scenario.features.map((featureId) => {
                    const feature = features.find(f => f.id === featureId);
                    if (!feature) return null;
                    return (
                      <Link
                        key={featureId}
                        to={feature.actionUrl}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        {feature.name}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-50 to-navy-50 border-2 border-teal-200 rounded-2xl p-8 text-center">
            <HelpCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-navy-900 mb-3">Still Not Sure?</h2>
            <p className="text-navy-700 mb-6">
              Start with our AI Chat. It's free, fast, and can help guide you to the right tool for your specific situation.
            </p>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Start with Chat
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
