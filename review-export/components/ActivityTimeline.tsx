import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  Briefcase,
  Settings,
  Star,
  Trash2,
  ExternalLink,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Activity, ActivityType, getActivityTypeConfig, toggleActivityFavorite, deleteActivity } from '../services/activity-service';

interface ActivityTimelineProps {
  activities: Activity[];
  groupLabel: string;
  onActivityUpdate: () => void;
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  chat: MessageSquare,
  lawyer_match: Users,
  document: FileText,
  prediction: TrendingUp,
  case: Briefcase,
  system: Settings
};

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  in_progress: Loader2,
  failed: AlertCircle
};

const statusColors = {
  completed: 'text-emerald-500',
  pending: 'text-amber-500',
  in_progress: 'text-blue-500',
  failed: 'text-red-500'
};

function ActivityCard({ activity, onUpdate }: { activity: Activity; onUpdate: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const config = getActivityTypeConfig(activity.activity_type);
  const Icon = activityIcons[activity.activity_type];
  const StatusIcon = statusIcons[activity.status];

  const handleToggleFavorite = async () => {
    setIsUpdating(true);
    await toggleActivityFavorite(activity.id, activity.is_favorite);
    onUpdate();
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    setIsUpdating(true);
    await deleteActivity(activity.id);
    onUpdate();
  };

  const handleNavigate = () => {
    const metadata = activity.metadata as Record<string, string>;
    switch (activity.activity_type) {
      case 'chat':
        navigate('/chat');
        break;
      case 'lawyer_match':
        if (metadata?.lawyerId) {
          navigate(`/find-attorney?id=${metadata.lawyerId}`);
        } else {
          navigate('/find-attorney');
        }
        break;
      case 'document':
        navigate('/dashboard/documents');
        break;
      case 'prediction':
        navigate('/dashboard/ai-assistant');
        break;
      case 'case':
        navigate('/dashboard/cases');
        break;
      default:
        break;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderMetadata = () => {
    const metadata = activity.metadata as Record<string, unknown>;
    if (!metadata || Object.keys(metadata).length === 0) return null;

    const renderableFields: { label: string; value: string }[] = [];

    if (metadata.jurisdiction) {
      renderableFields.push({ label: 'Jurisdiction', value: String(metadata.jurisdiction) });
    }
    if (metadata.practiceArea) {
      renderableFields.push({ label: 'Practice Area', value: String(metadata.practiceArea) });
    }
    if (metadata.lawyerName) {
      renderableFields.push({ label: 'Attorney', value: String(metadata.lawyerName) });
    }
    if (metadata.documentType) {
      renderableFields.push({ label: 'Document Type', value: String(metadata.documentType) });
    }
    if (metadata.confidenceScore) {
      renderableFields.push({ label: 'Confidence', value: `${metadata.confidenceScore}%` });
    }
    if (metadata.messageCount) {
      renderableFields.push({ label: 'Messages', value: String(metadata.messageCount) });
    }
    if (metadata.duration) {
      renderableFields.push({ label: 'Duration', value: String(metadata.duration) });
    }

    if (renderableFields.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap gap-3">
          {renderableFields.map((field, index) => (
            <div key={index} className="text-xs">
              <span className="text-slate-500">{field.label}:</span>{' '}
              <span className="text-slate-700 font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center shadow-sm ring-4 ring-white`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="w-0.5 flex-1 bg-slate-200 mt-2 group-last:hidden" />
      </div>

      <div className={`flex-1 pb-8 group-last:pb-0`}>
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden`}>
          <div className={`h-1 ${config.bgColor}`} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.lightBg} ${config.textColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(activity.created_at)}
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${statusColors[activity.status]}`}>
                    <StatusIcon className={`w-3 h-3 ${activity.status === 'in_progress' ? 'animate-spin' : ''}`} />
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                  {activity.title}
                </h3>

                {activity.description && (
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                {isExpanded && renderMetadata()}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleFavorite}
                  disabled={isUpdating}
                  className={`p-1.5 rounded-lg transition-all ${
                    activity.is_favorite
                      ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'
                  }`}
                  title={activity.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${activity.is_favorite ? 'fill-current' : ''}`} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                        <button
                          onClick={() => {
                            handleNavigate();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {(activity.metadata && Object.keys(activity.metadata).length > 0) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show details
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityTimeline({ activities, groupLabel, onActivityUpdate }: ActivityTimelineProps) {
  if (activities.length === 0) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-8 h-px bg-slate-300" />
        {groupLabel}
        <span className="text-slate-400 font-normal normal-case">({activities.length})</span>
        <span className="flex-1 h-px bg-slate-300" />
      </h3>

      <div className="space-y-0">
        {activities.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onUpdate={onActivityUpdate}
          />
        ))}
      </div>
    </div>
  );
}
