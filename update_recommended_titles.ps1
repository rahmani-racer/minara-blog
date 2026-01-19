# Update the link text in .recommended-links blocks to use the target page <title>
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\update_recommended_titles.ps1

$files = Get-ChildItem -Path . -Filter *.html -File -Recurse

foreach ($f in $files) {
  $path = $f.FullName
  try { $content = Get-Content -Path $path -Raw -Encoding UTF8 } catch { Write-Host "Failed to read $path" -ForegroundColor Yellow; continue }

  if ($content -notmatch 'recommended-links') { continue }

  $orig = $content
  $modified = $false

  # Find the recommended-links block
  $blockPattern = '(?s)(<div\s+class="recommended-links".*?</div>)'
  $content = [regex]::Replace($content, $blockPattern, { param($m)
      $block = $m.Groups[1].Value
      # Find all anchors
      $anchorPattern = '(?i)<a\s+href="(?<href>[^"]+)">(?<text>.*?)</a>'
      $newBlock = [regex]::Replace($block, $anchorPattern, { param($am)
          $href = $am.Groups['href'].Value
          $text = $am.Groups['text'].Value
          # Only handle local .html links
          if ($href -match '^(https?:)?//' -or $href -match '^[#]') { return $am.Value }
          $targetPath = Join-Path (Split-Path $path) $href
          if (-not (Test-Path $targetPath)) {
            # try root relative
            $rootPath = Join-Path (Get-Location) $href
            if (Test-Path $rootPath) { $targetPath = $rootPath } else { return $am.Value }
          }
          try {
            $t = Get-Content -Path $targetPath -Raw -Encoding UTF8
            if ($t -match '<title>(.*?)</title>') {
              $title = $matches[1].Trim()
              # Clean common suffix like "| Minara Blog"
              $title = $title -replace '\s*\|\s*Minara Blog$',''
              $newAnchor = '<a href="' + $href + '">' + $title + '</a>'
              return $newAnchor
            }
          } catch { }
          return $am.Value
      })
      return $newBlock
  })

  if ($content -ne $orig) {
    try { Set-Content -Path $path -Value $content -Encoding UTF8; Write-Host "Updated titles in: $($f.Name)" -ForegroundColor Green; $modified = $true } catch { Write-Host "Failed to write $path" -ForegroundColor Red }
  }
}
