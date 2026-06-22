import sys

with open('index.html', 'r') as f:
    lines = f.readlines()

# CSS
css = open('integrated_installation_module_css.txt').read()
for i, line in enumerate(lines):
    if '</style>' in line:
        lines.insert(i, css + "\n")
        break

# HTML
h_start = -1
h_end = -1
for i, line in enumerate(lines):
    if '<div class="page" id="page-installation">' in line: h_start = i
    if '<div class="page" id="page-settings">' in line: h_end = i
if h_start != -1 and h_end != -1:
    new_html = open('new_install_html.txt').read()
    lines[h_start:h_end] = [new_html + "\n"]

# JS Part 1: switchInstTab (2853-2860 in baseline)
js1_start = -1
js1_end = -1
for i, line in enumerate(lines):
    if 'function switchInstTab(tab) {' in line: js1_start = i
    if js1_start != -1 and line.strip() == '}' and i > js1_start:
        js1_end = i + 1
        break

new_js1 = """
function switchInstTab(tab) {
  if (tab.startsWith('config-') && !hasPermission('admin')) { showToast("Admin access required", "error"); return; }
  currentInstTab = tab;
  document.querySelectorAll('.inst-tab-btn').forEach(btn => btn.classList.toggle('active', btn.id === `btn-inst-${tab}`));
  if (tab === 'calendar') { calMonth = new Date().getMonth(); calYear = new Date().getFullYear(); }
  updateInstallationUI();
}
"""
if js1_start != -1: lines[js1_start:js1_end] = [new_js1 + "\n"]

# JS Part 2: bulk renderers (8909-9338)
js2_start = -1
js2_end = -1
for i, line in enumerate(lines):
    if 'function updateInstallationUI()' in line: js2_start = i
    if 'function refreshUI()' in line: js2_end = i
if js2_start != -1:
    new_js2 = open('integrated_installation_module.js').read()
    lines[js2_start:js2_end] = [new_js2 + "\n"]

# Write back
with open('index.html', 'w') as f:
    f.writelines(lines)

# Hooks
with open('index.html', 'r') as f:
    content = f.read()
content = content.replace('if (savePresetBtn) savePresetBtn.style.display = isFullAdmin ? "block" : "none";',
                        'if (savePresetBtn) savePresetBtn.style.display = isFullAdmin ? "block" : "none";\n    const instConfigGroup = document.getElementById("inst-config-group");\n    if (instConfigGroup) instConfigGroup.style.display = isFullAdmin ? "flex" : "none";')
content = content.replace('async function fetchData() {', 'async function fetchData() {\n  if (typeof loadInstallationData === "function") await loadInstallationData();', 1)
content = content.replace('function useLocalFallback() {', 'async function useLocalFallback() {\n  if (typeof loadInstallationData === "function") await loadInstallationData();')
content = content.replace('function refreshUI() {', 'async function refreshUI() {\n  if (typeof loadInstallationData === "function") await loadInstallationData();')
content = content.replace("if (id === 'installation') {", "if (id === 'installation') {\n    if (typeof loadInstallationData === 'function') loadInstallationData();")
with open('index.html', 'w') as f:
    f.write(content)
