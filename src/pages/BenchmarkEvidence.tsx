import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit3, Trash2, ExternalLink, CheckCircle, Clock, Search, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface BenchmarkArtifact {
  id: string;
  product: string;
  icp: string;
  dimension: string;
  our_score: number;
  competitor_label: string;
  competitor_score: number;
  evidence_url: string;
  evidence_type: string;
  notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  product: string;
  icp: string;
  dimension: string;
  our_score: string;
  competitor_label: string;
  competitor_score: string;
  evidence_url: string;
  evidence_type: string;
  notes: string;
}

export default function BenchmarkEvidence() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<BenchmarkArtifact[]>([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState<BenchmarkArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    product: '',
    icp: '',
    dimension: '',
    our_score: '',
    competitor_label: '',
    competitor_score: '',
    evidence_url: '',
    evidence_type: 'screenshot',
    notes: '',
  });

  useEffect(() => {
    loadArtifacts();
  }, []);

  useEffect(() => {
    filterArtifacts();
  }, [searchQuery, artifacts]);

  const loadArtifacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_benchmark_artifacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showToast('Failed to load artifacts', 'error');
        return;
      }

      setArtifacts(data || []);
    } catch (error) {
      showToast('Error loading artifacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterArtifacts = () => {
    if (!searchQuery.trim()) {
      setFilteredArtifacts(artifacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = artifacts.filter(
      (artifact) =>
        artifact.product.toLowerCase().includes(query) ||
        artifact.dimension.toLowerCase().includes(query) ||
        artifact.icp.toLowerCase().includes(query)
    );

    setFilteredArtifacts(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      product: '',
      icp: '',
      dimension: '',
      our_score: '',
      competitor_label: '',
      competitor_score: '',
      evidence_url: '',
      evidence_type: 'screenshot',
      notes: '',
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (
      !formData.product ||
      !formData.icp ||
      !formData.dimension ||
      !formData.our_score ||
      !formData.competitor_label ||
      !formData.competitor_score ||
      !formData.evidence_url
    ) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setProcessingId('save');

    try {
      const payload = {
        product: formData.product,
        icp: formData.icp,
        dimension: formData.dimension,
        our_score: parseFloat(formData.our_score),
        competitor_label: formData.competitor_label,
        competitor_score: parseFloat(formData.competitor_score),
        evidence_url: formData.evidence_url,
        evidence_type: formData.evidence_type,
        notes: formData.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('market_benchmark_artifacts')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        showToast('Artifact updated successfully');
      } else {
        const { error } = await supabase.from('market_benchmark_artifacts').insert([payload]);

        if (error) throw error;
        showToast('Artifact created successfully');
      }

      await loadArtifacts();
      setShowModal(false);
      resetForm();
    } catch (error) {
      showToast('Failed to save artifact', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (artifact: BenchmarkArtifact) => {
    setFormData({
      product: artifact.product,
      icp: artifact.icp,
      dimension: artifact.dimension,
      our_score: artifact.our_score.toString(),
      competitor_label: artifact.competitor_label,
      competitor_score: artifact.competitor_score.toString(),
      evidence_url: artifact.evidence_url,
      evidence_type: artifact.evidence_type,
      notes: artifact.notes || '',
    });
    setEditingId(artifact.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    setProcessingId(id);

    try {
      const { error } = await supabase.from('market_benchmark_artifacts').delete().eq('id', id);

      if (error) throw error;

      showToast('Artifact deleted successfully');
      await loadArtifacts();
    } catch (error) {
      showToast('Failed to delete artifact', 'error');
    } finally {
      setProcessingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleVerify = async (id: string) => {
    setProcessingId(id);

    try {
      const { error } = await supabase
        .from('market_benchmark_artifacts')
        .update({
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;

      showToast('Artifact verified successfully');
      await loadArtifacts();
    } catch (error) {
      showToast('Failed to verify artifact', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Market Benchmark Evidence</h1>
            <p className="text-gray-600 mt-1">Manage competitive market benchmark artifacts</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Evidence
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, ICP, or dimension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg text-white flex items-center gap-2 ${
              toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {toastMessage}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredArtifacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No benchmark artifacts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      ICP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Dimension
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Our Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Competitor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Their Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Evidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredArtifacts.map((artifact) => (
                    <tr key={artifact.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {artifact.product}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{artifact.icp}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{artifact.dimension}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {artifact.our_score}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {artifact.competitor_label}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {artifact.competitor_score}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={artifact.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-xs">{artifact.evidence_type}</span>
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        {artifact.verified_at ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">{formatDate(artifact.verified_at)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!artifact.verified_at && (
                            <button
                              onClick={() => handleVerify(artifact.id)}
                              disabled={processingId === artifact.id}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                              title="Verify"
                            >
                              {processingId === artifact.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(artifact)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(artifact.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit' : 'Add'} Benchmark Evidence
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <input
                    type="text"
                    value={formData.product}
                    onChange={(e) =>
                      setFormData({ ...formData, product: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Our Product"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ICP *</label>
                  <input
                    type="text"
                    value={formData.icp}
                    onChange={(e) =>
                      setFormData({ ...formData, icp: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Enterprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimension *
                  </label>
                  <input
                    type="text"
                    value={formData.dimension}
                    onChange={(e) =>
                      setFormData({ ...formData, dimension: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Performance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Our Score *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.our_score}
                    onChange={(e) =>
                      setFormData({ ...formData, our_score: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competitor Label *
                  </label>
                  <input
                    type="text"
                    value={formData.competitor_label}
                    onChange={(e) =>
                      setFormData({ ...formData, competitor_label: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Competitor X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Their Score *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.competitor_score}
                    onChange={(e) =>
                      setFormData({ ...formData, competitor_score: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 7.2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidence Type *
                  </label>
                  <select
                    value={formData.evidence_type}
                    onChange={(e) =>
                      setFormData({ ...formData, evidence_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="screenshot">Screenshot</option>
                    <option value="article">Article</option>
                    <option value="whitepaper">Whitepaper</option>
                    <option value="video">Video</option>
                    <option value="benchmark_report">Benchmark Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidence URL *
                  </label>
                  <input
                    type="url"
                    value={formData.evidence_url}
                    onChange={(e) =>
                      setFormData({ ...formData, evidence_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional context or notes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={processingId === 'save'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {processingId === 'save' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Artifact?</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. Are you sure you want to delete this benchmark
                artifact?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={processingId === showDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {processingId === showDeleteConfirm ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
