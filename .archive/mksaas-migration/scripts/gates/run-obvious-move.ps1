param(
  [int]$BatchSize = 10,
  [int]$MaxBatches = 3,
  [switch]$Quick = $true,
  [switch]$NoVerify
)
$ErrorActionPreference = 'Stop'
$DATE = Get-Date -Format 'yyyy-MM-dd'
$ART = "mksaas/artifacts/cleanup/$DATE"
$ATTIC = ".attic/$DATE"

# Backup full candidate list
Copy-Item -Force "$ART\candidates.json" "$ART\candidates.all.json"
# Replace with obvious subset
Copy-Item -Force "$ART\candidates.obvious.json" "$ART\candidates.json"

# Move in small batches, limited number to avoid blocking
& "mksaas/scripts/gates/move-and-verify.ps1" -ArtifactsDir $ART -AtticDir $ATTIC -BatchSize $BatchSize -MaxBatches $MaxBatches @(
  if ($Quick) { '-Quick' } else { $null }
) @(
  if ($NoVerify) { '-NoVerify' } else { $null }
)

# Restore full candidate list
Copy-Item -Force "$ART\candidates.all.json" "$ART\candidates.json"
