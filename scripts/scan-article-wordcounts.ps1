# Scan all article HTML files and output precise word counts + CSV report
# Usage: .\scripts\scan-article-wordcounts.ps1

$path = "c:\Users\DELL\Desktop\minara-blog"
$results = @()

# Get all HTML files except excluded ones
$exclude = @('index.html', 'home.js', 'script.js', 'style.css', 'ads.txt', 'robots.txt', 'sitemap.xml', 'contact.html', 'about.html', 'template-article.html', 'lighthouse-report.html', 'favicon.ico.ico')

Get-ChildItem -Path $path -Filter "*.html" -File | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    $filePath = $_.FullName
    $fileName = $_.BaseName
    
    try {
        $content = Get-Content $filePath -Raw -ErrorAction Stop
        
        # Remove HTML tags to get plain text
        $plainText = $content -replace '<[^>]+>', ' '
        
        # Count words (split on whitespace, filter empty)
        $words = $plainText -split '\s+' | Where-Object { $_.Length -gt 0 }
        $wordCount = $words.Count
        
        # Categorize
        $status = if ($wordCount -ge 1500) { "PREMIUM" } elseif ($wordCount -ge 1300) { "NEAR" } else { "NEEDS_UPGRADE" }
        
        $results += [PSCustomObject]@{
            Article = $fileName
            Words = $wordCount
            Status = $status
            FileSize = $_.Length
        }
    } catch {
        Write-Warning "Error reading $fileName : $_"
    }
}

# Sort by word count descending, then by status
$sorted = $results | Sort-Object Words -Descending

# Export CSV
$csvPath = Join-Path $path "article-word-counts.csv"
$sorted | Export-Csv -Path $csvPath -NoTypeInformation -Force
Write-Host "✓ CSV report saved: $csvPath"

# Show summary
Write-Host "=== ARTICLE WORD COUNT SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total articles scanned: $($results.Count)" -ForegroundColor Green
Write-Host "Premium (1500+): $($results | Where-Object { $_.Words -ge 1500 } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Green
Write-Host "Near threshold (1300-1499): $($results | Where-Object { $_.Words -ge 1300 -and $_.Words -lt 1500 } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Yellow
Write-Host "Needs upgrade (<1300): $($results | Where-Object { $_.Words -lt 1300 } | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor Red

Write-Host "`n=== TOP PRIORITY UPGRADES (under 1300 words) ===" -ForegroundColor Magenta
$results | Where-Object { $_.Words -lt 1300 } | Sort-Object Words -Descending | Select-Object -First 20 | ForEach-Object {
    Write-Host "$($_.Article): $($_.Words) words" -ForegroundColor Cyan
}

Write-Host "`n=== NEAR THRESHOLD (1300-1499 words) ===" -ForegroundColor Yellow
$results | Where-Object { $_.Words -ge 1300 -and $_.Words -lt 1500 } | Sort-Object Words -Descending | ForEach-Object {
    Write-Host "$($_.Article): $($_.Words) words" -ForegroundColor Yellow
}
