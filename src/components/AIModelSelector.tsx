import { useState, useEffect } from 'react';
import { Cpu, ChevronDown, Sparkles, Zap, Crown, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AIModel {
  id: string;
  model_name: string;
  display_name: string;
  description: string;
  tier_required: string;
  is_default: boolean;
  max_tokens: number;
  cost_per_1k_tokens: number;
}

interface AIModelSelectorProps {
  selectedModel: string | null;
  onModelChange: (modelName: string) => void;
  variant?: 'compact' | 'full';
  label?: string;
  showDescription?: boolean;
}

export default function AIModelSelector({
  selectedModel,
  onModelChange,
  variant = 'full',
  label = 'AI Model',
  showDescription = true,
}: AIModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<string>('free');

  useEffect(() => {
    fetchModels();
    fetchUserTier();
  }, []);

  const fetchUserTier = async () => {
    if (!user) {
      setUserTier('free');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle();

    setUserTier(data?.subscription_tier || 'free');
  };

  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data) {
      setModels(data);

      if (!selectedModel) {
        const defaultModel = data.find(m => m.is_default);
        if (defaultModel) {
          onModelChange(defaultModel.model_name);
        }
      }
    }
    setLoading(false);
  };

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('5') || modelName.includes('o1') || modelName.includes('o3')) {
      return <Crown className="w-4 h-4 text-amber-500" />;
    }
    if (modelName.includes('4o') || modelName.includes('4')) {
      return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
    return <Zap className="w-4 h-4 text-teal-500" />;
  };

  const canAccessModel = (model: AIModel) => {
    if (model.tier_required === 'free') return true;
    if (model.tier_required === 'premium' && (userTier === 'premium' || userTier === 'enterprise')) return true;
    if (model.tier_required === 'enterprise' && userTier === 'enterprise') return true;
    return false;
  };

  const selectedModelData = models.find(m => m.model_name === selectedModel);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-navy-50 rounded-lg border border-navy-200">
        <Cpu className="w-5 h-5 text-navy-400 animate-pulse" />
        <span className="text-sm text-navy-600">Loading models...</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-navy-300 rounded-lg hover:border-teal-500 transition-colors text-sm"
        >
          <Cpu className="w-4 h-4 text-teal-600" />
          <span className="font-medium text-navy-900">
            {selectedModelData?.display_name || 'Select Model'}
          </span>
          <ChevronDown className={`w-4 h-4 text-navy-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-navy-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {models.map((model) => {
                const accessible = canAccessModel(model);
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (accessible) {
                        onModelChange(model.model_name);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!accessible}
                    className={`w-full text-left p-3 hover:bg-teal-50 transition-colors border-b border-navy-100 last:border-b-0 ${
                      selectedModel === model.model_name ? 'bg-teal-50' : ''
                    } ${!accessible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {getModelIcon(model.model_name)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-navy-900 text-sm">
                            {model.display_name}
                          </span>
                          {!accessible && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                              {model.tier_required}
                            </span>
                          )}
                          {selectedModel === model.model_name && (
                            <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-navy-600 mt-1">{model.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-navy-900">
        {label}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((model) => {
          const accessible = canAccessModel(model);
          const isSelected = selectedModel === model.model_name;

          return (
            <button
              key={model.id}
              onClick={() => accessible && onModelChange(model.model_name)}
              disabled={!accessible}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-teal-500 bg-teal-50 shadow-lg'
                  : accessible
                  ? 'border-navy-200 bg-white hover:border-teal-300 hover:shadow-md'
                  : 'border-navy-200 bg-navy-50 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {getModelIcon(model.model_name)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-navy-900 text-sm leading-tight">
                      {model.display_name}
                    </h4>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {showDescription && (
                    <p className="text-xs text-navy-600 mt-1.5 leading-relaxed">
                      {model.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {!accessible ? (
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-medium">
                        {model.tier_required.toUpperCase()} Required
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-navy-500">
                          {(model.max_tokens / 1000).toFixed(0)}k tokens
                        </span>
                        {model.cost_per_1k_tokens > 0 && (
                          <span className="text-xs text-navy-400">
                            •
                          </span>
                        )}
                        {model.cost_per_1k_tokens > 0 && (
                          <span className="text-xs text-navy-500">
                            ${model.cost_per_1k_tokens.toFixed(4)}/1k
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-teal-500 ring-offset-2 pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {showDescription && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-semibold mb-1">Model Selection Tips:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
              <li>Free tier models are great for general questions and quick answers</li>
              <li>Premium models provide deeper analysis, case citations, and sophisticated document drafting</li>
              <li>Use GPT-5 series for complex legal documents and comprehensive research</li>
              <li>Upgrade to Premium to unlock advanced reasoning models</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
