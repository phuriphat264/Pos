import os

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    bad_str1 = "`http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000/api/auth/me`"
    good_str1 = "(process.env.NEXT_PUBLIC_API_URL || `http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000`) + '/api/auth/me'"
    
    bad_str2 = "`http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000${endpoint}`"
    good_str2 = "(process.env.NEXT_PUBLIC_API_URL || `http://${typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname) : '127.0.0.1'}:8000`) + endpoint"
    
    content = content.replace(bad_str1, good_str1)
    content = content.replace(bad_str2, good_str2)
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/components/AuthGuard.tsx')
replace_in_file('src/components/Navbar.tsx')
