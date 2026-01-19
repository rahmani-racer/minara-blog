# Batch-insert a static 'Recommended next' block into HTML articles
# Run from repo root in PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\scripts\add_recommended.ps1

$skip = @('index.html','template-article.html')
$files = Get-ChildItem -Path . -Filter *.html -File -Recurse

$block = @'
<!-- Static recommended links (non-JS fallback) -->
<div class="recommended-links" style="max-width:900px;margin:18px auto;padding:12px;border-top:1px solid rgba(255,255,255,0.04);">
  <h4>Recommended next</h4>
  <ul style="list-style:none;padding:0;margin:8px 0 0;">
    <li style="margin:6px 0;"><a href="trading-basics.html">Trading Basics — Foundation for Consistent Results</a></li>
    <li style="margin:6px 0;"><a href="price-action.html">Price Action — Read Price, Not Noise</a></li>
    <li style="margin:6px 0;"><a href="risk-management.html">Risk Management — Survival First</a></li>
  </ul>
</div>
'@

foreach ($f in $files) {
  $name = $f.Name
  if ($skip -contains $name) { continue }
  $path = $f.FullName
  try {
    $content = Get-Content -Path $path -Raw -Encoding UTF8
  } catch {
    Write-Host "Failed to read $path" -ForegroundColor Yellow
    continue
  }
  if ($content -match 'recommended-links') {
    Write-Host "Skipping (already has recommended-links): $name" -ForegroundColor DarkGray
    continue
  }
  if ($content -match '(?i)</body>') {
    $new = $content -replace '(?i)</body>', "$block`r`n</body>"
    try {
      Set-Content -Path $path -Value $new -Encoding UTF8
      Write-Host "Updated: $name" -ForegroundColor Green
    } catch {
      Write-Host "Failed to write $name" -ForegroundColor Red
    }
  } else {
    Write-Host "No </body> tag found, skipped: $name" -ForegroundColor Yellow
  }
}
