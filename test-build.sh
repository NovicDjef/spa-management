#!/bin/bash

echo "Testing build with timeout..."

# Test if sharp is causing issues
echo "Testing sharp installation..."
npx sharp --version 2>&1 | head -5 || echo "Sharp might be the issue"

echo ""
echo "Testing next-pwa configuration..."
node -e "const withPWA = require('next-pwa'); console.log('next-pwa loaded successfully')" 2>&1 || echo "next-pwa might be the issue"

echo ""
echo "Attempting build with 20 second timeout..."
# Use a simple timeout alternative
timeout_cmd() {
    time_limit=$1
    shift
    ("$@" &)
    cmd_pid=$!
    
    # Start sleep in background
    (sleep $time_limit && kill -9 $cmd_pid 2>/dev/null) &
    sleep_pid=$!
    
    # Wait for command to finish
    wait $cmd_pid 2>/dev/null
    kill $sleep_pid 2>/dev/null
}

timeout_cmd 20 npm run build || echo "Build timed out after 20 seconds"
