@description('Azure region for all resources')
param location string

@description('AKS cluster name')
param aksClusterName string

@description('DNS prefix for AKS API server')
param dnsPrefix string

@description('Kubernetes version in major.minor format')
param kubernetesVersion string

@description('VM size for the default system node pool')
param systemNodeVmSize string

@description('Initial node count for the default system node pool')
param systemNodeCount int

@description('Minimum node count when autoscaling is enabled')
param systemNodeMinCount int

@description('Maximum node count when autoscaling is enabled')
param systemNodeMaxCount int

@description('Pod CIDR for Azure CNI Overlay')
param podCidr string

@description('Service CIDR for Kubernetes services')
param serviceCidr string

@description('DNS service IP for the cluster')
param dnsServiceIP string

@description('Tags applied to resources')
param tags object

resource aks 'Microsoft.ContainerService/managedClusters@2025-08-01' = {
  name: aksClusterName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  sku: {
    name: 'Base'
    tier: 'Standard'
  }
  tags: tags
  properties: {
    kubernetesVersion: kubernetesVersion
    dnsPrefix: dnsPrefix
    enableRBAC: true

    agentPoolProfiles: [
      {
        name: 'system'
        mode: 'System'
        count: systemNodeCount
        vmSize: systemNodeVmSize
        osType: 'Linux'
        type: 'VirtualMachineScaleSets'
        enableAutoScaling: true
        minCount: systemNodeMinCount
        maxCount: systemNodeMaxCount
        orchestratorVersion: kubernetesVersion
      }
    ]

    networkProfile: {
      networkPlugin: 'azure'
      networkPluginMode: 'overlay'
      networkDataplane: 'cilium'
      loadBalancerSku: 'standard'
      outboundType: 'loadBalancer'
      podCidr: podCidr
      serviceCidr: serviceCidr
      dnsServiceIP: dnsServiceIP
    }

    oidcIssuerProfile: {
      enabled: true
    }

    securityProfile: {
      workloadIdentity: {
        enabled: true
      }
    }
  }
}

output aksName string = aks.name
output aksId string = aks.id
output nodeResourceGroup string = aks.properties.nodeResourceGroup
output kubeletIdentityObjectId string = aks.properties.identityProfile.kubeletidentity.objectId