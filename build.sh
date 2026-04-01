#!/bin/bash
# AGENTS.md requires this script to be present.
# It can be used to run build tasks or check for errors.

echo "Running build..."
npx vite build
echo "Build complete."
