import { useState } from 'react';
import {
  X, Mail, Calendar, FileText, DollarSign, Phone, Globe, MapPin,
  Award, ChevronRight, CreditCard, CheckCircle, Clock
} from 'lucide-react';
import type { LawyerProfile } from '../data/arizonaLawyers';
import QuoteRequestForm from './QuoteRequestForm';
import AppointmentRequestForm from './AppointmentRequestForm';
import FundingRequestForm from './FundingRequestForm';

interface LawyerProfileModalProps {
  lawyer: LawyerProfile;
  onClose: () => void;
}

export default function LawyerProfileModal({ lawyer, onClose }: LawyerProfileModalProps) {
  const [showPhone, setShowPhone] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'credentials'>('about');
  const [activeForm, setActiveForm] = useState<'quote' | 'appointment' | 'funding' | null>(null);

  const handleContactEmail = () => {
    window.location.href = `mailto:${lawyer.email}?subject=Legal Consultation Request`;
  };

  const handleVisitWebsite = () => {
    if (lawyer.website) {
      window.open(lawyer.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="lawyer-profile-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 id="lawyer-profile-title" className="text-xl font-bold text-slate-900">Attorney Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-0">
          <div className="lg:col-span-1 bg-slate-50 p-6 border-r border-slate-200">
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <img
                  src={lawyer.image}
                  alt={lawyer.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${
                  lawyer.availability === 'Available' ? 'bg-green-500' :
                  lawyer.availability === 'Busy' ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{lawyer.name}</h3>
              <p className="text-slate-600 text-sm mt-1">{lawyer.practiceAreas.slice(0, 2).join(', ')}</p>
              {lawyer.averageBillingRate > 0 && (
                <p className="text-slate-700 mt-2">
                  <span className="text-sm text-slate-500">Avg hourly billing rate:</span>{' '}
                  <span className="font-semibold">${lawyer.averageBillingRate}</span>
                </p>
              )}
              {lawyer.averageBillingRate === 0 && lawyer.totalRecovered && (
                <p className="text-sm text-green-700 font-medium mt-2">Contingency Fee Available</p>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <button
                onClick={handleContactEmail}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveForm('appointment')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  Request an appointment
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveForm('quote')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  Request a quote
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveForm('funding')}
                className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg font-medium flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-slate-500" />
                  Request funding
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 border-t border-slate-200 pt-4">
              <button
                onClick={() => setShowPhone(!showPhone)}
                className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white rounded-lg transition-colors"
              >
                <Phone className="w-5 h-5 text-slate-400" />
                {showPhone ? (
                  <span className="text-brand-600 font-medium">{lawyer.phone}</span>
                ) : (
                  <span className="text-slate-600">View phone number</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </button>

              <button
                onClick={handleContactEmail}
                className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">Email {lawyer.name.split(' ')[0]}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
              </button>

              {lawyer.website && (
                <button
                  onClick={handleVisitWebsite}
                  className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white rounded-lg transition-colors"
                >
                  <Globe className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600">Visit website</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-3">Accepted methods of payment</p>
              <div className="flex flex-wrap gap-2">
                {lawyer.acceptedPayments.map((payment) => (
                  <div
                    key={payment}
                    className="bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600">{payment}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-6">
            <div className="flex gap-1 mb-6 border-b border-slate-200">
              {[
                { id: 'about', label: 'About' },
                { id: 'credentials', label: 'Credentials' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-3 font-medium text-sm border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">About {lawyer.name}</h4>
                  <p className="text-slate-700 leading-relaxed">{lawyer.bio}</p>
                </div>

                {lawyer.flatFeeAvailable && (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Offers flat or alternative fee arrangements: Yes</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Location</h4>
                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                      <div>
                        <p>{lawyer.fullAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Jurisdiction</h4>
                    <p className="text-slate-600">{lawyer.jurisdiction}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Areas of law and practice offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {lawyer.practiceAreas.map((area) => (
                      <span
                        key={area}
                        className="bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {lawyer.languages.length > 1 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Languages</h4>
                    <p className="text-slate-600">{lawyer.languages.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'credentials' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Board Certified Specialization or other Designation</h4>
                  <div className="space-y-2">
                    {lawyer.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-700">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {lawyer.education && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Education</h4>
                    <p className="text-slate-600">{lawyer.education}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Experience</h4>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <span>{lawyer.experience} years of experience</span>
                  </div>
                </div>

                {lawyer.totalRecovered && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Total Recovered for Clients</h4>
                    <p className="text-2xl font-bold text-green-600">{lawyer.totalRecovered}</p>
                  </div>
                )}

                {lawyer.offers && lawyer.offers.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Offers</h4>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.offers.map((offer, index) => (
                        <span
                          key={index}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
                        >
                          {offer}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {activeForm === 'quote' && (
        <QuoteRequestForm lawyer={lawyer} onClose={() => setActiveForm(null)} />
      )}

      {activeForm === 'appointment' && (
        <AppointmentRequestForm lawyer={lawyer} onClose={() => setActiveForm(null)} />
      )}

      {activeForm === 'funding' && (
        <FundingRequestForm lawyer={lawyer} onClose={() => setActiveForm(null)} />
      )}
    </div>
  );
}
