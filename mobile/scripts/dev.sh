#!/usr/bin/env bash
# QR দেখতে --android ব্যবহার করবেন না (Android SDK লাগে)।
set -euo pipefail
cd "$(dirname "$0")/.."

echo ""
echo "  Minar Academy — Expo"
echo "  ----------------------------------"
echo "  1) ফোনে Expo Go ইনস্টল করুন"
echo "  2) একই Wi‑Fi তে থাকুন"
echo "  3) টার্মিনালের QR স্ক্যান করুন"
echo "  ----------------------------------"
echo ""

exec npx expo start "$@"
