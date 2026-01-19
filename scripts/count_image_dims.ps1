$csv = Import-Csv .\article-scan-report.csv
$withDims = ($csv | Where-Object { [int]$_.img_with_dims -gt 0 }).Count
Write-Host "articles_with_image_dims:$withDims"
