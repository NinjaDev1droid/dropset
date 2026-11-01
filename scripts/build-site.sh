#!/usr/bin/env bash
# Builds the public website into _site/:
#   _site/index.html  ← dropset-landing.html (the front page)
#   _site/afroflow/   ← the DropSet tools
# Only these files are published. Everything else in the project stays private.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf _site
mkdir -p _site
cp dropset-landing.html _site/index.html
cp -R afroflow _site/afroflow
find _site -name ".DS_Store" -delete

echo "Built _site/ ($(find _site -type f | wc -l | tr -d ' ') files)"
