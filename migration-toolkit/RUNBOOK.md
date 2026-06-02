# ezLegal.ai Migration Runbook

## Complete Guide for MySQL to Supabase Migration

**Target Launch Date:** February 15, 2026
**Document Version:** 1.0
**Last Updated:** January 21, 2026

---

## Table of Contents

1. [Pre-Migration Checklist](#1-pre-migration-checklist)
2. [Environment Setup](#2-environment-setup)
3. [Phase 1: Data Extraction](#3-phase-1-data-extraction)
4. [Phase 2: Data Transformation](#4-phase-2-data-transformation)
5. [Phase 3: Data Import](#5-phase-3-data-import)
6. [Phase 4: Embedding Migration](#6-phase-4-embedding-migration)
7. [Phase 5: Validation](#7-phase-5-validation)
8. [Phase 6: Cutover](#8-phase-6-cutover)
9. [Rollback Procedures](#9-rollback-procedures)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Pre-Migration Checklist

### Required Access

Before starting, ensure you have:

- [ ] MySQL database credentials (legalbre_main, legalbre_wp, legalbre_api)
- [ ] SSH access to production EC2 (100.21.9.87)
- [ ] SSH access to chatbot server (52.35.244.130)
- [ ] Supabase project admin access
- [ ] Supabase service role key
- [ ] OpenAI API key (for embedding generation)
- [ ] DNS registrar access (for cutover)

### System Requirements

- Node.js 18+ installed
- Python 3.9+ installed (for FAISS export)
- At least 10GB free disk space
- Stable internet connection

### Timeline Overview

| Day | Phase | Duration | Owner |
|-----|-------|----------|-------|
| Day 1-2 | Environment Setup | 4 hours | DevOps |
| Day 3-5 | Data Extraction | 8 hours | Backend |
| Day 6-7 | Data Transformation | 4 hours | Backend |
| Day 8-10 | Data Import | 6 hours | Backend |
| Day 11-14 | Embedding Migration | 10 hours | AI/ML |
| Day 15-18 | Validation & Testing | 12 hours | QA |
| Day 19-20 | Staging Verification | 8 hours | All |
| Day 21-23 | Buffer/Fixes | As needed | All |
| Day 24-25 | Cutover | 4 hours | DevOps |

---

## 2. Environment Setup

### Step 2.1: Clone and Install

```bash
cd migration-toolkit
npm install
```

### Step 2.2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# MySQL Source Database
MYSQL_HOST=100.21.9.87
MYSQL_PORT=3306
MYSQL_USER=legalbre_admin
MYSQL_PASSWORD=<your-password>
MYSQL_DATABASE_MAIN=legalbre_main
MYSQL_DATABASE_WP=legalbre_wp
MYSQL_DATABASE_API=legalbre_api

# Supabase Target
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# OpenAI for Embeddings
OPENAI_API_KEY=sk-<your-key>
```

### Step 2.3: Test Connections

```bash
npm run test:connection
```

**Expected Output:**
```
✓ MySQL connection successful (100.21.9.87)
✓ Main database: 15 tables found
✓ WordPress database: 12 tables found
✓ API database: 2 tables found
✓ Supabase connection successful
✓ 7 target tables ready
✅ All connections successful! Ready for migration.
```

**If connection fails:**
- Verify credentials in `.env`
- Check firewall rules allow connection
- Ensure SSH tunnel is active if required

---

## 3. Phase 1: Data Extraction

### Step 3.1: Run Extraction

```bash
npm run extract
```

This extracts data from all three MySQL databases.

**Expected Duration:** 5-30 minutes depending on data size

**Expected Output:**
```
📦 Extracting legalbre_main database
✓ users: 1,234 rows exported
✓ lawyers: 156 rows exported
✓ cases: 2,891 rows exported
✓ messages: 45,678 rows exported
...

📊 Extraction Summary
  Tables processed: 14
  Successful: 14
  Failed: 0
  Total rows: 52,341

  Output: ./backups/extract-2026-01-22T10-30-00
```

### Step 3.2: Verify Extraction

Check the backup directory:

```bash
ls -la backups/extract-*/
```

Verify manifest:
```bash
cat backups/extract-*/manifest.json
```

**Checkpoint:** All tables should show "success: true"

---

## 4. Phase 2: Data Transformation

### Step 4.1: Run Transformation

```bash
npm run transform
```

This converts legacy data formats to Supabase schema.

**Key Transformations:**
- User IDs converted to UUIDs
- Roles mapped (admin, lawyer, user)
- Arrays created from comma-separated values
- Timestamps normalized to ISO 8601

**Expected Output:**
```
📦 Transforming data...
✓ Users: 1,234 records transformed
✓ Lawyers: 156 records transformed
✓ Cases: 2,891 records transformed
...

📊 Transformation Summary
  Transformed: 7
  Skipped: 0
  Failed: 0

  Output: ./backups/transform-2026-01-22T10-30-00
```

### Step 4.2: Verify ID Mappings

```bash
cat backups/transform-*/id_mappings.json | head -50
```

This file tracks old->new ID mappings for referential integrity.

**Checkpoint:** `id_mappings.json` should contain entries for users, lawyers, cases

---

## 5. Phase 3: Data Import

### Step 5.1: Dry Run (Recommended)

First, test without writing:

```bash
DRY_RUN=true npm run import
```

Verify no errors before proceeding.

### Step 5.2: Production Import

```bash
npm run import
```

**Import Order (automatic):**
1. Profiles (users)
2. Lawyer Profiles
3. Chat Contexts
4. Chat Messages
5. Documents
6. Cases
7. Articles

**Expected Output:**
```
📦 Importing to Supabase...
  Importing 1,234 profiles...
  profiles |████████████████████| 100% | 1234/1234
✓ Profiles: 1,234 imported

  Importing 156 lawyer profiles...
  lawyer_profiles |████████████████████| 100% | 156/156
...

📊 Import Summary
  ✓ Profiles: 1234 imported, 0 errors
  ✓ Lawyer Profiles: 156 imported, 0 errors
  ...
  Total: 52,341 records imported
```

### Step 5.3: Handle Import Errors

If errors occur:

1. Check error messages in console
2. Review failed batch data
3. Common issues:
   - Duplicate keys: Run with `ignoreDuplicates: true`
   - Foreign key violations: Check import order
   - Data type mismatches: Review transform logic

---

## 6. Phase 4: Embedding Migration

### Step 6.1: Export FAISS Data (Legacy Server)

SSH to chatbot server:
```bash
ssh -i your-key.pem ec2-user@52.35.244.130
```

Run export script:
```bash
cd /var/www/chatbot
python3 export-faiss.py --index-path ./indexes --output ./faiss-export
```

Copy to migration toolkit:
```bash
scp -r ec2-user@52.35.244.130:/var/www/chatbot/faiss-export ./backups/
```

### Step 6.2: Import Embeddings

```bash
npm run migrate:embeddings
```

**This script:**
1. Imports FAISS vectors to pgvector
2. Generates embeddings for documents without them
3. Creates embeddings for migrated articles

**Expected Duration:** 1-4 hours depending on document count

**Expected Output:**
```
🧠 Embedding Migration
  Model: text-embedding-3-small
  Dimensions: 1536

  Importing FAISS data...
  FAISS |████████████████████| 100% | 5000/5000

  Generating document embeddings...
  Documents |████████████████████| 100% | 234/234

📊 Embedding Migration Summary
  ✓ FAISS Import: 5000 processed, 0 errors
  ✓ Document Embeddings: 234 processed, 0 errors

  Total: 5234 embeddings created
```

---

## 7. Phase 5: Validation

### Step 7.1: Run Full Validation

```bash
npm run validate
```

**Validation Checks:**
- Record count comparison (source vs target)
- Data integrity (orphaned records)
- Embedding coverage
- Relationship verification

**Expected Output:**
```
📊 Record Count Validation
  ✓ Users/Profiles        Source:   1234 | Target:   1234
  ✓ Lawyers               Source:    156 | Target:    156
  ✓ Cases                 Source:   2891 | Target:   2891
...

🔍 Data Integrity Checks
  ✓ Orphaned chat messages: 0
  ✓ Orphaned lawyer profiles: 0
  ✓ Duplicate emails: 0

🧠 Embedding Validation
  ✓ Documents with embeddings: 5234/5234 (100%)
  ✓ Embedding dimension: 1536

📋 Validation Summary
  Total checks: 12
  Passed: 12
  Failed: 0
  Pass rate: 100%

✅ All validation checks passed! Migration verified.
```

### Step 7.2: Generate Report

```bash
npm run generate:report
```

Save this report for cutover approval.

### Step 7.3: Manual Spot Checks

1. **User Login Test:**
   - Pick 5 random users
   - Verify they can log in (after password reset)

2. **Lawyer Search Test:**
   - Search for lawyers by practice area
   - Verify results match legacy system

3. **Chat History Test:**
   - Check 3 user chat histories
   - Verify all messages present

4. **RAG Query Test:**
   - Run 5 test queries against new pgvector
   - Compare results with legacy FAISS

---

## 8. Phase 6: Cutover

### Pre-Cutover Checklist

- [ ] All validation checks pass
- [ ] Management approval obtained
- [ ] Rollback plan reviewed
- [ ] Support team notified
- [ ] Maintenance window scheduled
- [ ] Monitoring dashboards ready

### Step 8.1: Final Data Sync

Run one final extraction/import 1 hour before cutover:

```bash
npm run extract && npm run transform && npm run import
```

This catches any data created since initial migration.

### Step 8.2: Enable Maintenance Mode

On legacy server:
```bash
# Enable maintenance page
sudo mv /var/www/html/index.php /var/www/html/index.php.bak
sudo cp /var/www/maintenance.html /var/www/html/index.php
```

### Step 8.3: DNS Cutover

Update DNS records to point to new infrastructure:

| Record | Old Value | New Value |
|--------|-----------|-----------|
| A | 100.21.9.87 | Supabase CDN IP |
| CNAME | - | your-project.supabase.co |

**DNS Propagation:** Allow 15-60 minutes

### Step 8.4: Verification

1. Test public pages load
2. Test user login works
3. Test chat functionality
4. Test lawyer search
5. Monitor error logs

### Step 8.5: Disable Maintenance Mode

Once verified, announce cutover complete.

---

## 9. Rollback Procedures

### Immediate Rollback (< 1 hour after cutover)

1. Revert DNS to legacy IPs
2. Re-enable legacy maintenance mode
3. Investigate issues

### Data Rollback

If data corruption detected:

```bash
# Restore from Supabase point-in-time recovery
# Contact Supabase support with timestamp
```

### Full Rollback

If cutover fails completely:

1. Revert all DNS changes
2. Keep legacy system running
3. Schedule new cutover window
4. Address root cause

---

## 10. Troubleshooting

### Connection Issues

**MySQL "Access denied":**
```bash
# Test credentials directly
mysql -h 100.21.9.87 -u legalbre_admin -p
```

**Supabase timeout:**
- Check service role key is correct
- Verify project is not paused
- Check RLS policies aren't blocking

### Import Errors

**"duplicate key value":**
```javascript
// Add to import script
{ onConflict: 'id', ignoreDuplicates: true }
```

**"foreign key violation":**
- Ensure import order is correct
- Check ID mappings are complete

### Embedding Errors

**OpenAI rate limit:**
- Reduce batch size
- Add longer delays between requests
- Use exponential backoff

**pgvector dimension mismatch:**
- Verify EMBEDDING_DIMENSIONS matches model
- Regenerate embeddings if needed

### Performance Issues

**Slow imports:**
- Increase BATCH_SIZE
- Use database connection pooling
- Check network latency

---

## Support Contacts

| Role | Name | Contact |
|------|------|---------|
| Project Lead | TBD | - |
| DevOps | TBD | - |
| Backend Dev | TBD | - |
| Supabase Support | - | support@supabase.io |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-21 | System | Initial runbook |

---

**Remember:** When in doubt, don't proceed. Ask for help.
