/*
  # Drop Unused Indexes

  Removes indexes that have never been used according to pg_stat_user_indexes,
  reducing storage overhead and write amplification.

  1. Indexes dropped
    - prediction_consent_log: idx_prediction_consent_log_user_id, idx_prediction_consent_log_consented_at
    - ezreads_articles: idx_ezreads_articles_jurisdiction
    - legal_content: idx_legal_content_embedding, idx_legal_content_source_key,
      idx_legal_content_jurisdiction, idx_legal_content_content_type,
      idx_legal_content_section_number, idx_legal_content_is_active,
      idx_legal_content_scraped_at, idx_legal_content_practice_areas,
      idx_legal_content_keywords
    - scraper_sources: idx_scraper_sources_source_type, idx_scraper_sources_is_active
    - scraper_run_logs: idx_scraper_run_logs_source_id, idx_scraper_run_logs_source_key,
      idx_scraper_run_logs_started_at

  2. Important notes
    - These indexes showed zero scans in pg_stat_user_indexes
    - IF EXISTS used for safety
    - The new FK index on legal_content.source_id (created in batch 3)
      replaces idx_legal_content_source_key if they cover the same column
*/

DROP INDEX IF EXISTS idx_prediction_consent_log_user_id;
DROP INDEX IF EXISTS idx_prediction_consent_log_consented_at;
DROP INDEX IF EXISTS idx_ezreads_articles_jurisdiction;
DROP INDEX IF EXISTS idx_legal_content_embedding;
DROP INDEX IF EXISTS idx_legal_content_source_key;
DROP INDEX IF EXISTS idx_legal_content_jurisdiction;
DROP INDEX IF EXISTS idx_legal_content_content_type;
DROP INDEX IF EXISTS idx_legal_content_section_number;
DROP INDEX IF EXISTS idx_legal_content_is_active;
DROP INDEX IF EXISTS idx_legal_content_scraped_at;
DROP INDEX IF EXISTS idx_legal_content_practice_areas;
DROP INDEX IF EXISTS idx_legal_content_keywords;
DROP INDEX IF EXISTS idx_scraper_sources_source_type;
DROP INDEX IF EXISTS idx_scraper_sources_is_active;
DROP INDEX IF EXISTS idx_scraper_run_logs_source_id;
DROP INDEX IF EXISTS idx_scraper_run_logs_source_key;
DROP INDEX IF EXISTS idx_scraper_run_logs_started_at;
