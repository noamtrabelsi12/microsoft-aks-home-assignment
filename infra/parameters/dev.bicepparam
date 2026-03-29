using '../main.bicep'

param aksClusterName = 'noam-aks-home'
param dnsPrefix = 'noam-aks-home'
param kubernetesVersion = '1.31'
param systemNodeVmSize = 'Standard_D4s_v5'
param systemNodeCount = 2
param systemNodeMinCount = 2
param systemNodeMaxCount = 3

param podCidr = '10.244.0.0/16'
param serviceCidr = '10.0.0.0/16'
param dnsServiceIP = '10.0.0.10'

param tags = {
  environment: 'dev'
  project: 'microsoft-aks-home-assignment'
  owner: 'noam'
  managedBy: 'bicep'
}