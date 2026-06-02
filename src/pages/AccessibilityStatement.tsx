import { CheckCircle, Eye, Keyboard, Volume2, ArrowRight, FileText, Mail } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function AccessibilityStatement() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 px-4 py-2 rounded-full mb-4">
              <Eye className="w-4 h-4 text-teal-600" />
              <span className="text-navy-700 text-sm font-semibold">{en ? 'Our Commitment' : 'Nuestro Compromiso'}</span>
            </div>
            <h1 className="text-4xl font-bold text-navy-900 mb-4">
              {en ? 'Accessibility Statement' : 'Declaración de Accesibilidad'}
            </h1>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              {en
                ? 'ezLegal.ai is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone.'
                : 'ezLegal.ai está comprometido a garantizar la accesibilidad digital para personas con discapacidades. Mejoramos continuamente la experiencia del usuario para todos.'}
            </p>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Our Accessibility Commitment</h2>
              <p className="text-navy-600 mb-4">
                At ezLegal.ai, we believe that access to legal information should be available to everyone,
                regardless of ability. We are actively working to meet and exceed Web Content Accessibility
                Guidelines (WCAG) 2.2 Level AA standards.
              </p>
              <p className="text-navy-600">
                This commitment is core to our mission of expanding access to justice. We recognize that accessibility
                is an ongoing journey and are dedicated to continuous improvement.
              </p>
            </section>

            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">Accessibility Features</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Keyboard className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">Keyboard Navigation</h3>
                      <p className="text-sm text-navy-600">
                        All interactive elements can be accessed and operated using keyboard alone
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">Screen Reader Support</h3>
                      <p className="text-sm text-navy-600">
                        Compatible with JAWS, NVDA, VoiceOver, and other assistive technologies
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">Visual Design</h3>
                      <p className="text-sm text-navy-600">
                        High contrast ratios, clear typography, and resizable text up to 200%
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">Alternative Text</h3>
                      <p className="text-sm text-navy-600">
                        All meaningful images include descriptive alternative text
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">WCAG 2.2 Conformance</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Target: WCAG 2.2 Level AA</h3>
                    <p className="text-sm text-navy-600">
                      We are actively working to conform to Level AA standards across all pages and features
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">Ongoing Testing</h3>
                    <p className="text-sm text-navy-600">
                      Regular audits using automated tools and manual testing with assistive technologies
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-navy-900">User Feedback Integration</h3>
                    <p className="text-sm text-navy-600">
                      We actively seek and incorporate feedback from users with disabilities
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Known Limitations</h2>
              <p className="text-navy-600 mb-4">
                We are transparent about areas where we're still improving:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-600">
                    <strong>Chat Interface:</strong> Some chat interactions may require additional keyboard shortcuts.
                    We are working to improve focus management and screen reader announcements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-600">
                    <strong>Form Validation:</strong> Error messages are being enhanced to provide clearer,
                    more accessible feedback.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span className="text-navy-600">
                    <strong>Modal Dialogs:</strong> Focus trapping and keyboard escape handling are being optimized.
                  </span>
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Assistive Technologies</h2>
              <p className="text-navy-600 mb-4">
                ezLegal.ai is designed to be compatible with the following assistive technologies:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Screen Readers</h3>
                  <ul className="text-sm text-navy-600 space-y-1">
                    <li>• JAWS (Windows)</li>
                    <li>• NVDA (Windows)</li>
                    <li>• VoiceOver (macOS/iOS)</li>
                    <li>• TalkBack (Android)</li>
                  </ul>
                </div>
                <div className="bg-navy-50 rounded-lg p-4">
                  <h3 className="font-semibold text-navy-900 mb-2">Other Technologies</h3>
                  <ul className="text-sm text-navy-600 space-y-1">
                    <li>• Screen magnification software</li>
                    <li>• Voice recognition software</li>
                    <li>• Browser zoom (up to 200%)</li>
                    <li>• High contrast modes</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-br from-navy-50 to-teal-50 rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Feedback and Contact</h2>
              <p className="text-navy-600 mb-4">
                We welcome your feedback on the accessibility of ezLegal.ai. If you encounter any accessibility
                barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="bg-white rounded-xl p-6 border border-navy-200">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">Email</h3>
                    <a
                      href="mailto:accessibility@ezlegal.ai"
                      className="text-teal-600 hover:text-navy-700 hover:underline"
                    >
                      accessibility@ezlegal.ai
                    </a>
                  </div>
                </div>
                <p className="text-sm text-navy-600">
                  We strive to respond to accessibility feedback within 2 business days and to resolve issues
                  within 10 business days, depending on complexity.
                </p>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-navy-200 p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Technical Specifications</h2>
              <p className="text-navy-600 mb-4">
                Accessibility of ezLegal.ai relies on the following technologies:
              </p>
              <ul className="space-y-2 text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>HTML5</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>WAI-ARIA (Accessible Rich Internet Applications)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>CSS3</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                  <span>JavaScript (ES6+)</span>
                </li>
              </ul>
            </section>

            <section className="text-center bg-navy-50 rounded-2xl p-8">
              <p className="text-sm text-navy-500">
                <strong>Last Updated:</strong> January 16, 2026
              </p>
              <p className="text-sm text-navy-500 mt-2">
                This accessibility statement is reviewed and updated regularly as we continue to improve our platform.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
