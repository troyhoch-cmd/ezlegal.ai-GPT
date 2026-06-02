import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ResumeBanner() {
  const { user } = useAuth();
  const [resumeChatId, setResumeChatId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_resume_chat_id, resume_banner_dismissed_at')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled || !profile) return;

      if (profile.resume_banner_dismissed_at) {
        const dismissedAt = new Date(profile.resume_banner_dismissed_at).getTime();
        if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) {
          setDismissed(true);
          return;
        }
      }

      if (profile.last_resume_chat_id) {
        setResumeChatId(profile.last_resume_chat_id);
      }

      const { data: lastMsg } = await supabase
        .from('chat_messages')
        .select('created_at, conversation_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (lastMsg) {
        setUpdatedAt(lastMsg.created_at);
        if (!profile.last_resume_chat_id && lastMsg.conversation_id) {
          setResumeChatId(lastMsg.conversation_id);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  async function handleDismiss() {
    setDismissed(true);
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ resume_banner_dismissed_at: new Date().toISOString() })
        .eq('id', user.id);
    }
  }

  if (!user?.id || dismissed || !resumeChatId) return null;

  return (
    <div className="mx-auto mt-4 max-w-4xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Pick up where you left off</p>
            {updatedAt && (
              <p className="text-xs text-slate-600">
                Last active {new Date(updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/chat?session=${resumeChatId}`}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Resume <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="rounded-full p-1 text-slate-500 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
