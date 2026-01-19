Run the batch recommended-links inserter

This script will insert a small "Recommended next" HTML block into all `.html` files under the project root, skipping `index.html`, `template-article.html`, and files that already contain the block.

How to run (Windows PowerShell):

```powershell
# From the repo root (where index.html sits)
powershell -ExecutionPolicy Bypass -File .\scripts\add_recommended.ps1
```

What it does:
- Scans recursively for `*.html` files
- Skips `index.html` and `template-article.html`
- Skips files already containing `recommended-links`
- Inserts the block right before the closing `</body>` tag

Safety:
- Files are overwritten in place (UTF-8). Create a git commit or backup before running if needed.

If you want me to run this for you, tell me and I will proceed (but I currently cannot execute arbitrary PowerShell here).