import { useState, useEffect, useCallback, useId } from 'react';
import {
  X, CheckCircle, FileText, Download, Copy, ChevronRight, ChevronLeft,
  Globe, Building2, Users, Clock, Shield, Handshake, AlertTriangle,
  Phone, Mail, Calendar, MapPin, Scale, Gavel, Briefcase,
  DollarSign, FileCheck, ClipboardList, MessageSquare, BookOpen, Star,
  Brain, Target, Info, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFocusTrap } from '../lib/focus-trap';

interface PackDemoModalProps {
  packId: string;
  packName: string;
  onClose: () => void;
}

export default function PackDemoModal({ packId, packName, onClose }: PackDemoModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const focusTrapRef = useFocusTrap(true);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, index: number, total: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % total;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + total) % total;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = total - 1;
    else return;
    e.preventDefault();
    setActiveTab(nextIndex);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const packContent = getPackContent(packId);

  if (!packContent) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={focusTrapRef} className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-auto">
        <div className={`${packContent.headerBg} p-6 relative`}>
          <button
            onClick={onClose}
            aria-label="Close pack preview"
            className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              {packContent.icon}
            </div>
            <div>
              <p id={descId} className="text-white/80 text-sm font-medium mb-1">What's Included</p>
              <h2 id={titleId} className="text-2xl font-bold text-white">{packName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">Arizona Templates</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
              <FileCheck className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">{packContent.documentCount} Documents</span>
            </div>
          </div>
        </div>

        <div role="tablist" aria-label="Pack contents" className="flex border-b border-stone-200 overflow-x-auto scrollbar-thin flex-shrink-0">
          {packContent.tabs.map((tab, index) => (
            <button
              key={index}
              role="tab"
              id={`pack-tab-${index}`}
              aria-selected={activeTab === index}
              aria-controls={`pack-tabpanel-${index}`}
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => setActiveTab(index)}
              onKeyDown={(e) => handleTabKeyDown(e, index, packContent.tabs.length)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === index
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`pack-tabpanel-${activeTab}`}
          aria-labelledby={`pack-tab-${activeTab}`}
          className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
        >
          {packContent.tabs[activeTab] && (
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-10 h-10 ${packContent.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {packContent.tabs[activeTab].icon}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-lg">{packContent.tabs[activeTab].title}</h3>
                  <p className="text-stone-600 text-sm">{packContent.tabs[activeTab].description}</p>
                </div>
              </div>

              {packContent.tabs[activeTab].preview && (
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Preview</span>
                    <button
                      onClick={() => copyToClipboard(packContent.tabs[activeTab].preview || '', `preview-${activeTab}`)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                    >
                      {copiedItem === `preview-${activeTab}` ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-stone-200 max-h-80 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-stone-700 font-mono leading-relaxed">
                      {packContent.tabs[activeTab].preview}
                    </pre>
                  </div>
                </div>
              )}

              {packContent.tabs[activeTab].sections && (
                <div className="space-y-4">
                  {packContent.tabs[activeTab].sections?.map((section, sIndex) => (
                    <div key={sIndex} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-stone-100 bg-stone-50">
                        <h4 className="font-semibold text-stone-900">{section.title}</h4>
                      </div>
                      <div className="p-4">
                        {section.items && (
                          <ul className="space-y-2">
                            {section.items.map((item, iIndex) => (
                              <li key={iIndex} className="flex items-start gap-2 text-sm text-stone-700">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {section.content && (
                          <p className="text-sm text-stone-600">{section.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {packContent.tabs[activeTab].keyPoints && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-amber-900">Key Arizona Information</span>
                  </div>
                  <ul className="space-y-2">
                    {packContent.tabs[activeTab].keyPoints?.map((point, pIndex) => (
                      <li key={pIndex} className="flex items-start gap-2 text-sm text-amber-800">
                        <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>Legal information, not legal advice</span>
          </div>
          <span className="hidden sm:inline text-stone-300">|</span>
          <span>Confirm your state before relying on any template</span>
          <span className="hidden sm:inline text-stone-300">|</span>
          <Link to="/emergency-resources" onClick={onClose} className="text-rose-600 hover:text-rose-700 font-medium flex items-center gap-0.5">
            If you feel unsafe, get help now
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              aria-label={`Previous tab: ${activeTab > 0 ? packContent.tabs[activeTab - 1]?.name : ''}`}
              className={`flex items-center gap-1 text-sm font-medium ${
                activeTab === 0 ? 'text-stone-300' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-stone-500" aria-live="polite">
              {activeTab + 1} of {packContent.tabs.length}
            </span>
            <button
              onClick={() => setActiveTab(Math.min(packContent.tabs.length - 1, activeTab + 1))}
              disabled={activeTab === packContent.tabs.length - 1}
              aria-label={`Next tab: ${activeTab < packContent.tabs.length - 1 ? packContent.tabs[activeTab + 1]?.name : ''}`}
              className={`flex items-center gap-1 text-sm font-medium ${
                activeTab === packContent.tabs.length - 1 ? 'text-stone-300' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            Get This Pack
          </button>
        </div>
      </div>
    </div>
  );
}

interface TabContent {
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  preview?: string;
  sections?: { title: string; items?: string[]; content?: string }[];
  keyPoints?: string[];
}

interface PackContent {
  headerBg: string;
  iconBg: string;
  icon: React.ReactNode;
  documentCount: number;
  tabs: TabContent[];
}

function getPackContent(packId: string): PackContent | null {
  const content: Record<string, PackContent> = {
    'immigration': {
      headerBg: 'bg-gradient-to-r from-amber-600 to-amber-500',
      iconBg: 'bg-amber-100',
      icon: <Globe className="w-7 h-7 text-white" />,
      documentCount: 8,
      tabs: [
        {
          name: 'Action Plan',
          title: 'Step-by-Step Action Plan',
          description: 'Guidance tailored to the immigration details you provide',
          icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Immediate Actions (First 48 Hours)',
              items: [
                'Gather all immigration documents (visa, I-94, passport, work permits)',
                'Document your entry date and current status accurately',
                'Identify any upcoming deadlines (visa expiration, court dates)',
                'Secure copies of all documents in a safe location'
              ]
            },
            {
              title: 'Arizona-Specific Resources',
              items: [
                'Florence Immigrant & Refugee Rights Project: Free legal services',
                'CLINIC-affiliated attorneys in Maricopa County',
                'Phoenix Immigration Court: 401 W Washington St',
                'USCIS Phoenix Field Office: 1810 S 7th Ave'
              ]
            },
            {
              title: 'Next Steps Based on Your Situation',
              items: [
                'If facing removal: Request a continuance, gather evidence for relief',
                'If visa overstay: Consult attorney about adjustment options',
                'If DACA: Monitor renewal deadlines, keep address updated',
                'If asylum: Prepare credible fear interview documentation'
              ]
            }
          ],
          keyPoints: [
            'Arizona is in the Ninth Circuit - different precedents than other states',
            'Phoenix Immigration Court has specific local rules',
            'SB 1070 provisions still affect some interactions with law enforcement'
          ]
        },
        {
          name: 'Know Your Rights',
          title: 'Know Your Rights Document (ICE Encounters)',
          description: 'What to do if approached by immigration officers in Arizona',
          icon: <Shield className="w-5 h-5 text-amber-600" />,
          preview: `KNOW YOUR RIGHTS IN ARIZONA
Immigration Enforcement Encounters

IF ICE COMES TO YOUR HOME:
- You have the RIGHT to remain silent
- You have the RIGHT to NOT open the door
- Ask: "Do you have a warrant signed by a judge?"
- A warrant must have your correct name and address
- ICE administrative warrants (Form I-200) do NOT allow entry

IF ICE COMES TO YOUR WORKPLACE:
- You can remain silent
- You do not have to show immigration documents to ICE
- You have the right to speak to a lawyer
- You can refuse to sign any documents

IF STOPPED BY POLICE IN ARIZONA:
- You must provide your name if asked
- You do NOT have to answer questions about immigration status
- Say: "I wish to remain silent and want to speak to a lawyer"
- Do not run, argue, or resist

EMERGENCY CONTACTS:
- ICE Detention Reporting Line: 1-888-351-4024
- Florence Project Hotline: (520) 868-0191
- ACLU Arizona: (602) 650-1854

REMEMBER: Being undocumented is NOT a crime.
Immigration violations are civil, not criminal matters.`,
          keyPoints: [
            'Arizona police can ask about immigration status during lawful stops',
            'You never have to answer questions about where you were born',
            'Carry this document with you at all times'
          ]
        },
        {
          name: 'Emergency Contacts',
          title: 'Emergency Contact Templates',
          description: 'Pre-filled contact cards and family safety plan',
          icon: <Phone className="w-5 h-5 text-amber-600" />,
          preview: `EMERGENCY CONTACT CARD - ARIZONA

If I am detained, please contact:

ATTORNEY/LEGAL AID:
Name: _______________________
Phone: ______________________
Organization: ________________

FAMILY CONTACT:
Name: _______________________
Relationship: ________________
Phone: ______________________

EMPLOYER NOTIFICATION:
Company: ____________________
Supervisor: __________________
Phone: ______________________

CHILDREN'S CARE:
Guardian Name: _______________
Phone: ______________________
School: _____________________
Pediatrician: _________________

IMPORTANT NUMBERS:
ICE Detention Line: 1-888-351-4024
Florence Project: (520) 868-0191
Mexican Consulate Phoenix: (602) 242-7398
Guatemalan Consulate: (602) 200-0398

My A-Number: ________________
My Attorney's Info: ___________

Keep this card in your wallet at all times.`,
          sections: [
            {
              title: 'Family Safety Plan Checklist',
              items: [
                'Designate a trusted person with power of attorney',
                'Prepare childcare arrangements with documentation',
                'Store important documents with a trusted person',
                'Memorize key phone numbers',
                'Have savings accessible to family members',
                'Create a communication plan with family'
              ]
            }
          ]
        },
        {
          name: 'Deadline Checklist',
          title: 'Deadline Checklist for Your Case',
          description: 'Track critical dates and filing requirements',
          icon: <Calendar className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Common Immigration Deadlines',
              items: [
                'Visa expiration: File renewal 6 months before',
                'I-130 processing: Currently 12-24 months',
                'Work permit renewal: File 180 days before expiration',
                'Change of address: Report within 10 days (AR-11)',
                'Asylum filing: Within 1 year of entry',
                'DACA renewal: File 150 days before expiration'
              ]
            },
            {
              title: 'Arizona Immigration Court Deadlines',
              items: [
                'Motion to reopen: 90 days from final order (exceptions apply)',
                'Appeal to BIA: 30 days from Immigration Judge decision',
                'Voluntary departure: Must depart by deadline or face 10-year bar',
                'Bond hearing: Can request any time after detention'
              ]
            }
          ],
          keyPoints: [
            'Missing a deadline can result in automatic deportation order',
            'Phoenix Immigration Court is known for strict deadline enforcement',
            'Always keep proof of mailing with certified mail receipts'
          ]
        },
        {
          name: 'Attorney Referral',
          title: 'Free Attorney Referral in Arizona',
          description: 'Vetted immigration attorneys and free legal services',
          icon: <Scale className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Free Legal Services in Arizona',
              items: [
                'Florence Immigrant & Refugee Rights Project - Detention representation',
                'CLINIC Phoenix - Immigration legal services',
                'International Rescue Committee Phoenix - Refugee services',
                'Lutheran Immigration and Refugee Service',
                'Catholic Charities Immigration Services'
              ]
            },
            {
              title: 'Low-Cost Immigration Help',
              items: [
                'ASU Immigration Law Clinic - Student representation',
                'Community Legal Services - Income-qualified clients',
                'AILA Arizona Chapter - Attorney referral service',
                'Maricopa County Bar Association Lawyer Referral'
              ]
            },
            {
              title: 'Warning Signs of Immigration Fraud',
              items: [
                'Notarios claiming to be attorneys (illegal in AZ)',
                'Guaranteeing specific outcomes',
                'Asking you to sign blank forms',
                'Requesting cash payments only',
                'Refusing to give receipts'
              ]
            }
          ],
          keyPoints: [
            'Only hire attorneys licensed by the Arizona State Bar',
            'Accredited representatives must be DOJ-certified',
            'Report fraud to Arizona Attorney General: (602) 542-5025'
          ]
        },
        {
          name: 'Court Guide',
          title: 'Immigration Court Survival Guide',
          description: 'What to expect at Phoenix Immigration Court',
          icon: <Gavel className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Before Your Court Date',
              items: [
                'Arrive 1 hour early - security lines are long',
                'Bring photo ID and all immigration documents',
                'Dress professionally (no hats, sunglasses inside)',
                'Turn off cell phones before entering courtroom',
                'Bring interpreter if needed (court provides but may be delayed)'
              ]
            },
            {
              title: 'Phoenix Immigration Court Location',
              items: [
                'Address: 401 W Washington St, Suite 150, Phoenix AZ 85003',
                'Hours: 8:00 AM - 4:30 PM weekdays',
                'Parking: Metered street parking or paid lots nearby',
                'Phone: (602) 640-2711 (automated system)',
                'Check-in at security, then courtroom listed on notice'
              ]
            },
            {
              title: 'During Your Hearing',
              items: [
                'Stand when the judge enters/exits',
                'Address judge as "Your Honor"',
                'Answer only what is asked - do not volunteer information',
                'If you do not understand, say "I do not understand"',
                'You can request a continuance if you need more time'
              ]
            },
            {
              title: 'Types of Hearings',
              items: [
                'Master Calendar: Short scheduling hearing (15-30 min)',
                'Individual/Merits: Full hearing on your case (2-4 hours)',
                'Bond Hearing: Request release from detention',
                'Motion Hearing: Specific legal issues'
              ]
            }
          ],
          keyPoints: [
            'Missing a hearing can result in deportation order in absentia',
            'You can file a motion to reopen if you missed due to exceptional circumstances',
            'Always get your next court date in writing before leaving'
          ]
        },
        {
          name: 'Asylum Checklist',
          title: 'Asylum Application Document Checklist',
          description: 'Evidence to support your asylum claim',
          icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Personal Documents',
              items: [
                'Passport and travel documents',
                'Birth certificate',
                'Marriage/divorce certificates',
                'National ID card',
                'Military service records',
                'Professional licenses or credentials'
              ]
            },
            {
              title: 'Evidence of Persecution',
              items: [
                'Photographs of injuries',
                'Medical records documenting harm',
                'Police reports (or explanation why none exist)',
                'Threatening letters, messages, or social media',
                'Witness affidavits from people who saw what happened',
                'News articles about incidents'
              ]
            },
            {
              title: 'Country Conditions Evidence',
              items: [
                'U.S. State Department country reports',
                'Human Rights Watch reports',
                'Amnesty International reports',
                'News articles about conditions for people like you',
                'Expert witness affidavits (if available)'
              ]
            },
            {
              title: 'Supporting Your Identity',
              items: [
                'Membership cards (political party, religious organization)',
                'Social media posts showing your identity/beliefs',
                'Letters from community leaders',
                'Photographs at events related to your claim'
              ]
            }
          ],
          keyPoints: [
            'Asylum must be filed within 1 year of entry (with limited exceptions)',
            'Even partial documentation helps - explain gaps in your declaration',
            'Translated documents must include certification'
          ]
        },
        {
          name: 'Work Permits',
          title: 'Work Authorization Guide',
          description: 'Understanding employment authorization in Arizona',
          icon: <Briefcase className="w-5 h-5 text-amber-600" />,
          preview: `EMPLOYMENT AUTHORIZATION DOCUMENT (EAD)
Quick Reference Guide

WHO CAN APPLY FOR A WORK PERMIT?
- Asylum applicants (after 150-day waiting period)
- DACA recipients (renewal required)
- Certain visa holders (F-1 OPT, J-1, L-2, H-4)
- Pending adjustment of status applicants
- TPS (Temporary Protected Status) holders
- VAWA self-petitioners
- U-visa applicants (with pending status)

APPLICATION PROCESS:
1. Complete Form I-765
2. Gather supporting documents
3. Pay filing fee ($410) or request fee waiver
4. Submit to USCIS lockbox
5. Wait for biometrics appointment
6. Receive EAD card (90-180+ days processing)

ARIZONA E-VERIFY:
- Arizona requires E-Verify for ALL employers
- Employers must verify work authorization
- Working without authorization is risky
- Do NOT use fake documents

RENEWAL TIMELINE:
- Apply 180 days before expiration
- Some categories get automatic 180-day extension
- Check USCIS website for current processing times
- Do not let your EAD expire while working

WHAT YOUR EAD SHOWS:
- Category code (explains basis for authorization)
- Expiration date
- Employment restrictions (if any)
- Card must be valid to work

LOST/STOLEN EAD:
- File I-765 to replace
- Keep copy of old card for records
- Notify employer of situation`,
          keyPoints: [
            'Arizona has strict E-Verify requirements for employers',
            'Working without authorization can affect future immigration benefits',
            'USCIS processing times vary - check regularly at uscis.gov'
          ]
        }
      ]
    },
    'housing': {
      headerBg: 'bg-gradient-to-r from-blue-600 to-blue-500',
      iconBg: 'bg-blue-100',
      icon: <Building2 className="w-7 h-7 text-white" />,
      documentCount: 7,
      tabs: [
        {
          name: 'Response Letter',
          title: 'Response Letter Template for Eviction Notices',
          description: 'Arizona-compliant response to eviction notices',
          icon: <FileText className="w-5 h-5 text-blue-600" />,
          preview: `[Your Name]
[Your Address]
[City, AZ ZIP]
[Date]

[Landlord/Property Manager Name]
[Management Company]
[Address]
[City, AZ ZIP]

RE: Response to Eviction Notice
    Property Address: [Your Address]
    Date of Notice: [Date on Notice]

Dear [Landlord Name]:

I am writing in response to the [type: 5-day/10-day/30-day] notice
I received on [date]. I dispute this notice for the following reasons:

[SELECT APPLICABLE DEFENSE:]

[ ] IMPROPER NOTICE: Under A.R.S. Section 33-1368, this notice does
not comply with Arizona law because [specify: wrong time period,
improper service, missing information].

[ ] RENT DISPUTE: I dispute the amount claimed. My records show
[explain discrepancy]. I have attached proof of payments.

[ ] RETALIATION: This eviction appears retaliatory under A.R.S.
Section 33-1381, as it follows my complaint about [habitability
issue, code violation] made on [date].

[ ] LEASE VIOLATION CURED: The alleged violation has been corrected
as of [date]. [Describe correction and attach evidence].

[ ] DISCRIMINATION: I believe this action violates the Fair Housing
Act because [explain].

I request the following:
1. Withdrawal of the eviction notice
2. [Other specific requests]
3. Written response within 5 business days

I am prepared to resolve this matter, but I will exercise my full
legal rights if necessary. Please contact me at [phone] or [email].

Sincerely,

[Your Signature]
[Your Printed Name]

Enclosures: [List any attached documents]
cc: [Keep copy for your records]`,
          keyPoints: [
            'Arizona requires 5 days for non-payment, 10 days for lease violations',
            'Always respond in writing and keep copies',
            'Send via certified mail with return receipt requested'
          ]
        },
        {
          name: 'Tenant Rights',
          title: 'Tenant Rights Guide for Arizona',
          description: 'Your legal protections under Arizona Residential Landlord Tenant Act',
          icon: <Shield className="w-5 h-5 text-blue-600" />,
          sections: [
            {
              title: 'Your Rights as an Arizona Tenant',
              items: [
                'Right to habitable premises (A.R.S. 33-1324)',
                'Right to proper notice before eviction',
                'Right to security deposit return within 14 days',
                'Right to withhold rent for major repairs (with proper notice)',
                'Right to privacy - landlord must give 2 days notice to enter',
                'Right to be free from retaliation for complaints'
              ]
            },
            {
              title: 'Landlord Obligations in Arizona',
              items: [
                'Maintain fit and habitable premises',
                'Keep common areas clean and safe',
                'Maintain electrical, plumbing, heating, and AC systems',
                'Provide running water and reasonable hot water',
                'Comply with building and housing codes',
                'Maintain smoke detectors'
              ]
            },
            {
              title: 'Arizona-Specific Protections',
              items: [
                'Maximum security deposit: 1.5 months rent',
                'Landlord has 14 days to return deposit after move-out',
                'Landlord cannot charge for normal wear and tear',
                'Tenant can terminate lease early for domestic violence',
                'Mobile home tenants have additional protections'
              ]
            }
          ],
          keyPoints: [
            'Arizona does NOT have rent control - landlords can raise rent with proper notice',
            'Oral leases are valid for terms under one year',
            'Breaking a lease may require paying rent until new tenant found'
          ]
        },
        {
          name: 'Court Calendar',
          title: 'Court Deadline Calendar',
          description: 'Critical dates and timelines for eviction proceedings',
          icon: <Calendar className="w-5 h-5 text-blue-600" />,
          sections: [
            {
              title: 'Arizona Eviction Timeline',
              items: [
                'Day 1: Receive eviction notice (5-day, 10-day, or 30-day)',
                'Day 5-30: Notice period expires (depends on notice type)',
                'Day 6-31: Landlord can file eviction lawsuit (Forcible Detainer)',
                'Within 3-6 days: Court hearing scheduled',
                'At hearing: Judge issues ruling',
                'If you lose: 5 days to appeal or vacate'
              ]
            },
            {
              title: 'Important Deadlines',
              items: [
                '5-Day Notice: Pay rent or face eviction filing',
                '10-Day Notice: Cure lease violation or vacate',
                '30-Day Notice: Month-to-month termination',
                '5 Days After Judgment: Must vacate or file appeal',
                '14 Days After Move-Out: Landlord must return deposit'
              ]
            }
          ],
          keyPoints: [
            'Never ignore a court summons - always appear or file a response',
            'Maricopa County Justice Courts handle most evictions',
            'You can request a continuance if you need more time'
          ]
        },
        {
          name: 'Evidence Checklist',
          title: 'Evidence Organization Checklist',
          description: 'Documents to gather for your defense',
          icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
          sections: [
            {
              title: 'Essential Documents to Gather',
              items: [
                'Signed lease agreement (all pages)',
                'All rent payment receipts or bank statements',
                'Photos of property condition (with dates)',
                'Written communication with landlord (emails, texts, letters)',
                'The eviction notice you received',
                'Any repair requests you made in writing'
              ]
            },
            {
              title: 'Evidence of Landlord Violations',
              items: [
                'Photos/videos of habitability issues',
                'Written repair requests and dates',
                'City/county code violation reports',
                'Witness statements from neighbors',
                'Medical records if health affected',
                'Utility bills showing issues (water, electric)'
              ]
            },
            {
              title: 'Proof of Payment',
              items: [
                'Canceled checks (front and back)',
                'Bank statements showing payments',
                'Money order receipts',
                'Cash payment receipts signed by landlord',
                'Venmo/Zelle/Cash App records',
                'Ledger or rent payment history from landlord'
              ]
            }
          ],
          keyPoints: [
            'Arizona courts require original documents when possible',
            'Organize chronologically with a cover sheet',
            'Make 3 copies: court, landlord, yourself'
          ]
        },
        {
          name: 'Attorney Referral',
          title: 'Free Attorney Referral in Arizona',
          description: 'Legal aid and tenant advocacy organizations',
          icon: <Scale className="w-5 h-5 text-blue-600" />,
          sections: [
            {
              title: 'Free Legal Help for Tenants',
              items: [
                'Community Legal Services (CLS): (602) 258-3434',
                'Arizona Center for Law in the Public Interest',
                'Wildfire (formerly DNA Legal Services) - Statewide',
                'William E. Morris Institute for Justice',
                'Volunteer Lawyers Program - Maricopa County'
              ]
            },
            {
              title: 'Arizona Tenant Resources',
              items: [
                'Arizona Tenants Advocates: Hotline and workshops',
                'Phoenix Housing Department: Fair housing complaints',
                'Arizona Attorney General: Consumer protection',
                'HUD Phoenix Office: Federal housing discrimination',
                'Southwest Fair Housing Council'
              ]
            },
            {
              title: 'Emergency Rental Assistance',
              items: [
                'Arizona Department of Housing ERA Program',
                'Community Action Program (CAP) Agencies',
                'St. Vincent de Paul - Emergency rent assistance',
                'Salvation Army - Utility and rent help',
                'Local churches and community organizations'
              ]
            }
          ],
          keyPoints: [
            'Income limits apply for free legal services',
            'Call early - legal aid has limited capacity',
            'Many offer help in Spanish and other languages'
          ]
        },
        {
          name: 'Move-Out Checklist',
          title: 'Move-Out & Security Deposit Protection Checklist',
          description: 'Document everything to protect your deposit',
          icon: <ClipboardList className="w-5 h-5 text-blue-600" />,
          sections: [
            {
              title: '30 Days Before Move-Out',
              items: [
                'Review lease for required notice period (usually 30 days)',
                'Send written move-out notice via certified mail',
                'Request pre-move-out inspection from landlord (your right under A.R.S. 33-1321)',
                'Start documenting current condition with dated photos/video',
                'Begin cleaning and minor repairs'
              ]
            },
            {
              title: 'Move-Out Day Documentation',
              items: [
                'Take timestamped photos of EVERY room, wall, floor, and fixture',
                'Video walkthrough with narration of condition',
                'Photograph all appliances (inside and out)',
                'Document any pre-existing damage noted on move-in checklist',
                'Read and photograph all utility meters',
                'Return all keys and get signed receipt'
              ]
            },
            {
              title: 'After Move-Out',
              items: [
                'Provide forwarding address in writing (required for deposit return)',
                'Keep copies of all move-out documentation',
                'Landlord has 14 days to return deposit with itemized deductions',
                'If not received, send demand letter via certified mail',
                'File in Justice Court if deposit wrongfully withheld'
              ]
            },
            {
              title: 'What Landlords CANNOT Deduct',
              items: [
                'Normal wear and tear (faded paint, worn carpet in traffic areas)',
                'Damage present at move-in (check your move-in checklist)',
                'Cleaning if you left unit reasonably clean',
                'Repairs due to landlord neglect',
                'Items not documented with receipts'
              ]
            }
          ],
          keyPoints: [
            'Arizona law: Landlords must return deposit within 14 days',
            'You can recover up to 2x your deposit if landlord acts in bad faith',
            'Pre-move-out inspection lets you fix issues before final walkthrough'
          ]
        },
        {
          name: 'AZ Eviction Laws',
          title: 'Arizona Eviction Laws Quick Reference',
          description: 'Key statutes every Arizona tenant should know',
          icon: <Gavel className="w-5 h-5 text-blue-600" />,
          preview: `ARIZONA RESIDENTIAL LANDLORD & TENANT ACT
Key Statutes Quick Reference

A.R.S. 33-1310 - Definitions
"Normal wear and tear" = deterioration from ordinary use

A.R.S. 33-1314 - Landlord Obligations
Must disclose: Move-in checklist, purpose of deposits,
name of property manager/owner

A.R.S. 33-1321 - Security Deposits
- Maximum: 1.5 months rent
- Return within 14 days of move-out
- Must provide itemized list of deductions
- Tenant entitled to pre-termination inspection

A.R.S. 33-1324 - Habitability Requirements
Landlord must maintain:
- Plumbing, heating, cooling, electrical
- Common areas safe and clean
- Compliance with building codes
- Reasonable weatherproofing

A.R.S. 33-1343 - Entry by Landlord
- 2 days notice required (except emergency)
- Only at reasonable times
- Cannot abuse right of access

A.R.S. 33-1368 - Eviction Notice Requirements
- 5-day notice for non-payment of rent
- 10-day notice for lease violations
- 30-day notice for month-to-month termination

A.R.S. 33-1377 - Landlord Remedies
- Cannot lockout tenant or shut off utilities
- Must go through court eviction process
- "Self-help" eviction is illegal

A.R.S. 33-1381 - Retaliation Prohibited
Landlord cannot evict/raise rent in response to:
- Complaints to government agencies
- Tenant organizing activities
- Good faith complaints to landlord

STATUTE OF LIMITATIONS:
- Security deposit claims: 2 years
- Breach of lease: 6 years
- Personal injury: 2 years`,
          keyPoints: [
            'Landlord MUST use court process - self-help eviction is illegal',
            'Retaliation claims require complaint within 6 months of protected activity',
            'All Arizona statutes available free at azleg.gov'
          ]
        }
      ]
    },
    'family': {
      headerBg: 'bg-gradient-to-r from-rose-600 to-rose-500',
      iconBg: 'bg-rose-100',
      icon: <Users className="w-7 h-7 text-white" />,
      documentCount: 9,
      tabs: [
        {
          name: 'Self-Rep Guide',
          title: 'Self-Representation Guide for Arizona Family Court',
          description: 'Navigate Arizona Superior Court without an attorney',
          icon: <BookOpen className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'Getting Started in Arizona Family Court',
              items: [
                'All Arizona family cases go through Superior Court',
                'Maricopa County Self-Service Center: (602) 506-1417',
                'Free forms available at azcourts.gov/selfservicecenter',
                'Filing fee waivers available (Fee Deferral Application)',
                'Self-Help Centers available in most courthouses'
              ]
            },
            {
              title: 'Arizona Family Court Process',
              items: [
                'File Petition (divorce, custody, support)',
                'Serve the other party (must use proper service)',
                'Wait for Response (20 days in Arizona)',
                'Attend Resolution Management Conference (RMC)',
                'Complete parenting class (required for children)',
                'Attend mediation if ordered',
                'Trial or settlement conference'
              ]
            },
            {
              title: 'Courtroom Tips for Self-Represented Parties',
              items: [
                'Arrive 30 minutes early',
                'Dress professionally (business casual minimum)',
                'Address judge as "Your Honor"',
                'Stand when speaking to the judge',
                'Do not interrupt the other party',
                'Bring 3 copies of all documents',
                'Turn off cell phones'
              ]
            }
          ],
          keyPoints: [
            'Arizona requires a 60-day waiting period for divorce',
            'Parenting class must be completed before final orders',
            'Arizona is a community property state - assets split 50/50'
          ]
        },
        {
          name: 'Custody Agreement',
          title: 'Custody Agreement Templates',
          description: 'Arizona parenting plan templates and schedules',
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          preview: `PARENTING PLAN AGREEMENT
State of Arizona

Case Number: ________________
Mother: ____________________
Father: _____________________
Child(ren): _________________

1. LEGAL DECISION-MAKING (Custody)
[ ] Joint Legal Decision-Making
    Both parents share major decisions regarding:
    - Education
    - Healthcare
    - Religious upbringing

[ ] Sole Legal Decision-Making to: ____________
    Reason: _________________________________

2. PARENTING TIME SCHEDULE

Regular Schedule:
[ ] Week-on/Week-off (exchanges on ____________)
[ ] 5-2-2-5 Schedule
[ ] Every other weekend (Friday 6pm - Sunday 6pm)
[ ] Other: _________________________________

Holidays (alternating yearly):
- Thanksgiving: [ ] Odd years Mom [ ] Even years Dad
- Christmas Eve: [ ] Odd years Mom [ ] Even years Dad
- Christmas Day: [ ] Odd years Mom [ ] Even years Dad
- Spring Break: [ ] Odd years Mom [ ] Even years Dad
- Child's Birthday: [ ] Shared [ ] Alternating

Summer Schedule:
[ ] Two weeks uninterrupted for each parent
[ ] Follow school year schedule
[ ] Other: _________________________________

3. EXCHANGE LOCATION
[ ] Curbside at ___________________________
[ ] School (drop off/pick up)
[ ] Police station
[ ] Other neutral location: _________________

4. COMMUNICATION
- Phone/video calls: _______________________
- Notice of schedule change: 48 hours minimum
- Emergency contact both parents immediately

5. RELOCATION
Either parent must provide 45 days written notice
before relocating more than 100 miles or out of state,
per A.R.S. Section 25-408.

________________________  Date: ___________
Mother's Signature

________________________  Date: ___________
Father's Signature`,
          keyPoints: [
            'Arizona uses "legal decision-making" instead of "custody"',
            'Courts presume joint legal decision-making is in child\'s best interest',
            'Parenting plans must include holiday and vacation schedules'
          ]
        },
        {
          name: 'Child Support',
          title: 'Child Support Calculation Worksheet',
          description: 'Arizona Child Support Guidelines calculator',
          icon: <DollarSign className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'Arizona Child Support Factors',
              items: [
                'Gross monthly income of both parents',
                'Number of children',
                'Parenting time percentage',
                'Cost of health insurance for children',
                'Childcare costs',
                'Other child support obligations'
              ]
            },
            {
              title: 'What Counts as Income in Arizona',
              items: [
                'Wages, salary, tips, commissions',
                'Self-employment income',
                'Bonuses and overtime',
                'Unemployment benefits',
                'Workers compensation',
                'Social Security benefits',
                'Rental income',
                'Interest and dividends'
              ]
            },
            {
              title: 'Deductions Allowed',
              items: [
                'Court-ordered child support for other children',
                'Court-ordered spousal maintenance paid',
                'Mandatory retirement contributions',
                'Not allowed: voluntary retirement, taxes, living expenses'
              ]
            },
            {
              title: 'How to Calculate (Simplified)',
              content: 'Use the Arizona Child Support Calculator at azcourts.gov. Input both parents\' gross income, parenting time, and children\'s expenses. The calculator will provide the guideline amount. Courts can deviate up to 15% without special findings.'
            }
          ],
          keyPoints: [
            'Arizona child support continues until age 18 (or 19 if still in high school)',
            'Either parent can request modification if income changes by 15%+',
            'Non-payment can result in wage garnishment, license suspension, or jail'
          ]
        },
        {
          name: 'Document Checklist',
          title: 'Document Checklist for Family Court',
          description: 'Essential documents for divorce, custody, and support cases',
          icon: <ClipboardList className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'Financial Documents',
              items: [
                'Last 3 years tax returns (all pages)',
                'Last 3 months pay stubs',
                'Bank statements (all accounts, 6 months)',
                'Retirement account statements',
                'Credit card statements',
                'Mortgage documents',
                'Vehicle titles and loan documents',
                'Business financial statements (if applicable)'
              ]
            },
            {
              title: 'Property Documents',
              items: [
                'Deed to real property',
                'Appraisals or market analysis',
                'List of personal property with values',
                'Prenuptial or postnuptial agreements',
                'Debt documentation'
              ]
            },
            {
              title: 'Custody Documents',
              items: [
                'Birth certificates for all children',
                'School records and report cards',
                'Medical records for children',
                'Documentation of current parenting schedule',
                'Communication logs with other parent',
                'Parenting class completion certificate'
              ]
            }
          ],
          keyPoints: [
            'Arizona requires Affidavit of Financial Information in all family cases',
            'Hiding assets is perjury and can affect your case outcome',
            'Keep organized copies - you may need them months later'
          ]
        },
        {
          name: 'Attorney Referral',
          title: 'Free Attorney Referral in Arizona',
          description: 'Family law legal aid and low-cost resources',
          icon: <Scale className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'Free Family Law Help',
              items: [
                'Community Legal Services: (602) 258-3434',
                'Volunteer Lawyers Program - Family Law Clinic',
                'Arizona Legal Women\'s Project',
                'Florence Crittenton - Domestic violence victims',
                'CASA (Court Appointed Special Advocates)'
              ]
            },
            {
              title: 'Low-Cost Options',
              items: [
                'Arizona State Bar Lawyer Referral: (602) 340-7239',
                'ASU Legal Clinic - Family Law',
                'Certified Legal Document Preparers (not attorneys)',
                'Mediation services through courts',
                'Unbundled legal services (attorney helps with parts)'
              ]
            },
            {
              title: 'Domestic Violence Resources',
              items: [
                'Arizona Coalition to End Sexual & Domestic Violence',
                'Sojourner Center: (602) 244-0997',
                'Order of Protection - Free at court',
                'Victim compensation funds available',
                'Safety planning assistance'
              ]
            }
          ],
          keyPoints: [
            'Self-Service Center staff cannot give legal advice, only procedural help',
            'Mediators are neutral - consider consulting attorney before mediating',
            'Legal Document Preparers can help with forms but not strategy'
          ]
        },
        {
          name: 'Divorce Filing',
          title: 'Arizona Divorce Filing Guide',
          description: 'Step-by-step process for filing dissolution of marriage',
          icon: <FileText className="w-5 h-5 text-rose-600" />,
          preview: `ARIZONA DISSOLUTION OF MARRIAGE
Step-by-Step Filing Guide

RESIDENCY REQUIREMENT:
At least one spouse must have lived in Arizona for
90 days before filing.

TYPES OF DIVORCE:
1. Consent Decree (Uncontested)
   - Both parties agree on everything
   - Fastest option (60 days minimum)
   - File joint petition or petitioner + respondent agrees

2. Default Decree (Uncontested)
   - Respondent does not respond within 20 days
   - Petitioner can request default judgment

3. Contested Divorce
   - Parties disagree on issues
   - Requires court hearings and trial

FILING STEPS:
1. Complete Petition for Dissolution (form varies by county)
2. Complete Preliminary Injunction (automatic restraining order)
3. Complete Summons
4. File with Superior Court Clerk
5. Pay filing fee ($349 Maricopa County) or file fee waiver
6. Serve respondent (cannot do this yourself)
7. Wait for response (20 days)
8. Complete parenting class if children involved
9. Attend Resolution Management Conference
10. Finalize decree (minimum 60 days after service)

REQUIRED DISCLOSURES:
Both parties must exchange:
- Affidavit of Financial Information
- Tax returns (3 years)
- Pay stubs (3 months)
- Bank statements
- Retirement account statements
- Real property appraisals

NO-FAULT STATE:
Arizona is a no-fault divorce state. You only need
to state the marriage is "irretrievably broken."
No need to prove adultery, abuse, etc.`,
          keyPoints: [
            'Arizona has a mandatory 60-day waiting period',
            'Both parties must complete parent education if children involved',
            'Community property is divided "equitably" (usually 50/50)'
          ]
        },
        {
          name: 'Protection Order',
          title: 'Order of Protection Guide',
          description: 'How to get emergency protection from abuse',
          icon: <Shield className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'What an Order of Protection Does',
              items: [
                'Prohibits contact (in person, phone, text, social media)',
                'Orders abuser to stay away from your home, work, school',
                'Can grant temporary custody of children',
                'Can order abuser to leave shared residence',
                'Can prohibit firearms possession',
                'Valid for 1 year (can be renewed)'
              ]
            },
            {
              title: 'Who Can Get an Order',
              items: [
                'Current/former spouse',
                'Current/former romantic partner',
                'Person you have a child with',
                'Family member or household member',
                'Victim of stalking or harassment (use Injunction instead)'
              ]
            },
            {
              title: 'How to File',
              items: [
                'Go to Superior Court Self-Service Center',
                'Complete Petition for Order of Protection',
                'Submit to clerk (no filing fee)',
                'Judge reviews immediately (usually same day)',
                'If granted, order served on respondent',
                'Hearing scheduled within 10 days if respondent requests'
              ]
            },
            {
              title: 'Emergency (Ex Parte) Orders',
              items: [
                'Granted without respondent present',
                'Effective immediately upon service',
                'Hearing held within 10 days',
                'Bring evidence and witnesses to hearing',
                'Order becomes permanent (1 year) if respondent doesn\'t contest'
              ]
            }
          ],
          keyPoints: [
            'FREE to file - no cost for Order of Protection',
            'Can file at any courthouse in Arizona',
            'Violation is a criminal offense'
          ]
        },
        {
          name: 'Modification',
          title: 'Modifying Court Orders',
          description: 'How to change custody, support, or parenting time',
          icon: <FileCheck className="w-5 h-5 text-rose-600" />,
          sections: [
            {
              title: 'When You Can Modify',
              items: [
                'Substantial and continuing change in circumstances',
                'Best interest of child requires change',
                'One parent relocating more than 100 miles',
                'Child is now older with different needs',
                'Income changed significantly (15%+ for support)',
                'Safety concerns have emerged'
              ]
            },
            {
              title: 'Types of Modifications',
              items: [
                'Legal decision-making (custody)',
                'Parenting time schedule',
                'Child support amount',
                'Spousal maintenance',
                'Relocation requests'
              ]
            },
            {
              title: 'Filing Process',
              items: [
                'File Petition to Modify in same county as original order',
                'Pay filing fee or request waiver',
                'Serve the other parent',
                'Attend mediation if ordered',
                'Go to hearing if not resolved',
                'Cannot modify "just because" - need changed circumstances'
              ]
            },
            {
              title: 'Emergency Modifications',
              items: [
                'If child is in immediate danger',
                'File Petition for Emergency Orders',
                'Must show imminent harm',
                'Hearing within 10 days',
                'Temporary order pending full hearing'
              ]
            }
          ],
          keyPoints: [
            'Support modifications usually can\'t go back in time',
            'File as soon as circumstances change - don\'t wait',
            'Document everything (texts, emails, incidents)'
          ]
        },
        {
          name: 'Mediation Prep',
          title: 'Family Court Mediation Preparation',
          description: 'Get ready for successful mediation',
          icon: <Handshake className="w-5 h-5 text-rose-600" />,
          preview: `FAMILY COURT MEDIATION
Preparation Checklist

WHAT IS MEDIATION?
A neutral third party helps you and the other parent
reach agreements about custody, parenting time, and
other family issues. The mediator does NOT decide -
you both must agree.

BEFORE MEDIATION:
[ ] Know your ideal parenting schedule
[ ] Know your "must haves" vs. "nice to haves"
[ ] Prepare a proposed holiday schedule
[ ] Think about school, activities, medical decisions
[ ] Consider child's current routine and needs
[ ] Gather relevant documents (school schedule, etc.)
[ ] List concerns about the other parent (be specific)
[ ] Think about what the other parent might want

DURING MEDIATION:
[ ] Stay calm and professional
[ ] Focus on the children's needs, not your feelings
[ ] Listen without interrupting
[ ] Propose solutions, not just problems
[ ] Be willing to compromise on smaller issues
[ ] Ask for breaks if you need them
[ ] Don't agree to anything you can't live with

WHAT TO BRING:
- Calendar (for scheduling discussions)
- Proposed parenting plan (if you have one)
- Work schedules for both parents
- Children's school and activity schedules
- Notes on your key concerns
- List of questions

IF YOU CAN'T AGREE:
The mediator will report to the judge:
- What was agreed upon
- What issues remain unresolved
- Sometimes recommendations (depends on county)

CONFIDENTIALITY:
What you say in mediation generally cannot be
used against you in court (with some exceptions
for child safety concerns).`,
          keyPoints: [
            'Maricopa County requires Conciliation Services mediation',
            'You can request separate sessions if domestic violence history',
            'Agreements in mediation become binding court orders'
          ]
        }
      ]
    },
    'employment': {
      headerBg: 'bg-gradient-to-r from-green-600 to-green-500',
      iconBg: 'bg-green-100',
      icon: <Clock className="w-7 h-7 text-white" />,
      documentCount: 7,
      tabs: [
        {
          name: 'Wage Claim Guide',
          title: 'Arizona Wage Claim Filing Guide',
          description: 'How to file for unpaid wages with the Industrial Commission',
          icon: <FileText className="w-5 h-5 text-green-600" />,
          sections: [
            {
              title: 'Filing a Wage Claim in Arizona',
              items: [
                'File with Industrial Commission of Arizona (ICA)',
                'Online filing at azica.gov or in person',
                'Must file within 1 year of unpaid wages',
                'No filing fee required',
                'ICA investigates and mediates claims',
                'Can recover unpaid wages plus penalties'
              ]
            },
            {
              title: 'What You Can Claim',
              items: [
                'Unpaid regular wages',
                'Unpaid overtime (if non-exempt)',
                'Unpaid vacation/PTO (if company policy provides it)',
                'Final paycheck not received on time',
                'Unlawful deductions from pay',
                'Minimum wage violations'
              ]
            },
            {
              title: 'Arizona Wage Laws',
              items: [
                'Minimum wage: $14.35/hour (2024)',
                'Must be paid at least semi-monthly',
                'Final wages due within 7 days OR next regular payday',
                'Overtime: 1.5x after 40 hours/week (federal law)',
                'Employers cannot deduct for cash shortages or breakage',
                'Tips belong to employees - cannot be kept by employer'
              ]
            }
          ],
          keyPoints: [
            'Arizona has one of the highest state minimum wages',
            'Proposition 206 provides for annual minimum wage increases',
            'Retaliation for filing wage claim is illegal'
          ]
        },
        {
          name: 'Demand Letter',
          title: 'Demand Letter Templates',
          description: 'Professional demand letters for unpaid wages',
          icon: <Mail className="w-5 h-5 text-green-600" />,
          preview: `[Your Name]
[Your Address]
[City, AZ ZIP]
[Your Email]
[Date]

SENT VIA CERTIFIED MAIL AND EMAIL

[Employer Name]
[Company Name]
[Address]
[City, AZ ZIP]

RE: DEMAND FOR UNPAID WAGES
    Employee: [Your Name]
    Employment Dates: [Start] to [End]
    Amount Owed: $[Amount]

Dear [Employer/HR Manager]:

I am writing to demand payment of wages owed to me for work
performed during my employment with [Company Name].

WAGES OWED:
- Regular wages for period [dates]: $________
- Overtime hours worked but not paid: $________
- Final paycheck not received: $________
- Accrued vacation/PTO: $________
  TOTAL OWED: $________

Under Arizona law (A.R.S. Section 23-351), employers must pay
wages due within [7 days/next regular payday] of separation.
Your failure to pay constitutes a violation of Arizona wage laws.

DEMAND:
I demand full payment of $[Amount] within TEN (10) DAYS of this
letter. Payment should be made by [check/direct deposit] to:

[Your Name]
[Address or account info]

If I do not receive payment by [Date], I will:
1. File a wage claim with the Industrial Commission of Arizona
2. Pursue all legal remedies, including attorneys' fees and
   treble damages under A.R.S. Section 23-355
3. File a complaint with the U.S. Department of Labor (if applicable)

Under Arizona law, I may be entitled to recover THREE TIMES the
unpaid wages plus costs and attorneys' fees if this matter
proceeds to court.

I prefer to resolve this matter without legal action. Please
contact me at [phone] or [email] to arrange payment.

Sincerely,

[Your Signature]
[Your Printed Name]

cc: Industrial Commission of Arizona (upon filing)`,
          keyPoints: [
            'Send demand letter before filing claim - often resolves faster',
            'Keep copy with certified mail receipt as evidence',
            'Arizona allows treble (3x) damages for willful violations'
          ]
        },
        {
          name: 'Evidence Checklist',
          title: 'Evidence Documentation Checklist',
          description: 'Documents to prove your wage claim',
          icon: <ClipboardList className="w-5 h-5 text-green-600" />,
          sections: [
            {
              title: 'Essential Documents',
              items: [
                'Pay stubs for entire employment period',
                'Offer letter or employment contract',
                'Employee handbook (wage/OT policies)',
                'Time records (clock-in sheets, timecards)',
                'Bank statements showing deposits',
                'W-2 forms',
                'Final separation paperwork'
              ]
            },
            {
              title: 'Proving Hours Worked',
              items: [
                'Personal calendar or notes of hours worked',
                'Text/email exchanges about schedule',
                'Witness statements from coworkers',
                'Photos of schedule postings',
                'Computer login records',
                'Badge or key card access logs'
              ]
            },
            {
              title: 'Proving Pay Rate',
              items: [
                'Offer letter with salary/wage',
                'Emails about raises or bonuses',
                'Job posting with pay range',
                'Performance reviews mentioning pay',
                'Handbook with pay scales'
              ]
            }
          ],
          keyPoints: [
            'If employer doesn\'t keep time records, your reasonable estimate is accepted',
            'Text messages and emails are valid evidence',
            'Take photos of workplace postings about pay before leaving'
          ]
        },
        {
          name: 'Deadlines',
          title: 'Filing Deadline Calendar',
          description: 'Time limits for wage claims in Arizona',
          icon: <Calendar className="w-5 h-5 text-green-600" />,
          sections: [
            {
              title: 'Arizona Wage Claim Deadlines',
              items: [
                'ICA Wage Claim: 1 year from when wages were due',
                'State Court (breach of contract): 6 years',
                'Federal FLSA claim: 2 years (3 years if willful)',
                'EEOC discrimination charge: 180-300 days'
              ]
            },
            {
              title: 'ICA Process Timeline',
              items: [
                'File claim online or by mail',
                'ICA assigns investigator (2-4 weeks)',
                'Investigation and employer contact (30-60 days)',
                'Mediation scheduled if needed',
                'Determination issued',
                'Appeal within 30 days if disagree'
              ]
            }
          ],
          keyPoints: [
            'Don\'t wait - the longer you wait, the harder to prove',
            'File with ICA even if deadline is approaching',
            'Federal claims can be filed simultaneously'
          ]
        },
        {
          name: 'Attorney Referral',
          title: 'Free Attorney Referral in Arizona',
          description: 'Employment law attorneys and worker advocacy',
          icon: <Scale className="w-5 h-5 text-green-600" />,
          sections: [
            {
              title: 'Free Employment Law Help',
              items: [
                'Arizona Employment Lawyers Association referral',
                'Community Legal Services - Employment law unit',
                'Equal Justice Works Fellows',
                'EEOC Phoenix District Office: (602) 640-5000',
                'U.S. Department of Labor Wage & Hour: (866) 487-9243'
              ]
            },
            {
              title: 'When to Hire an Attorney',
              items: [
                'Large amount of wages owed (over $5,000)',
                'Employer is hostile or threatening',
                'Complex overtime or classification issues',
                'Retaliation or discrimination involved',
                'Class action potential (multiple employees affected)'
              ]
            },
            {
              title: 'Contingency Fee Attorneys',
              items: [
                'Many employment lawyers work on contingency',
                'No upfront cost - attorney paid from recovery',
                'Fee shifting: employer may pay your attorney fees if you win',
                'Free consultations typically available'
              ]
            }
          ],
          keyPoints: [
            'Small claims court handles cases up to $3,500',
            'ICA process is free and doesn\'t require attorney',
            'FLSA allows fee-shifting so attorneys take cases on contingency'
          ]
        },
        {
          name: 'Discrimination',
          title: 'Workplace Discrimination Guide',
          description: 'How to document and report illegal discrimination',
          icon: <Shield className="w-5 h-5 text-green-600" />,
          sections: [
            {
              title: 'Protected Classes in Arizona',
              items: [
                'Race, color, national origin',
                'Sex, pregnancy, sexual orientation, gender identity',
                'Religion',
                'Age (40 and older)',
                'Disability (physical or mental)',
                'Genetic information',
                'Veteran status'
              ]
            },
            {
              title: 'Types of Discrimination',
              items: [
                'Disparate treatment (treated differently because of protected class)',
                'Harassment (hostile work environment)',
                'Retaliation (punished for complaining)',
                'Failure to accommodate disability or religion',
                'Discriminatory policies (seem neutral but have disparate impact)'
              ]
            },
            {
              title: 'Filing a Discrimination Claim',
              items: [
                'EEOC: Federal claims (180-300 days to file)',
                'Arizona Civil Rights Division: State claims',
                'Must file with agency BEFORE suing in court',
                'Agency will investigate and may mediate',
                'If agency doesn\'t resolve, you get "right to sue" letter',
                'Then have 90 days to file lawsuit'
              ]
            },
            {
              title: 'Documenting Discrimination',
              items: [
                'Write down incidents immediately (date, time, witnesses)',
                'Save emails, texts, and written communications',
                'Note who was treated differently and how',
                'Keep copies of performance reviews',
                'Document any complaints you made to HR',
                'Save any retaliatory actions after complaining'
              ]
            }
          ],
          keyPoints: [
            'Strict deadlines - file with EEOC within 180-300 days',
            'Retaliation is illegal even if underlying claim fails',
            'Many discrimination attorneys work on contingency'
          ]
        },
        {
          name: 'Wrongful Termination',
          title: 'Wrongful Termination Guide',
          description: 'When firing is illegal in Arizona',
          icon: <AlertTriangle className="w-5 h-5 text-green-600" />,
          preview: `WRONGFUL TERMINATION IN ARIZONA
Understanding Your Rights

ARIZONA IS "AT-WILL" - BUT WITH LIMITS

Arizona is an at-will employment state, meaning
employers can generally fire you for any reason
or no reason. HOWEVER, they CANNOT fire you for
an ILLEGAL reason.

ILLEGAL REASONS FOR FIRING:

1. DISCRIMINATION
   - Fired because of race, sex, age, religion,
     disability, national origin, etc.
   - File with EEOC within 180-300 days

2. RETALIATION
   - Fired for filing a complaint (discrimination,
     safety, wage claim)
   - Fired for reporting illegal activity (whistleblower)
   - Fired for taking FMLA leave
   - Fired for filing workers' comp claim

3. BREACH OF CONTRACT
   - Employer violated written employment contract
   - Employer violated promises in employee handbook
   - Employer violated implied contract

4. PUBLIC POLICY VIOLATION
   - Fired for refusing to do something illegal
   - Fired for exercising a legal right (voting, jury duty)
   - Fired for reporting safety violations

5. ARIZONA EMPLOYMENT PROTECTION ACT
   - Employers must follow their own stated procedures
   - If handbook says "progressive discipline," must follow it

WHAT TO DO IF WRONGFULLY TERMINATED:

1. Request termination in writing (reason and date)
2. Get copies of your personnel file
3. Document everything you remember
4. File for unemployment immediately
5. Consult with employment attorney
6. File with appropriate agency (EEOC, OSHA, etc.)

DAMAGES YOU CAN RECOVER:
- Back pay (wages you lost)
- Front pay (future lost wages)
- Benefits lost
- Emotional distress (in some cases)
- Punitive damages (rare but possible)
- Attorney fees`,
          keyPoints: [
            'At-will does NOT mean employers can fire for illegal reasons',
            'Document your termination immediately - memories fade',
            'File for unemployment even if you plan to sue'
          ]
        }
      ]
    },
    'debt': {
      headerBg: 'bg-gradient-to-r from-teal-600 to-teal-500',
      iconBg: 'bg-teal-100',
      icon: <Shield className="w-7 h-7 text-white" />,
      documentCount: 8,
      tabs: [
        {
          name: 'Validation Letter',
          title: 'Debt Validation Letter Templates',
          description: 'Request proof the debt collector has the right to collect',
          icon: <FileText className="w-5 h-5 text-teal-600" />,
          preview: `[Your Name]
[Your Address]
[City, AZ ZIP]
[Date]

SENT VIA CERTIFIED MAIL, RETURN RECEIPT REQUESTED

[Collection Agency Name]
[Address]
[City, State ZIP]

RE: Debt Validation Request
    Account/Reference Number: [Number from letter]
    Alleged Creditor: [Name they claim]
    Alleged Amount: $[Amount]

Dear Sir or Madam:

I am writing in response to your [letter/call] dated [date]
regarding the above-referenced account. This is NOT an
acknowledgment of the debt.

Pursuant to the Fair Debt Collection Practices Act (FDCPA),
15 U.S.C. Section 1692g, I am exercising my right to request
validation of this alleged debt.

PLEASE PROVIDE THE FOLLOWING:

1. PROOF OF DEBT:
   - Signed contract or agreement with original creditor
   - Complete account statements from original creditor
   - Documentation of how the amount was calculated

2. PROOF OF YOUR AUTHORITY:
   - Copy of agreement with original creditor to collect
   - Assignment or sale documentation
   - License to collect debts in Arizona

3. VERIFICATION:
   - Name and address of original creditor
   - Account number with original creditor
   - Date of last payment
   - Date of alleged default

NOTICE: Until you provide adequate validation, you must:
- Cease all collection activities
- Not report this to credit bureaus
- Not contact me about this alleged debt

I also dispute this debt. Do not contact me by telephone.
All communication must be in writing.

If you continue collection activities without providing
validation, I will file complaints with:
- Arizona Attorney General
- Consumer Financial Protection Bureau
- Federal Trade Commission

Sincerely,

[Your Signature]
[Your Printed Name]

[KEEP COPY AND CERTIFIED MAIL RECEIPT]`,
          keyPoints: [
            'Must send within 30 days of first collection contact',
            'Always send certified mail with return receipt',
            'Collector must stop collection until they validate'
          ]
        },
        {
          name: 'Lawsuit Response',
          title: 'Response to Debt Lawsuit Guide',
          description: 'How to respond if you\'re sued in Arizona',
          icon: <Gavel className="w-5 h-5 text-teal-600" />,
          sections: [
            {
              title: 'If You\'re Served with a Lawsuit',
              items: [
                'You have 20 DAYS to file a written response (Answer)',
                'File your Answer with the court listed on the Summons',
                'Serve a copy on the plaintiff\'s attorney',
                'Failing to respond = default judgment against you',
                'Filing fee may be waived for low-income defendants'
              ]
            },
            {
              title: 'Common Defenses in Arizona',
              items: [
                'Statute of Limitations expired (6 years for written contracts)',
                'Debt was already paid or settled',
                'Debt is not yours (identity theft, wrong person)',
                'Amount claimed is incorrect',
                'Plaintiff lacks standing (can\'t prove they own debt)',
                'Improper service of process'
              ]
            },
            {
              title: 'Sample Answer Format',
              items: [
                'Caption: Match the court heading from Summons',
                'Introductory paragraph: "Defendant answers as follows..."',
                'Numbered responses: Admit, Deny, or Lack Knowledge',
                'Affirmative Defenses: List all defenses',
                'Prayer: "Wherefore, Defendant requests dismissal..."',
                'Signature and date'
              ]
            }
          ],
          keyPoints: [
            'Arizona statute of limitations: 6 years for written contracts, 3 years for oral',
            'Even if you owe the debt, the collector must prove it',
            'About 90% of debt collection cases end in default judgment - RESPOND!'
          ]
        },
        {
          name: 'SOL Checker',
          title: 'Statute of Limitations Checker',
          description: 'Determine if your debt is too old to sue',
          icon: <Clock className="w-5 h-5 text-teal-600" />,
          sections: [
            {
              title: 'Arizona Statute of Limitations',
              items: [
                'Credit Cards: 6 years (written contract)',
                'Medical Bills: 6 years (usually written)',
                'Personal Loans: 6 years (written) or 3 years (oral)',
                'Auto Loans: 6 years',
                'Mortgage Deficiency: 6 years',
                'Judgments: 10 years (renewable)'
              ]
            },
            {
              title: 'When the Clock Starts',
              items: [
                'Usually: Date of last payment',
                'Sometimes: Date of default or charge-off',
                'Check account statements for exact dates',
                'Moving states may change which SOL applies'
              ]
            },
            {
              title: 'Warning: Restarting the Clock',
              items: [
                'Making a payment restarts the SOL',
                'A written promise to pay may restart it',
                'Acknowledging the debt in writing may restart it',
                'Do NOT make partial payments on old debt without consulting attorney'
              ]
            }
          ],
          keyPoints: [
            'SOL is an affirmative defense - you must raise it in court',
            'Even time-barred debt can still be reported on credit reports',
            'Collectors can still try to collect - just can\'t sue successfully'
          ]
        },
        {
          name: 'Negotiation Scripts',
          title: 'Negotiation Scripts and Tips',
          description: 'How to settle debt for less than you owe',
          icon: <MessageSquare className="w-5 h-5 text-teal-600" />,
          preview: `DEBT SETTLEMENT PHONE SCRIPT

---BEFORE CALLING---
Know: Your total debt, what you can realistically pay,
and if the statute of limitations has passed.

---OPENING---
"Hello, I'm calling about account number [X]. I've been
having financial difficulties but I'd like to resolve
this account. Before we discuss anything, I need to
let you know I'm recording this call for my records."

---GATHERING INFORMATION---
"Can you tell me:
- The original creditor name?
- The current total balance including interest/fees?
- When was the last payment on this account?
- Can you send me documentation of this debt?"

---MAKING AN OFFER---
"I can't afford the full amount, but I can offer a
lump sum settlement of $[X] to resolve this completely.
This would be payment in full."

[START LOW - offer 25-40% of total]

---IF THEY COUNTER---
"I understand, but that's more than I can afford.
The most I could possibly do is $[Y]."

---GETTING IT IN WRITING---
"Before I make any payment, I need a written settlement
agreement that states:
1. The settlement amount
2. This will be reported as 'Paid in Full' or
   'Settled' to credit bureaus
3. The account will be closed
4. You won't sell the remaining balance to another
   collector"

---CLOSING---
"Please send me this agreement in writing. Once I
receive and review it, I'll send payment. I will
not make any payment until I have the written
agreement."

---NEVER---
- Give access to your bank account
- Agree to post-dated checks
- Pay without written agreement
- Admit the debt is valid if SOL may have passed`,
          keyPoints: [
            'Always negotiate in writing when possible',
            'Never give bank account access for automatic payments',
            'Get settlement agreement BEFORE sending money'
          ]
        },
        {
          name: 'Attorney Referral',
          title: 'Free Attorney Referral in Arizona',
          description: 'Consumer debt defense and legal aid',
          icon: <Scale className="w-5 h-5 text-teal-600" />,
          sections: [
            {
              title: 'Free Legal Help for Debt Issues',
              items: [
                'Community Legal Services: (602) 258-3434',
                'Arizona Consumer Law Group (contingency)',
                'Legal Aid Society of Phoenix',
                'Debt Defense Arizona',
                'NACA (National Association of Consumer Advocates)'
              ]
            },
            {
              title: 'When You NEED an Attorney',
              items: [
                'You\'ve been sued and don\'t know how to respond',
                'Wage garnishment has started',
                'Creditor is violating the law (harassment, false statements)',
                'You\'re considering bankruptcy',
                'Large amounts of debt involved'
              ]
            },
            {
              title: 'Arizona Consumer Protections',
              items: [
                'Arizona Consumer Fraud Act',
                'FDCPA violations: Up to $1,000 per violation',
                'Wage garnishment limit: 25% of disposable income',
                'Head of household exemption from garnishment',
                'Bankruptcy exemptions protect some property'
              ]
            }
          ],
          keyPoints: [
            'FDCPA violations can result in collectors paying YOUR attorney fees',
            'Many consumer attorneys offer free consultations',
            'Document all collector communications for potential lawsuits'
          ]
        },
        {
          name: 'Credit Disputes',
          title: 'Credit Report Dispute Guide',
          description: 'How to fix errors and remove inaccurate debts',
          icon: <FileCheck className="w-5 h-5 text-teal-600" />,
          preview: `CREDIT REPORT DISPUTE LETTER
Template for Disputing Inaccurate Information

[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Credit Bureau Name]
[Address]

RE: Dispute of Inaccurate Credit Information
    SSN: XXX-XX-[last 4]
    DOB: [Date]

Dear Sir or Madam:

I am writing to dispute the following information in
my credit report. The items I dispute are identified
below with explanations:

DISPUTED ITEM #1:
Creditor Name: ____________________
Account Number: ____________________
Reason for Dispute:
[ ] This account is not mine
[ ] The balance is incorrect (correct balance: $____)
[ ] The account status is wrong
[ ] This debt was paid/settled
[ ] This debt is past the 7-year reporting period
[ ] This is a duplicate entry
[ ] I was an authorized user, not account holder

DOCUMENTATION ENCLOSED:
- Copy of [relevant document]
- [Other supporting evidence]

Under the Fair Credit Reporting Act (FCRA), you are
required to investigate this dispute within 30 days
and remove or correct any information that cannot
be verified.

Please send me written confirmation of your
investigation results.

Sincerely,
[Your Signature]
[Your Printed Name]

ENCLOSURES:
- Copy of credit report with disputed item circled
- Copy of [supporting documents]
- Copy of government ID

SEND TO ALL THREE BUREAUS:
Equifax: P.O. Box 740256, Atlanta, GA 30374
Experian: P.O. Box 4500, Allen, TX 75013
TransUnion: P.O. Box 2000, Chester, PA 19016`,
          keyPoints: [
            'Bureaus must investigate within 30 days',
            'Send disputes via certified mail with return receipt',
            'If debt collector reported inaccuately, you can sue under FCRA'
          ]
        },
        {
          name: 'Bankruptcy Basics',
          title: 'Bankruptcy Overview for Arizona',
          description: 'When bankruptcy might be the right choice',
          icon: <Scale className="w-5 h-5 text-teal-600" />,
          sections: [
            {
              title: 'Types of Bankruptcy',
              items: [
                'Chapter 7: "Fresh start" - debts discharged, some property sold',
                'Chapter 13: Payment plan (3-5 years) - keep property, pay back portion',
                'Chapter 7 requires "means test" (income below median)',
                'Chapter 13 requires regular income to make payments'
              ]
            },
            {
              title: 'What Bankruptcy Can Do',
              items: [
                'Stop wage garnishment immediately',
                'Stop collection calls and lawsuits',
                'Eliminate credit card debt',
                'Eliminate medical bills',
                'Eliminate personal loans',
                'Stop foreclosure (temporarily)',
                'Stop utility shutoffs'
              ]
            },
            {
              title: 'What Bankruptcy CANNOT Eliminate',
              items: [
                'Child support and alimony',
                'Most student loans (with rare exceptions)',
                'Recent tax debts (last 3 years)',
                'Debts from fraud or intentional harm',
                'Court fines and restitution',
                'Secured debts if keeping collateral (car, house)'
              ]
            },
            {
              title: 'Arizona Bankruptcy Exemptions',
              items: [
                'Homestead: $250,000 equity in home',
                'Vehicle: $6,000 equity',
                'Personal property: $6,000 total',
                'Wildcard: $500 for any property',
                'Tools of trade: $5,000',
                'Life insurance cash value (limited)'
              ]
            }
          ],
          keyPoints: [
            'Credit counseling required before filing',
            'Stays on credit report 7-10 years',
            'Consult bankruptcy attorney for your specific situation'
          ]
        },
        {
          name: 'Your Rights',
          title: 'Debt Collector Rights & Violations',
          description: 'Know what collectors can and cannot do',
          icon: <Shield className="w-5 h-5 text-teal-600" />,
          preview: `YOUR RIGHTS UNDER THE FDCPA
Fair Debt Collection Practices Act

DEBT COLLECTORS CANNOT:

HARASSMENT:
X Call repeatedly to annoy you
X Use profane or abusive language
X Threaten violence or harm
X Publish your name as a "deadbeat"
X Call you at work if you say stop

FALSE STATEMENTS:
X Claim to be attorneys when they're not
X Threaten arrest or jail
X Claim you'll be sued when they won't
X Misrepresent amount owed
X Pretend to be government officials
X Threaten to seize property they can't legally take

UNFAIR PRACTICES:
X Collect more than you owe
X Deposit post-dated checks early
X Take your property without legal right
X Contact you by postcard (privacy violation)
X Add unauthorized fees or interest

YOUR RIGHTS:

1. VALIDATION
   Request proof of debt in writing
   They must stop collecting until they validate

2. CEASE COMMUNICATION
   Send written request to stop contact
   They can only contact you about lawsuits after

3. LIMITED CONTACT TIMES
   Cannot call before 8am or after 9pm
   Cannot call at inconvenient places

4. THIRD PARTY CONTACT
   Cannot discuss debt with family, friends, employer
   Limited exceptions for location information

5. SUE FOR VIOLATIONS
   Up to $1,000 per lawsuit for violations
   Actual damages if you can prove them
   Attorney fees paid by collector if you win

DOCUMENT EVERYTHING:
- Date and time of each call
- Name of person who called
- What was said
- Keep copies of all letters`,
          keyPoints: [
            'Recording laws vary - Arizona is one-party consent',
            'File CFPB complaints online at consumerfinance.gov',
            'Violations can result in $1,000+ damages per case'
          ]
        }
      ]
    },
    'negotiation': {
      headerBg: 'bg-gradient-to-r from-amber-600 to-stone-800',
      iconBg: 'bg-amber-100',
      icon: <Handshake className="w-7 h-7 text-white" />,
      documentCount: 6,
      tabs: [
        {
          name: 'Strategy Guide',
          title: 'Negotiation Scripts Tailored to Your Inputs',
          description: 'Strategies generated based on the information you provide',
          icon: <Brain className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'What You\'ll Get',
              items: [
                'BATNA analysis - your alternatives if negotiation fails',
                'ZOPA calculation - the zone where agreement is possible',
                'Opening anchor recommendation based on leverage',
                'Counter-offer response strategies',
                'Psychological tactics to use (and defend against)',
                'When to walk away signals'
              ]
            },
            {
              title: 'Types of Negotiations Covered',
              items: [
                'Landlord disputes (deposits, repairs, lease terms)',
                'Wage claims (unpaid wages, severance)',
                'Debt settlements',
                'Insurance claims',
                'Contract disputes',
                'Consumer complaints'
              ]
            }
          ],
          keyPoints: [
            'Strategies based on Harvard Law negotiation frameworks',
            'Tailored to the amounts and details you enter',
            'Includes copy-paste scripts for phone, email, and letters'
          ]
        },
        {
          name: 'Opening Statement',
          title: 'Opening Statements & Key Talking Points',
          description: 'How to start strong in any negotiation',
          icon: <MessageSquare className="w-5 h-5 text-amber-600" />,
          preview: `SAMPLE OPENING STATEMENT FRAMEWORK

---FOR LANDLORD DEPOSIT DISPUTE---

"Thank you for taking the time to discuss this. I want
to resolve this fairly for both of us.

I lived at [address] for [X years/months] and always paid
rent on time. When I moved out on [date], I left the unit
in good condition - I have photos documenting this.

Under Arizona law (A.R.S. 33-1321), I'm entitled to my
$[amount] security deposit minus any legitimate damages
beyond normal wear and tear.

I've reviewed your deduction list and I believe $[amount]
of those deductions aren't valid because [reason].

I'm hoping we can agree on a fair refund of $[your target]
today. What are your thoughts?"

---KEY TALKING POINTS---

1. ANCHOR HIGH (BUT REASONABLE)
   Start with a number higher than you expect, but
   support it with reasoning.

2. USE "I" STATEMENTS
   "I feel..." "I need..." - less confrontational than
   "You never..." "You always..."

3. ACKNOWLEDGE THEIR PERSPECTIVE
   "I understand this is challenging..." shows
   good faith.

4. STATE YOUR BATNA
   "If we can't resolve this, I'll need to [file claim/
   go to court]" - shows you have alternatives.

5. ASK QUESTIONS
   "Help me understand..." "What would work for you?"
   Information is power.`,
          keyPoints: [
            'The first number mentioned anchors the negotiation',
            'Confident but collaborative tone gets best results',
            'Always mention your alternatives (BATNA) subtly'
          ]
        },
        {
          name: 'Settlement Ranges',
          title: 'Scenario-Based Settlement Ranges',
          description: 'Estimates based on the numbers you enter -- for planning purposes only',
          icon: <DollarSign className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Assumptions & Limits',
              content: 'All figures are scenario-planning estimates derived from the numbers you provide. They are not market data, appraisals, or legal guidance. Actual outcomes depend on facts, evidence, jurisdiction, and opposing party behavior. Always verify your inputs and consult a licensed attorney before relying on any amount in a real negotiation.'
            },
            {
              title: 'How Your Range Is Calculated',
              items: [
                'Your claim amount and supporting evidence strength',
                'Typical settlement percentages for your dispute type',
                'Your leverage factors (time pressure, alternatives)',
                'Their likely BATNA (cost of not settling)',
                'Arizona case outcome patterns for similar disputes'
              ]
            },
            {
              title: 'Sample Settlement Ranges by Type',
              items: [
                'Security deposit: Typically recover 60-100%',
                'Wage claims: Often settle for 70-90% to avoid litigation',
                'Debt settlements: Lump sum offers at 25-50% commonly accepted',
                'Insurance underpayment: Push for 80-100% of fair value',
                'Consumer disputes: Full refund + goodwill common'
              ]
            }
          ],
          keyPoints: [
            'Your range is calculated from your inputs -- not independent data',
            'Includes rationale to support your numbers in conversation',
            'Shows planning-level opening, target, and walk-away points'
          ]
        },
        {
          name: 'Counter Strategies',
          title: 'Counter-Offer Response Strategies',
          description: 'What to say when they push back',
          icon: <Target className="w-5 h-5 text-amber-600" />,
          preview: `COUNTER-OFFER RESPONSE SCRIPTS

---WHEN THEY LOWBALL YOU---

Their offer: "We can only offer $X" (way below your target)

Response: "I appreciate you making an offer. Help me
understand how you arrived at that number? [pause]

I was thinking more in the range of $[your anchor] based
on [your reasoning]. What would need to happen for you
to get closer to that range?"

---WHEN THEY SAY "THAT'S OUR FINAL OFFER"---

Response: "I understand you may have constraints. Before
we end this conversation, let me share why that doesn't
work for me: [reasons].

If the dollar amount is firm, are there other ways to
add value? [payment terms, additional items, timeline]"

---WHEN THEY GET AGGRESSIVE---

Response: "I want to resolve this, but I need us to keep
this professional. Let's focus on the facts and finding
a fair solution.

What specific concerns do you have with my position?"

---WHEN THEY DELAY---

Response: "I'd like to resolve this soon. I have [deadline/
next step] coming up on [date]. Can we agree on something
today, or do you need to consult with someone? When can
I expect a response?"

---THE FLINCH---
When they make an offer, pause. Look surprised (even if
it's reasonable). "Hmm... that's quite a bit lower than
I expected based on [X]." They may improve immediately.`,
          keyPoints: [
            'Never accept the first offer',
            'Silence is a powerful tool - let them fill it',
            '"Final offer" is rarely final'
          ]
        },
        {
          name: 'Red Flags',
          title: 'Red Flags to Watch For',
          description: 'Warning signs the other party is acting in bad faith',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Bad Faith Negotiation Signs',
              items: [
                'Refusing to put offers in writing',
                'Constantly changing their position',
                'Making threats or ultimatums early',
                'Not responding to reasonable requests',
                'Lying about facts you can verify',
                'Refusing to explain their reasoning'
              ]
            },
            {
              title: 'Manipulative Tactics to Recognize',
              items: [
                'Good cop/bad cop - switching between friendly and aggressive',
                'Artificial deadlines - "offer expires in 24 hours"',
                'Anchoring with absurd numbers',
                'Nibbling - asking for more after agreement',
                'Take it or leave it (usually a bluff)',
                'Emotional manipulation'
              ]
            },
            {
              title: 'When to Walk Away',
              items: [
                'Your BATNA is better than their best offer',
                'They\'re clearly acting in bad faith',
                'The process is costing you more than potential gain',
                'They\'ve crossed ethical or legal lines',
                'Agreement would set a bad precedent'
              ]
            }
          ],
          keyPoints: [
            'Document everything when you see bad faith',
            'Bad faith in negotiation can be evidence in court',
            'Trust your instincts - if something feels wrong, pause'
          ]
        },
        {
          name: 'Download PDF',
          title: 'Downloadable PDF Strategy Document',
          description: 'Take your tailored strategy document anywhere -- verify all facts before sending',
          icon: <Download className="w-5 h-5 text-amber-600" />,
          sections: [
            {
              title: 'Your PDF Strategy Document Includes',
              items: [
                'Executive summary of your negotiation',
                'Key numbers: anchor, target, reservation point',
                'All scripts tailored to the details you entered',
                'Checklist to use during negotiation',
                'Counter-offer response cheat sheet',
                'Notes section to track the negotiation'
              ]
            },
            {
              title: 'How to Use Your Strategy PDF',
              items: [
                'Review before any negotiation call or meeting',
                'Keep nearby during conversations for quick reference',
                'Use the scripts as templates for emails/letters',
                'Track offers and counter-offers in notes section',
                'Share with an attorney if you need to escalate'
              ]
            },
            {
              title: 'After Purchase: What to Expect',
              items: [
                'Complete 3 guided steps (dispute details, leverage analysis, range inputs)',
                'Your strategy and scripts are generated based on those inputs',
                'You can edit your facts and regenerate outputs within 30 days',
                'Each purchase covers one dispute or matter',
                'Export as downloadable PDF for offline use'
              ]
            }
          ],
          keyPoints: [
            'PDF generated after completing all strategy steps',
            'Printable format (PDF) for offline reference',
            'Editable inputs and regeneration available for 30 days'
          ]
        }
      ]
    }
  };

  return content[packId] || null;
}
