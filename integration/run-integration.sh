#!/usr/bin/env bash

set -e  # exit on any error

# Get React version from first argument
REACT_VERSION=$1

if [ -z "$REACT_VERSION" ]; then
  echo "Error: You must provide a React version."
  echo "Usage: $0 <react-version>"
  exit 1
fi

# Set the root package.json resolutions to the correct
# react version so that we can run tests against it.
JQ_CMD=".resolutions += {}
| .resolutions[\"react\"] = \"$REACT_VERSION\"
| .resolutions[\"react-dom\"] = \"$REACT_VERSION\""

# Back up original package.json
cp ./package.json ./original.json

# Ensure that we always restore the original package.json AND run yarn install on exit
trap 'echo "Restoring original package.json..."; mv ./original.json ./package.json; echo "Running yarn install to restore lockfile and node_modules..."; yarn install --no-immutable' EXIT

# Apply modifications
jq "$JQ_CMD" ./package.json > tmp.json
mv tmp.json ./package.json

# Run commands
yarn install --no-immutable
yarn test:integration:runner


