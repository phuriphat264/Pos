import os

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content.replace("http://localhost:8000", "http://127.0.0.1:8000")
    
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

replace_in_file('src/components/AuthGuard.tsx')
replace_in_file('src/components/Navbar.tsx')
replace_in_file('src/lib/api.ts')
