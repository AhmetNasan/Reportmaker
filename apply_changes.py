import sys

with open('index.html', 'r') as f:
    content = f.read()

# CSS
css_anchor = '@keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }'
content = content.replace(css_anchor, css_anchor + """
.inst-module-container { display: flex; flex-direction: column; gap: 20px; animation: fadeUp 0.4s ease both; }
.inst-subnav-container { display: flex; flex-direction: column; gap: 12px; background: var(--surface); border: 1px solid var(--border); padding: 16px; border-radius: 12px; margin-bottom: 10px; }
.inst-category-group { display: flex; align-items: center; gap: 15px; }
.inst-category-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); width: 90px; flex-shrink: 0; }
.inst-tabs-row { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
.inst-tab-btn { padding: 6px 12px; font-size: 11px; font-weight: 600; color: var(--muted); background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
.inst-tab-btn:hover { color: var(--text); border-color: var(--accent); }
.inst-tab-btn.active { background: var(--accent); color: #000; border-color: var(--accent); }
.inst-tab-btn i { font-size: 12px; }
.kpi-grid-new { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px; }
.inst-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow); }
.inst-card-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.02); }
.inst-card-title { font-size: 13px; font-weight: 700; color: var(--text); }
.inst-card-body { padding: 16px; }
.team-grid-new { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
.team-card-new { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; position: relative; transition: transform 0.2s; }
.team-status-badge { position: absolute; top: 16px; right: 16px; font-size: 9px; padding: 2px 8px; border-radius: 100px; }
.export-grid-new { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.export-item-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s; }
.export-item-icon { font-size: 32px; color: var(--accent); margin-bottom: 12px; }
.prog-grid-new { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.inst-mono { font-family: "JetBrains Mono", monospace; font-size: 11px; }
.inst-empty { padding: 40px; text-align: center; color: var(--muted); border: 2px dashed var(--border); border-radius: 12px; }
@media (max-width: 768px) { .inst-category-group { flex-direction: column; align-items: flex-start; gap: 8px; } .inst-category-label { width: auto; } }
""")

# HTML
h_start = content.find('<div class="page" id="page-installation">')
h_end = content.find('<div class="page" id="page-settings">')
new_html = """
<div class="page" id="page-installation">
  <div class="wrapper">
    <header style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:16px;">
      <div><h2 style="font-family:'Inter', sans-serif;font-size:22px;font-weight:800;">Installation <span style="color:var(--accent)">Module</span></h2><p style="font-size:12px; color:var(--muted); margin-top:4px;">Integrated site management & configuration</p></div>
    </header>
    <div class="inst-subnav-container">
      <div class="inst-category-group"><div class="inst-category-label">Overview</div><div class="inst-tabs-row"><button class="inst-tab-btn active" id="btn-inst-dashboard" onclick="switchInstTab('dashboard')"><i class="fas fa-chart-line"></i> Dashboard</button><button class="inst-tab-btn" id="btn-inst-map" onclick="switchInstTab('map')"><i class="fas fa-map-marked-alt"></i> Planning Map</button><button class="inst-tab-btn" id="btn-inst-tracking" onclick="switchInstTab('tracking')"><i class="fas fa-route"></i> Tracking</button></div></div>
      <div class="inst-category-group"><div class="inst-category-label">Execution</div><div class="inst-tabs-row"><button class="inst-tab-btn" id="btn-inst-teams" onclick="switchInstTab('teams')"><i class="fas fa-users-cog"></i> Teams</button><button class="inst-tab-btn" id="btn-inst-programs" onclick="switchInstTab('programs')"><i class="fas fa-calendar-check"></i> Programs</button><button class="inst-tab-btn" id="btn-inst-calendar" onclick="switchInstTab('calendar')"><i class="fas fa-calendar-alt"></i> Calendar</button><button class="inst-tab-btn" id="btn-inst-photos" onclick="switchInstTab('photos')"><i class="fas fa-camera"></i> Site Photos</button></div></div>
      <div class="inst-category-group"><div class="inst-category-label">Reports</div><div class="inst-tabs-row"><button class="inst-tab-btn" id="btn-inst-export" onclick="switchInstTab('export')"><i class="fas fa-file-export"></i> Export</button><button class="inst-tab-btn" id="btn-inst-packages" onclick="switchInstTab('packages')"><i class="fas fa-box-open"></i> Packages</button><button class="inst-tab-btn" id="btn-inst-certs" onclick="switchInstTab('certs')"><i class="fas fa-certificate"></i> Certs</button></div></div>
      <div class="inst-category-group" id="inst-config-group" style="display: none;"><div class="inst-category-label">Configuration</div><div class="inst-tabs-row"><button class="inst-tab-btn" id="btn-inst-config-general" onclick="switchInstTab('config-general')"><i class="fas fa-sliders-h"></i> General</button><button class="inst-tab-btn" id="btn-inst-config-assets" onclick="switchInstTab('config-assets')"><i class="fas fa-tags"></i> Assets</button><button class="inst-tab-btn" id="btn-inst-config-workflow" onclick="switchInstTab('config-workflow')"><i class="fas fa-project-diagram"></i> Workflow</button><button class="inst-tab-btn" id="btn-inst-config-notifications" onclick="switchInstTab('config-notifications')"><i class="fas fa-bell"></i> Alerts</button><button class="inst-tab-btn" id="btn-inst-config-templates" onclick="switchInstTab('config-templates')"><i class="fas fa-file-invoice"></i> Templates</button><button class="inst-tab-btn" id="btn-inst-config-advanced" onclick="switchInstTab('config-advanced')"><i class="fas fa-cogs"></i> Advanced</button></div></div>
    </div>
    <div id="inst-content" class="inst-module-container"></div>
  </div>
</div>
"""
content = content[:h_start] + new_html + content[h_end:]

# JS
js_start = content.find('function switchInstTab(tab) {')
js_end = content.find('function refreshUI() {')
with open('integrated_installation_module.js', 'r') as f:
    new_js = f.read()
content = content[:js_start] + new_js + content[js_end:]

# Hooks
content = content.replace('if (savePresetBtn) savePresetBtn.style.display = isFullAdmin ? "block" : "none";', 'if (savePresetBtn) savePresetBtn.style.display = isFullAdmin ? "block" : "none";\n    const instConfigGroup = document.getElementById("inst-config-group");\n    if (instConfigGroup) instConfigGroup.style.display = isFullAdmin ? "flex" : "none";')

# Data loading
fetch_data_start = content.find('async function fetchData() {')
if fetch_data_start != -1:
    ins_pos = content.find('updateFileManagerStats();', fetch_data_start)
    if ins_pos != -1:
        ins_pos += len('updateFileManagerStats();')
        content = content[:ins_pos] + '\n  if (typeof loadInstallationData === "function") await loadInstallationData();' + content[ins_pos:]

content = content.replace('function useLocalFallback()', 'async function useLocalFallback()')
lfb_start = content.find('async function useLocalFallback()')
if lfb_start != -1:
    ins_pos = content.find('updateFileManagerStats();', lfb_start)
    if ins_pos != -1:
        ins_pos += len('updateFileManagerStats();')
        content = content[:ins_pos] + '\n  if (typeof loadInstallationData === "function") await loadInstallationData();' + content[ins_pos:]

# refreshUI MUST BE ASYNC
content = content.replace('function refreshUI() {', 'async function refreshUI() {')

with open('index.html', 'w') as f:
    f.write(content)
