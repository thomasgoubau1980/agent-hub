#!/usr/bin/env bash
# Build and publish the Agent Hub to GitHub Pages.
#
#   bash scripts/publish.sh
#
# 1. Syncs Kara release entries from the local kara-desktop checkout (that repo
#    stays Kara's authoring home because release.sh reads them).
# 2. Rebuilds docs/ from agents/.
# 3. Commits and pushes; GitHub Pages serves main:/docs.
#
# Live at: https://thomasgoubau1980.github.io/agent-hub/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPO="thomasgoubau1980/agent-hub"
URL="https://thomasgoubau1980.github.io/agent-hub/"

# Kara entries are authored in kara-desktop/docs/updates; mirror them in.
KARA_SRC="$HOME/Developer/kara-desktop/docs/updates"
if [ -d "$KARA_SRC" ]; then
  rsync -a --exclude "README.md" "$KARA_SRC/" "agents/kara/updates/"
fi

node scripts/build.mjs

git add -A
if git diff --cached --quiet; then
  echo "Site unchanged."
else
  git -c user.name="Thomas Goubau" -c user.email="thomas.goubau@me.com" \
    commit -q -m "Publish agent hub"
  git push -q origin main
fi

# Enable GitHub Pages from main:/docs (409 if already enabled, which is fine).
gh api -X POST "repos/$REPO/pages" \
  -f "source[branch]=main" -f "source[path]=/docs" >/dev/null 2>&1 || true

echo "Agent Hub: $URL"
