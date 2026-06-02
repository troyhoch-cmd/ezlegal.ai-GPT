import { useState } from 'react';
import {
  X, Send, Plus, Trash2, Loader2, CheckCircle, AlertCircle,
  Mail, User, FileText, MessageSquare
} from 'lucide-react';
import type { PartnerAsset } from '../../services/asset-service';
import { sendAssetEmail, logDistribution, type DistributionRecipient } from '../../services/distribution-service';

interface EmailDistributionModalProps {
  asset: PartnerAsset;
  userId: string;
  onClose: () => void;
}

export function EmailDistributionModal({ asset, userId, onClose }: EmailDistributionModalProps) {
  const [recipients, setRecipients] = useState<DistributionRecipient[]>([{ email: '', name: '' }]);
  const [subject, setSubject] = useState(`${asset.name} -- ezLegal.ai Partner Asset`);
  const [notes, setNotes] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; sent: number; total: number } | null>(null);

  const addRecipient = () => {
    setRecipients(prev => [...prev, { email: '', name: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: 'email' | 'name', value: string) => {
    setRecipients(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const validRecipients = recipients.filter(r => r.email.includes('@') && r.email.includes('.'));
  const canSend = validRecipients.length > 0 && subject.trim().length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);

    const sendResult = await sendAssetEmail({
      asset,
      recipients: validRecipients,
      subject,
      notes: notes || undefined,
      partnerId: partnerId || undefined,
      sentBy: userId,
    });

    setResult(sendResult);
    setSending(false);

    if (!sendResult.success) {
      await logDistribution({
        assetId: asset.id,
        sentBy: userId,
        recipients: validRecipients,
        channel: 'email',
        subject,
        notes,
        partnerId: partnerId || undefined,
      });
    }
  };

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            {result.success ? (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">Sent Successfully</h3>
                <p className="text-sm text-navy-500 mb-1">
                  {result.sent} of {result.total} email{result.total !== 1 ? 's' : ''} sent.
                </p>
                <p className="text-xs text-navy-400">
                  Distribution logged to asset history.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">Partially Sent</h3>
                <p className="text-sm text-navy-500">
                  {result.sent} of {result.total} sent. Some emails may require retry.
                </p>
              </>
            )}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-500 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Send asset via email">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-navy-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-navy-900">Send via Email</h3>
            <p className="text-xs text-navy-500 mt-0.5 flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {asset.name} ({asset.asset_type.toUpperCase()})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-100 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-navy-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-2">
              Recipients
            </label>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-navy-300" />
                      <input
                        type="email"
                        value={r.email}
                        onChange={e => updateRecipient(i, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className="w-full text-sm pl-8 pr-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="relative w-36">
                      <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-navy-300" />
                      <input
                        type="text"
                        value={r.name || ''}
                        onChange={e => updateRecipient(i, 'name', e.target.value)}
                        placeholder="Name (optional)"
                        className="w-full text-sm pl-8 pr-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  {recipients.length > 1 && (
                    <button
                      onClick={() => removeRecipient(i)}
                      className="p-1.5 text-navy-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label="Remove recipient"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addRecipient}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-500 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Recipient
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">
              Partner ID (optional -- for attribution)
            </label>
            <input
              type="text"
              value={partnerId}
              onChange={e => setPartnerId(e.target.value)}
              placeholder="e.g., community-legal-az"
              className="w-full text-sm px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-navy-500 uppercase tracking-wider block mb-1.5">
              Notes (optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-navy-300" />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Include a personal note with the asset..."
                rows={3}
                className="w-full text-sm pl-8 pr-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
            </div>
          </div>

          <div className="p-3 bg-navy-50 rounded-lg">
            <p className="text-[10px] text-navy-500">
              Asset content will be formatted as a branded HTML email. The distribution will be logged in the asset history.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-navy-200 bg-navy-50 flex items-center justify-between">
          <p className="text-xs text-navy-500">
            {validRecipients.length} valid recipient{validRecipients.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-navy-600 hover:bg-navy-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {sending ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Send Email</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
