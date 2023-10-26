#!/bin/bash

bet2_js_url="https://raw.githubusercontent.com/wpmed92/WebMRI/master/src/app/src/brainbrowser/volume-viewer/plugins/bet2.js"
bet2_wasm_url="https://github.com/wpmed92/WebMRI/raw/master/src/app/src/brainbrowser/volume-viewer/workers/bet2.wasm"

curl -L -o bet2.js $bet2_js_url
curl -L -o bet2.wasm $bet2_wasm_url
sed -i '' '1s/^/export /' bet2.js

echo "BET WASM fetched"
