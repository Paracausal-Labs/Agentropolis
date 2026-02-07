#!/usr/bin/env bash
set -a && source .env 2>/dev/null && set +a
cd apps/web && exec bun run dev
