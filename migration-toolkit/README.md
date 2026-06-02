# ezLegal.ai Migration Toolkit

Complete toolkit for migrating from legacy MySQL/LegalBreeze to Supabase.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Test connections
npm run test:connection

# 4. Run full migration
npm run migrate:all

# 5. Validate
npm run validate
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run test:connection` | Test MySQL and Supabase connections |
| `npm run extract` | Extract data from MySQL databases |
| `npm run transform` | Transform data to Supabase format |
| `npm run import` | Import data to Supabase |
| `npm run migrate:all` | Run extract, transform, and import |
| `npm run migrate:users` | Migrate users with auth handling |
| `npm run migrate:embeddings` | Migrate FAISS embeddings to pgvector |
| `npm run validate` | Validate migration integrity |
| `npm run generate:report` | Generate migration report |
| `npm run rollback` | Rollback migrated data (destructive) |

## Documentation

See [RUNBOOK.md](./RUNBOOK.md) for detailed step-by-step instructions.

## Directory Structure

```
migration-toolkit/
├── scripts/
│   ├── test-connections.js    # Connection testing
│   ├── extract-mysql.js       # MySQL data extraction
│   ├── transform-data.js      # Data transformation
│   ├── import-supabase.js     # Supabase import
│   ├── migrate-users.js       # User-specific migration
│   ├── migrate-embeddings.js  # FAISS to pgvector
│   ├── validate-migration.js  # Validation checks
│   ├── generate-report.js     # Report generation
│   ├── rollback.js           # Rollback procedure
│   └── export-faiss.py       # FAISS export (run on legacy server)
├── config/
│   └── schema-mapping.json   # Legacy to new schema mapping
├── backups/                  # Extracted data (gitignored)
├── reports/                  # Generated reports (gitignored)
├── .env.example             # Environment template
├── RUNBOOK.md               # Detailed migration guide
└── package.json
```

## Requirements

- Node.js 18+
- Python 3.9+ (for FAISS export)
- MySQL access to legacy databases
- Supabase project with service role key
- OpenAI API key (for embeddings)

## Support

For issues, contact the development team.
