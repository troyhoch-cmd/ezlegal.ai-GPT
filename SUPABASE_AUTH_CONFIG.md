# Supabase Auth Configuration

This document outlines required Auth security configurations that must be set through the Supabase Dashboard.

## Required Configuration Changes

### 1. Enable Leaked Password Protection

**Status:** ⚠️ Currently Disabled

**What it does:**
Supabase Auth can check user passwords against the HaveIBeenPwned.org database to prevent users from using compromised passwords that have been leaked in data breaches.

**How to enable:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Policies**
3. Find the **Password Protection** section
4. Enable **"Check passwords against HaveIBeenPwned"**

**Benefits:**
- Prevents users from setting passwords that have been compromised in known data breaches
- Enhances overall account security
- Protects users from credential stuffing attacks
- Industry best practice for password security

### 2. Switch to Percentage-Based Connection Pool

**Status:** ⚠️ Currently using fixed connection count (10 connections)

**What it does:**
Changes the Auth server's database connection pool from a fixed number to a percentage-based allocation. This allows the connection pool to scale automatically when you upgrade your database instance.

**How to configure:**
1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **Database**
3. Find the **Connection Pooling** section
4. Switch from **"Fixed"** to **"Percentage"** mode for Auth connections
5. Set an appropriate percentage (recommended: 10-20% of total connections)

**Benefits:**
- Automatic scaling when database instance is upgraded
- Better resource utilization
- Prevents connection pool bottlenecks
- More flexible and maintainable configuration

**Example:**
- Small instance (15 connections total): 10-20% = 2-3 Auth connections
- Medium instance (60 connections total): 10-20% = 6-12 Auth connections
- Large instance (120 connections total): 10-20% = 12-24 Auth connections

## Database Security Improvements Completed

### ✅ Removed Unused Indexes

The following unused indexes have been removed to improve database performance:

- `idx_cases_client_id` - Unused index on cases table
- `idx_documents_case_id` - Unused index on documents table
- `idx_profiles_is_admin` - Low cardinality index
- `idx_profiles_status` - Low cardinality index
- `idx_profiles_subscription_tier` - Low cardinality index
- `idx_profiles_email` - Unused index on profiles table
- `idx_chat_messages_is_favorite` - Unused partial index

**Benefits:**
- Reduced storage overhead
- Improved write performance (INSERT, UPDATE, DELETE operations)
- Lower maintenance complexity
- Indexes can be recreated if query patterns change

## Verification

After making these changes:

1. **Leaked Password Protection**: Try to sign up with a known compromised password (e.g., "password123") - it should be rejected
2. **Connection Pool**: Monitor Auth performance after instance upgrades - connections should scale automatically
3. **Database Performance**: Monitor query performance and write speeds - should see improvements from removed indexes

## Notes

- These Auth configurations cannot be set through SQL migrations
- All configuration changes must be made through the Supabase Dashboard
- Changes take effect immediately
- No application code changes are required
