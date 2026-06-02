import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logActivity, LogActivityParams } from '../services/activity-service';

export function useActivityLog() {
  const { user } = useAuth();

  const log = useCallback(async (params: LogActivityParams) => {
    if (!user) return null;
    return logActivity(params);
  }, [user]);

  const logChat = useCallback(async (options: {
    title: string;
    description?: string;
    jurisdiction?: string;
    messageCount?: number;
    relatedId?: string;
  }) => {
    return log({
      activityType: 'chat',
      action: 'message_sent',
      title: options.title,
      description: options.description,
      metadata: {
        jurisdiction: options.jurisdiction,
        messageCount: options.messageCount
      },
      relatedId: options.relatedId,
      relatedType: 'chat_message'
    });
  }, [log]);

  const logLawyerMatch = useCallback(async (options: {
    lawyerId: string;
    lawyerName: string;
    practiceArea?: string;
    action: 'viewed' | 'contacted' | 'matched' | 'connected';
  }) => {
    const actionTitles = {
      viewed: `Viewed attorney profile: ${options.lawyerName}`,
      contacted: `Contacted attorney: ${options.lawyerName}`,
      matched: `Matched with attorney: ${options.lawyerName}`,
      connected: `Connected with attorney: ${options.lawyerName}`
    };

    return log({
      activityType: 'lawyer_match',
      action: options.action,
      title: actionTitles[options.action],
      metadata: {
        lawyerId: options.lawyerId,
        lawyerName: options.lawyerName,
        practiceArea: options.practiceArea
      },
      relatedId: options.lawyerId,
      relatedType: 'lawyer_profile'
    });
  }, [log]);

  const logDocument = useCallback(async (options: {
    documentId?: string;
    documentName: string;
    documentType: string;
    action: 'created' | 'uploaded' | 'downloaded' | 'shared' | 'edited';
    status?: 'completed' | 'pending' | 'failed';
  }) => {
    const actionTitles = {
      created: `Document created: ${options.documentName}`,
      uploaded: `Document uploaded: ${options.documentName}`,
      downloaded: `Document downloaded: ${options.documentName}`,
      shared: `Document shared: ${options.documentName}`,
      edited: `Document edited: ${options.documentName}`
    };

    return log({
      activityType: 'document',
      action: options.action,
      title: actionTitles[options.action],
      metadata: {
        documentType: options.documentType,
        documentName: options.documentName
      },
      relatedId: options.documentId,
      relatedType: 'document',
      status: options.status
    });
  }, [log]);

  const logPrediction = useCallback(async (options: {
    predictionId?: string;
    caseType: string;
    confidenceScore?: number;
    outcome?: string;
  }) => {
    return log({
      activityType: 'prediction',
      action: 'generated',
      title: `Outcome prediction: ${options.caseType}`,
      description: options.outcome ? `Predicted outcome: ${options.outcome}` : undefined,
      metadata: {
        caseType: options.caseType,
        confidenceScore: options.confidenceScore,
        outcome: options.outcome
      },
      relatedId: options.predictionId,
      relatedType: 'prediction'
    });
  }, [log]);

  const logCase = useCallback(async (options: {
    caseId?: string;
    caseName: string;
    caseType?: string;
    action: 'created' | 'updated' | 'closed' | 'reopened';
    status?: 'completed' | 'pending' | 'in_progress';
  }) => {
    const actionTitles = {
      created: `Case created: ${options.caseName}`,
      updated: `Case updated: ${options.caseName}`,
      closed: `Case closed: ${options.caseName}`,
      reopened: `Case reopened: ${options.caseName}`
    };

    return log({
      activityType: 'case',
      action: options.action,
      title: actionTitles[options.action],
      metadata: {
        caseType: options.caseType
      },
      relatedId: options.caseId,
      relatedType: 'case',
      status: options.status
    });
  }, [log]);

  const logSystem = useCallback(async (options: {
    action: string;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) => {
    return log({
      activityType: 'system',
      action: options.action,
      title: options.title,
      description: options.description,
      metadata: options.metadata
    });
  }, [log]);

  return {
    log,
    logChat,
    logLawyerMatch,
    logDocument,
    logPrediction,
    logCase,
    logSystem
  };
}
