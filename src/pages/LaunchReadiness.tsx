'use client';

import { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  ExternalLink,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LAUNCH_GATES,
  computeGateStatus,
  type LaunchGate,
  type ICP,
  type Severity,
} from '../data/launchReadiness';

interface ExpandedState {
  [key: string]: boolean;
}

export default function LaunchReadiness() {
  const { language } = useLanguage();
  const [expandedGates, setExpandedGates] = useState<ExpandedState>({});
  const [selectedICP, setSelectedICP] = useState<ICP | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');

  // Filter gates
  const filteredGates = LAUNCH_GATES.filter((gate) => {
    const icpMatch =
      selectedICP === 'all' ||
      gate.icps.includes(selectedICP) ||
      gate.icps.includes('all');
    const severityMatch = selectedSeverity === 'all' || gate.severity === selectedSeverity;
    return icpMatch && severityMatch;
  });

  // Compute status
  const status = computeGateStatus(filteredGates);

  // Toggle expanded state
  const toggleExpanded = (gateId: string) => {
    setExpandedGates((prev) => ({
      ...prev,
      [gateId]: !prev[gateId],
    }));
  };

  // Status badge styling
  const getStatusStyles = (gateStatus: string) => {
    switch (gateStatus) {
      case 'pass':
        return {
          badge: 'bg-green-100 text-green-800',
          border: 'border-l-4 border-green-500',
          icon: CheckCircle,
        };
      case 'fail':
        return {
          badge: 'bg-red-100 text-red-800',
          border: 'border-l-4 border-red-500',
          icon: AlertTriangle,
        };
      case 'in_progress':
        return {
          badge: 'bg-blue-100 text-blue-800',
          border: 'border-l-4 border-blue-500',
          icon: Clock,
        };
      case 'blocked':
        return {
          badge: 'bg-amber-100 text-amber-800',
          border: 'border-l-4 border-amber-500',
          icon: Lock,
        };
      case 'not_started':
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          border: 'border-l-4 border-gray-500',
          icon: Shield,
        };
    }
  };

  // Severity color
  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate markdown export
  const generateMarkdown = () => {
    let markdown = `# Launch Readiness Report\n\n`;
    markdown += `Generated: ${new Date().toLocaleString()}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- **Total Gates**: ${status.totalGates}\n`;
    markdown += `- **Passed**: ${status.passed}\n`;
    markdown += `- **Blocked**: ${status.blocked}\n`;
    markdown += `- **Critical Issues**: ${status.criticalBlocked}\n`;
    markdown += `- **Ready to Launch**: ${status.readyToLaunch ? 'Yes ✓' : 'No ✗'}\n\n`;

    markdown += `## Gate Details\n\n`;

    filteredGates.forEach((gate) => {
      markdown += `### ${gate.title}\n\n`;
      markdown += `**Category**: ${gate.category}\n\n`;
      markdown += `**Status**: ${gate.status.toUpperCase()}\n\n`;
      markdown += `**Severity**: ${gate.severity.toUpperCase()}\n\n`;
      markdown += `**Owner**: ${gate.owner}\n\n`;
      markdown += `**Due Date**: ${gate.dueDate}\n\n`;
      markdown += `**Description**: ${gate.description}\n\n`;

      if (gate.evidence.length > 0) {
        markdown += `**Evidence**:\n\n`;
        gate.evidence.forEach((item) => {
          markdown += `- [${item.label}](${item.url})\n`;
        });
        markdown += `\n`;
      }

      if (gate.blockers.length > 0) {
        markdown += `**Blockers**:\n\n`;
        gate.blockers.forEach((blocker) => {
          markdown += `- ${blocker}\n`;
        });
        markdown += `\n`;
      }

      if (gate.reviewerNotes) {
        markdown += `**Reviewer Notes**: ${gate.reviewerNotes}\n\n`;
      }

      markdown += `---\n\n`;
    });

    return markdown;
  };

  // Download markdown
  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`);
    element.setAttribute('download', `launch-readiness-${new Date().toISOString().split('T')[0]}.md`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Launch Readiness Dashboard
            </h1>
            <p className="text-gray-600">Admin-only internal dashboard for ezLegal.ai</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full font-semibold ${
              status.readyToLaunch
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status.readyToLaunch ? 'Ready to Launch ✓' : 'Not Ready ✗'}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Gates Passing</div>
            <div className="text-3xl font-bold text-green-600">
              {status.passed}/{status.totalGates}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Blocked</div>
            <div className="text-3xl font-bold text-amber-600">{status.blocked}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Critical Issues</div>
            <div className="text-3xl font-bold text-red-600">
              {status.criticalBlocked}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">
              {filteredGates.filter((g) => g.status === 'in_progress').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="mb-8 flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Filter:</span>
        </div>

        {/* ICP Filter */}
        <select
          value={selectedICP}
          onChange={(e) => setSelectedICP(e.target.value as ICP | 'all')}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All ICPs</option>
          <option value="spanish_low_income">Spanish Low Income</option>
          <option value="smb">SMB</option>
          <option value="pro_bono_org">Pro Bono Org</option>
        </select>

        {/* Severity Filter */}
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value as Severity | 'all')}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Export Button */}
        <button
          onClick={downloadMarkdown}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Export Markdown
        </button>
      </div>

      {/* Gate Cards */}
      <div className="space-y-4">
        {filteredGates.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-600">No gates match the selected filters.</p>
          </div>
        ) : (
          filteredGates.map((gate) => {
            const isExpanded = expandedGates[gate.id] ?? false;
            const statusStyles = getStatusStyles(gate.status);
            const StatusIcon = statusStyles.icon;

            return (
              <div
                key={gate.id}
                className={`bg-white rounded-lg border border-gray-200 ${statusStyles.border} transition-all hover:shadow-md`}
              >
                {/* Collapsed Header */}
                <button
                  onClick={() => toggleExpanded(gate.id)}
                  className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <StatusIcon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {gate.title}
                      </h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles.badge}`}
                    >
                      {gate.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                        gate.severity
                      )}`}
                    >
                      {gate.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    {/* Description & Category */}
                    <div className="mb-5">
                      <p className="text-gray-700 mb-3">{gate.description}</p>
                      <div className="inline-block">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                          {gate.category}
                        </span>
                      </div>
                    </div>

                    {/* Owner & Due Date */}
                    <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-200">
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Owner</div>
                        <div className="text-gray-900">{gate.owner}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium">Due Date</div>
                        <div className="text-gray-900">{gate.dueDate}</div>
                      </div>
                    </div>

                    {/* Evidence */}
                    {gate.evidence.length > 0 && (
                      <div className="mb-5 pb-5 border-b border-gray-200">
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          Evidence
                        </div>
                        <div className="space-y-2">
                          {gate.evidence.map((item, idx) => (
                            <a
                              key={idx}
                              href={item.url}
                              target={item.url.startsWith('/') ? undefined : '_blank'}
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {item.label}
                              <span className="text-xs text-gray-500">({item.type})</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Blockers */}
                    {gate.blockers.length > 0 && (
                      <div className="mb-5 pb-5 border-b border-gray-200">
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          Blockers
                        </div>
                        <div className="space-y-2">
                          {gate.blockers.map((blocker, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
                            >
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-amber-900">{blocker}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reviewer Notes */}
                    {gate.reviewerNotes && (
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-2">
                          Reviewer Notes
                        </div>
                        <p className="text-gray-700 text-sm italic">
                          {gate.reviewerNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
