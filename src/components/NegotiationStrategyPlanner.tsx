import { useState, useEffect } from 'react';
import {
  Scale, Target, TrendingUp, FileText, MessageSquare, AlertTriangle,
  ChevronRight, ChevronLeft, Check, Lightbulb, Shield,
  DollarSign, Clock, Copy, Brain,
  BarChart3, Crosshair, Building2, CreditCard,
  Car, Home, Briefcase, Calculator, Eye, EyeOff,
  Lock, Sparkles, ArrowRight, Star, Zap, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import NegotiationSafetyGate, { type SafetyData } from './NegotiationSafetyGate';
import NegotiationSendChecklist from './NegotiationSendChecklist';
import { US_STATES } from '../data/jurisdictions';

type Step = 'setup' | 'batna' | 'zopa' | 'strategy' | 'scripts' | 'tracker';

const PREMIUM_STEPS: Step[] = ['strategy', 'scripts', 'tracker'];

interface DisputeInfo {
  type: string;
  title: string;
  description: string;
  yourPosition: string;
  theirPosition: string;
  otherPartyName: string;
  otherPartyType: string;
  monetaryValue: number;
}

interface BatnaAnalysis {
  yourBatna: string;
  theirBatna: string;
  yourBatnaValue: number;
  theirBatnaValue: number;
  timePressureYou: 'low' | 'medium' | 'high';
  timePressureThem: 'low' | 'medium' | 'high';
  informationAdvantage: 'you' | 'them' | 'equal';
}

interface ZopaData {
  yourReservation: number;
  yourTarget: number;
  theirReservation: number;
  theirTarget: number;
}

interface NegotiationRound {
  party: 'you' | 'them';
  type: 'demand' | 'offer' | 'counter' | 'bracket';
  amount: number;
  bracketLow?: number;
  bracketHigh?: number;
  notes: string;
  timestamp: Date;
}

const DISPUTE_TYPES = [
  { id: 'landlord', name: 'Landlord or housing', icon: Home, scope: 'state' },
  { id: 'employer', name: 'Employer or wages', icon: Briefcase, scope: 'state' },
  { id: 'debt', name: 'Debt collection', icon: CreditCard, scope: 'state' },
  { id: 'insurance', name: 'Insurance claim', icon: Shield, scope: 'state' },
  { id: 'contract', name: 'Contract dispute', icon: FileText, scope: 'state' },
  { id: 'consumer', name: 'Consumer or business', icon: Building2, scope: 'state' },
  { id: 'auto', name: 'Auto accident', icon: Car, scope: 'state' },
  { id: 'irs', name: 'IRS or tax lien', icon: DollarSign, scope: 'federal' },
  { id: 'student_loans', name: 'Federal student loans', icon: Briefcase, scope: 'federal' },
  { id: 'ssa', name: 'Social Security / SSDI', icon: Shield, scope: 'federal' },
  { id: 'va', name: 'VA benefits', icon: Shield, scope: 'federal' },
  { id: 'immigration', name: 'Immigration fees or appeal', icon: FileText, scope: 'federal' },
  { id: 'other', name: 'Something else', icon: Scale, scope: 'other' },
];

const OTHER_PARTY_TYPES = [
  'Individual',
  'Small Business',
  'Corporation',
  'Insurance Company',
  'Collection Agency',
  'Landlord or Property Manager',
  'Employer or HR Department',
  'IRS / Tax Authority',
  'Department of Education / Loan Servicer',
  'Social Security Administration',
  'Department of Veterans Affairs',
  'USCIS / Immigration Agency',
  'Other Government Agency',
];

export default function NegotiationStrategyPlanner() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [showEducation, setShowEducation] = useState(true);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkPremiumAccess = async () => {
      if (!user) {
        setCheckingAccess(false);
        return;
      }

      const { data } = await supabase
        .from('negotiation_planner_purchases')
        .select('*')
        .eq('user_id', user.id)
        .or('plans_remaining.gt.0,plans_remaining.is.null')
        .maybeSingle();

      if (data) {
        setHasPremiumAccess(true);
      }
      setCheckingAccess(false);
    };

    checkPremiumAccess();
  }, [user]);

  const [safetyData, setSafetyData] = useState<SafetyData>({
    jurisdiction: '',
    safetyRisk: null,
    courtOrder: null,
    activeLawsuit: null,
  });

  const [dispute, setDispute] = useState<DisputeInfo>({
    type: '',
    title: '',
    description: '',
    yourPosition: '',
    theirPosition: '',
    otherPartyName: '',
    otherPartyType: '',
    monetaryValue: 0,
  });

  const [batna, setBatna] = useState<BatnaAnalysis>({
    yourBatna: '',
    theirBatna: '',
    yourBatnaValue: 0,
    theirBatnaValue: 0,
    timePressureYou: 'medium',
    timePressureThem: 'medium',
    informationAdvantage: 'equal',
  });

  const [zopa, setZopa] = useState<ZopaData>({
    yourReservation: 0,
    yourTarget: 0,
    theirReservation: 0,
    theirTarget: 0,
  });

  const [rounds, setRounds] = useState<NegotiationRound[]>([]);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const steps: { id: Step; name: string; icon: typeof Scale }[] = [
    { id: 'setup', name: 'Setup', icon: FileText },
    { id: 'batna', name: 'Leverage', icon: Scale },
    { id: 'zopa', name: 'Range', icon: Target },
    { id: 'strategy', name: 'Strategy', icon: Brain },
    { id: 'scripts', name: 'Scripts', icon: MessageSquare },
    { id: 'tracker', name: 'Track', icon: BarChart3 },
  ];

  const calculateLeverageScore = (): number => {
    let score = 50;

    if (batna.yourBatnaValue > batna.theirBatnaValue) score += 15;
    else if (batna.yourBatnaValue < batna.theirBatnaValue) score -= 15;

    if (batna.timePressureYou === 'low') score += 10;
    else if (batna.timePressureYou === 'high') score -= 10;

    if (batna.timePressureThem === 'high') score += 10;
    else if (batna.timePressureThem === 'low') score -= 10;

    if (batna.informationAdvantage === 'you') score += 10;
    else if (batna.informationAdvantage === 'them') score -= 10;

    return Math.max(0, Math.min(100, score));
  };

  const calculateZopa = () => {
    const zopaExists = zopa.yourReservation <= zopa.theirReservation;
    const zopaLow = zopaExists ? zopa.yourReservation : 0;
    const zopaHigh = zopaExists ? zopa.theirReservation : 0;
    const zopaSize = zopaHigh - zopaLow;

    return { zopaExists, zopaLow, zopaHigh, zopaSize };
  };

  const calculateAnchor = (): number => {
    const leverageScore = calculateLeverageScore();
    const { zopaExists } = calculateZopa();

    if (!zopaExists) return zopa.yourTarget * 1.3;

    if (leverageScore >= 70) {
      return zopa.yourTarget * 1.2;
    } else if (leverageScore >= 50) {
      return zopa.yourTarget * 1.1;
    } else {
      return zopa.yourTarget;
    }
  };

  const getMidpoint = (): number => {
    if (rounds.length < 2) return 0;

    const yourLastOffer = [...rounds].reverse().find(r => r.party === 'you');
    const theirLastOffer = [...rounds].reverse().find(r => r.party === 'them');

    if (!yourLastOffer || !theirLastOffer) return 0;

    return (yourLastOffer.amount + theirLastOffer.amount) / 2;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const renderSetupStep = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold text-stone-900 mb-4" id="dispute-type-label">What type of dispute are you negotiating?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup" aria-labelledby="dispute-type-label">
          {DISPUTE_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = dispute.type === type.id;
            return (
              <button
                key={type.id}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setDispute({ ...dispute, type: type.id })}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary-600' : 'text-stone-400'}`} aria-hidden="true" />
                <div className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-stone-700'}`}>
                  {type.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {dispute.type && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Give this dispute a name
              </label>
              <input
                type="text"
                value={dispute.title}
                onChange={(e) => setDispute({ ...dispute, title: e.target.value })}
                placeholder="e.g., Security deposit from ABC Apartments"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Amount in dispute (approximate)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="number"
                  value={dispute.monetaryValue || ''}
                  onChange={(e) => setDispute({ ...dispute, monetaryValue: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Who are you negotiating with?
              </label>
              <input
                type="text"
                value={dispute.otherPartyName}
                onChange={(e) => setDispute({ ...dispute, otherPartyName: e.target.value })}
                placeholder="Company or person's name"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                What type of entity?
              </label>
              <select
                value={dispute.otherPartyType}
                onChange={(e) => setDispute({ ...dispute, otherPartyType: e.target.value })}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select type...</option>
                {OTHER_PARTY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Briefly describe the situation
            </label>
            <textarea
              value={dispute.description}
              onChange={(e) => setDispute({ ...dispute, description: e.target.value })}
              placeholder="What happened? What are the key facts?"
              rows={3}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                What do YOU want out of this?
              </label>
              <textarea
                value={dispute.yourPosition}
                onChange={(e) => setDispute({ ...dispute, yourPosition: e.target.value })}
                placeholder="Your ideal outcome"
                rows={2}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                What do THEY want?
              </label>
              <textarea
                value={dispute.theirPosition}
                onChange={(e) => setDispute({ ...dispute, theirPosition: e.target.value })}
                placeholder="What they've said or offered"
                rows={2}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <NegotiationSafetyGate
            safetyData={safetyData}
            onChange={setSafetyData}
          />
        </>
      )}
    </div>
  );

  const renderBatnaStep = () => {
    const leverageScore = calculateLeverageScore();
    const selectedType = DISPUTE_TYPES.find(t => t.id === dispute.type);
    const isFederal = selectedType?.scope === 'federal';

    const yourExamples = isFederal
      ? 'e.g., Request an IRS installment agreement, appeal the decision, hire a tax pro...'
      : 'e.g., File in small claims, report to the state agency, walk away...';
    const theirExamples = isFederal
      ? 'e.g., Continue collection, garnish wages, place a lien...'
      : 'e.g., Defend a lawsuit, keep collecting, lose your business to you...';

    return (
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-semibold text-slate-900 mb-0.5">Your backup plan matters more than your offer.</p>
            <p>The side with the stronger plan B has the stronger hand. Write yours and theirs in plain words.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700">Y</span>
              Your backup plan
            </label>
            <p className="text-xs text-slate-500">If this negotiation falls apart, what will you do?</p>
            <textarea
              value={batna.yourBatna}
              onChange={(e) => setBatna({ ...batna, yourBatna: e.target.value })}
              placeholder={yourExamples}
              rows={4}
              className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-xs font-bold text-rose-700">T</span>
              Their backup plan
            </label>
            <p className="text-xs text-slate-500">If you walk away, what will they do?</p>
            <textarea
              value={batna.theirBatna}
              onChange={(e) => setBatna({ ...batna, theirBatna: e.target.value })}
              placeholder={theirExamples}
              rows={4}
              className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
        </div>

        <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden">
          <summary className="list-none cursor-pointer flex items-center justify-between px-4 py-3 hover:bg-slate-50">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Add leverage details (optional)
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="px-4 pb-4 pt-2 space-y-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">These sharpen your leverage score but aren't required.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Value of your backup plan ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="number"
                    value={batna.yourBatnaValue || ''}
                    onChange={(e) => setBatna({ ...batna, yourBatnaValue: Number(e.target.value) })}
                    placeholder="What you'd realistically get"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Cost to them if it fails ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="number"
                    value={batna.theirBatnaValue || ''}
                    onChange={(e) => setBatna({ ...batna, theirBatnaValue: Number(e.target.value) })}
                    placeholder="Legal fees, time, reputation"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />Your time pressure
                </label>
                <select
                  value={batna.timePressureYou}
                  onChange={(e) => setBatna({ ...batna, timePressureYou: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low - I can wait</option>
                  <option value="medium">Medium</option>
                  <option value="high">High - Need it soon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />Their time pressure
                </label>
                <select
                  value={batna.timePressureThem}
                  onChange={(e) => setBatna({ ...batna, timePressureThem: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low - They can wait</option>
                  <option value="medium">Medium</option>
                  <option value="high">High - Need it resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  <Eye className="w-3.5 h-3.5 inline mr-1" />Who knows more?
                </label>
                <select
                  value={batna.informationAdvantage}
                  onChange={(e) => setBatna({ ...batna, informationAdvantage: e.target.value as 'you' | 'them' | 'equal' })}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="you">I know more</option>
                  <option value="equal">About equal</option>
                  <option value="them">They know more</option>
                </select>
              </div>
            </div>
          </div>
        </details>

        <div className="bg-stone-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Your Leverage Score</h3>
            <div className="text-3xl font-bold">{leverageScore}/100</div>
          </div>
          <div className="w-full bg-stone-700 rounded-full h-4 mb-4" role="progressbar" aria-valuenow={leverageScore} aria-valuemin={0} aria-valuemax={100} aria-label={`Leverage score: ${leverageScore} out of 100`}>
            <div
              className={`h-4 rounded-full transition-all ${
                leverageScore >= 60 ? 'bg-green-500' : leverageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${leverageScore}%` }}
            />
          </div>
          <p className="text-stone-300 text-sm">
            {leverageScore >= 70 && "Strong position. You can negotiate aggressively and demand more. They need this deal more than you do."}
            {leverageScore >= 50 && leverageScore < 70 && "Balanced negotiation. Neither side has a clear advantage. Focus on finding creative solutions."}
            {leverageScore >= 30 && leverageScore < 50 && "Challenging position. Consider strengthening your backup plan before negotiating, or focus on non-monetary value."}
            {leverageScore < 30 && "Weak position. Focus on building rapport and finding interests you share. Consider whether a deal is worth it."}
          </p>
        </div>
      </div>
    );
  };

  const renderZopaStep = () => {
    const { zopaExists, zopaLow, zopaHigh, zopaSize } = calculateZopa();
    const recommendedAnchor = calculateAnchor();

    return (
      <div className="space-y-8">
        {showEducation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900">What is ZOPA?</h4>
                  <button
                    onClick={() => setShowEducation(false)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label="Hide ZOPA explanation"
                  >
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Zone Of Possible Agreement</strong> - the range where both parties can say yes.
                  It is the overlap between your minimum acceptable outcome and their maximum willingness to offer.
                  If there is no overlap, the negotiation cannot succeed without one side changing their position.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-sm text-primary-700">Y</span>
              Your Numbers
            </h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your TARGET (ideal outcome)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                <input
                  type="number"
                  value={zopa.yourTarget || ''}
                  onChange={(e) => setZopa({ ...zopa, yourTarget: Number(e.target.value) })}
                  placeholder="What you'd love to get"
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your RESERVATION (walk-away point)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                <input
                  type="number"
                  value={zopa.yourReservation || ''}
                  onChange={(e) => setZopa({ ...zopa, yourReservation: Number(e.target.value) })}
                  placeholder="Minimum you'll accept"
                  className="w-full pl-10 pr-4 py-3 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50"
                />
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Never reveal this number. It is your private floor.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center text-sm text-rose-700">T</span>
              Their Numbers (estimated)
            </h3>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Their TARGET (what they want to pay)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <input
                  type="number"
                  value={zopa.theirTarget || ''}
                  onChange={(e) => setZopa({ ...zopa, theirTarget: Number(e.target.value) })}
                  placeholder="What they'd love to pay"
                  className="w-full pl-10 pr-4 py-3 border-2 border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-rose-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Their RESERVATION (max they'll pay)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  type="number"
                  value={zopa.theirReservation || ''}
                  onChange={(e) => setZopa({ ...zopa, theirReservation: Number(e.target.value) })}
                  placeholder="Maximum they'll agree to"
                  className="w-full pl-10 pr-4 py-3 border-2 border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                />
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Your best estimate. Consider their alternatives and budget.
              </p>
            </div>
          </div>
        </div>

        {(zopa.yourReservation > 0 || zopa.theirReservation > 0) && (
          <div className="bg-stone-100 rounded-2xl p-6">
            <h3 className="font-bold text-stone-900 mb-4">Negotiation Range Visualization</h3>

            <div className="relative h-24 bg-white rounded-lg border border-stone-200 overflow-hidden" role="img" aria-label={`Negotiation range chart. Your range: $${zopa.yourReservation.toLocaleString()} to $${zopa.yourTarget.toLocaleString()}. Their range: $${zopa.theirTarget.toLocaleString()} to $${zopa.theirReservation.toLocaleString()}.${zopaExists ? ` Overlap zone: $${zopaLow.toLocaleString()} to $${zopaHigh.toLocaleString()}.` : ' No overlap.'}`}>
              <div className="absolute top-0 left-0 w-full h-full flex items-center px-4">
                {zopa.theirTarget > 0 && (
                  <div
                    className="absolute h-8 bg-rose-200 rounded"
                    style={{
                      left: `${(zopa.theirTarget / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`,
                      width: `${((zopa.theirReservation - zopa.theirTarget) / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`
                    }}
                  />
                )}

                {zopa.yourReservation > 0 && (
                  <div
                    className="absolute h-8 bg-green-200 rounded top-12"
                    style={{
                      left: `${(zopa.yourReservation / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`,
                      width: `${((zopa.yourTarget - zopa.yourReservation) / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`
                    }}
                  />
                )}

                {zopaExists && (
                  <div
                    className="absolute h-full bg-blue-500/20 border-x-2 border-blue-500"
                    style={{
                      left: `${(zopaLow / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`,
                      width: `${(zopaSize / Math.max(zopa.yourTarget, zopa.theirReservation) * 100)}%`
                    }}
                  />
                )}
              </div>

              <div className="absolute bottom-1 left-0 w-full flex justify-between text-xs text-stone-500 px-2">
                <span>${zopa.theirTarget?.toLocaleString() || '?'}</span>
                <span>${zopa.yourTarget?.toLocaleString() || '?'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm" aria-hidden="true">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-rose-200 rounded" />
                <span>Their range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded" />
                <span>Your range</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500/30 border border-blue-500 rounded" />
                <span>ZOPA (overlap)</span>
              </div>
            </div>
          </div>
        )}

        <div className={`rounded-2xl p-6 ${zopaExists ? 'bg-green-50 border border-green-200' : 'bg-rose-50 border border-rose-200'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${zopaExists ? 'bg-green-100' : 'bg-rose-100'}`}>
              {zopaExists ? <Check className="w-6 h-6 text-green-600" /> : <AlertTriangle className="w-6 h-6 text-rose-600" />}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${zopaExists ? 'text-green-900' : 'text-rose-900'}`}>
                {zopaExists ? 'ZOPA Exists - A Deal is Possible!' : 'No ZOPA - Gap Between Positions'}
              </h4>
              {zopaExists ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-green-800">
                    Settlement range: <strong>${zopaLow.toLocaleString()}</strong> to <strong>${zopaHigh.toLocaleString()}</strong>
                  </p>
                  <p className="text-sm text-green-800">
                    Zone size: <strong>${zopaSize.toLocaleString()}</strong>
                  </p>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                      <Crosshair className="w-4 h-4" />
                      Recommended Opening Anchor
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      ${recommendedAnchor.toLocaleString()}
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Based on your leverage score. Start high to give room to negotiate down.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-rose-800 mt-2">
                  Your minimum (${zopa.yourReservation.toLocaleString()}) is higher than their estimated maximum (${zopa.theirReservation.toLocaleString()}).
                  Either lower your expectations, improve their offer through persuasion, or consider your BATNA.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStrategyStep = () => {
    const leverageScore = calculateLeverageScore();
    const { zopaExists, zopaLow, zopaHigh } = calculateZopa();
    const recommendedAnchor = calculateAnchor();

    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Crosshair className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-primary-900">Anchoring Strategy</h3>
                <p className="text-xs text-primary-700">Your opening move sets the tone</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-sm text-stone-600">Your Opening Anchor</div>
                <div className="text-2xl font-bold text-primary-700">${recommendedAnchor.toLocaleString()}</div>
              </div>
              <p className="text-sm text-primary-800">
                <strong>Why this number?</strong> Research shows the first number mentioned heavily influences
                the final outcome. Start ambitiously (but defensibly) to maximize your result.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Concession Pattern</h3>
                <p className="text-xs text-amber-700">How to move from your anchor</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">1</span>
                <span>First concession: Move 20-30% of the gap</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">2</span>
                <span>Second concession: Move 15-20%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">3</span>
                <span>Third concession: Move 10%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">4</span>
                <span>Final: Small moves signal you are near limit</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-900 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Your Personalized Strategy
          </h3>

          <div className="space-y-4">
            {leverageScore >= 60 && (
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-700">
                <h4 className="font-semibold text-green-400 mb-2">Power Position Tactics</h4>
                <ul className="space-y-2 text-sm text-green-100">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Make them come to you. Let them make the first move after your anchor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Use silence. After making an offer, wait. Do not fill the silence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Be willing to walk away. Your strong BATNA gives you this power.</span>
                  </li>
                </ul>
              </div>
            )}

            {leverageScore < 60 && leverageScore >= 40 && (
              <div className="p-4 bg-amber-900/30 rounded-lg border border-amber-700">
                <h4 className="font-semibold text-amber-400 mb-2">Balanced Negotiation Tactics</h4>
                <ul className="space-y-2 text-sm text-amber-100">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Focus on interests, not positions. What do they REALLY need?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Create value by exploring trade-offs (timing, payment terms, other items).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Use "what if" questions to test boundaries without committing.</span>
                  </li>
                </ul>
              </div>
            )}

            {leverageScore < 40 && (
              <div className="p-4 bg-rose-900/30 rounded-lg border border-rose-700">
                <h4 className="font-semibold text-rose-400 mb-2">Underdog Tactics</h4>
                <ul className="space-y-2 text-sm text-rose-100">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Build rapport first. People give better deals to people they like.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Find their pain points. What problems can YOU solve for them?</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Consider improving your BATNA before negotiating (get competing offers).</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h4 className="font-semibold text-blue-400 mb-2">Bracketing Tactic</h4>
              <p className="text-sm text-blue-100 mb-3">
                If negotiations stall, use a bracket: "If you can move to $X, I could accept $Y."
              </p>
              {zopaExists && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <div className="text-xs text-blue-300">Ask them to move to</div>
                    <div className="text-lg font-bold text-blue-200">
                      ${Math.round(zopaHigh - (zopaHigh - zopaLow) * 0.25).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <div className="text-xs text-blue-300">You'd accept</div>
                    <div className="text-lg font-bold text-blue-200">
                      ${Math.round(zopaLow + (zopaHigh - zopaLow) * 0.25).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
          <h3 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Watch Out For These Tactics
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Lowball Offer', response: 'Do not counter immediately. Express disappointment and ask them to justify it.' },
              { name: 'Good Cop/Bad Cop', response: 'Negotiate with the company, not individuals. Ask for one spokesperson.' },
              { name: 'Artificial Deadline', response: 'Real deadlines exist. Ask them to explain in writing why the deadline is fixed.' },
              { name: '"Take It or Leave It"', response: 'Call the bluff. "Final" offers rarely are. Ask if they can check with someone higher.' },
            ].map((tactic, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-rose-200">
                <h4 className="font-semibold text-rose-800">{tactic.name}</h4>
                <p className="text-sm text-rose-700 mt-1">{tactic.response}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderScriptsStep = () => {
    const scripts = getScriptsForDispute();

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-600">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Legal information, not legal advice.</strong> These scripts are educational templates.
            Customize them for your situation and consider having an attorney review before sending for high-stakes matters.
            {jurisdictionName && <span className="ml-1">Jurisdiction: <strong>{jurisdictionName}</strong>.</span>}
          </span>
          <Link to="/scope-disclaimers" className="text-teal-600 hover:text-teal-700 whitespace-nowrap ml-auto font-medium">
            Learn more
          </Link>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-bold text-primary-900">Ready-to-Use Scripts</h3>
              <p className="text-sm text-primary-800 mt-1">
                These scripts are based on tactics used by AmLaw 100 attorneys. Customize the placeholders
                with your specific details, then copy and send.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {scripts.map((script, index) => (
            <div key={index} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">{script.title}</h4>
                  <p className="text-xs text-stone-500">{script.type}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(script.content, `script-${index}`)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                >
                  {copiedScript === `script-${index}` ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm text-stone-700 leading-relaxed">
                  {script.content}
                </pre>
              </div>
              {script.psychology && (
                <div className="p-4 bg-amber-50 border-t border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">{script.psychology}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <NegotiationSendChecklist jurisdiction={jurisdictionName} />
      </div>
    );
  };

  const getScriptsForDispute = () => {
    const commonScripts = [
      {
        title: 'Opening Demand',
        type: 'Use this to start the negotiation',
        content: `Dear ${dispute.otherPartyName || '[Other Party]'},

I am writing regarding ${dispute.title || '[dispute description]'}.

After careful review of the facts and applicable law, I am formally demanding ${formatCurrency(calculateAnchor())} to resolve this matter.

This amount is justified because:
1. ${dispute.yourPosition || '[Your position/reasoning]'}
2. The strength of my legal position
3. The cost you would incur defending this matter

I am prepared to discuss this in good faith, but I am also prepared to pursue all available remedies if we cannot reach a reasonable resolution.

Please respond within 10 business days.

Sincerely,
[Your Name]`,
        psychology: 'The first number mentioned heavily influences the final outcome. By anchoring high with justification, you set the frame for the entire negotiation.'
      },
      {
        title: 'Response to Lowball Offer',
        type: 'When they come back way under your number',
        content: `Thank you for your response.

Unfortunately, ${formatCurrency(zopa.theirTarget || 0)} does not reflect a serious attempt to resolve this matter.

Based on [applicable law/facts/precedent], the appropriate range is ${formatCurrency(zopa.yourReservation)} to ${formatCurrency(zopa.yourTarget)}.

I remain willing to negotiate in good faith. However, if you are not authorized to make a meaningful offer, please connect me with someone who is.

My counter-offer is ${formatCurrency(Math.round(calculateAnchor() * 0.9))}.`,
        psychology: 'Never counter a lowball immediately. First, name it as inadequate, then establish the proper range, then make your counter. This shows you will not be pushed around.'
      },
      {
        title: 'Bracketing Proposal',
        type: 'Use when negotiations are stalling',
        content: `I understand we see this differently. Let me propose a framework:

If you are willing to move to ${formatCurrency(zopa.theirReservation || Math.round(calculateAnchor() * 0.7))}, I would be willing to accept ${formatCurrency(zopa.yourReservation || Math.round(calculateAnchor() * 0.6))}.

This bracket represents where I believe a reasonable settlement falls given the facts and law involved.

What can you agree to within this range?`,
        psychology: 'Bracketing signals where you expect to end up while giving them a target to hit. Most settlements land near the midpoint of a well-constructed bracket.'
      },
    ];

    return commonScripts;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderTrackerStep = () => {
    const midpoint = getMidpoint();
    const [newRound, setNewRound] = useState<Partial<NegotiationRound>>({
      party: 'them',
      type: 'offer',
      amount: 0,
      notes: '',
    });

    const addRound = () => {
      if (newRound.amount && newRound.amount > 0) {
        setRounds([
          ...rounds,
          {
            ...newRound,
            timestamp: new Date(),
          } as NegotiationRound
        ]);
        setNewRound({ party: newRound.party === 'you' ? 'them' : 'you', type: 'counter', amount: 0, notes: '' });
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-stone-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Negotiation Tracker</h3>
            {midpoint > 0 && (
              <div className="text-right">
                <div className="text-xs text-stone-400">Current Midpoint</div>
                <div className="text-2xl font-bold text-green-400">{formatCurrency(midpoint)}</div>
              </div>
            )}
          </div>

          {rounds.length > 0 && (
            <div className="mb-6">
              <div className="h-32 flex items-end gap-1" role="img" aria-label={`Negotiation tracker chart with ${rounds.length} rounds`}>
                {rounds.map((round, i) => {
                  const maxAmount = Math.max(...rounds.map(r => r.amount));
                  const height = (round.amount / maxAmount) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center"
                      aria-label={`Round ${i + 1}: ${round.party === 'you' ? 'Your' : 'Their'} ${round.type} of ${formatCurrency(round.amount)}`}
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          round.party === 'you' ? 'bg-green-500' : 'bg-rose-500'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-stone-400 mt-1" aria-hidden="true">R{i + 1}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs" aria-hidden="true">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-stone-400">Your offers</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-rose-500 rounded" />
                  <span className="text-stone-400">Their offers</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-stone-400 mb-1">Who made the offer?</label>
                <select
                  value={newRound.party}
                  onChange={(e) => setNewRound({ ...newRound, party: e.target.value as 'you' | 'them' })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm"
                >
                  <option value="you">You</option>
                  <option value="them">Them</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Type</label>
                <select
                  value={newRound.type}
                  onChange={(e) => setNewRound({ ...newRound, type: e.target.value as NegotiationRound['type'] })}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm"
                >
                  <option value="demand">Initial Demand</option>
                  <option value="offer">Offer</option>
                  <option value="counter">Counter-Offer</option>
                  <option value="bracket">Bracket</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Amount</label>
                <input
                  type="number"
                  value={newRound.amount || ''}
                  onChange={(e) => setNewRound({ ...newRound, amount: Number(e.target.value) })}
                  placeholder="$0"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addRound}
                  className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
                >
                  Add Round
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Notes</label>
              <input
                type="text"
                value={newRound.notes}
                onChange={(e) => setNewRound({ ...newRound, notes: e.target.value })}
                placeholder="What did they say? Any tactics you noticed?"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>
        </div>

        {rounds.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900">Negotiation History</h4>
            {rounds.map((round, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border-2 ${
                  round.party === 'you'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      round.party === 'you' ? 'bg-green-200 text-green-800' : 'bg-rose-200 text-rose-800'
                    }`}>
                      {round.party === 'you' ? 'Y' : 'T'}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">
                        Round {i + 1}: {round.party === 'you' ? 'Your' : 'Their'} {round.type}
                      </div>
                      <div className="text-sm text-stone-500">
                        {round.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    round.party === 'you' ? 'text-green-700' : 'text-rose-700'
                  }`}>
                    {formatCurrency(round.amount)}
                  </div>
                </div>
                {round.notes && (
                  <p className="mt-2 text-sm text-stone-600 pl-11">{round.notes}</p>
                )}
              </div>
            ))}

            {rounds.length >= 2 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calculator className="w-5 h-5" />
                  <span className="font-semibold">Analysis</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Current midpoint: {formatCurrency(midpoint)}.
                  {midpoint > zopa.yourReservation
                    ? ` This is above your reservation point of ${formatCurrency(zopa.yourReservation)}. You're in good shape.`
                    : ` This is below your reservation point. Consider whether to continue or walk away.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {rounds.length === 0 && (
          <div className="text-center py-12 text-stone-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rounds recorded yet. Add offers as your negotiation progresses.</p>
          </div>
        )}
      </div>
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'setup':
        return dispute.type && dispute.title && dispute.monetaryValue > 0
          && safetyData.jurisdiction
          && safetyData.safetyRisk !== null
          && safetyData.courtOrder !== null
          && safetyData.activeLawsuit !== null;
      case 'batna':
        return batna.yourBatna || batna.yourBatnaValue > 0;
      case 'zopa':
        return zopa.yourReservation > 0 && zopa.yourTarget > 0;
      default:
        return true;
    }
  };

  const jurisdictionName = US_STATES.find(s => s.code === safetyData.jurisdiction)?.name || '';

  const nextStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      const nextStepId = steps[stepIndex + 1].id;
      if (PREMIUM_STEPS.includes(nextStepId) && !hasPremiumAccess) {
        setShowPaywall(true);
        return;
      }
      setCurrentStep(nextStepId);
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  const renderPaywallModal = () => (
    <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/10 rounded-full -ml-16 -mb-16" />

        <div className="relative">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
          </div>

          <h2 id="paywall-title" className="text-2xl font-bold text-stone-900 text-center mb-2">
            Unlock Your Complete Strategy
          </h2>

          <p className="text-stone-600 text-center mb-6">
            You've analyzed your situation. Now get the personalized scripts and tactics to win your negotiation.
          </p>

          <div className="bg-stone-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-stone-900">What you'll unlock:</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>AI-calculated opening anchor amount & rationale</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Copy-ready demand letter & email scripts</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Counter-offer response templates</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Phone call scripts & power phrases</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-stone-700">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Live negotiation tracker</span>
              </li>
            </ul>
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-stone-900">$49</span>
              <span className="text-stone-500">one-time</span>
            </div>
            <p className="text-sm text-stone-500">Worth $500+ in attorney consultation fees</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/pricing#individuals"
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-400 text-stone-900 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              Get Strategy Planner
              <ArrowRight className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setShowPaywall(false)}
              className="w-full py-3 text-stone-500 hover:text-stone-700 font-medium transition-colors"
            >
              Continue with free analysis
            </button>
          </div>

          <p className="text-xs text-stone-400 text-center mt-4">
            <Lock className="w-3 h-3 inline mr-1" />
            Secure payment via Stripe. Your data stays private.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {showPaywall && renderPaywallModal()}

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Negotiation planner steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isPast = steps.findIndex(s => s.id === currentStep) > index;
            const isPremium = PREMIUM_STEPS.includes(step.id);
            const isLocked = isPremium && !hasPremiumAccess;

            return (
              <button
                key={step.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`${step.name}${isLocked ? ' (locked - premium)' : isPast ? ' (completed)' : ''}`}
                aria-disabled={isLocked}
                onClick={() => {
                  if (isLocked) {
                    setShowPaywall(true);
                  } else {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isPast && !isLocked
                    ? 'bg-green-100 text-green-800'
                    : isLocked
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4" aria-hidden="true" />
                ) : isPast ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="hidden md:inline text-sm font-medium">{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8" role="tabpanel" aria-label={`${steps.find(s => s.id === currentStep)?.name || ''} step`}>
        {currentStep === 'setup' && renderSetupStep()}
        {currentStep === 'batna' && renderBatnaStep()}
        {currentStep === 'zopa' && renderZopaStep()}
        {currentStep === 'strategy' && renderStrategyStep()}
        {currentStep === 'scripts' && renderScriptsStep()}
        {currentStep === 'tracker' && renderTrackerStep()}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 'setup'}
            aria-label="Go to previous step"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 'setup'
                ? 'text-stone-300 cursor-not-allowed'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            Back
          </button>

          {currentStep !== 'tracker' && (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              aria-label={`Continue to ${steps[steps.findIndex(s => s.id === currentStep) + 1]?.name || 'next'} step`}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors ${
                canProceed()
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
