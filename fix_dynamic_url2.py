import re

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # fix the string wrapping issue
    content = content.replace(
        "fetch('${`http://${typeof window !== \\'undefined\\' ? window.location.hostname : \\'127.0.0.1\\'}:8000/api/auth/me`}'", 
        "fetch(`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000/api/auth/me`"
    )
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/components/Navbar.tsx')
fix('src/components/AuthGuard.tsx')
