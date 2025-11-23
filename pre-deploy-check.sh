#!/bin/bash

# Quick deployment check script
# Run: bash pre-deploy-check.sh

echo "🚀 Pre-deployment checklist"
echo "=" 
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
  echo "⚠️  Git working directory is not clean"
  echo "   Uncommitted changes detected. Commit before deploying."
else
  echo "✅ Git working directory is clean"
fi

# Check if on correct branch
current_branch=$(git branch --show-current)
echo "📍 Current branch: $current_branch"

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ .env.local exists"
else
  echo "⚠️  .env.local not found (OK for production, not OK for local testing)"
fi

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
else
  echo "❌ package.json not found!"
  exit 1
fi

# Check Python API files
echo ""
echo "🐍 Checking Python API files..."
if [ -f "clova-rag-roadmap/requirements.txt" ]; then
  echo "✅ requirements.txt exists"
else
  echo "❌ requirements.txt not found!"
fi

if [ -f "clova-rag-roadmap/Procfile" ]; then
  echo "✅ Procfile exists"
else
  echo "❌ Procfile not found!"
fi

if [ -f "clova-rag-roadmap/runtime.txt" ]; then
  echo "✅ runtime.txt exists"
else
  echo "❌ runtime.txt not found!"
fi

# Check data files
if [ -d "clova-rag-roadmap/data" ]; then
  echo "✅ data/ directory exists"
  csv_count=$(find clova-rag-roadmap/data -name "*.csv" | wc -l)
  json_count=$(find clova-rag-roadmap/data -name "*.json" | wc -l)
  echo "   Found $csv_count CSV files and $json_count JSON files"
else
  echo "❌ data/ directory not found!"
fi

echo ""
echo "✅ Pre-deployment check complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Push to GitHub: git push origin $current_branch"
echo "   2. Deploy Next.js to Vercel"
echo "   3. Deploy Python API to Render"
echo "   4. Update PYTHON_API_URL in Vercel"
echo ""
