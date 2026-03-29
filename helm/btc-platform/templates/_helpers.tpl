{{- define "btc-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "btc-platform.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s" (include "btc-platform.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "btc-platform.labels" -}}
app.kubernetes.io/name: {{ include "btc-platform.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "btc-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "btc-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{- define "btc-platform.serviceAName" -}}
{{- printf "%s-service-a" (include "btc-platform.fullname" .) -}}
{{- end -}}

{{- define "btc-platform.serviceBName" -}}
{{- printf "%s-service-b" (include "btc-platform.fullname" .) -}}
{{- end -}}