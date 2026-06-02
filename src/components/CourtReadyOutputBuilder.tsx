import { useState, useMemo } from 'react';
import {
  FileText, CheckSquare, Clock, MapPin, Download, Printer, Copy, ChevronDown, ChevronRight,
  Calendar, AlertTriangle, FileCheck, Scale, Building, Phone, ExternalLink, CheckCircle,
  AlertCircle, ShieldAlert, HelpCircle, Edit2, Check, X, RefreshCw, Info
} from 'lucide-react';

export interface TimelineItem {
  id: string;
  date?: string;
  daysFromNow?: number;
  title: string;
  description: string;
  isDeadline?: boolean;
  isCompleted?: boolean;
  resources?: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted?: boolean;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface CourtInfo {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  filingFee?: string;
  dataSource?: string;
  lastUpdated?: string;
  verifyUrl?: string;
}

export interface ReadinessField {
  id: string;
  label: string;
  value?: string;
  required: boolean;
  placeholder?: string;
  allowUnknown?: boolean;
}

export interface EditableAssumption {
  id: string;
  text: string;
  status: 'unconfirmed' | 'confirmed' | 'denied' | 'edited';
  editedText?: string;
}

export interface CourtReadyOutput {
  title: string;
  jurisdiction: string;
  caseType: string;
  generatedDate: string;
  summary?: string;
  timeline?: TimelineItem[];
  checklist?: ChecklistItem[];
  documentsNeeded?: string[];
  courtInfo?: CourtInfo;
  nextSteps?: string[];
  warnings?: string[];
  citations?: string[];
  readinessFields?: ReadinessField[];
  assumptions?: string[];
}

interface CourtReadyOutputBuilderProps {
  output: CourtReadyOutput;
  onClose?: () => void;
  onRegenerateWithAssumptions?: (assumptions: EditableAssumption[]) => void;
}

const DEFAULT_READINESS_FIELDS: ReadinessField[] = [
  { id: 'jurisdiction', label: 'Jurisdiction/State', required: true, placeholder: 'e.g., Arizona', allowUnknown: true },
  { id: 'caseType', label: 'Type of Legal Matter', required: true, placeholder: 'e.g., Landlord-Tenant Dispute', allowUnknown: true },
  { id: 'criticalDate', label: 'Critical Date/Deadline', required: false, placeholder: 'e.g., Court date, response deadline' },
  { id: 'opposingParty', label: 'Opposing Party (if applicable)', required: false, placeholder: 'Name of other party involved' },
  { id: 'courtVenue', label: 'Court or Agency', required: false, placeholder: 'e.g., Maricopa County Superior Court' },
];

export default function CourtReadyOutputBuilder({ output, onClose, onRegenerateWithAssumptions }: CourtReadyOutputBuilderProps) {
  const [currentStep, setCurrentStep] = useState<'review' | 'plan'>('review');
  const [readinessValues, setReadinessValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {
      jurisdiction: output.jurisdiction || '',
      caseType: output.caseType || '',
    };
    output.readinessFields?.forEach(field => {
      initial[field.id] = field.value || '';
    });
    return initial;
  });
  const [unknownFields, setUnknownFields] = useState<Set<string>>(new Set());
  const [assumptions, setAssumptions] = useState<EditableAssumption[]>(() =>
    (output.assumptions || []).map((text, i) => ({
      id: `assumption-${i}`,
      text,
      status: 'unconfirmed' as const,
    }))
  );
  const [editingAssumption, setEditingAssumption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['checklist', 'timeline', 'documents'])
  );
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    output.checklist?.forEach(item => {
      initial[item.id] = item.isCompleted || false;
    });
    return initial;
  });
  const [copied, setCopied] = useState(false);
  const [exportAcknowledged, setExportAcknowledged] = useState(false);
  const [showExportWarning, setShowExportWarning] = useState(false);

  const readinessFields = output.readinessFields || DEFAULT_READINESS_FIELDS;

  const readinessStatus = useMemo(() => {
    const requiredFields = readinessFields.filter(f => f.required);
    const filledOrUnknown = requiredFields.filter(f =>
      readinessValues[f.id]?.trim() || unknownFields.has(f.id)
    );
    const missingRequired = requiredFields.filter(f =>
      !readinessValues[f.id]?.trim() && !unknownFields.has(f.id)
    );
    const hasUnknowns = unknownFields.size > 0;

    return {
      requiredComplete: missingRequired.length === 0,
      missingRequired,
      hasUnknowns,
      progress: Math.round((filledOrUnknown.length / Math.max(requiredFields.length, 1)) * 100),
    };
  }, [readinessFields, readinessValues, unknownFields]);

  const hasUnconfirmedAssumptions = assumptions.some(a => a.status === 'unconfirmed');
  const hasDeniedAssumptions = assumptions.some(a => a.status === 'denied');

  const toggleUnknown = (fieldId: string) => {
    setUnknownFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
        setReadinessValues(p => ({ ...p, [fieldId]: '' }));
      }
      return next;
    });
  };

  const startEditAssumption = (assumption: EditableAssumption) => {
    setEditingAssumption(assumption.id);
    setEditText(assumption.editedText || assumption.text);
  };

  const saveEditAssumption = (id: string) => {
    setAssumptions(prev => prev.map(a =>
      a.id === id ? { ...a, status: 'edited', editedText: editText } : a
    ));
    setEditingAssumption(null);
    setEditText('');
  };

  const setAssumptionStatus = (id: string, status: EditableAssumption['status']) => {
    setAssumptions(prev => prev.map(a =>
      a.id === id ? { ...a, status, editedText: status === 'edited' ? a.editedText : undefined } : a
    ));
  };

  const handleRegenerateWithAssumptions = () => {
    if (onRegenerateWithAssumptions) {
      onRegenerateWithAssumptions(assumptions);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checklistState).filter(Boolean).length;
  const totalItems = output.checklist?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const isProvisional = readinessStatus.hasUnknowns;

  const generateExportText = () => {
    let text = `═══════════════════════════════════════════════════════════════\n`;
    text += isProvisional
      ? `         PROVISIONAL ACTION PLAN (Needs Confirmation)\n`
      : `                  ACTION PLAN\n`;
    text += `═══════════════════════════════════════════════════════════════\n\n`;

    if (isProvisional) {
      text += `⚠ PROVISIONAL STATUS: Some required information was marked as\n`;
      text += `   "I don't know." Verify details before relying on this plan.\n\n`;
    }

    text += `Case Type: ${unknownFields.has('caseType') ? '[Unknown - Needs Confirmation]' : (readinessValues.caseType || output.caseType)}\n`;
    text += `Jurisdiction: ${unknownFields.has('jurisdiction') ? '[Unknown - Needs Confirmation]' : (readinessValues.jurisdiction || output.jurisdiction)}\n`;
    text += `Generated: ${output.generatedDate}\n`;

    if (readinessValues.criticalDate) {
      text += `Critical Date: ${readinessValues.criticalDate}\n`;
    }
    if (readinessValues.courtVenue) {
      text += `Court/Agency: ${readinessValues.courtVenue}\n`;
    }
    text += `\n`;

    text += `───────────────────────────────────────────────────────────────\n`;
    text += `⚠ IMPORTANT NOTICE\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `This document is for INFORMATIONAL PURPOSES ONLY.\n`;
    text += `It does NOT constitute legal advice.\n`;
    text += `It is NOT a court-ready filing.\n`;
    text += `Always consult a licensed attorney before taking legal action.\n\n`;

    const activeAssumptions = assumptions.filter(a => a.status !== 'denied');
    if (activeAssumptions.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `ASSUMPTIONS\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      activeAssumptions.forEach((assumption, i) => {
        const displayText = assumption.editedText || assumption.text;
        const statusLabel = assumption.status === 'confirmed' ? ' [Confirmed]' :
                           assumption.status === 'edited' ? ' [Edited]' : ' [Unconfirmed]';
        text += `${i + 1}. ${displayText}${statusLabel}\n`;
      });
      text += `\n`;
    }

    if (output.summary) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `SUMMARY\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `${output.summary}\n\n`;
    }

    if (output.warnings && output.warnings.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `⚠ WARNINGS\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.warnings.forEach((warning, i) => {
        text += `${i + 1}. ${warning}\n`;
      });
      text += `\n`;
    }

    if (output.timeline && output.timeline.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `TIMELINE & DEADLINES\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.timeline.forEach((item) => {
        const deadline = item.isDeadline ? ' [DEADLINE]' : '';
        const date = item.date || (item.daysFromNow !== undefined ? `${item.daysFromNow} days` : 'TBD');
        text += `• ${date}${deadline}: ${item.title}\n`;
        text += `  ${item.description}\n\n`;
      });
    }

    if (output.checklist && output.checklist.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `ACTION CHECKLIST\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.checklist.forEach((item) => {
        const status = checklistState[item.id] ? '[X]' : '[ ]';
        const priority = item.priority === 'high' ? ' (HIGH PRIORITY)' : '';
        text += `${status} ${item.text}${priority}\n`;
        if (item.notes) text += `    Note: ${item.notes}\n`;
      });
      text += `\n`;
    }

    if (output.documentsNeeded && output.documentsNeeded.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `DOCUMENTS TO GATHER\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.documentsNeeded.forEach((doc, i) => {
        text += `${i + 1}. ${doc}\n`;
      });
      text += `\n`;
    }

    if (output.courtInfo) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `COURT INFORMATION\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `Court: ${output.courtInfo.name}\n`;
      if (output.courtInfo.address) text += `Address: ${output.courtInfo.address}\n`;
      if (output.courtInfo.phone) text += `Phone: ${output.courtInfo.phone}\n`;
      if (output.courtInfo.hours) text += `Hours: ${output.courtInfo.hours}\n`;
      if (output.courtInfo.filingFee) text += `Filing Fee: ${output.courtInfo.filingFee}\n`;
      if (output.courtInfo.website) text += `Website: ${output.courtInfo.website}\n`;
      if (output.courtInfo.dataSource) text += `Data Source: ${output.courtInfo.dataSource}\n`;
      if (output.courtInfo.lastUpdated) text += `Last Updated: ${output.courtInfo.lastUpdated}\n`;
      text += `⚠ VERIFY: Court info may have changed. Call or check website.\n`;
      text += `\n`;
    }

    if (output.nextSteps && output.nextSteps.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `NEXT STEPS\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.nextSteps.forEach((step, i) => {
        text += `${i + 1}. ${step}\n`;
      });
      text += `\n`;
    }

    if (output.citations && output.citations.length > 0) {
      text += `───────────────────────────────────────────────────────────────\n`;
      text += `LEGAL REFERENCES (Verify Before Relying)\n`;
      text += `───────────────────────────────────────────────────────────────\n`;
      output.citations.forEach((citation, i) => {
        text += `${i + 1}. ${citation}\n`;
      });
      text += `\n`;
    }

    text += `═══════════════════════════════════════════════════════════════\n`;
    text += `DISCLAIMER\n`;
    text += `═══════════════════════════════════════════════════════════════\n`;
    text += `This document is for INFORMATIONAL and SELF-HELP purposes only.\n`;
    text += `It does NOT constitute legal advice and is NOT a substitute for\n`;
    text += `advice from a licensed attorney. Laws change frequently. Always\n`;
    text += `verify current requirements with official sources before acting.\n`;
    text += `\n`;
    text += `EZLegal.ai is not a law firm and does not provide legal advice.\n`;
    text += `Generated: ${output.generatedDate}\n`;
    text += `═══════════════════════════════════════════════════════════════\n`;

    return text;
  };

  const initiateExport = (exportType: 'download' | 'print' | 'copy') => {
    if (!exportAcknowledged) {
      setShowExportWarning(true);
      return;
    }
    performExport(exportType);
  };

  const performExport = (exportType: 'download' | 'print' | 'copy') => {
    const text = generateExportText();
    if (exportType === 'download') {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = isProvisional ? 'provisional-plan' : 'action-plan';
      a.download = `${prefix}-${(readinessValues.caseType || output.caseType || 'legal-matter').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (exportType === 'print') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px;">${text}</pre>`);
        printWindow.document.close();
        printWindow.print();
      }
    } else if (exportType === 'copy') {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowExportWarning(false);
  };

  if (currentStep === 'review') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Review Before Generating</h2>
                <p className="text-amber-100 text-sm mt-1">Confirm details for accuracy</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Why this matters</p>
                <p className="text-sm text-amber-700 mt-1">
                  Accurate information ensures your action plan is relevant. If you don't know something,
                  you can mark it as "I don't know" to receive a provisional plan.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Confirm Your Details</h3>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${readinessStatus.progress === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                    style={{ width: `${readinessStatus.progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{readinessStatus.progress}%</span>
              </div>
            </div>

            <div className="space-y-4">
              {readinessFields.map((field) => (
                <div key={field.id}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {(field.allowUnknown || field.required) && (
                      <button
                        type="button"
                        onClick={() => toggleUnknown(field.id)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          unknownFields.has(field.id)
                            ? 'bg-amber-100 text-amber-700 font-medium'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {unknownFields.has(field.id) ? "Marked as unknown" : "I don't know"}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={unknownFields.has(field.id) ? '' : (readinessValues[field.id] || '')}
                    onChange={(e) => setReadinessValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={unknownFields.has(field.id) ? 'Marked as unknown' : field.placeholder}
                    disabled={unknownFields.has(field.id)}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                      unknownFields.has(field.id)
                        ? 'bg-amber-50 border-amber-200 text-amber-600 cursor-not-allowed'
                        : 'border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {readinessStatus.missingRequired.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Missing Required Information</p>
                  <p className="text-xs text-red-600 mt-1 mb-2">Fill in or mark as "I don't know":</p>
                  <ul className="space-y-1">
                    {readinessStatus.missingRequired.map(field => (
                      <li key={field.id} className="text-sm text-red-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        {field.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {readinessStatus.hasUnknowns && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Provisional Plan Notice</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Some fields are marked "I don't know." Your action plan will be labeled as
                    <strong> Provisional</strong> and may need confirmation of these details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {assumptions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Review Our Assumptions</p>
                  <p className="text-xs text-blue-600 mt-1 mb-3">Confirm, edit, or deny each assumption:</p>
                  <div className="space-y-2">
                    {assumptions.map((assumption) => (
                      <div
                        key={assumption.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          assumption.status === 'confirmed' ? 'bg-green-50 border-green-200' :
                          assumption.status === 'denied' ? 'bg-red-50 border-red-200 opacity-60' :
                          assumption.status === 'edited' ? 'bg-teal-50 border-teal-200' :
                          'bg-white border-slate-200'
                        }`}
                      >
                        {editingAssumption === assumption.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveEditAssumption(assumption.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                onClick={() => setEditingAssumption(null)}
                                className="px-3 py-1 text-slate-600 text-xs hover:bg-slate-100 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <p className={`text-sm flex-1 ${assumption.status === 'denied' ? 'line-through text-slate-500' : 'text-slate-700'}`}>
                              {assumption.editedText || assumption.text}
                              {assumption.status === 'edited' && (
                                <span className="ml-2 text-xs text-teal-600">(edited)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setAssumptionStatus(assumption.id, 'confirmed')}
                                className={`p-1.5 rounded transition-colors ${
                                  assumption.status === 'confirmed'
                                    ? 'bg-green-500 text-white'
                                    : 'hover:bg-green-100 text-green-600'
                                }`}
                                title="Confirm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => startEditAssumption(assumption)}
                                className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setAssumptionStatus(assumption.id, 'denied')}
                                className={`p-1.5 rounded transition-colors ${
                                  assumption.status === 'denied'
                                    ? 'bg-red-500 text-white'
                                    : 'hover:bg-red-100 text-red-600'
                                }`}
                                title="Deny"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {hasDeniedAssumptions && onRegenerateWithAssumptions && (
                    <button
                      onClick={handleRegenerateWithAssumptions}
                      className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate with corrected assumptions
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setCurrentStep('plan')}
              disabled={!readinessStatus.requiredComplete}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                readinessStatus.requiredComplete
                  ? isProvisional
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {isProvisional ? 'Generate Provisional Plan' : 'Generate Action Plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col">
      <div className={`px-6 py-5 flex-shrink-0 ${isProvisional ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-slate-800 to-slate-900'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{output.title}</h2>
                {isProvisional && (
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-medium rounded">
                    Provisional
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {unknownFields.has('caseType') ? '[Needs Confirmation]' : (readinessValues.caseType || output.caseType)}
                </span>
                <span className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {unknownFields.has('jurisdiction') ? '[Needs Confirmation]' : (readinessValues.jurisdiction || output.jurisdiction)}
                </span>
              </div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setCurrentStep('review')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Edit Details
          </button>
          <button
            onClick={() => initiateExport('download')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => initiateExport('print')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={() => initiateExport('copy')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {showExportWarning && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex-shrink-0">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900">Confirm Before Export</p>
              <p className="text-sm text-amber-700 mt-1">
                This action plan is for informational purposes only. It is NOT legal advice and NOT a court-ready filing.
                {isProvisional && ' This is a PROVISIONAL plan with unconfirmed details.'}
              </p>
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportAcknowledged}
                  onChange={(e) => setExportAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-amber-800">
                  I understand this is informational only, not legal advice, and I should consult an attorney before taking legal action.
                </span>
              </label>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowExportWarning(false)} className="px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-100 rounded transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => performExport('download')}
                  disabled={!exportAcknowledged}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${exportAcknowledged ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-200 text-amber-400 cursor-not-allowed'}`}
                >
                  Proceed with Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4 overflow-y-auto flex-1">
        {isProvisional && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Provisional Plan - Needs Confirmation</p>
                <p className="text-sm text-amber-700 mt-1">
                  Some required information was marked as "I don't know." This plan is based on general guidance
                  and may not be accurate for your specific situation. Confirm the unknown details before relying on this information.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Important Disclaimer</p>
              <p className="text-sm text-red-700 mt-1">
                This action plan is for <strong>informational and self-help purposes only</strong>. It does NOT constitute legal advice
                and is NOT a substitute for advice from a licensed attorney. EZLegal.ai is not a law firm.
              </p>
            </div>
          </div>
        </div>

        {hasUnconfirmedAssumptions && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Unconfirmed Assumptions</p>
                <p className="text-sm text-blue-700 mt-1">
                  Some assumptions haven't been confirmed. Go back to <button onClick={() => setCurrentStep('review')} className="underline font-medium">Edit Details</button> to review them.
                </p>
              </div>
            </div>
          </div>
        )}

        {output.summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">{output.summary}</p>
          </div>
        )}

        {output.warnings && output.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important Warnings</h3>
                <ul className="space-y-1">
                  {output.warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-400">-</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {output.checklist && output.checklist.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('checklist')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Action Checklist</span>
                <span className="text-sm text-slate-500">{completedCount}/{totalItems} completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                {expandedSections.has('checklist') ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
              </div>
            </button>
            {expandedSections.has('checklist') && (
              <div className="p-4 space-y-2">
                {output.checklist.map((item) => (
                  <label key={item.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${checklistState[item.id] ? 'bg-green-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
                    <input type="checkbox" checked={checklistState[item.id] || false} onChange={() => toggleChecklistItem(item.id)} className="mt-0.5 w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${checklistState[item.id] ? 'text-green-700 line-through' : 'text-slate-800'}`}>{item.text}</span>
                        {item.priority === 'high' && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">High Priority</span>}
                      </div>
                      {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {output.timeline && output.timeline.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('timeline')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Timeline & Deadlines</span>
              </div>
              {expandedSections.has('timeline') ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {expandedSections.has('timeline') && (
              <div className="p-4">
                <div className="relative">
                  {output.timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${item.isDeadline ? 'bg-red-500' : 'bg-blue-500'}`} />
                        {index < output.timeline!.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                      </div>
                      <div className="flex-1 -mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${item.isDeadline ? 'text-red-600' : 'text-slate-900'}`}>{item.title}</span>
                          {item.isDeadline && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">Deadline</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <Calendar className="w-3 h-3" />
                          {item.date || (item.daysFromNow !== undefined ? `${item.daysFromNow} days from now` : 'Date TBD')}
                        </div>
                        <p className="text-sm text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {output.documentsNeeded && output.documentsNeeded.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('documents')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Documents to Gather</span>
                <span className="text-sm text-slate-500">{output.documentsNeeded.length} items</span>
              </div>
              {expandedSections.has('documents') ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {expandedSections.has('documents') && (
              <div className="p-4">
                <ul className="space-y-2">
                  {output.documentsNeeded.map((doc, index) => (
                    <li key={index} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{index + 1}</span>
                      <span className="text-sm text-slate-700">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {output.courtInfo && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('court')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Court Information</span>
              </div>
              {expandedSections.has('court') ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>
            {expandedSections.has('court') && (
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-slate-900">{output.courtInfo.name}</h4>
                {output.courtInfo.address && (
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{output.courtInfo.address}</span>
                  </div>
                )}
                {output.courtInfo.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${output.courtInfo.phone}`} className="hover:text-blue-600">{output.courtInfo.phone}</a>
                  </div>
                )}
                {output.courtInfo.hours && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{output.courtInfo.hours}</span>
                  </div>
                )}
                {output.courtInfo.filingFee && (
                  <div className="text-sm">
                    <span className="text-slate-500">Filing Fee: </span>
                    <span className="font-medium text-slate-900">{output.courtInfo.filingFee}</span>
                  </div>
                )}

                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700">
                      <p className="font-medium">Verify Before Visiting</p>
                      <p className="mt-1">Court hours, fees, and procedures may have changed.</p>
                      {output.courtInfo.dataSource && (
                        <p className="mt-1">Source: {output.courtInfo.dataSource}</p>
                      )}
                      {output.courtInfo.lastUpdated && (
                        <p>Last updated: {output.courtInfo.lastUpdated}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {output.courtInfo.website && (
                      <a
                        href={output.courtInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Verify on Court Website
                      </a>
                    )}
                    {output.courtInfo.phone && (
                      <a
                        href={`tel:${output.courtInfo.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        Call to Verify
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {output.nextSteps && output.nextSteps.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recommended Next Steps
            </h3>
            <ol className="space-y-2">
              {output.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">{index + 1}</span>
                  <span className="text-sm text-green-800">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="p-4 bg-slate-100 rounded-xl">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Disclaimer:</strong> This action plan is for informational purposes only and does not constitute legal advice.
            Laws and procedures may change. Always verify current requirements with the court or a licensed attorney.
            Generated {output.generatedDate} for {unknownFields.has('jurisdiction') ? '[jurisdiction to be confirmed]' : (readinessValues.jurisdiction || output.jurisdiction)}.
          </p>
        </div>
      </div>
    </div>
  );
}
