#!/bin/bash

echo "VERCEL_GIT_COMMIT_REF: $VERCEL_GIT_COMMIT_REF"

git remote -v

if [ "$VERCEL_GIT_COMMIT_REF" == "main" ]; then
  exit 1;
else
  git diff FETCH_HEAD HEAD --quiet -- ./docs

  if [ $? -eq 0 ]; then
    exit 0
  else
    exit 1;
  fi
fi
