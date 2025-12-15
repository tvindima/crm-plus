#!/bin/bash

# Ignored Build Step for crm-plus-backoffice
# Only build if there are changes in frontend/backoffice/

echo "Checking for changes in frontend/backoffice..."

# Fetch previous commit if not available (shallow clone)
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  git fetch origin "$VERCEL_GIT_PREVIOUS_SHA" --depth=1 2>/dev/null || true
fi

# Get the commit range (use HEAD~1 if PREVIOUS_SHA unavailable)
PREVIOUS="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"

# Check if there are changes in frontend/backoffice
if git diff --quiet "$PREVIOUS" HEAD -- frontend/backoffice 2>/dev/null; then
  echo "🛑 No changes in frontend/backoffice - skipping build"
  exit 0
else
  echo "✅ Changes detected in frontend/backoffice (or first deployment) - proceeding with build"
  exit 1
fi
