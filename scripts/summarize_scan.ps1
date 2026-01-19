$csv = Import-Csv .\article-scan-report.csv
$total = $csv.Count
$withImages = ($csv | Where-Object { [int]$_.img_count -gt 0 }).Count
$premium = ($csv | Where-Object { $_.features -match 'premium-features' }).Count
$over1500 = ($csv | Where-Object { [int]$_.word_count -ge 1500 }).Count
Write-Host "scanned:$total, with_images:$withImages, premium_features:$premium, >=1500:$over1500"
$top = $csv | Sort-Object {[int]$_.word_count} -Descending | Select-Object -First 10
Write-Host "Top 10 by word_count:"
foreach ($t in $top) { Write-Host "$($t.file) - $($t.word_count) words - images:$($t.img_count) - features:$($t.features)" }
