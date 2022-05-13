#!/usr/bin/with-contenv bashio
set +u

CONFIG_PATH=/data/options.json

bashio::log.info "Starting..."

node ./index.js $SUPERVISOR_TOKEN