import re
import os

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    with open(filepath, 'w') as f:
        f.write(new_content)

replace_in_file('src/lib/api.ts', r"const API_URL = 'http://127.0.0.1:8000';", "const API_URL = `http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000`;")

replace_in_file('src/components/AuthGuard.tsx', r"http://127.0.0.1:8000/api/auth/me", "${`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000/api/auth/me`}")

replace_in_file('src/components/AuthGuard.tsx', r"fetch\(`http://127.0.0.1:8000\$\{endpoint\}`", "fetch(`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000${endpoint}`")

replace_in_file('src/components/Navbar.tsx', r"http://127.0.0.1:8000/api/auth/me", "${`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000/api/auth/me`}")
