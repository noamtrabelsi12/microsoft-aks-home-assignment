# AKS Home Assignment — Production-Ready Deployment with AGC

## Overview

This repository contains a production-oriented deployment of two services on **Azure Kubernetes Service (AKS)**.

The solution includes:

* **AKS** provisioned with **Bicep**
* **RBAC enabled**
* **Azure CNI Overlay + Cilium**
* **Gateway API** enabled on AKS
* **Application Gateway for Containers (AGC)** for external traffic
* **Helm** for packaging and deployment
* Two services:

  * `service-a` — retrieves Bitcoin price every minute and logs it, and calculates a rolling 10-minute average
  * `service-b` — simple backend service
* Health endpoints:

  * `/healthz`
  * `/readyz`

Traffic is routed by path:

* `/service-a` → `service-a`
* `/service-b` → `service-b`

---

## Architecture

### Main components

* **AKS Cluster**

  * RBAC enabled
  * Azure CNI Overlay
  * Cilium dataplane
  * Workload Identity enabled
  * Gateway API enabled
  * Application Gateway for Containers enabled

* **Application Gateway for Containers**

  * Managed through the AKS ALB controller
  * Exposes a public hostname
  * Routes traffic to services using Gateway API resources

* **Helm Chart**

  * Deploys:

    * `service-a`
    * `service-b`
    * `Gateway`
    * `HTTPRoute` resources

---

## Project Structure

```text
.
├─ apps/
│  ├─ service-a/
│  └─ service-b/
├─ helm/
│  └─ btc-platform/
│     ├─ Chart.yaml
│     ├─ values.yaml
│     └─ templates/
├─ infra/
│  ├─ main.bicep
│  ├─ modules/
│  ├─ parameters/
│  └─ scripts/
├─ alb.yaml
└─ README.md
```

---

## Service Behavior

### service-a

`service-a` performs the following:

* fetches the current Bitcoin price in USD every minute from an external API
* logs the fetched value
* maintains recent samples in memory
* logs a rolling average every 10 minutes

It also exposes:

* `/` — service info
* `/healthz` — liveness endpoint
* `/readyz` — readiness endpoint
* `/stats` — current in-memory state and samples

### service-b

`service-b` is a simple backend service exposing:

* `/`
* `/healthz`
* `/readyz`

---

## Prerequisites

Install the following tools:

* Azure CLI
* kubectl
* Helm
* Docker

Also make sure you are logged in:

```bash
az login
```

---

## Build and Push Images

Build the application images with explicit tags:

```bash
docker build -t ghcr.io/<your-user>/service-a:1.0.0 ./apps/service-a
docker build -t ghcr.io/<your-user>/service-b:1.0.0 ./apps/service-b
```

Authenticate to GitHub Container Registry:

```bash
echo <YOUR_GITHUB_TOKEN> | docker login ghcr.io -u <your-user> --password-stdin
```

Push the images:

```bash
docker push ghcr.io/<your-user>/service-a:1.0.0
docker push ghcr.io/<your-user>/service-b:1.0.0
```

---

## Infrastructure Deployment

Deploy the AKS infrastructure using Bicep:

```bash
./infra/scripts/deploy-infra.sh
```

Fetch cluster credentials:

```bash
./infra/scripts/get-credentials.sh
```

Verify cluster connectivity:

```bash
kubectl get nodes
```

---

## Enable Gateway API and AGC

Enable the required AKS add-ons:

```bash
az aks update -g <resource-group> -n <cluster-name> --enable-gateway-api --enable-application-load-balancer
```

Verify that the GatewayClass exists:

```bash
kubectl get gatewayclass
```

Expected result includes:

```text
azure-alb-external
```

Verify ALB controller pods:

```bash
kubectl get pods -n kube-system
```

---

## Create ApplicationLoadBalancer Resource

Create a namespace for ALB resources:

```bash
kubectl create namespace alb-test-infra
```

Create an `ApplicationLoadBalancer` resource, for example in `alb.yaml`:

