#!/bin/bash

# Start both Angular and Go servers

echo "🚀 Starting Star Wars Application..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $GO_PID $ANGULAR_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start Go API server in background
echo "📡 Starting Go API server on :8080..."
go run main.go &
GO_PID=$!

# Wait a moment for Go server to start
sleep 3

# Check if Go server is running
if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Failed to start Go API server"
    exit 1
fi

echo "✅ Go API server started successfully"

# Start Angular development server in background
echo "🅰️ Starting Angular development server on :4200..."
ng serve &
ANGULAR_PID=$!

# Wait a moment for Angular server to start
sleep 5

echo "✅ Angular development server started successfully"
echo ""
echo "🌟 Application is ready!"
echo "📱 Frontend: http://localhost:4200"
echo "🔌 API: http://localhost:8080"
echo "🏥 Health Check: http://localhost:8080/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait
