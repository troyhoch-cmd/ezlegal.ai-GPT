import { Link } from 'react-router-dom';
import {
  Shield, Clock, AlertTriangle, CheckCircle2, ArrowRight,
  Server, Lock, Mail, FileText, Download
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const uptimeTargets = [
  {
    plan: 'Starter / Individual',
    target: '99.9%',
    maxDowntime: '~43 min/month',
    support: 'Email (48hr response)',
    escalation: 'support@ezlegal.ai',
  },
  {
    plan: 'Pro / Business',
    target: '99.9%',
    maxDowntime: '~43 min/month',
    support: 'Email + Chat (24hr response)',
    escalation: 'Priority queue',
  },
  {
    plan: 'Enterprise / LSO Professional',
    target: '99.95%',
    maxDowntime: '~22 min/month',
    support: 'Dedicated account manager',
    escalation: 'Direct escalation path',
  },
];

const exclusions = [
  'Scheduled maintenance windows (announced 72 hours in advance)',
  'Third-party service outages outside our direct control (e.g., upstream DNS, CDN)',
  'Force majeure events (natural disasters, government actions)',
  'Client-side network issues or browser incompatibilities',
  'Abuse or misuse that triggers rate limiting or security protections',
];

const infrastructure = [
  { label: 'Hosting', value: 'Supabase (AWS-backed infrastructure)' },
  { label: 'Encryption in transit', value: 'TLS 1.3' },
  { label: 'Encryption at rest', value: 'AES-256' },
  { label: 'Data residency', value: 'United States' },
  { label: 'Backups', value: 'Daily automated, 30-day retention' },
  { label: 'Monitoring', value: 'Real-time uptime monitoring with automated alerts' },
];

export default function SLA() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content" className="pt-28">
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Service Level Agreement</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              SLA & Uptime Targets
            </h1>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto">
              Transparency about our service commitments, infrastructure, and what to expect when things go wrong.
            </p>
            <p className="text-sm text-navy-400 mt-4">
              Effective Date: February 1, 2026 | Version 1.0
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Uptime Targets by Plan</h2>
            <p className="text-navy-600 mb-8">
              These are our target uptime commitments. Enterprise customers may negotiate contractual SLAs with specific remedies.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-navy-200">
                    <th className="py-3 pr-4 text-sm font-semibold text-navy-900">Plan</th>
                    <th className="py-3 px-4 text-sm font-semibold text-navy-900">Target Uptime</th>
                    <th className="py-3 px-4 text-sm font-semibold text-navy-900">Max Downtime</th>
                    <th className="py-3 px-4 text-sm font-semibold text-navy-900">Support</th>
                    <th className="py-3 pl-4 text-sm font-semibold text-navy-900">Escalation</th>
                  </tr>
                </thead>
                <tbody>
                  {uptimeTargets.map((row) => (
                    <tr key={row.plan} className="border-b border-navy-100">
                      <td className="py-4 pr-4 font-medium text-navy-900 text-sm">{row.plan}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {row.target}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-navy-600">{row.maxDowntime}</td>
                      <td className="py-4 px-4 text-sm text-navy-600">{row.support}</td>
                      <td className="py-4 pl-4 text-sm text-navy-600">{row.escalation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 bg-navy-50 border border-navy-200 rounded-xl p-4">
              <p className="text-sm text-navy-700">
                <strong>Contractual SLA:</strong> Enterprise and LSO Professional plans are eligible for a binding SLA with defined remedies (service credits). Contact your account manager or <a href="mailto:enterprise@ezlegal.ai" className="text-teal-600 hover:text-teal-700 underline">enterprise@ezlegal.ai</a> to request the contractual SLA document.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">Scope & Exclusions</h2>
            <p className="text-navy-600 mb-6">
              Uptime is measured as the availability of core platform services (AI chat, API endpoints, dashboard) from our monitoring infrastructure. The following are excluded from uptime calculations:
            </p>
            <ul className="space-y-3">
              {exclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                  <span className="text-sm text-navy-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Infrastructure Summary</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {infrastructure.map((item) => (
                <div key={item.label} className="flex items-start gap-3 bg-navy-50 rounded-xl p-4 border border-navy-100">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.label.includes('Encrypt') ? <Lock className="w-4 h-4 text-teal-700" /> :
                     item.label.includes('Host') ? <Server className="w-4 h-4 text-teal-700" /> :
                     item.label.includes('Monitor') ? <Clock className="w-4 h-4 text-teal-700" /> :
                     <Shield className="w-4 h-4 text-teal-700" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{item.label}</p>
                    <p className="text-sm text-navy-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Incident Response & Escalation</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-navy-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Response Times
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-xs font-semibold text-red-700 uppercase mb-1">Critical (P1)</p>
                    <p className="text-lg font-bold text-red-800">1 hour</p>
                    <p className="text-xs text-red-600">Service fully unavailable</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 uppercase mb-1">High (P2)</p>
                    <p className="text-lg font-bold text-amber-800">4 hours</p>
                    <p className="text-xs text-amber-600">Major feature degraded</p>
                  </div>
                  <div className="text-center p-3 bg-navy-50 rounded-lg">
                    <p className="text-xs font-semibold text-navy-700 uppercase mb-1">Normal (P3)</p>
                    <p className="text-lg font-bold text-navy-800">24 hours</p>
                    <p className="text-xs text-navy-600">Minor issues or questions</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-navy-200 p-6">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-teal-600" />
                  Contact Channels
                </h3>
                <div className="space-y-2 text-sm text-navy-700">
                  <p><strong>General support:</strong> support@ezlegal.ai</p>
                  <p><strong>Enterprise/SLA inquiries:</strong> enterprise@ezlegal.ai</p>
                  <p><strong>Security incidents:</strong> security@ezlegal.ai</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Maintenance Policy</h2>
            <div className="bg-navy-50 rounded-xl border border-navy-200 p-6 space-y-4 text-sm text-navy-700">
              <p>
                <strong>Scheduled maintenance</strong> is performed during low-traffic windows (Sundays 2:00-6:00 AM UTC) with at least 72 hours advance notice via email to account administrators.
              </p>
              <p>
                <strong>Emergency maintenance</strong> may be performed without advance notice to address critical security vulnerabilities or data integrity risks. We will communicate via email and our status page as soon as possible.
              </p>
              <p>
                <strong>Zero-downtime deployments</strong> are used for routine updates. Most deployments do not cause any service interruption.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Need a Contractual SLA?
            </h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Enterprise and LSO Professional plans are eligible for binding SLAs with defined service credits. Reach out to discuss your requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact?type=enterprise"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 hover:bg-teal-50 px-8 py-3.5 rounded-xl font-bold transition-all"
              >
                Contact Enterprise Sales
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/enterprise-security"
                className="inline-flex items-center justify-center gap-2 bg-teal-500/30 hover:bg-teal-500/50 border border-white/30 text-white px-8 py-3.5 rounded-xl font-bold transition-all"
              >
                View Security Details
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
