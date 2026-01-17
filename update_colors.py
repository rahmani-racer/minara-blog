import os
import re

# List of HTML files to update
html_files = [
    'trading-basics.html',
    'forex-article.html',
    'risk-management.html',
    'trading-psychology.html',
    'technical-analysis.html',
    'support-resistance.html',
    'thought.html'
]

for file in html_files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace fill colors in SVGs
        # Change dark backgrounds to white
        content = re.sub(r'fill="#0[0-9a-fA-F]{5}"', 'fill="#ffffff"', content)
        content = re.sub(r'fill="#071022"', 'fill="#ffffff"', content)
        content = re.sub(r'fill="#081022"', 'fill="#ffffff"', content)
        content = re.sub(r'fill="#0b1320"', 'fill="#ffffff"', content)
        content = re.sub(r'fill="#111827"', 'fill="#ffffff"', content)
        content = re.sub(r'fill="#0f172a"', 'fill="#ffffff"', content)

        # Change text to black
        content = re.sub(r'fill="#fff"', 'fill="#000000"', content)
        content = re.sub(r'fill="#ffffff"', 'fill="#000000"', content)
        content = re.sub(r'fill="#e6eef6"', 'fill="#000000"', content)
        content = re.sub(r'fill="#9aa9b2"', 'fill="#000000"', content)
        content = re.sub(r'fill="#cfeefd"', 'fill="#000000"', content)
        content = re.sub(r'fill="#dcd7ff"', 'fill="#000000"', content)

        # Change blue strokes to black
        content = re.sub(r'stroke="#38bdf8"', 'stroke="#000000"', content)
        content = re.sub(r'stroke="#a78bfa"', 'stroke="#000000"', content)

        # Change other colors to white or black
        content = re.sub(r'fill="#10b981"', 'fill="#ffffff"', content)  # green to white
        content = re.sub(r'fill="#ef4444"', 'fill="#000000"', content)  # red to black
        content = re.sub(r'fill="#ffdd57"', 'fill="#ffffff"', content)  # yellow to white
        content = re.sub(r'fill="#071427"', 'fill="#ffffff"', content)
        content = re.sub(r'stroke="#123146"', 'stroke="#000000"', content)
        content = re.sub(r'stroke="#475569"', 'stroke="#000000"', content)

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f'Updated {file}')

print('All HTML files updated to remove colors except white/black.')
