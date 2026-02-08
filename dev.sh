#!/usr/bin/env bash
set -a && source .env 2>/dev/null && set +a
: > logs.txt
cd apps/web && exec bun run dev 2>&1 | tee ../../logs.txt
