import { useState } from 'react';
import { ArrowRight, Check, Target, Clock, DollarSign } from 'lucide-react';

interface QuizResult {
  tactics: string[];
  description: string;
  priority: string;
}

const disputeTypes = [
  { id: 'landlord', label: 'Landlord/Tenant Dispute', example: 'Security deposit, repairs, eviction' },
  { id: 'wage', label: 'Unpaid Wages', example: 'Owed salary, overtime, benefits' },
  { id: 'debt', label: 'Debt Collection', example: 'Credit card, medical bills, collections' },
  { id: 'insurance', label: 'Insurance Claim', example: 'Denied claim, low settlement offer' },
  { id: 'contract', label: 'Contract Dispute', example: 'Breach of agreement, non-payment' },
  { id: 'consumer', label: 'Consumer Issue', example: 'Defective product, service complaint' },
];

const goals = [
  { id: 'settlement', label: 'Reach a Settlement', description: 'Get money or resolution' },
  { id: 'resolution', label: 'Resolve the Issue', description: 'Fix the problem, no money needed' },
  { id: 'information', label: 'Get Information', description: 'Understand options and rights' },
];

const timelines = [
  { id: 'immediate', label: 'Immediate', description: 'Urgent, need to act now' },
  { id: 'flexible', label: 'Flexible', description: 'Can take time to negotiate' },
];

const tacticRecommendations: Record<string, QuizResult> = {
  'landlord-settlement-immediate': {
    tactics: ['Anchoring with Documentation', 'Deadline Pressure', 'Walk-Away Power'],
    description: 'Your landlord dispute needs immediate resolution. Start with a strong, documented position using receipts and photos. Set a clear deadline and show willingness to escalate to small claims court.',
    priority: 'high'
  },
  'landlord-settlement-flexible': {
    tactics: ['Bracketing', 'Silence Technique', 'Written Documentation'],
    description: 'With time on your side, use measured negotiation. Propose conditional offers ("If you do X, I\'ll accept Y"). Let silence work for you after making offers.',
    priority: 'medium'
  },
  'wage-settlement-immediate': {
    tactics: ['Statutory Damages Leverage', 'Agency Escalation Threat', 'Documentation Package'],
    description: 'Unpaid wages have strong legal protections. Reference statutory damages (often 2-3x actual wages) and threaten Department of Labor complaint. Present complete documentation of hours and owed amounts.',
    priority: 'high'
  },
  'wage-settlement-flexible': {
    tactics: ['Interest Calculation', 'Good Faith Bargaining', 'Payment Plan Negotiation'],
    description: 'Calculate interest on unpaid wages. Propose payment plans. Show willingness to resolve without litigation while maintaining strong documentation.',
    priority: 'medium'
  },
  'debt-settlement-immediate': {
    tactics: ['Lump Sum Discount', 'Statute of Limitations Check', 'Validation Demand'],
    description: 'Debt collectors often settle for 30-50% if paid immediately. Check if debt is time-barred. Always demand validation before negotiating.',
    priority: 'high'
  },
  'debt-settlement-flexible': {
    tactics: ['Payment Plan Negotiation', 'Pay-for-Delete Strategy', 'Settlement in Writing'],
    description: 'Negotiate monthly payment plans or lump sum settlements. Request pay-for-delete (removal from credit report). Get everything in writing before paying.',
    priority: 'medium'
  },
  'insurance-settlement-immediate': {
    tactics: ['Comparable Claims Evidence', 'Bad Faith Threat', 'Public Adjuster Reference'],
    description: 'Insurance companies respond to comparable claims data and bad faith allegations. Consider mentioning public adjuster or attorney consultation.',
    priority: 'high'
  },
  'insurance-settlement-flexible': {
    tactics: ['Independent Appraisal', 'Bracketing Offers', 'Multiple Estimate Strategy'],
    description: 'Get multiple repair estimates. Use bracketing: "If you pay X, I\'ll accept Y." Request independent appraisal if disagreement persists.',
    priority: 'medium'
  },
  'contract-settlement-immediate': {
    tactics: ['Material Breach Documentation', 'Specific Performance Threat', 'Damages Calculation'],
    description: 'Document the breach clearly. Calculate actual damages (including consequential losses). Reference specific performance or breach of contract litigation.',
    priority: 'high'
  },
  'contract-settlement-flexible': {
    tactics: ['Modification Agreement', 'Mediation Proposal', 'Win-Win Solutions'],
    description: 'Propose contract modification rather than termination. Suggest mediation. Look for solutions that benefit both parties.',
    priority: 'medium'
  },
  'consumer-settlement-immediate': {
    tactics: ['Warranty Law Reference', 'BBB Complaint Threat', 'Chargeback Mention'],
    description: 'Reference implied warranties and consumer protection laws. Mention BBB complaint and credit card chargeback if applicable.',
    priority: 'high'
  },
  'consumer-settlement-flexible': {
    tactics: ['Replacement Negotiation', 'Store Credit Strategy', 'Management Escalation'],
    description: 'Negotiate for replacement product or store credit. Escalate through management levels. Document all communications.',
    priority: 'medium'
  }
};

interface Props {
  onComplete: (result: QuizResult) => void;
}

export default function NegotiationStrategyQuiz({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [disputeType, setDisputeType] = useState('');
  const [goal, setGoal] = useState('');
  const [timeline, setTimeline] = useState('');

  const handleComplete = () => {
    const key = `${disputeType}-${goal}-${timeline}`;
    const result = tacticRecommendations[key] || {
      tactics: ['Documentation', 'Clear Communication', 'Professional Persistence'],
      description: 'Your situation requires clear documentation, professional communication, and persistent follow-up. Consider consulting an attorney for specific guidance.',
      priority: 'medium'
    };
    onComplete(result);
  };

  return (
    <div className="bg-white rounded-xl border border-navy-200 p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-navy-900">Find Your Strategy</h3>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-1 rounded-full transition-colors ${
                  s <= step ? 'bg-teal-600' : 'bg-navy-200'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-navy-600">
          Answer 3 questions to get personalized negotiation tactics
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              What type of dispute do you have?
            </label>
            <div className="grid gap-3">
              {disputeTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setDisputeType(type.id);
                    setStep(2);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    disputeType === type.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-navy-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <div className="font-medium text-navy-900">{type.label}</div>
                  <div className="text-sm text-navy-600 mt-1">{type.example}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(1)}
            className="text-sm text-teal-600 hover:text-teal-700 mb-2"
          >
            &larr; Back
          </button>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" />
              What's your goal?
            </label>
            <div className="grid gap-3">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGoal(g.id);
                    setStep(3);
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    goal === g.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-navy-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <div className="font-medium text-navy-900">{g.label}</div>
                  <div className="text-sm text-navy-600 mt-1">{g.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(2)}
            className="text-sm text-teal-600 hover:text-teal-700 mb-2"
          >
            &larr; Back
          </button>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              What's your timeline?
            </label>
            <div className="grid gap-3">
              {timelines.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTimeline(t.id);
                    handleComplete();
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    timeline === t.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-navy-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  <div className="font-medium text-navy-900">{t.label}</div>
                  <div className="text-sm text-navy-600 mt-1">{t.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
