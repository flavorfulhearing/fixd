#!/bin/bash
# Start both services for local development with hot reloading

# Save the base directory
BASE_DIR=$(pwd)

# Start Python code-agent service
echo "Starting code-agent service..."
(
  cd "$BASE_DIR/services/code-agent"
  poetry install
  # Run the service directly
  poetry run python -m code_agent.service
) &
CODE_AGENT_PID=$!

# Start web service (already has hot reloading via tsx watch)
echo "Starting web service..."
(
  cd "$BASE_DIR/services/web"
  npm run dev
) &
WEB_PID=$!

echo "Both services are running. Press Ctrl+C to stop."

# Handle cleanup on exit
trap "echo 'Stopping services...'; kill $CODE_AGENT_PID $WEB_PID; exit" INT TERM
wait