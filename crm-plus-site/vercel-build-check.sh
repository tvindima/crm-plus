#!/bin/bash

# Ignored Build Step for crm-plus-site
# Only build if there are changes in crm-plus-site/

echo "Checking for changes in crm-plus-site..."
echo "Current commit: $VERCEL_GIT_COMMIT_SHA"
echo "Previous commit: $VERCEL_GIT_PREVIOUS_SHA"

# Try to fetch previous commit if specified
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "Fetching previous commit..."
  git fetch origin "$VERCEL_GIT_PREVIOUS_SHA" --depth=1 2>/dev/null || echo "(fetch failed, will try to proceed)"
fi

# Verify commits exist before comparing
if [ -n "$VERCEL_GIT_PREVIOUS_SHA" ] && git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  PREVIOUS="$VERCEL_GIT_PREVIOUS_SHA"
  echo "Using VERCEL_GIT_PREVIOUS_SHA: $PREVIOUS"
elif git rev-parse HEAD~1 >/dev/null 2>&1; then
  PREVIOUS="HEAD~1"
  echo "Using HEAD~1 as fallback"
else
  echo "✅ Cannot determine previous commit (likely first deployment) - proceeding with build"
  exit 1
fi

# Check for changes in crm-plus-site
echo "Running: git diff --quiet $PREVIOUS HEAD -- crm-plus-site"
if git diff --quiet "$PREVIOUS" HEAD -- crm-plus-site; then
  echo "🛑 No changes in crm-plus-site/ - skipping build"
  echo "DEBUG: git diff output:"
  git diff --name-only "$PREVIOUS" HEAD -- crm-plus-site || echo "(diff failed)"
  exit 0
else
  echo "✅ Changes detected in crm-plus-site/ - proceeding with build"
  echo "DEBUG: Changed files:"
  git diff --name-only "$PREVIOUS" HEAD -- crm-plus-site
  exit 1
fi
