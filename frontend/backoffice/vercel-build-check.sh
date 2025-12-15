#!/bin/bash

# Ignored Build Step for crm-plus-backoffice
# Only build if there are changes in frontend/backoffice/

echo "Checking for changes in frontend/backoffice..."

# Get the commit range
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
  echo "✅ First deployment - building..."
  exit 1
fi

# Check if there are changes in frontend/backoffice
if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- frontend/backoffice; then
  echo "🛑 No changes in frontend/backoffice - skipping build"
  exit 0
else
  echo "✅ Changes detected in frontend/backoffice - proceeding with build"
  exit 1
fi
