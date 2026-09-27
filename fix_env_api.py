import os

filepath = 'src/lib/api.ts'
with open(filepath, 'r') as f:
    content = f.read()

# Replace the dynamic API_URL logic with environment variable support
bad = "const API_URL = `http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000`;"
good = "const API_URL = process.env.NEXT_PUBLIC_API_URL || `http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000`;"

content = content.replace(bad, good)

with open(filepath, 'w') as f:
    f.write(content)
