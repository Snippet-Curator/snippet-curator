#!/bin/sh

# Start PocketBase in background
cd db
./pocketbase serve --dir pb_data --http="0.0.0.0:8090" &
PB_PID=$!

# Serve static Svelte app
cd ..
serve build -l tcp:0.0.0.0:5173

# When `serve` exits, stop PocketBase too
kill $PB_PID
