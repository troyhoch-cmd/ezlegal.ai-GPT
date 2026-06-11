import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CreditCard, CheckCircle, Sparkles, Receipt, AlertTriangle,
  Loader2, ExternalLink, ArrowUpRight, Mail,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { setPendingPlan } from '../lib/plan-context';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  tier: string;
  features: string[];
}

interface Invoice {
  id: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: string;
  hosted_invoice_url: string;
  receipt_url: string;
  paid_at: string | null;
  created_at: string;
}

interface Intent {
  id: string;
  plan_id: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Billing() {
  const { user, profile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [searchParams] = useSearchParams();

  const tier = profile?.subscription_tier ?? 'free';
  const isFree = tier === 'free' || tier === '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from('subscription_plans').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('billing_invoices').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('purchase_intents').select('*').order('created_at', { ascending: false }).limit(10),
    ]).then(([planRes, invoiceRes, intentRes]) => {
      if (cancelled) return;
      setPlans((planRes.data ?? []) as Plan[]);
      setInvoices((invoiceRes.data ?? []) as Invoice[]);
      setIntents((intentRes.data ?? []) as Intent[]);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') setActionNotice('Payment received. Your plan will activate within a few seconds.');
    else if (status === 'cancel') setActionError('Checkout was cancelled. No charge was made.');
  }, [searchParams]);

  async function startCheckout(planId: string) {
    setActioning(planId);
    setActionError('');
    setActionNotice('');
    setPendingPlan(planId, 'billing');
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;
      if (!accessToken) {
        setActionError('You must be signed in to manage billing.');
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-session`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard/billing?status=success`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancel`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data?.error ?? 'Could not start checkout.');
        return;
      }
      if (data.mode === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }
      setActionNotice(data.message ?? 'We saved your interest and will email you when checkout is live.');
      const intentRes = await supabase
        .from('purchase_intents').select('*')
        .order('created_at', { ascending: false }).limit(10);
      setIntents((intentRes.data ?? []) as Intent[]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setActioning(null);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-3">Sign in to view billing</h1>
          <p className="text-navy-600 mb-6">Your plan, invoices, and pending purchases live here once you sign in.</p>
          <Link to="/login?redirect=/dashboard/billing"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-semibold">
            Sign in
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-teal-700 font-semibold mb-1">Account</p>
          <h1 className="text-3xl font-bold text-navy-900">Billing & subscription</h1>
          <p className="text-navy-600 mt-1">Manage your plan, view receipts, and upgrade when you need more.</p>
        </div>

        {actionError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{actionError}</div>
          </div>
        )}
        {actionNotice && (
          <div className="mb-6 flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-teal-800">{actionNotice}</div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-navy-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase font-semibold text-navy-500 tracking-wider">Current plan</p>
                <h2 className="text-2xl font-bold text-navy-900 mt-1 capitalize">{isFree ? 'Free' : tier}</h2>
                <p className="text-sm text-navy-600 mt-1">
                  {isFree ? 'You are on the Free plan. Upgrade for unlimited chats and PDF exports.'
                    : 'You have access to all features included in your plan.'}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                isFree ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                <CheckCircle className="w-3.5 h-3.5" />
                {isFree ? 'Free tier' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-navy-500">Account email: <span className="font-medium text-navy-700">{user.email}</span></p>
          </div>

          <div className="bg-gradient-to-br from-teal-600 to-navy-800 rounded-2xl text-white p-6 shadow-lg">
            <Sparkles className="w-6 h-6 mb-3 opacity-80" />
            <p className="text-lg font-bold leading-tight">Need more chats this month?</p>
            <p className="text-sm text-teal-100 mt-1">Pro unlocks unlimited chats, PDF exports, and priority models.</p>
            <button onClick={() => startCheckout('pro_monthly')} disabled={actioning === 'pro_monthly'}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-white text-navy-900 font-semibold py-2.5 rounded-lg hover:bg-teal-50 transition disabled:opacity-60">
              {actioning === 'pro_monthly' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              Upgrade to Pro
            </button>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Available plans</h2>
          {loading ? (
            <div className="bg-white rounded-2xl border border-navy-200 p-12 text-center text-navy-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.tier === tier;
                return (
                  <div key={plan.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col ${isCurrent ? 'border-teal-500 ring-2 ring-teal-200' : 'border-navy-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-navy-900">{plan.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-navy-600 mb-3 min-h-[2.5rem]">{plan.description}</p>
                    <p className="text-2xl font-bold text-navy-900">
                      {plan.price_cents === 0 ? 'Free' : formatMoney(plan.price_cents, plan.currency)}
                      {plan.price_cents > 0 && plan.interval !== 'one_time' && (
                        <span className="text-xs font-normal text-navy-500"> / {plan.interval}</span>
                      )}
                    </p>
                    <ul className="text-xs text-navy-700 space-y-1 mt-3 mb-4 flex-1">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-teal-600 mt-0.5 flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => startCheckout(plan.id)}
                      disabled={isCurrent || plan.price_cents === 0 || actioning === plan.id}
                      className="w-full inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {actioning === plan.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : isCurrent ? 'Active' : plan.price_cents === 0 ? 'Free tier' : 'Choose'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-navy-900">Payment history</h2>
            <span className="text-xs text-navy-500 inline-flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5" /> Last 20 invoices
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-navy-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : invoices.length === 0 ? (
              <div className="p-10 text-center">
                <CreditCard className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                <p className="text-sm text-navy-600">No invoices yet. Once you upgrade, your receipts appear here.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-navy-50 text-navy-700">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Description</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-navy-100">
                      <td className="px-4 py-3 text-navy-700">{formatDate(inv.paid_at ?? inv.created_at)}</td>
                      <td className="px-4 py-3 text-navy-900">{inv.description || inv.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-800'
                          : inv.status === 'failed' ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-navy-900 font-semibold">
                        {formatMoney(inv.amount_cents, inv.currency)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {inv.receipt_url || inv.hosted_invoice_url ? (
                          <a href={inv.receipt_url || inv.hosted_invoice_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-medium">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (<span className="text-navy-400 text-xs">—</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {intents.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Pending purchases</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-900 mb-3 inline-flex items-center gap-2">
                <Mail className="w-4 h-4" /> These purchase requests are queued and will activate once Stripe is fully wired.
              </p>
              <ul className="space-y-2">
                {intents.map((intent) => (
                  <li key={intent.id} className="flex items-center justify-between text-sm">
                    <span className="text-navy-800">
                      <span className="font-semibold capitalize">{intent.plan_id.replace(/_/g, ' ')}</span>
                      <span className="text-navy-500 ml-2">{formatDate(intent.created_at)}</span>
                    </span>
                    <span className="text-navy-700 font-medium">{formatMoney(intent.amount_cents, 'usd')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
