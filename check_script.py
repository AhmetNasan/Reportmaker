import sys
with open('index.html', 'r') as f:
    content = f.read()
start_marker, end_marker = '<script>', '</script>'
scripts, start = [], 0
while True:
    start = content.find(start_marker, start)
    if start == -1: break
    end = content.find(end_marker, start)
    if end == -1: break
    scripts.append(content[start + len(start_marker):end])
    start = end
with open('temp_check.js', 'w') as f:
    for s in scripts: f.write(s); f.write('\n')
