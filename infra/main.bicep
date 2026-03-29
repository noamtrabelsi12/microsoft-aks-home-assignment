targetScope = 'resourceGroup'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('AKS cluster name')
param aksClusterName string

@description('DNS prefix for AKS API server')
param dnsPrefix string

@description('Kubernetes version in major.minor format, for example 1.31')
param kubernetesVersion string = '1.31'

@description('VM size for the default system node pool')
param systemNodeVmSize string = 'Standard_D4s_v5'

@description('Initial node count for the default system node pool')
@minValue(1)
param systemNodeCount int = 2

@description('Minimum node count when autoscaling is enabled')
@minValue(1)
param systemNodeMinCount int = 2

@description('Maximum node count when autoscaling is enabled')
@minValue(1)
param systemNodeMaxCount int = 3

@description('Pod CIDR for Azure CNI Overlay')
param podCidr string = '10.244.0.0/16'

@description('Service CIDR for Kubernetes services')
param serviceCidr string = '10.0.0.0/16'

@description('DNS service IP for the cluster')
param dnsServiceIP string = '10.0.0.10'

@description('Tags applied to resources')
param tags object = {
  environment: 'dev'
  project: 'microsoft-aks-home-assignment'
  managedBy: 'bicep'
}

module aks './modules/aks.bicep' = {
  name: 'aks-deployment'
  params: {
    location: location
    aksClusterName: aksClusterName
    dnsPrefix: dnsPrefix
    kubernetesVersion: kubernetesVersion
    systemNodeVmSize: systemNodeVmSize
    systemNodeCount: systemNodeCount
    systemNodeMinCount: systemNodeMinCount
    systemNodeMaxCount: systemNodeMaxCount
    podCidr: podCidr
    serviceCidr: serviceCidr
    dnsServiceIP: dnsServiceIP
    tags: tags
  }
}

output aksName string = aks.outputs.aksName
output aksId string = aks.outputs.aksId
output nodeResourceGroup string = aks.outputs.nodeResourceGroup
output kubeletIdentityObjectId string = aks.outputs.kubeletIdentityObjectId