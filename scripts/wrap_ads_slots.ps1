# Wrap unwrapped AdSense ins blocks in .ads-slot to reserve space and reduce CLS
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\wrap_ads_slots.ps1

$pattern = [regex]::new(@'
(?s)<ins\s+class=["\']adsbygoogle["\'][\s\S]*?<\/script>\s*
'@)
$files = Get-ChildItem -Path . -Include *.html -File -Recurse
foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    } catch {
        Write-Host "Skip (read error): $($file.FullName)"
        continue
    }
    $matches = $pattern.Matches($content)
    if ($matches.Count -eq 0) {
        Write-Host "No ad blocks: $($file.Name)"
        continue
    }
    $changed = $false
    # Replace from end so indexes remain valid
    for ($i = $matches.Count - 1; $i -ge 0; $i--) {
        $m = $matches[$i]
        $prefixStart = [Math]::Max(0, $m.Index - 200)
        $prefixLen = $m.Index - $prefixStart
        $prefix = $content.Substring($prefixStart, $prefixLen)
        if ($prefix -notmatch 'ads-slot') {
            $replacement = '<div class="ads-slot" style="min-height:120px;margin:18px 0;">' + $m.Value + '</div>'
            $content = $content.Substring(0, $m.Index) + $replacement + $content.Substring($m.Index + $m.Length)
            $changed = $true
        }
    }
    if ($changed) {
        try {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "Updated: $($file.Name)"
        } catch {
            Write-Host "Failed to write: $($file.Name) - $($_.Exception.Message)"
        }
    } else {
        Write-Host "No change (already wrapped): $($file.Name)"
    }
}
Write-Host "Done."
