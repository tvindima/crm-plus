#!/bin/bash

# Ignored Build Step for crm-plus-site
# Only build if there are changes in crm-plus-site/

echo "Checking for changes in crm-plus-site..."

# Get the commit range
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "✅ First deployment - building..."
  exit 1
fi

# Check if there are changes in crm-plus-site
if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- crm-plus-site; then
  echo "🛑 No changes in crm-plus-site - skipping build"
  exit 0
else
  echo "✅ Changes detected in crm-plus-site - proceeding with build"
  exit 1
fi
