Update recommended-links anchor text to target page <title>

This script replaces the anchor text inside `.recommended-links` blocks with the actual `<title>` of the linked page, making links human-readable.

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update_recommended_titles.ps1
```

Notes:
- It only updates local HTML links.
- It trims a trailing "| Minara Blog" suffix from titles.
- Files are overwritten in place; create a git commit or backup first if needed.
