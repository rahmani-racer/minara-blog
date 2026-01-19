# Scan all HTML articles for word count, images, and premium-feature markers
# Run from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\scan_articles.ps1

$files = Get-ChildItem -Path . -Filter *.html -File -Recurse | Where-Object { $_.FullName -notmatch "lighthouse-report.html" }
$report = Join-Path (Get-Location) "article-scan-report.csv"
"file,word_count,img_count,img_with_dims,features" | Out-File $report -Encoding UTF8

foreach ($f in $files) {
    try {
        $content = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    } catch {
        Write-Host "Failed to read $($f.FullName)" -ForegroundColor Yellow
        continue
    }

    # remove script/style blocks for cleaner text
    $body = [regex]::Replace($content, '(?is)<script.*?</script>', ' ')
    $body = [regex]::Replace($body, '(?is)<style.*?</style>', ' ')

    # strip HTML tags
    $text = [regex]::Replace($body, '<[^>]+>', ' ')
    # normalize whitespace
    $text = $text -replace '\s+', ' '
    $words = 0
    if ($text.Trim().Length -gt 0) { $words = ($text.Trim() -split ' ').Count }

    # images
    $imgMatches = [regex]::Matches($content, '<img\b[^>]*>', 'IgnoreCase')
    $imgCount = $imgMatches.Count
    $imgWithDims = 0
    foreach ($m in $imgMatches) {
        $val = $m.Value
        if ($val -match '\bwidth\s*=\s*"?\d+' -or $val -match '\bheight\s*=\s*"?\d+' -or $val -match 'class=".*article-img.*"') { $imgWithDims++ }
    }

    # detect premium features markers
    $features = @()
    if ($content -match 'id=\"premium-features\"|premium-features') { $features += 'premium-features' }
    if ($content -match 'ratesTicker|rates-ticker|ratesTicker') { $features += 'rates-ticker' }
    if ($content -match 'tv_chart_container|TradingView|loadTv') { $features += 'tradingview' }
    if ($content -match 'watchlist|watchList') { $features += 'watchlist' }
    if ($content -match 'econList|econAdd|econ-') { $features += 'econ-calendar' }
    if ($content -match 'recommended-links') { $features += 'recommended-links' }
    if ($content -match 'ads-slot') { $features += 'ads-slot' }

    $featStr = ($features | Select-Object -Unique) -join ';'

    "$($f.Name),$words,$imgCount,$imgWithDims,$featStr" | Out-File $report -Append -Encoding UTF8
    Write-Host "Scanned $($f.Name): $words words, $imgCount images, features: $featStr"
}

Write-Host "Report written to $report" -ForegroundColor Green
