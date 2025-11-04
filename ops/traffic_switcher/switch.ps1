param()

$ns = $env:NAMESPACE; if ([string]::IsNullOrEmpty($ns)) { $ns = "qiflowai" }
$ing = $env:INGRESS_CANARY; if ([string]::IsNullOrEmpty($ing)) { $ing = "qiflowai-ingress-canary" }
$weight = $env:WEIGHT; if ([string]::IsNullOrEmpty($weight)) { $weight = "25" }
$url = $env:TRAFFIC_SWITCHER_URL
$dry = $env:DRY_RUN

if ($url) {
  Write-Host "Switch via API $url -> weight=$weight dry_run=$dry"
  $isDry = $false; if ($dry -and $dry.ToLower() -eq "true") { $isDry = $true }
  $body = @{ canary_weight = [int]$weight; dry_run = $isDry } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri "$url/switch" -ContentType "application/json" -Body $body
} elseif ($dry -and $dry.ToLower() -eq "true") {
  Write-Host "DRY_RUN=true; would kubectl -n $ns patch ingress $ing weight=$weight"
} else {
  Write-Host "kubectl patch ingress $ing -> weight=$weight"
  kubectl -n $ns patch ingress $ing --type merge -p "{`"metadata`":{`"annotations`":{`"nginx.ingress.kubernetes.io/canary-weight`":`"$weight`"}}}"
}

Write-Host "Done."
