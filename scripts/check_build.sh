#!/bin/bash

./scripts/build.sh

DIFF=$(git diff)

if [[ $DIFF ]]; then
  exit 1
else
  exit 0
fi
