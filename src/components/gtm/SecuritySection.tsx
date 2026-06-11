import { Shield, Lock, Eye, Server, Users } from 'lucide-react';

const SECURITY_POINTS = [
  { icon: Lock, title: 'Encrypted in transit and at rest', description: 'All data is encrypted using industry-standard TLS and AES-256 protocols.' },
  { icon: Shield, title: 'Designed for secure legal workflows', description: 'Architecture built with legal data sensitivity in mind from day one.' },
  { icon: Server, title: 'Configurable data handling', description: 'Control retention, export, and deletion policies for your organization.' },
  { icon: Eye, title: 'No unsupported AI training claims', description: 'We do not make promises about AI training data usage that we cannot verify and enforce at the infrastructure level.' },
  { icon: Users, title: 'Human review as a workflow step', description: 'Attorney review can be added as an optional workflow step for high-stakes matters.' },
];

export default function SecuritySection() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {SECURITY_POINTS.map((point) => (
          <div key={point.title} className="bg-white rounded-xl p-6 border border-navy-200">
            <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
              <point.icon className="w-5 h-5 text-navy-700" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{point.title}</h3>
            <p className="text-sm text-navy-600">{point.description}</p>
          </div>
        ))}
      </div>
      <div className="bg-navy-50 rounded-xl p-4 border border-navy-200">
        <p className="text-xs text-navy-600">
          <strong>Privacy and legal notice:</strong> ezlegal.ai provides workflow automation and legal information tools.
          It is not a law firm and does not provide legal advice. No attorney-client relationship is created through use of this platform.
          For questions about data handling, contact {import.meta.env.VITE_CONTACT_EMAIL || 'hello@ezlegal.ai'}.
        </p>
      </div>
    </div>
  );
}
