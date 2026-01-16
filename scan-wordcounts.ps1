$path = "c:\Users\DELL\Desktop\minara-blog"
$results = @()
$exclude = @('index.html', 'home.js', 'script.js', 'style.css', 'ads.txt', 'robots.txt', 'sitemap.xml', 'contact.html', 'about.html', 'template-article.html', 'lighthouse-report.html', 'favicon.ico.ico')

Get-ChildItem -Path $path -Filter "*.html" -File | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    $filePath = $_.FullName
    $fileName = $_.BaseName
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $plainText = $content -replace '<[^>]+>', ' '
        $words = $plainText -split '\s+' | Where-Object { $_.Length -gt 0 }
        $wordCount = $words.Count
        $status = if ($wordCount -ge 1500) { "OK" } else { "UPGRADE" }
        $results += [PSCustomObject]@{
            Article = $fileName
            Words = $wordCount
            Status = $status
        }
    }
}

$sorted = $results | Sort-Object Words -Descending
$sorted | Export-Csv -Path (Join-Path $path "article-word-counts.csv") -NoTypeInformation -Force

$premium = ($sorted | Where-Object { $_.Words -ge 1500 }).Count
$upgrade = ($sorted | Where-Object { $_.Words -lt 1500 }).Count

Write-Host "Total: $($sorted.Count) | Premium (1500+): $premium | Needs upgrade: $upgrade"
Write-Host "CSV saved to article-word-counts.csv"
$sorted | Where-Object { $_.Words -lt 1300 } | Sort-Object Words -Descending | Select-Object -First 15
