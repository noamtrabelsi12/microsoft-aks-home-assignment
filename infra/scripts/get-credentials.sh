#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP_NAME="${RESOURCE_GROUP_NAME:-rg-aks-home-dev}"
CLUSTER_NAME="${CLUSTER_NAME:-noam-aks-home}"

echo "Fetching AKS credentials for cluster ${CLUSTER_NAME}..."
az aks get-credentials \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --name "${CLUSTER_NAME}" \
  --overwrite-existing

echo "Current kubectl context:"
kubectl config current-context