#!/bin/bash

# Ignored Build Step for imoveismais-site
# Only build if there are changes in frontend/web/

echo "Checking for changes in frontend/web..."

# Fetch previous commit if not available (shallow clone)
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  git fetch origin "$VERCEL_GIT_PREVIOUS_SHA" --depth=1 2>/dev/null || true
fi

# Get the commit range (use HEAD~1 if PREVIOUS_SHA unavailable)
PREVIOUS="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"

# Check if there are changes in frontend/web
if git diff --quiet "$PREVIOUS" HEAD -- frontend/web 2>/dev/null; then
  echo "🛑 No changes in frontend/web - skipping build"
  exit 0
else
  echo "✅ Changes detected in frontend/web (or first deployment) - proceeding with build"
  exit 1
fi
