import { Scale, Target, Users, Zap, Shield, Brain, Award, TrendingUp, CheckCircle, Sparkles, Heart, Eye, Lock, MessageCircle, BookOpen, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Trust & Privacy',
      description: 'We protect your personal and legal information with enterprise-grade security—your data belongs to you, always.',
    },
    {
      icon: Brain,
      title: 'AI Innovation',
      description: 'Leveraging cutting-edge AI from LegalBreeze to make legal information accessible to everyone who needs it.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Your success is our mission. We provide dedicated support and continuously improve to serve individuals and small businesses better.',
    },
    {
      icon: Award,
      title: 'Accessibility',
      description: 'Committed to delivering affordable, high-quality legal assistance that breaks down barriers to justice.',
    },
  ];

  const stats = [
    { value: 'Growing', label: 'Community' },
    { value: 'AI-Powered', label: 'Legal Assistance' },
    { value: 'Free Tier', label: 'No Credit Card Required' },
    { value: 'Bilingual', label: 'English & Español' },
  ];

  const team = [
    {
      name: 'Troy Hoch',
      role: 'Founder & Chief Executive Officer',
      bio: 'Partner at Quarles & Brady LLP with over 20 years of private practice experience. Troy holds a BA in Business Administration from the University of San Diego and a JD from Gonzaga University, leading ezLegal.ai™\'s AI ethical standards and Access to Justice initiatives.',
    },
    {
      name: 'Jen Hoch',
      role: 'Co-Founder & Chief Learning Officer',
      bio: 'With a Master\'s in Education from the University of Arizona and 15 years as an online education specialist, Jen brings Fortune 500 training expertise to ensure our platform delivers accessible, effective legal education for all users.',
    },
    {
      name: 'Mark Dean',
      role: 'Co-Founder & Chief Revenue Officer',
      bio: 'Fortune 1000 sales leader with executive experience at EverCommerce, Intuit, LinkedIn, GoDaddy, and First Data. Mark serves as an Arizona Commerce Authority mentor and startup advisor, driving revenue strategy and customer success.',
    },
    {
      name: 'Rebecca Salido',
      role: 'Go-to-Market Growth Leader',
      bio: 'Former American Bar Association researcher in national security law with degrees in Law and English Literature from the University of Arizona. Rebecca is a bilingual strategist focused on serving underserved communities and expanding access to justice.',
    },
    {
      name: 'Thomas Norton',
      role: 'Chief Legal Officer',
      bio: 'Principal at Norton Vaughan, L.L.C. with 22 years of legal experience spanning criminal defense, family law, and child welfare. A former Pima County prosecutor, Thomas holds a BA from Loyola Marymount and a JD from Gonzaga University.',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'Started with a vision to make legal information accessible' },
    { year: '2021', title: 'AI Platform Launch', description: 'Released our first AI-powered legal assistant' },
    { year: '2022', title: 'Platform Enhancement', description: 'Expanded AI capabilities and legal document features' },
    { year: '2023', title: 'Arizona Focus', description: 'Deep specialization in Arizona law and attorney network' },
    { year: '2024', title: 'GTM Launch', description: 'Go-to-market expansion serving individuals and small businesses' },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/30">
              <Sparkles className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-semibold text-white">Making Legal Information Accessible with AI</span>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight text-white">
              Legal Assistance for Everyone Who Needs It
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-10">
              We're on a mission to make legal information accessible and affordable for individuals, families, small businesses, and pro bono organizations through the power of AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ask"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Get Help Now
              </Link>
              <Link
                to="/ezreads"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/25 transition-colors border border-white/30"
              >
                <BookOpen className="w-5 h-5" />
                Legal Guides
              </Link>
              <Link
                to="/emergency-resources"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/25 transition-colors border border-white/30"
              >
                <Phone className="w-5 h-5" />
                Crisis Resources
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">{stat.value}</div>
              <div className="text-navy-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-20 text-sm">
          <span className="text-navy-400">Learn more:</span>
          <Link to="/trust-center" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors">Trust Center</Link>
          <span className="text-navy-300 hidden sm:inline">|</span>
          <Link to="/scope-disclaimers" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors">Scope & Disclaimers</Link>
          <span className="text-navy-300 hidden sm:inline">|</span>
          <Link to="/privacy" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors">Privacy Policy</Link>
          <span className="text-navy-300 hidden sm:inline">|</span>
          <Link to="/ai-governance" className="text-teal-600 hover:text-teal-700 hover:underline font-medium transition-colors">AI Ethics</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-navy-50 text-teal-600 px-4 py-2 rounded-full mb-4 border border-navy-200">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">Our Mission</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-6">
              Breaking Down Barriers to Legal Access
            </h2>
            <p className="text-lg text-navy-600 mb-4 leading-relaxed">
              Legal aid advocates and technologists built ezLegal.ai. Quality legal information shouldn't be a privilege.
            </p>
            <p className="text-lg text-navy-600 mb-4 leading-relaxed">
              <a href="https://legalbreeze.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium"><span className="text-navy-600">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-600">e</span><sup className="text-[8px] text-navy-500">TM</sup></a> powers our platform. We pair legal expertise with AI so individuals, families, and small businesses can afford the guidance they need.
            </p>
            <p className="text-lg text-navy-600 leading-relaxed">
              Every feature expands legal access. We prepare people for attorney consultations and help them make informed decisions. Think of us as the bridge between a legal question and the right next step.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-600 to-navy-800 rounded-2xl p-8 text-white shadow-xl">
              <Scale className="w-16 h-16 mb-6 text-white/90" />
              <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
              <p className="text-white/90 leading-relaxed">
                To make quality legal information accessible to everyone, regardless of their financial situation. We envision a world where understanding your rights and getting legal support is simple, affordable, and available to all.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-navy-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-navy-900 mb-1">Trusted by Communities</div>
                  <div className="text-sm text-navy-600">Pro bono organizations and individuals rely on our platform daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-50 text-teal-600 px-4 py-2 rounded-full mb-4 border border-navy-200">
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Our Values</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">What Drives Us</h2>
            <p className="text-lg text-navy-600 max-w-2xl mx-auto">
              Our core values guide every decision we make and every feature we build
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-navy-200"
              >
                <div className="w-12 h-12 bg-navy-50 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">{value.title}</h3>
                <p className="text-navy-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="bg-navy-50 rounded-3xl p-8 md:p-12 border-2 border-navy-200">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-navy-50 px-4 py-2 rounded-full mb-4 border border-navy-200">
                <Heart className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-navy-700">Ethical AI Commitment</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navy-900">
                How We're Different from Other Legal AI Tools
              </h2>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                Not all legal AI platforms are built with the same values. Here's why we stand apart.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border-2 border-navy-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">100% Transparent Pricing</h3>
                <p className="text-navy-600 mb-3 text-sm">
                  Our pricing is visible on every page. No hidden fees, no surprises, no need to "contact sales."
                </p>
                <div className="text-xs text-navy-500 italic">
                  Unlike: Competitors who hide pricing and require sales calls
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-navy-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">Your Data Stays Private</h3>
                <p className="text-navy-600 mb-3 text-sm">
                  We NEVER use your conversations or documents to train AI models. Your legal matters are confidential, period.
                </p>
                <div className="text-xs text-navy-500 italic">
                  Unlike: Tools that track you with multiple analytics pixels
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-navy-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-900">Built for Accessibility</h3>
                <p className="text-navy-600 mb-3 text-sm">
                  Free plan available forever. We exist to serve individuals, families, and pro bono orgs—not just businesses.
                </p>
                <div className="text-xs text-navy-500 italic">
                  Unlike: Business-only tools with no social mission
                </div>
              </div>
            </div>

            <div className="mt-8 bg-navy-50 rounded-xl p-6 border-2 border-navy-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-teal-600 mb-2">Our Commitment</div>
                <p className="text-lg leading-relaxed text-navy-800">
                  "We measure our success not by revenue, but by the number of people we help gain access to justice. Every design decision we make asks: Does this empower someone to understand their legal options?"
                </p>
                <p className="text-sm text-navy-600 mt-3">— ezLegal.ai™ Team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-50 text-teal-600 px-4 py-2 rounded-full mb-4 border border-navy-200">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Our Journey</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Milestones & Growth</h2>
            <p className="text-lg text-navy-600 max-w-2xl mx-auto">
              From concept to platform, here is how we have grown together with our community
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-600 to-navy-300 hidden md:block"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-navy-200 inline-block">
                      <div className="text-3xl font-bold text-teal-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-navy-900 mb-2">{milestone.title}</h3>
                      <p className="text-navy-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-teal-600 rounded-full border-4 border-white shadow-md flex-shrink-0 relative z-10 hidden md:block"></div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-50 text-teal-600 px-4 py-2 rounded-full mb-4 border border-navy-200">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">Leadership Team</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-navy-600 max-w-2xl mx-auto">
              A dedicated team of legal, education, and business professionals united by a mission to make justice accessible to all
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {team.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-navy-200 group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-700">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-900 mb-1">{member.name}</h3>
                  <div className="text-teal-600 font-semibold text-sm mb-3">{member.role}</div>
                  <p className="text-navy-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.slice(3).map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-navy-200 group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 to-navy-50 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-teal-700">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-900 mb-1">{member.name}</h3>
                  <div className="text-teal-600 font-semibold text-sm mb-3">{member.role}</div>
                  <p className="text-navy-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-12 text-white text-center shadow-xl">
          <Zap className="w-16 h-16 mx-auto mb-6 text-white/90" />
          <h2 className="text-3xl font-bold mb-4 text-white">Get the Legal Information You Deserve</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Whether you're facing a legal question, managing a small business, or running a pro bono organization, we're here to help. Legal assistance shouldn't be out of reach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white text-navy-700 rounded-lg font-semibold hover:bg-navy-50 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
