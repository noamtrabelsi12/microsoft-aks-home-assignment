#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP_NAME="${RESOURCE_GROUP_NAME:-rg-aks-home-dev}"
LOCATION="${LOCATION:-westeurope}"
PARAM_FILE="${PARAM_FILE:-./infra/parameters/dev.bicepparam}"

echo "Creating resource group: ${RESOURCE_GROUP_NAME} in ${LOCATION}"
az group create \
  --name "${RESOURCE_GROUP_NAME}" \
  --location "${LOCATION}"

echo "Deploying AKS infrastructure with Bicep..."
az deployment group create \
  --resource-group "${RESOURCE_GROUP_NAME}" \
  --template-file "./infra/main.bicep" \
  --parameters "${PARAM_FILE}"

echo "Deployment completed successfully."