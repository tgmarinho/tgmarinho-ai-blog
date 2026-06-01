#!/usr/bin/env bash
# journal-cron.sh — orchestrates the daily-work journal pipeline locally.
#
# Steps:
#   1. Resolve target date (default: YESTERDAY in America/Campo_Grande — run at 00:30 the next day
#      so the entire previous day is on disk before we read sessions).
#   2. Run daily-journal.mjs to produce raw markdown under tmp/.
#   3. Bail out early if there's no meaningful activity.
#   4. Narrate via Claude API into content/journal/<DATE>.md.
#   5. Sanity-check frontmatter (date / title / summary).
#   6. Commit on branch journal/<DATE>. No push, no PR.

set -euo pipefail

# Load nvm so `node` is on PATH when invoked by launchd/cron (non-interactive
# shells don't read ~/.zshrc, where the user's nvm setup lives).
if [ -z "${NVM_DIR:-}" ]; then
  export NVM_DIR="$HOME/.nvm"
fi
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  \. "$NVM_DIR/nvm.sh"
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

log() { printf '[journal-cron] %s\n' "$*"; }

# 1. Resolve target date.
if [ "${1:-}" != "" ]; then
  DATE="$1"
else
  # BSD date (macOS): yesterday in America/Campo_Grande. Cron fires at 00:30
  # of the *following* day so the target day's sessions are fully written before
  # we scan them. Avoids a race with sessions still being modified near midnight.
  DATE="$(TZ=America/Campo_Grande date -v-1d +%Y-%m-%d)"
fi

if ! printf '%s' "$DATE" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; then
  echo "[journal-cron] invalid date: $DATE (expected YYYY-MM-DD)" >&2
  exit 1
fi

log "target date: $DATE"

mkdir -p tmp content/journal/pt-BR content/journal/en

RAW="tmp/journal-${DATE}.md"
OUT_PT="content/journal/pt-BR/${DATE}.md"
OUT_EN="content/journal/en/${DATE}.md"

# 2. Generate raw markdown.
log "step 1/5: generating raw markdown -> $RAW"
node scripts/daily-journal.mjs --date "$DATE" --out "$RAW"

# 3. Activity gate — count bullet lines.
BULLETS="$(grep -c '^- ' "$RAW" || true)"
log "raw bullets: $BULLETS"
if [ "${BULLETS:-0}" -lt 5 ]; then
  log "no activity, skipping"
  exit 0
fi

# 4. Narrate — PT-BR and EN.
log "step 2/5: narrating PT-BR -> $OUT_PT"
node scripts/journal-narrate.mjs --in "$RAW" --out "$OUT_PT" --lang pt-BR
log "step 3/5: narrating EN -> $OUT_EN"
node scripts/journal-narrate.mjs --in "$RAW" --out "$OUT_EN" --lang en

# 5. Frontmatter sanity check on both.
log "step 4/5: validating frontmatter"
for OUT in "$OUT_PT" "$OUT_EN"; do
  MISSING=""
  for key in date title summary; do
    if ! grep -Eq "^${key}:" "$OUT"; then
      MISSING="$MISSING $key"
    fi
  done
  if [ -n "$MISSING" ]; then
    log "WARNING: $OUT missing fields:$MISSING (continuing anyway)"
  fi
done

# 6. Commit on dedicated branch.
log "step 5/5: committing on branch journal/${DATE}"
BRANCH="journal/${DATE}"

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
    git checkout "$BRANCH"
  else
    git checkout -b "$BRANCH"
  fi
fi

git add "$OUT_PT" "$OUT_EN"
if git diff --cached --quiet; then
  log "nothing to commit (files unchanged)"
  log "done."
  exit 0
fi

git commit -m "journal: ${DATE}"
log "committed on $BRANCH"

# 7. Push + open draft PR for manual approval before going to prod.
log "pushing branch and opening draft PR"
if ! git push -u origin "$BRANCH" 2>&1; then
  log "WARNING: push failed — branch stays local. Run manually:"
  log "  git push -u origin $BRANCH && gh pr create --draft --base main"
  exit 0
fi

if command -v gh >/dev/null 2>&1; then
  PR_TITLE="journal: ${DATE}"
  PR_BODY=$(cat <<EOF
Auto-generated bilingual daily journal entry for **${DATE}**.

- Files: \`${OUT_PT}\`, \`${OUT_EN}\`
- Source: \`scripts/journal-cron.sh\` (local pipeline, narrated via Claude CLI).

**Review checklist before merging:**
- [ ] No personal/career/financial content leaked
- [ ] No client/internal names exposed
- [ ] Title and summary make sense
- [ ] Tone matches public blog voice

Merge to publish to prod. Close without merging to discard.
EOF
)
  if gh pr create --draft --base main --head "$BRANCH" --title "$PR_TITLE" --body "$PR_BODY" 2>&1; then
    log "draft PR opened — approve manually to publish"
  else
    log "WARNING: gh pr create failed (PR may already exist)"
  fi
else
  log "WARNING: gh CLI not installed — open PR manually"
fi

log "done."
