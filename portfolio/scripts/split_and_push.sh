#!/usr/bin/env bash
# Splits each portfolio/<NN-name> folder into its own GitHub repo,
# preserving the git history for that folder, and pushes it.
#
# Prerequisites (on YOUR machine, not in this sandbox):
#   1. git installed
#   2. GitHub CLI installed and logged in: https://cli.github.com  ->  gh auth login
#   3. This repo cloned locally with the claude/github-portfolio-projects-km0apg
#      branch checked out (the branch containing the portfolio/ folder).
#
# Usage:
#   cd ai-dimensional-modeler        # repo root, on the branch with portfolio/
#   bash portfolio/scripts/split_and_push.sh
#
# Optional: set GITHUB_USER to your GitHub username/org if you want the
# script to print ready-made clone URLs (it doesn't change behavior).

set -euo pipefail

# "folder-name:new-repo-name" — edit repo names here if you want different ones.
PROJECTS=(
  "01-study-buddy-rag:study-buddy-rag"
  "02-fake-news-classifier-scratch:fake-news-classifier-scratch"
  "03-appointment-agent:appointment-agent"
  "04-clinic-manager:clinic-manager"
  "05-budget-tracker:budget-tracker"
  "06-fast-doc-search:fast-doc-search"
  "07-study-room-realtime:study-room-realtime"
  "08-volunteer-match:volunteer-match"
  "09-accessible-reader:accessible-reader"
  "10-voice-accessibility-assistant:voice-accessibility-assistant"
  "site:portfolio-site"
)

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Run this from inside the ai-dimensional-modeler repo." >&2
  exit 1
fi

if ! command -v gh > /dev/null 2>&1; then
  echo "GitHub CLI (gh) not found. Install it: https://cli.github.com" >&2
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

for entry in "${PROJECTS[@]}"; do
  folder="${entry%%:*}"
  repo_name="${entry##*:}"

  echo ""
  echo "=== $folder -> $repo_name ==="

  branch_name="split-${repo_name}"
  git branch -D "$branch_name" > /dev/null 2>&1 || true
  git subtree split --prefix="portfolio/$folder" -b "$branch_name"

  work_dir="$(mktemp -d)"
  git worktree add "$work_dir" "$branch_name" > /dev/null

  ( cd "$work_dir" && gh repo create "$repo_name" --public --source=. --remote=origin --push )

  git worktree remove "$work_dir" --force
  git branch -D "$branch_name"

  echo "Done: $repo_name"
done

echo ""
echo "All projects pushed as separate repos."
