/*
  # Add print_optimized flag to partner kit generations

  1. Modified Tables
    - `partner_kit_generations`
      - `print_optimized` (boolean, default false) - Tracks whether the generated kit
        was configured for print output (no interactive elements, min font sizes enforced)

  2. Notes
    - This supports the new print vs digital flyer variant feature
    - Existing rows default to false (digital format)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partner_kit_generations' AND column_name = 'print_optimized'
  ) THEN
    ALTER TABLE partner_kit_generations ADD COLUMN print_optimized boolean DEFAULT false;
  END IF;
END $$;
