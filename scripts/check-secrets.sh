#!/usr/bin/env sh
set -eu

repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"
found=0

check_pattern() {
  label=$1
  pattern=$2
  if git grep -nI -E "$pattern" -- . ':!scripts/check-secrets.sh'; then
    printf 'Potential secret pattern found: %s\n' "$label" >&2
    found=1
  fi
}

check_pattern 'Resend API key' 're_[A-Za-z0-9]{20,}'
check_pattern 'credentialed MongoDB URI' 'mongodb\+srv://[^[:space:]"/]+:[^@[:space:]"/]+@'
check_pattern 'secret key prefix' 'sk-[A-Za-z0-9]{20,}'
check_pattern 'Cloudinary API secret assignment' 'CLOUDINARY_API_SECRET=[^[:space:]#]+'

if [ "$found" -ne 0 ]; then
  exit 1
fi

printf 'No known secret patterns found in tracked files.\n'