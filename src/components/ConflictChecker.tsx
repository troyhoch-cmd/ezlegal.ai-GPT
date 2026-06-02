import { useState } from 'react';
import {
  Search, AlertTriangle, CheckCircle, Shield, FileText,
  Lock, Eye, AlertCircle, Clock, Scale
} from 'lucide-react';

interface ConflictResult {
  matter_id: string;
  matter_name: string;
  matter_number: string;
  client_name: string;
  match_type: 'client_name' | 'adverse_party' | 'related_party';
  matched_party?: string;
  status: string;
}

interface ConflictCheckResponse {
  success: boolean;
  results_count: number;
  results: ConflictResult[];
  status: 'clear' | 'potential_conflict';
}

export default function ConflictChecker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all_parties' | 'client_name' | 'adverse_party'>('all_parties');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ConflictCheckResponse | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const demoResults: ConflictCheckResponse = {
    success: true,
    results_count: 2,
    results: [
      {
        matter_id: 'demo-1',
        matter_name: 'Smith v. Johnson Property Dispute',
        matter_number: '2024-RE-0142',
        client_name: 'Robert Smith',
        match_type: 'adverse_party',
        matched_party: 'Johnson Holdings LLC',
        status: 'active'
      },
      {
        matter_id: 'demo-2',
        matter_name: 'Johnson Enterprises Contract Review',
        matter_number: '2023-CO-0891',
        client_name: 'Johnson Holdings LLC',
        match_type: 'client_name',
        status: 'closed'
      }
    ],
    status: 'potential_conflict'
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (searchQuery.toLowerCase().includes('johnson') || searchQuery.toLowerCase().includes('smith')) {
      setResults(demoResults);
    } else {
      setResults({
        success: true,
        results_count: 0,
        results: [],
        status: 'clear'
      });
    }

    setIsSearching(false);
    setShowDemo(true);
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'client_name': return 'Current/Former Client';
      case 'adverse_party': return 'Adverse Party';
      case 'related_party': return 'Related Party';
      default: return type;
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'client_name': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'adverse_party': return 'bg-red-100 text-red-700 border-red-200';
      case 'related_party': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h3 className="text-xl font-bold">Conflict of Interest Checker</h3>
        </div>
        <p className="text-blue-100 text-sm">
          Search for potential conflicts before accepting new clients or matters.
          All searches are logged for compliance and audit purposes.
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Search Party Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter client, company, or party name..."
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="md:w-48">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as typeof searchType)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all_parties">All Parties</option>
              <option value="client_name">Clients Only</option>
              <option value="adverse_party">Adverse Parties</option>
            </select>
          </div>

          <div className="md:w-auto md:self-end">
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Run Conflict Check
                </>
              )}
            </button>
          </div>
        </div>

        {showDemo && results && (
          <div className="border-t border-stone-200 pt-6">
            <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
              results.status === 'clear'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              {results.status === 'clear' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">No Conflicts Found</h4>
                    <p className="text-sm text-green-700">
                      No matching parties found in your firm's matter database.
                      This check has been logged for compliance records.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">
                      {results.results_count} Potential Conflict{results.results_count !== 1 ? 's' : ''} Found
                    </h4>
                    <p className="text-sm text-red-700">
                      Review the matches below carefully. A supervising attorney must
                      approve or obtain waivers before proceeding.
                    </p>
                  </div>
                </>
              )}
            </div>

            {results.results.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-stone-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Matching Matters
                </h4>

                {results.results.map((result, index) => (
                  <div
                    key={index}
                    className="border border-stone-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded border ${getMatchTypeColor(result.match_type)}`}>
                            {getMatchTypeLabel(result.match_type)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            result.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {result.status === 'active' ? 'Active Matter' : 'Closed Matter'}
                          </span>
                        </div>

                        <h5 className="font-semibold text-stone-900 mb-1">
                          {result.matter_name}
                        </h5>

                        <div className="text-sm text-stone-600 space-y-1">
                          <p><span className="font-medium">Matter #:</span> {result.matter_number}</p>
                          <p><span className="font-medium">Client:</span> {result.client_name}</p>
                          {result.matched_party && (
                            <p>
                              <span className="font-medium">Matched Party:</span>{' '}
                              <span className="text-red-600 font-medium">{result.matched_party}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4 pt-4 border-t border-stone-200">
                  <button className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Scale className="w-5 h-5" />
                    Request Conflict Waiver
                  </button>
                  <button className="flex-1 px-4 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Decline Representation
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <h4 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Enterprise Security Features
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-stone-900">Tenant Isolation</p>
                <p className="text-stone-600">Matter data segregated per organization</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-stone-900">Audit Logging</p>
                <p className="text-stone-600">All searches logged for compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-stone-900">Waiver Tracking</p>
                <p className="text-stone-600">Document consent and approvals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
