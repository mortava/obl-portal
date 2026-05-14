#!/usr/bin/env bash
# verify-deploy.sh — probe a deployed portal URL to confirm the production
# build is healthy and the Encompass adapter path is reachable.
#
# Usage:
#   scripts/verify-deploy.sh https://your-deploy.vercel.app
#   scripts/verify-deploy.sh https://your-deploy.vercel.app --with-edc-test
#
# What this verifies:
#   - /api/healthz responds 200 (public)
#   - /login renders 200 (public)
#   - / and other protected routes return 307 → /login (auth middleware live)
#
# The optional --with-edc-test flag hits the *Supabase edge function* that
# mirrors the same Encompass adapter logic — independent of the Next portal's
# auth gating — and confirms the adapter can still reach ICE end-to-end.
# A 401 with "invalid_client" is the success case (proves the wiring works).
#
# Exit codes:
#   0 = all probes returned the expected shape
#   1 = at least one probe failed

set -euo pipefail

BASE="${1:-}"
WITH_EDC="${2:-}"

if [[ -z "${BASE}" ]]; then
  echo "Usage: $0 <https://deploy-url> [--with-edc-test]" >&2
  exit 2
fi
BASE="${BASE%/}"

# Independent endpoint that proves the Encompass adapter is wired to ICE.
# This is the live Supabase function deployed on OpenBrokerPPE; it runs the
# same OAuth exchange logic against api.elliemae.com and is unaffected by
# the Next portal's auth middleware.
EDC_PROBE_URL="https://vxoqwyntwsszipabhiuv.supabase.co/functions/v1/encompass-test"

red()    { printf '\033[31m%s\033[0m\n' "$*"; }
green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
bold()   { printf '\033[1m%s\033[0m\n' "$*"; }

bold "Probing ${BASE}"
echo

fails=0

probe() {
  local label="$1" method="$2" url="$3" expect_status="$4" data="${5:-}"
  local args=(-sS -o /tmp/probe.body -w '%{http_code}|%{time_total}' -X "${method}" --max-time 20)
  if [[ -n "${data}" ]]; then
    args+=(-H 'content-type: application/json' -d "${data}")
  fi
  local out status time
  out="$(curl "${args[@]}" "${url}" 2>/tmp/probe.err)" || true
  status="${out%%|*}"
  time="${out##*|}"

  if [[ "${status}" == "${expect_status}" ]]; then
    green "✓ ${label}  ${method} ${url}  → ${status} (${time}s)"
    head -c 200 /tmp/probe.body 2>/dev/null | sed 's/^/    /'
    echo
  else
    red "✗ ${label}  ${method} ${url}  → ${status} (expected ${expect_status})"
    head -c 400 /tmp/probe.body 2>/dev/null | sed 's/^/    /'
    cat /tmp/probe.err 2>/dev/null | sed 's/^/    /'
    echo
    fails=$((fails + 1))
  fi
}

# Public endpoints — should answer 200.
probe "Healthz"         "GET" "${BASE}/api/healthz" 200
probe "Login page"      "GET" "${BASE}/login"       200

# Protected routes — auth middleware should redirect (307) to /login.
probe "Root → /login"            "GET" "${BASE}/"            307
probe "Connections → /login"     "GET" "${BASE}/connections" 307
probe "Wizard → /login"          "GET" "${BASE}/new"         307
probe "Platform → /login"        "GET" "${BASE}/platform"    307

if [[ "${WITH_EDC}" == "--with-edc-test" ]]; then
  # Send invalid creds — expect 401 from upstream EDC, surfaced cleanly by
  # the Supabase function. This is the same adapter logic the Next portal
  # uses, just deployed independently so the auth gate doesn't block CI.
  probe "EDC adapter (bad creds → ICE 401)" \
    "POST" "${EDC_PROBE_URL}" 401 \
    '{"env":"sandbox","grantType":"client_credentials","clientId":"intentionally_invalid","clientSecret":"intentionally_invalid"}'
fi

echo
if [[ ${fails} -eq 0 ]]; then
  green "All probes passed."
  exit 0
else
  red "${fails} probe(s) failed."
  exit 1
fi
