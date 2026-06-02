import { useState, useEffect } from 'react';
import { Users, MapPin, Phone, Mail, Filter, X, CheckCircle2, Award, DollarSign, Globe, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PaginatedList } from './inclusive';

interface LawyerProfile {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  hourly_rate: number;
  avatar_url: string;
  about_me: string;
  is_online: boolean;
  public_phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  jurisdiction: string;
  certifications: string;
  practice_areas: string[];
  languages: string[];
  website_url: string;
  years_experience: number;
  offers_flat_fee: boolean;
}

interface RealLawyerDirectoryProps {
  zipCode?: string;
  suggestedPracticeArea?: string;
  onClose?: () => void;
}

export default function RealLawyerDirectory({
  zipCode = '',
  suggestedPracticeArea,
  onClose
}: RealLawyerDirectoryProps) {
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArea, setSelectedArea] = useState(suggestedPracticeArea || '');
  const [searchZip, setSearchZip] = useState(zipCode);

  useEffect(() => {
    fetchLawyers();
  }, [searchZip]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('lawyer_profiles')
        .select('*')
        .order('years_experience', { ascending: false });

      if (searchZip) {
        query = query.eq('zip', searchZip);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setLawyers(data || []);
    } catch (err) {
      setError('Unable to load lawyers. Please try again later.');
      console.error('Error fetching lawyers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPracticeAreas = (lawyer: LawyerProfile): string[] => {
    return lawyer.practice_areas || [];
  };

  const filteredLawyers = selectedArea
    ? lawyers.filter(lawyer => {
        const areas = getPracticeAreas(lawyer);
        return areas.some(area =>
          area.toLowerCase().includes(selectedArea.toLowerCase())
        );
      })
    : lawyers;

  const uniquePracticeAreas = Array.from(
    new Set(
      lawyers.flatMap(lawyer => getPracticeAreas(lawyer))
    )
  ).sort().slice(0, 12);

  return (
    <div
      className="bg-white rounded-2xl shadow-xl border-2 border-slate-200"
      role="region"
      aria-label="Lawyer Directory"
    >
      <div className="bg-gradient-to-r from-[#0067FF] to-[#0052CC] px-6 py-5 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Find Your Attorney</h2>
              <p className="text-sm text-blue-100">Verified lawyers in our network</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close lawyer directory"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchZip}
              onChange={(e) => setSearchZip(e.target.value)}
              placeholder="Enter ZIP code (optional)"
              className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-[#0067FF] focus:outline-none"
              aria-label="Search by ZIP code"
            />
            <button
              onClick={fetchLawyers}
              disabled={loading}
              className="px-6 py-2 bg-[#0067FF] hover:bg-[#0052CC] text-white rounded-lg font-semibold transition-all disabled:opacity-50"
              aria-label="Search lawyers"
            >
              Search
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-900">Filter by Practice Area</label>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-[#0067FF] hover:text-[#0052CC] font-medium"
              aria-expanded={showFilters}
              aria-controls="practice-area-filters"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>

          {showFilters && (
            <div
              id="practice-area-filters"
              className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4"
              role="group"
              aria-label="Practice area filters"
            >
              <button
                onClick={() => setSelectedArea('')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedArea === ''
                    ? 'bg-[#0067FF] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                aria-pressed={selectedArea === ''}
              >
                All Areas
              </button>
              {uniquePracticeAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedArea === area
                      ? 'bg-[#0067FF] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-pressed={selectedArea === area}
                >
                  {area}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#0067FF] rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">EZLegal Attorney Network</h3>
              <ul className="space-y-1 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  All attorneys BAR-certified & verified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Direct connection to legal professionals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Transparent rates and consultation options
                </li>
              </ul>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-[#0067FF] animate-spin mb-4" />
            <p className="text-slate-600">Loading attorneys...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 font-semibold mb-2">Unable to load lawyers</p>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchLawyers}
              className="px-4 py-2 bg-[#0067FF] hover:bg-[#0052CC] text-white rounded-lg font-semibold transition-all"
            >
              Try Again
            </button>
          </div>
        ) : (
          <PaginatedList
            label="Available attorneys"
            items={filteredLawyers}
            pageSize={8}
            keyFor={(l) => l.id}
            totalCount={filteredLawyers.length}
            emptyState={null}
            renderItem={(lawyer) => {
              const practiceAreas = getPracticeAreas(lawyer);
              const fullName = `${lawyer.first_name} ${lawyer.last_name}`;
              const location = [lawyer.city, lawyer.state].filter(Boolean).join(', ');

              return (
                <article
                  className="group border-2 border-slate-200 rounded-xl p-5 hover:border-[#0067FF] hover:shadow-lg transition-all focus-within:border-[#0067FF] focus-within:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {lawyer.avatar_url ? (
                        <img
                          src={lawyer.avatar_url}
                          alt={`Headshot of ${fullName}, attorney`}
                          width={64}
                          height={64}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-[#0067FF] to-[#0052CC] rounded-xl flex items-center justify-center text-white text-xl font-bold">
                          {lawyer.first_name[0]}{lawyer.last_name[0]}
                        </div>
                      )}
                      {lawyer.is_online && (
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
                          aria-label="Currently online"
                          title="Online now"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0067FF] transition-colors">
                            {fullName}
                          </h3>
                          {lawyer.specialty && (
                            <p className="text-sm text-slate-600 font-medium">{lawyer.specialty}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {lawyer.years_experience > 0 && (
                              <span className="text-sm text-teal-600 font-medium">{lawyer.years_experience} years experience</span>
                            )}
                            {lawyer.jurisdiction && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-sm text-slate-600">{lawyer.jurisdiction}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {practiceAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {practiceAreas.slice(0, 4).map((area, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-blue-50 text-[#0067FF] text-xs font-medium rounded-lg"
                            >
                              {area}
                            </span>
                          ))}
                          {practiceAreas.length > 4 && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                              +{practiceAreas.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {lawyer.about_me && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {lawyer.about_me}
                        </p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{location}</span>
                          </div>
                        )}
                        {lawyer.hourly_rate > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-900">
                              ${lawyer.hourly_rate}/hr
                            </span>
                          </div>
                        )}
                        {lawyer.offers_flat_fee && (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-700 font-medium">Flat fees available</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {lawyer.public_phone && (
                          <a
                            href={`tel:${lawyer.public_phone}`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0067FF] to-[#0052CC] hover:from-[#005EE9] hover:to-[#0041A8] text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                            aria-label={`Call ${fullName}`}
                          >
                            <Phone className="w-4 h-4" />
                            Call Now
                          </a>
                        )}
                        {lawyer.email && (
                          <a
                            href={`mailto:${lawyer.email}`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                            aria-label={`Email ${fullName}`}
                          >
                            <Mail className="w-4 h-4" />
                            Send Message
                          </a>
                        )}
                        {lawyer.website_url && (
                          <a
                            href={lawyer.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                            aria-label={`Visit ${fullName}'s website`}
                          >
                            <Globe className="w-4 h-4" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            }}
          />
        )}

        {!loading && !error && filteredLawyers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-900 mb-2">No lawyers found</h4>
            <p className="text-slate-600 mb-4">Try adjusting your filters or search criteria</p>
            <button
              onClick={() => {
                setSelectedArea('');
                setSearchZip('');
              }}
              className="text-[#0067FF] hover:text-[#0052CC] font-semibold"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {!loading && !error && filteredLawyers.length > 0 && (
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
          <div className="flex items-center justify-center">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredLawyers.length}</span> attorney{filteredLawyers.length !== 1 ? 's' : ''} in our network
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