```yaml
apiVersion: alb.networking.azure.io/v1
kind: ApplicationLoadBalancer
metadata:
  name: alb-test-2
  namespace: alb-test-infra
spec:
  associations:
    - <AKS_APPGATEWAY_SUBNET_ID>
```

Apply it:

```bash
kubectl apply -f ./alb.yaml
```

Verify it:

```bash
kubectl get applicationloadbalancer -n alb-test-infra
kubectl get applicationloadbalancer alb-test-2 -n alb-test-infra -o yaml
```

---

## Application Deployment with Helm

Deploy the application chart:

```bash
helm upgrade --install btc-platform ./helm/btc-platform \
  --namespace btc-platform \
  --create-namespace
```

Verify resources:

```bash
kubectl get pods -n btc-platform
kubectl get gateway -n btc-platform
kubectl get httproute -n btc-platform
```

---

## Gateway Verification

Inspect the Gateway:

```bash
kubectl get gateway gateway-01 -n btc-platform -o yaml
```

A successful status should include:

* `Accepted: True`
* `Programmed: True`
* `status.addresses`

Example hostname:

```text
d4fmhagnaccrgxhm.fz62.alb.azure.com
```

---

## Functional Verification

Open these paths in the browser or use curl:

```bash
http://<gateway-hostname>/service-a
http://<gateway-hostname>/service-a/healthz
http://<gateway-hostname>/service-a/readyz
http://<gateway-hostname>/service-a/stats

http://<gateway-hostname>/service-b
http://<gateway-hostname>/service-b/healthz
http://<gateway-hostname>/service-b/readyz
```

---

## Viewing Bitcoin Price Logs

The Bitcoin values are logged by `service-a` to container stdout, not returned directly from the main endpoint.

To view logs:

```bash
kubectl logs -n btc-platform deploy/btc-platform-service-a --tail=100
```

For live logs:

```bash
kubectl logs -n btc-platform deploy/btc-platform-service-a -f
```

To inspect the in-memory samples over HTTP:

```bash
http://<gateway-hostname>/service-a/stats
```

---

## Design Decisions

### Why Helm?

Helm was used to package the Kubernetes resources as a reusable and versioned deployment unit.

Benefits:

* reusable templates
* environment-specific values
* versioned releases
* easier upgrades and re-deployments

### Why explicit image tags?

`latest` was intentionally avoided.

Using explicit tags such as `1.0.0` improves:

* reproducibility
* traceability
* rollback safety
* debugging

### Why AGC instead of NGINX Ingress?

The solution uses **Application Gateway for Containers** with **Gateway API** instead of a traditional Ingress controller.

Reasons:

* Gateway API is the more modern traffic management model
* it aligns with Azure’s forward-looking networking direction
* AGC integrates natively with AKS add-ons and Azure-managed load balancing

### Why liveness and readiness probes?

Both services expose:

* `/healthz` for liveness
* `/readyz` for readiness

This supports proper Kubernetes health management and traffic routing behavior.

---

## Notes About Troubleshooting

During deployment, the following issues may occur:

* Gateway created before the `ApplicationLoadBalancer`
* stale ALB resources stuck in `Deleting`
* Azure CLI extension version mismatches
* AGC controller provisioning delays

Typical validation commands:

```bash
kubectl get gatewayclass
kubectl get gateway -n btc-platform
kubectl get httproute -n btc-platform
kubectl get applicationloadbalancer -n alb-test-infra
kubectl logs -n kube-system <alb-controller-pod>
az network alb list -g <node-resource-group> -o table
```

---

## Future Improvements

Possible production improvements:

* CI/CD pipeline with GitHub Actions
* TLS termination and certificates
* private DNS / custom domain
* NetworkPolicy completion after validating AGC traffic source behavior
* monitoring and alerting
* autoscaling policies
* PodDisruptionBudget
* Azure Container Registry integration

---

## Summary

This solution demonstrates a repeatable and production-minded AKS setup using:

* Infrastructure as Code with Bicep
* Gateway API on AKS
* Application Gateway for Containers
* Helm-based workload deployment
* explicit versioning
* health checks
* maintainable structure

It satisfies the assignment requirements while using a modern Azure-native traffic management approach.
