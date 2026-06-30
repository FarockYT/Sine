#!/usr/bin/env sh
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node "$DIR/sine-inverse-pc-ui.mjs"
