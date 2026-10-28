# Génère CV_Baptiste_Laffond.pdf à partir de cv-print.html (Edge ou Chrome en mode headless).
# Pour mettre à jour le QR code : remplacez qr-code.png (image carrée), puis lancez :
#   powershell -ExecutionPolicy Bypass -File .\generer-cv-pdf.ps1
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $here 'cv-print.html'
$pdf  = Join-Path $here 'CV_Baptiste_Laffond.pdf'

$browsers = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)
$exe = $browsers | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { Write-Error 'Edge ou Chrome introuvable.'; exit 1 }

$url = 'file:///' + ($html -replace '\\', '/')
& $exe --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=8000 `
    "--print-to-pdf=$pdf" $url 2>$null | Out-Null
Start-Sleep -Milliseconds 500
if (Test-Path $pdf) { Write-Host "PDF généré : $pdf" } else { Write-Error 'Échec de la génération du PDF.' }
