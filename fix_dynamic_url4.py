import os

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # if hostname is localhost, use 127.0.0.1 to avoid IPv6 issues
    bad = "typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'"
    good = "typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'"
    
    content = content.replace(bad, good)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/components/Navbar.tsx')
fix('src/components/AuthGuard.tsx')
fix('src/lib/api.ts')
