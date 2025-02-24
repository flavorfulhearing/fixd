#!/bin/bash
# Start both services for local development

# Start Python code-agent service
cd services/code-agent
poetry install
echo "Starting code-agent service..."
poetry run python -m code_agent &
CODE_AGENT_PID=$!

# Start web service
cd ../web
echo "Starting web service..."
npm run dev &
WEB_PID=$!

# Handle cleanup on exit
trap "kill $CODE_AGENT_PID $WEB_PID; exit" INT TERM
wait