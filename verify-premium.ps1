$articles = Get-ChildItem "c:\Users\DELL\Desktop\minara-blog\*.html" -Exclude "index.html", "home.js", "script.js", "style.css", "ads.txt", "robots.txt", "sitemap.xml"

$premiumCount = 0
$upgradeCount = 0

foreach ($file in $articles) {
    $content = Get-Content $file.FullName -Raw
    $wordCount = $content -split '\s+' | Measure-Object | Select-Object -ExpandProperty Count
    
    if ($wordCount -ge 1500) {
        $premiumCount++
        Write-Host "$($file.BaseName): $wordCount words ✅"
    } else {
        $upgradeCount++
        Write-Host "$($file.BaseName): $wordCount words ⚠️"
    }
}

Write-Host ""
Write-Host "================"
Write-Host "Total: $($articles.Count) | Premium (1500+): $premiumCount | Needs upgrade: $upgradeCount"
Write-Host "================"
