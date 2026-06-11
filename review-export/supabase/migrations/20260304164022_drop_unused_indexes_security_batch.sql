/*
  # Drop unused indexes

  Removes indexes that have never been used according to pg_stat_user_indexes.
  These were flagged by Supabase security advisor as unused indexes that
  consume storage and slow down write operations without benefit.

  Indexes dropped:
  - idx_legal_documents_document_type_id (legal_documents)
  - idx_user_data_requests_user_status (user_data_requests)
  - idx_user_data_requests_status_requested (user_data_requests)
  - idx_ai_models_is_reasoning (ai_models)
  - idx_audit_events_user_type_created (audit_events)
  - idx_audit_events_tenant_created (audit_events)
  - idx_tenant_policies_tenant_key (tenant_policies — covered by unique constraint)
*/

DROP INDEX IF EXISTS idx_legal_documents_document_type_id;
DROP INDEX IF EXISTS idx_user_data_requests_user_status;
DROP INDEX IF EXISTS idx_user_data_requests_status_requested;
DROP INDEX IF EXISTS idx_ai_models_is_reasoning;
DROP INDEX IF EXISTS idx_audit_events_user_type_created;
DROP INDEX IF EXISTS idx_audit_events_tenant_created;
DROP INDEX IF EXISTS idx_tenant_policies_tenant_key;
