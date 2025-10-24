# Simple push script
param([string]$Message = "feat: update")

Write-Host "Starting push workflow..." -ForegroundColor Cyan

# Check status
$status = git status --porcelain
if ($status) {
    Write-Host "Adding changes..." -ForegroundColor Yellow
    git add -A
    Write-Host "Committing..." -ForegroundColor Yellow
    git commit -m $Message
}

Write-Host "Pushing to origin main..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful!" -ForegroundColor Green
    git log --oneline -n 3
} else {
    Write-Host "Push failed, trying pull and push again..." -ForegroundColor Yellow
    git pull origin main --rebase
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push successful after rebase!" -ForegroundColor Green
    }
}
