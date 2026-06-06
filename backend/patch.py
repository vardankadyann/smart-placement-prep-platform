import os

import os
api_key = os.getenv("GOOGLE_API_KEY")
root = r'C:\Users\sharm\Projects\ai-teaching-assistant\backend\app'

for dirpath, dirs, files in os.walk(root):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(dirpath, f)
            txt = open(path, encoding='utf-8').read()
            if 'generativeai' in txt and 'genai.configure' not in txt:
                txt = txt.replace('import google.generativeai as genai', 'import google.generativeai as genai\ngenai.configure(api_key="' + api_key + '")')
                open(path, 'w', encoding='utf-8').write(txt)
                print('Patched:', path)
