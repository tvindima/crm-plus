#!/bin/bash

# Ignored Build Step for crm-plus-site
# Only build if there are changes in crm-plus-site/

echo "Checking for changes in crm-plus-site..."

# Fetch previous commit if not available (shallow clone)
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  git fetch origin "$VERCEL_GIT_PREVIOUS_SHA" --depth=1 2>/dev/null || true
fi

# Get the commit range (use HEAD~1 if PREVIOUS_SHA unavailable)
PREVIOUS="${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}"

# Check if there are changes in crm-plus-site
if git diff --quiet "$PREVIOUS" HEAD -- crm-plus-site 2>/dev/null; then
  echo "🛑 No changes in crm-plus-site - skipping build"
  exit 0
else
  echo "✅ Changes detected in crm-plus-site (or first deployment) - proceeding with build"
  exit 1
fi
