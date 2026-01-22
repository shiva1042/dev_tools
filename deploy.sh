#!/bin/bash

# ============================================================================
# Dev Tools - Build & Deploy Script
# ============================================================================
# Usage: ./deploy.sh [OPTIONS]
#
# Options:
#   -i, --ip       IP address to bind (default: 0.0.0.0)
#   -p, --port     Port number (default: 8080)
#   -b, --build    Force rebuild before starting server
#   -h, --help     Show this help message
#
# Examples:
#   ./deploy.sh                      # Start on 0.0.0.0:8080
#   ./deploy.sh -p 3000              # Start on 0.0.0.0:3000
#   ./deploy.sh -i 192.168.1.100 -p 8080
#   ./deploy.sh --build              # Rebuild and start
# ============================================================================

set -e

# Default values
IP="0.0.0.0"
PORT="8080"
BUILD=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${2}${1}${NC}"
}

# Show help
show_help() {
    echo "Dev Tools - Build & Deploy Script"
    echo ""
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -i, --ip       IP address to bind (default: 0.0.0.0)"
    echo "  -p, --port     Port number (default: 8080)"
    echo "  -b, --build    Force rebuild before starting server"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh                          # Start on 0.0.0.0:8080"
    echo "  ./deploy.sh -p 3000                  # Start on 0.0.0.0:3000"
    echo "  ./deploy.sh -i 192.168.1.100 -p 8080 # Start on specific IP"
    echo "  ./deploy.sh --build                  # Rebuild and start"
    echo ""
    echo "Access the app at: http://<ip>:<port>/dev-tools/"
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -i|--ip)
            IP="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            print_msg "Unknown option: $1" "$RED"
            show_help
            ;;
    esac
done

# Change to script directory
cd "$SCRIPT_DIR"

print_msg "============================================" "$BLUE"
print_msg "  Dev Tools - Deployment Script" "$BLUE"
print_msg "============================================" "$BLUE"
echo ""

# Check if build exists or if rebuild requested
if [ ! -d "$DIST_DIR" ] || [ "$BUILD" = true ]; then
    print_msg "Building project..." "$YELLOW"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_msg "Installing dependencies..." "$YELLOW"
        npm install
    fi

    # Run build
    npm run build

    print_msg "Build completed!" "$GREEN"
    echo ""
fi

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
    print_msg "Error: dist directory not found. Run with --build flag." "$RED"
    exit 1
fi

# Create a simple serve directory structure for /dev-tools path
SERVE_DIR="$SCRIPT_DIR/.serve"
rm -rf "$SERVE_DIR"
mkdir -p "$SERVE_DIR/dev-tools"
cp -r "$DIST_DIR"/* "$SERVE_DIR/dev-tools/"

print_msg "Starting HTTP server..." "$YELLOW"
echo ""
print_msg "============================================" "$GREEN"
print_msg "  Server running at:" "$GREEN"
print_msg "  http://${IP}:${PORT}/dev-tools/" "$GREEN"
echo ""
if [ "$IP" = "0.0.0.0" ]; then
    # Get local IP
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    print_msg "  Local access: http://localhost:${PORT}/dev-tools/" "$GREEN"
    print_msg "  Network access: http://${LOCAL_IP}:${PORT}/dev-tools/" "$GREEN"
fi
print_msg "============================================" "$GREEN"
echo ""
print_msg "Press Ctrl+C to stop the server" "$YELLOW"
echo ""

# Start HTTP server
# Try Python 3 first, then Python 2, then Node
if command -v python3 &> /dev/null; then
    cd "$SERVE_DIR"
    python3 -m http.server "$PORT" --bind "$IP"
elif command -v python &> /dev/null; then
    cd "$SERVE_DIR"
    python -m SimpleHTTPServer "$PORT"
elif command -v npx &> /dev/null; then
    npx serve "$SERVE_DIR" -l "tcp://${IP}:${PORT}"
else
    print_msg "Error: No suitable HTTP server found." "$RED"
    print_msg "Please install Python 3 or Node.js" "$RED"
    exit 1
fi
