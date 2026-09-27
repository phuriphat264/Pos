def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    bad_str = "fetch('${`http://${typeof window !== \\'undefined\\' ? window.location.hostname : \\'127.0.0.1\\'}:8000/api/auth/me`}'"
    bad_str_2 = "fetch('${`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000/api/auth/me`}'"
    
    good_str = "fetch(`http://${typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'}:8000/api/auth/me`"
    
    content = content.replace(bad_str, good_str).replace(bad_str_2, good_str)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/components/Navbar.tsx')
fix('src/components/AuthGuard.tsx')
