using '../main.bicep'

param aksClusterName = 'noam-aks-home'
param dnsPrefix = 'noam-aks-home'
param kubernetesVersion = '1.34.3'
param systemNodeVmSize = 'Standard_D2s_v5'
param systemNodeCount = 1
param systemNodeMinCount = 1
param systemNodeMaxCount = 1

param podCidr = '10.244.0.0/16'
param serviceCidr = '10.0.0.0/16'
param dnsServiceIP = '10.0.0.10'

param tags = {
  environment: 'dev'
  project: 'microsoft-aks-home-assignment'
  owner: 'noam'
  managedBy: 'bicep'
}