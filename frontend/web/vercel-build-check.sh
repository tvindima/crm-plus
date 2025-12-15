#!/bin/bash

# Ignored Build Step for imoveismais-site
# Only build if there are changes in frontend/web/

echo "Checking for changes in frontend/web..."

# Get the commit range
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "✅ First deployment - building..."
  exit 1
fi

# Check if there are changes in frontend/web
if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- frontend/web; then
  echo "🛑 No changes in frontend/web - skipping build"
  exit 0
else
  echo "✅ Changes detected in frontend/web - proceeding with build"
  exit 1
fi
