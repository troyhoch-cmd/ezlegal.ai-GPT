#!/bin/bash

# Update color palette to ezlegal.ai colors
# Run this script from project root

# Files to update
FILES=(
  "src/pages/Features.tsx"
  "src/pages/Pricing.tsx"
  "src/pages/EZReads.tsx"
  "src/components/Layout.tsx"
  "src/pages/Contact.tsx"
)

for file in "${FILES[@]}"; do
  echo "Updating $file..."

  # Primary Blue colors
  sed -i 's/blue-600/#0067FF/g' "$file"
  sed -i 's/blue-700/#005EE9/g' "$file"
  sed -i 's/teal-500/#0067FF/g' "$file"
  sed -i 's/teal-600/#0067FF/g' "$file"
  sed -i 's/teal-700/#005EE9/g' "$file"

  # Text colors
  sed -i 's/slate-900/#0F172A/g' "$file"
  sed -i 's/slate-700/#364151/g' "$file"
  sed -i 's/slate-600/#364151/g' "$file"

  # Border and background colors
  sed -i 's/slate-200/#D1DAE5/g' "$file"
  sed -i 's/slate-300/#D1DAE5/g' "$file"

  # Light background colors
  sed -i 's/blue-50/#E7F6FF/g' "$file"
  sed -i 's/teal-50/#E7F6FF/g' "$file"
  sed -i 's/blue-100/#E7F6FF/g' "$file"
  sed -i 's/teal-100/#E7F6FF/g' "$file"

  echo "Done with $file"
done

echo "Color update complete!"
