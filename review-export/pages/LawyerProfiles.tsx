import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Award, Globe, MessageSquare,
  ArrowRight, Users, Briefcase, Info
} from 'lucide-react';
import AttorneyMatchingDisclosure from '../components/AttorneyMatchingDisclosure';
import LawyerProfileModal from '../components/LawyerProfileModal';
import { arizonaLawyers, practiceAreaCategories, type LawyerProfile } from '../data/arizonaLawyers';

export default function LawyerProfiles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [sortBy, setSortBy] = useState<'experience' | 'price'>('experience');
  const [selectedLawyer, setSelectedLawyer] = useState<LawyerProfile | null>(null);
  const [spanishOnly, setSpanishOnly] = useState(false);
  const [freeConsultation, setFreeConsultation] = useState(false);
  const [flatFee, setFlatFee] = useState(false);
  const [contingencyFee, setContingencyFee] = useState(false);
  const [showRankingInfo, setShowRankingInfo] = useState(false);

  const filteredLawyers = arizonaLawyers
    .filter((lawyer) => {
      const matchesSearch =
        searchTerm === '' ||
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.practiceAreas.some(area => area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lawyer.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === 'all' || lawyer.practiceAreas.some(area =>
          area.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );
      const matchesLanguage = !spanishOnly || lawyer.languages.includes('Spanish');
      const matchesFreeConsult = !freeConsultation || lawyer.offers?.includes('Free Consultation');
      const matchesFlatFee = !flatFee || lawyer.flatFeeAvailable;
      const matchesContingency = !contingencyFee || lawyer.offers?.includes('Contingency Fee');
      return matchesSearch && matchesSpecialty && matchesLanguage && matchesFreeConsult && matchesFlatFee && matchesContingency;
    })
    .sort((a, b) => {
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'price') return a.averageBillingRate - b.averageBillingRate;
      return 0;
    });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSpanishOnly(false);
    setFreeConsultation(false);
    setFlatFee(false);
    setContingencyFee(false);
  };

  const hasActiveFilters = selectedSpecialty !== 'all' || spanishOnly || searchTerm || freeConsultation || flatFee || contingencyFee;

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-semibold text-teal-300 uppercase tracking-wider">
              Attorney Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Find Your Attorney
          </h1>
          <p className="text-navy-300 mb-8 max-w-xl">
            Browse verified, bar-licensed Arizona attorneys. Filter by specialty,
            language, and experience.
          </p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, specialty, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-navy-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent text-base"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-navy-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSpecialty === 'all'
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
              }`}
            >
              All
            </button>
            {practiceAreaCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedSpecialty(
                  selectedSpecialty === cat.name ? 'all' : cat.name
                )}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialty === cat.name
                    ? 'bg-navy-900 text-white shadow-md'
                    : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={() => setFreeConsultation(!freeConsultation)}
              aria-pressed={freeConsultation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                freeConsultation
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Free Consultation
            </button>
            <button
              onClick={() => setFlatFee(!flatFee)}
              aria-pressed={flatFee}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                flatFee
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Flat Fee
            </button>
            <button
              onClick={() => setContingencyFee(!contingencyFee)}
              aria-pressed={contingencyFee}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                contingencyFee
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Contingency Fee
            </button>
            <div className="w-px h-5 bg-navy-200 mx-1" />
            <button
              onClick={() => setSpanishOnly(!spanishOnly)}
              aria-pressed={spanishOnly}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                spanishOnly
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Spanish-Speaking Attorneys
            </button>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-navy-500 hidden sm:inline">Sort:</span>
              {([
                { key: 'experience' as const, label: 'Most Experience' },
              ]).map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSortBy(option.key)}
                  aria-pressed={sortBy === option.key}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.key
                      ? 'bg-navy-900 text-white'
                      : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowRankingInfo(!showRankingInfo)}
                  className="flex items-center gap-1 text-xs text-navy-500 hover:text-teal-600 transition-colors"
                  aria-expanded={showRankingInfo}
                  aria-label="How is this sorted?"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline underline decoration-dotted underline-offset-2">How is this sorted?</span>
                </button>
                {showRankingInfo && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-navy-200 rounded-xl shadow-lg p-4 z-20">
                    <p className="text-sm text-navy-700 leading-relaxed">
                      Results are ranked by verified client reviews, relevance to your search, and location proximity.{' '}
                      <span className="font-semibold">No attorney pays for placement or priority positioning.</span>{' '}
                      ezLegal.ai has no sponsorship or commercial relationships that influence ordering.
                    </p>
                    <button
                      onClick={() => setShowRankingInfo(false)}
                      className="text-xs text-teal-600 hover:underline mt-2 font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-navy-600">
            <span className="font-semibold text-navy-900">{filteredLawyers.length}</span> verified attorney{filteredLawyers.length !== 1 ? 's' : ''}
            {selectedSpecialty !== 'all' && (
              <span> in <span className="font-semibold text-teal-700">{selectedSpecialty}</span></span>
            )}
            {spanishOnly && (
              <span> who speak <span className="font-semibold text-teal-700">Spanish</span></span>
            )}
            {freeConsultation && (
              <span> offering <span className="font-semibold text-green-700">free consultation</span></span>
            )}
            {flatFee && (
              <span>{freeConsultation ? ', ' : ' offering '}<span className="font-semibold text-green-700">flat fee</span></span>
            )}
            {contingencyFee && (
              <span>{(freeConsultation || flatFee) ? ', ' : ' offering '}<span className="font-semibold text-green-700">contingency fee</span></span>
            )}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:underline font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        <AttorneyMatchingDisclosure variant="panel" className="mb-6" />

        {filteredLawyers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-navy-200">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-navy-400" />
            </div>
            <h2 className="text-lg font-semibold text-navy-900 mb-2">No attorneys found</h2>
            <p className="text-navy-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="text-teal-600 font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white rounded-2xl border border-navy-200 overflow-hidden hover:shadow-lg hover:border-navy-300 transition-all cursor-pointer group flex flex-col"
                onClick={() => setSelectedLawyer(lawyer)}
              >
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        lawyer.availability === 'Available' ? 'bg-green-500' :
                        lawyer.availability === 'Busy' ? 'bg-amber-500' : 'bg-navy-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-navy-900 truncate group-hover:text-teal-700 transition-colors">
                          {lawyer.name}
                        </h3>
                        {lawyer.verified && (
                          <div className="relative group/verified flex-shrink-0">
                            <Award className="w-4 h-4 text-teal-600" aria-label="Bar license verified by ezLegal.ai" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/verified:opacity-100 pointer-events-none transition-opacity shadow-lg">
                              Bar license verified by ezLegal.ai
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs text-teal-600 font-medium">{lawyer.experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-navy-600">
                        <MapPin className="w-3.5 h-3.5 text-navy-400 flex-shrink-0" />
                        <span className="truncate">{lawyer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {lawyer.practiceAreas.slice(0, 3).map((area) => (
                      <span
                        key={area}
                        className="px-2 py-0.5 rounded-md text-xs font-medium bg-navy-100 text-navy-700"
                      >
                        {area}
                      </span>
                    ))}
                    {lawyer.practiceAreas.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-navy-400">
                        +{lawyer.practiceAreas.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-navy-400" />
                      {lawyer.experience} yrs
                    </span>
                    {lawyer.flatFeeAvailable && (
                      <span className="text-green-700 font-medium">Flat fee</span>
                    )}
                    {lawyer.averageBillingRate > 0 && (
                      <span className="font-medium">${lawyer.averageBillingRate}/hr</span>
                    )}
                    {lawyer.languages.includes('Spanish') && (
                      <span className="flex items-center gap-1 text-teal-700 font-medium">
                        <Globe className="w-3 h-3" />
                        Español
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-navy-600 line-clamp-2 mb-4 flex-1">{lawyer.bio}</p>

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLawyer(lawyer); }}
                    className="w-full bg-navy-900 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy-900 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Not sure which attorney you need?
              </h3>
              <p className="text-navy-300 max-w-lg">
                Chat with our AI legal assistant to understand your situation first.
                Get matched to the right attorney for your specific needs.
              </p>
            </div>
            <Link
              to="/chat"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg whitespace-nowrap"
            >
              <MessageSquare className="w-5 h-5" />
              Chat with AI
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {selectedLawyer && (
        <LawyerProfileModal
          lawyer={selectedLawyer}
          onClose={() => setSelectedLawyer(null)}
        />
      )}
    </div>
  );
}
