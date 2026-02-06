#!/bin/bash
# =============================================================================
# Kubernetes Deployment Helper Script
# Usage: ./scripts/k8s-deploy.sh [command] [options]
# =============================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
K8S_DIR="$PROJECT_DIR/k8s"
NAMESPACE="dev-tools"
REGISTRY="ghcr.io"
IMAGE_NAME="shiva1042/dev-tools"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_usage() {
    cat << EOF
Kubernetes Deployment Helper Script

Usage: $0 <command> [options]

Commands:
  build         Build Docker image locally
  push          Push Docker image to registry
  deploy        Deploy to Kubernetes cluster
  rollback      Rollback to previous deployment
  status        Show deployment status
  logs          Show pod logs
  shell         Open shell in running pod
  port-forward  Forward local port to service
  delete        Delete deployment from cluster

Options:
  -t, --tag TAG       Docker image tag (default: latest)
  -n, --namespace NS  Kubernetes namespace (default: dev-tools)
  -e, --env ENV       Environment: dev, staging, prod (default: dev)
  -h, --help          Show this help message

Examples:
  $0 build -t v1.0.0
  $0 deploy -e staging -t v1.0.0
  $0 status
  $0 logs -f
  $0 port-forward 8080

EOF
}

# Build Docker image
cmd_build() {
    local tag="${TAG:-latest}"
    log_info "Building Docker image: ${IMAGE_NAME}:${tag}"

    docker build \
        -t "${IMAGE_NAME}:${tag}" \
        -t "${REGISTRY}/${IMAGE_NAME}:${tag}" \
        -f "$PROJECT_DIR/Dockerfile" \
        "$PROJECT_DIR"

    log_success "Image built successfully: ${IMAGE_NAME}:${tag}"
}

# Push Docker image
cmd_push() {
    local tag="${TAG:-latest}"
    log_info "Pushing Docker image: ${REGISTRY}/${IMAGE_NAME}:${tag}"

    docker push "${REGISTRY}/${IMAGE_NAME}:${tag}"

    log_success "Image pushed successfully"
}

# Deploy to Kubernetes
cmd_deploy() {
    local tag="${TAG:-latest}"
    log_info "Deploying to Kubernetes (namespace: ${NAMESPACE})"

    # Update image in kustomization
    cd "$K8S_DIR"
    kustomize edit set image "dev-tools=${REGISTRY}/${IMAGE_NAME}:${tag}"

    # Apply manifests
    kubectl apply -k "$K8S_DIR"

    # Wait for rollout
    log_info "Waiting for rollout to complete..."
    kubectl rollout status deployment/dev-tools -n "$NAMESPACE" --timeout=300s

    log_success "Deployment completed successfully"
    cmd_status
}

# Rollback deployment
cmd_rollback() {
    log_info "Rolling back deployment..."
    kubectl rollout undo deployment/dev-tools -n "$NAMESPACE"
    kubectl rollout status deployment/dev-tools -n "$NAMESPACE" --timeout=300s
    log_success "Rollback completed"
}

# Show deployment status
cmd_status() {
    log_info "Deployment Status:"
    echo ""
    echo "=== Pods ==="
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=dev-tools -o wide
    echo ""
    echo "=== Services ==="
    kubectl get svc -n "$NAMESPACE"
    echo ""
    echo "=== Ingress ==="
    kubectl get ingress -n "$NAMESPACE"
    echo ""
    echo "=== HPA ==="
    kubectl get hpa -n "$NAMESPACE"
}

# Show pod logs
cmd_logs() {
    local follow="${FOLLOW:-false}"
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=dev-tools -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$pod" ]; then
        log_error "No pods found"
        exit 1
    fi

    log_info "Showing logs for pod: $pod"
    if [ "$follow" = "true" ]; then
        kubectl logs -f "$pod" -n "$NAMESPACE"
    else
        kubectl logs "$pod" -n "$NAMESPACE"
    fi
}

# Open shell in pod
cmd_shell() {
    local pod=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=dev-tools -o jsonpath='{.items[0].metadata.name}')

    if [ -z "$pod" ]; then
        log_error "No pods found"
        exit 1
    fi

    log_info "Opening shell in pod: $pod"
    kubectl exec -it "$pod" -n "$NAMESPACE" -- /bin/sh
}

# Port forward
cmd_port_forward() {
    local port="${1:-8080}"
    log_info "Forwarding local port $port to service dev-tools:80"
    log_info "Access at: http://localhost:$port/dev-tools/"
    kubectl port-forward svc/dev-tools -n "$NAMESPACE" "$port:80"
}

# Delete deployment
cmd_delete() {
    log_warn "This will delete the dev-tools deployment from namespace: $NAMESPACE"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete -k "$K8S_DIR"
        log_success "Deployment deleted"
    else
        log_info "Cancelled"
    fi
}

# Parse arguments
TAG="latest"
NAMESPACE="dev-tools"
ENV="dev"
FOLLOW="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -f|--follow)
            FOLLOW="true"
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        build|push|deploy|rollback|status|logs|shell|port-forward|delete)
            COMMAND="$1"
            shift
            ;;
        *)
            if [ -z "${COMMAND:-}" ]; then
                log_error "Unknown command: $1"
                show_usage
                exit 1
            fi
            EXTRA_ARGS+=("$1")
            shift
            ;;
    esac
done

# Execute command
if [ -z "${COMMAND:-}" ]; then
    show_usage
    exit 1
fi

case $COMMAND in
    build)
        cmd_build
        ;;
    push)
        cmd_push
        ;;
    deploy)
        cmd_deploy
        ;;
    rollback)
        cmd_rollback
        ;;
    status)
        cmd_status
        ;;
    logs)
        cmd_logs
        ;;
    shell)
        cmd_shell
        ;;
    port-forward)
        cmd_port_forward "${EXTRA_ARGS[0]:-8080}"
        ;;
    delete)
        cmd_delete
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
