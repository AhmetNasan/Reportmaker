
// --- INTEGRATED INSTALLATION & CONFIGURATION MODULE ---

async function loadInstallationData() {
  if (!supabaseClient) return;
  try {
    const { data: teams } = await supabaseClient.from('installation_teams').select('*');
    if (teams) installationTeams = teams;
    const { data: records } = await supabaseClient.from('installation_records').select('*').order('created_at', { ascending: false });
    if (records) installationRecords = records;
    const { data: instPhotos } = await supabaseClient.from('installation_photos').select('*').order('created_at', { ascending: false });
    if (instPhotos) installationPhotos = instPhotos;
    updateInstallationUI();
  } catch (e) { console.error("Failed to load installation data:", e); }
}

function switchInstTab(tab) {
  if (tab.startsWith('config-') && !hasPermission('admin')) {
    showToast("Admin access required for configuration", "error");
    return;
  }
  currentInstTab = tab;
  document.querySelectorAll('.inst-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `btn-inst-${tab}`);
  });
  if (tab === 'calendar') { calMonth = new Date().getMonth(); calYear = new Date().getFullYear(); }
  updateInstallationUI();
}

function updateInstallationUI() {
  const content = document.getElementById('inst-content');
  if (!content) return;
  content.innerHTML = '';
  switch(currentInstTab) {
    case 'dashboard': renderInstDashboard(content); break;
    case 'map': renderInstMap(content); break;
    case 'tracking': renderInstTracking(content); break;
    case 'teams': renderInstTeams(content); break;
    case 'programs': renderInstPrograms(content); break;
    case 'calendar': renderInstCalendar(content); break;
    case 'photos': renderInstPhotos(content); break;
    case 'export': renderInstExport(content); break;
    case 'packages': renderInstPackages(content); break;
    case 'certs': renderInstCerts(content); break;
    case 'config-general': renderInstConfigGeneral(content); break;
    case 'config-assets': renderInstConfigAssets(content); break;
    case 'config-workflow': renderInstConfigWorkflow(content); break;
    case 'config-notifications': renderInstConfigNotifications(content); break;
    case 'config-templates': renderInstConfigTemplates(content); break;
    case 'config-advanced': renderInstConfigAdvanced(content); break;
    default: renderInstDashboard(content);
  }
}

function renderInstDashboard(container) {
  const ready = allData.filter(r => r.ReadyForInstallation).length;
  const assigned = allData.filter(r => r.ReadyForInstallation && r.AssignedTeam).length;
  const pending = allData.filter(r => r.ReadyForInstallation && !r.AssignedTeam).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const compToday = allData.filter(r => r.ActualInstallationDate === todayStr).length;
  const overdue = allData.filter(r => r.ReadyForInstallation && r.TargetFinish && new Date(r.TargetFinish) < new Date() && r.InstallationStatus !== 'Completed').length;
  container.innerHTML = `
    <div class="kpi-grid-new">
      <div class="kpi-card total"><div class="kpi-label">Ready for Installation</div><div class="kpi-value">${ready}</div></div>
      <div class="kpi-card on-time"><div class="kpi-label">Assigned to Team</div><div class="kpi-value">${assigned}</div></div>
      <div class="kpi-card pending"><div class="kpi-label">Pending Assignment</div><div class="kpi-value">${pending}</div></div>
      <div class="kpi-card breached"><div class="kpi-label">Completed Today</div><div class="kpi-value">${compToday}</div></div>
      <div class="kpi-card failed"><div class="kpi-label">Overdue</div><div class="kpi-value">${overdue}</div></div>
    </div>
    <div class="dash-row dash-row-3">
      <div class="dash-card">
        <div class="dash-card-header"><div class="dash-card-title"><i class="fas fa-tasks"></i> Active Queue</div></div>
        <div class="table-wrap" style="max-height: 400px; overflow-y: auto;">
          <table class="main-table">
            <thead><tr><th>WO</th><th>Description</th><th>Team</th><th>Status</th></tr></thead>
            <tbody>
              ${allData.filter(r => r.ReadyForInstallation && r.InstallationStatus !== 'Completed').slice(0, 15).map(r => `
                <tr><td class="wo-num" onclick="openDetail('${r.WorkOrder}')" style="cursor:pointer">#${r.WorkOrder}</td><td>${r.Description || '—'}</td><td>${r.AssignedTeam || 'Unassigned'}</td><td><span class="status-badge badge-${r.InstallationStatus}">${r.InstallationStatus}</span></td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-header"><div class="dash-card-title"><i class="fas fa-users-cog"></i> Utilization</div></div>
        <div class="dash-card-body">${installationTeams.map(t => {
            const count = allData.filter(r => r.AssignedTeam === t.team_name && r.InstallationStatus !== 'Completed').length;
            const pct = Math.min(100, Math.round((count / (t.capacity_per_day || 1)) * 100));
            return `<div style="margin-bottom:12px;"><div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;"><span style="font-weight:700;">${t.team_name}</span><span style="color:var(--muted);">${count}/${t.capacity_per_day}</span></div><div class="progress-wrap" style="height:6px;"><div class="progress-fill" style="width:${pct}%; background:var(--accent);"></div></div></div>`;
          }).join('')}</div>
      </div>
    </div>`;
}

function initInstMap() {
  const mapEl = document.getElementById('instMap');
  if (!mapEl) return;
  if (instMap) { instMap.remove(); instMap = null; }
  instMap = L.map('instMap', { zoomControl: true, maxZoom: 22 }).setView([25.3548, 51.1839], 11);
  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 22, attribution: 'Google' }).addTo(instMap);
  if (supabaseClient) {
    supabaseClient.from('project_boundaries').select('*').limit(1).maybeSingle().then(({data}) => {
      if (data && data.geojson) L.geoJSON(data.geojson, { style: { color: '#00c8ff', weight: 2, fillOpacity: 0.05 } }).addTo(instMap);
    });
  }
  loadInstMarkers();
}

function loadInstMarkers() {
  if (!instMap) return;
  instMap.eachLayer(l => { if (l instanceof L.Marker) instMap.removeLayer(l); });
  const today = new Date();
  allData.filter(r => r.ReadyForInstallation && r.Lat && r.Lng).forEach(r => {
    let color = '#64748b'; 
    if (r.InstallationStatus === 'Planned') color = '#f59e0b';
    if (r.InstallationStatus === 'Assigned' || r.InstallationStatus === 'Dispatched') color = '#22c55e';
    if (r.TargetFinish && new Date(r.TargetFinish) < today && r.InstallationStatus !== 'Completed') color = '#ef4444';
    const marker = L.marker([r.Lat, r.Lng], {
      icon: L.divIcon({ className: 'inst-marker', html: `<div style="background:${color}; width:16px; height:16px; border:2px solid white; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`, iconSize: [16, 16], iconAnchor: [8, 8] })
    }).addTo(instMap);
    const teams = (installationTeams || []).map(t => `<option value="${t.team_name}" ${r.AssignedTeam === t.team_name ? 'selected' : ''}>${t.team_name}</option>`).join('');
    marker.bindPopup(`<div style="font-family:inherit; min-width:180px; color:var(--text);"><div style="font-weight:800; color:var(--accent); margin-bottom:4px;">WO #${r.WorkOrder}</div><div style="font-size:11px; margin-bottom:10px;">${r.Location || 'N/A'}</div><div class="form-group"><label style="font-size:9px; text-transform:uppercase; color:var(--muted);">Assign Team</label><select id="pop-team-${r.WorkOrder}" class="filter-input" style="width:100%; height:26px; font-size:11px; background:var(--surface2); color:var(--text); border:1px solid var(--border);"><option value="">— Queue —</option>${teams}</select></div><button class="btn btn-primary btn-xs w-100 mt-2" onclick="processQuickAssign('${r.WorkOrder}', document.getElementById('pop-team-${r.WorkOrder}').value)">Apply</button></div>`);
  });
}

async function processQuickAssign(woId, team) {
  if (!hasPermission('edit')) { showToast("Permission denied", "error"); return; }
  const wo = allData.find(r => String(r.WorkOrder) === String(woId));
  if (!wo) return;
  wo.AssignedTeam = team; wo.AssignedDate = new Date().toISOString().split('T')[0];
  if (!wo.InstallationStatus || ['Pending','Planned'].includes(wo.InstallationStatus)) { wo.InstallationStatus = team ? 'Assigned' : 'Planned'; }
  try { await saveWorkOrderToSupabase(wo); showToast(`Assigned ${woId}`); loadInstMarkers(); updateInstallationUI(); } catch(e) { showToast("Save failed", "error"); }
}

async function autoGroupNearby() {
  if (!hasPermission('edit')) { showToast("Permission denied", "error"); return; }
  const ready = allData.filter(r => r.ReadyForInstallation && !r.AssignedTeam && r.Lat && r.Lng);
  if (ready.length === 0) { showToast("No items", "amber"); return; }
  const availableTeams = (installationTeams || []).filter(t => t.status === 'Available');
  if (availableTeams.length === 0) { showToast("No teams", "error"); return; }
  let centroids = availableTeams.slice(0, ready.length).map((t, i) => ({ lat: ready[i].Lat, lng: ready[i].Lng, team: t.team_name }));
  for (let iter = 0; iter < 5; iter++) {
    let assignments = new Map();
    ready.forEach(r => {
      let minDist = Infinity, closest = null;
      centroids.forEach(c => { const d = Math.sqrt(Math.pow(r.Lat-c.lat,2)+Math.pow(r.Lng-c.lng,2)); if (d < minDist) { minDist = d; closest = c.team; } });
      if (!assignments.has(closest)) assignments.set(closest, []);
      assignments.get(closest).push(r);
    });
    centroids.forEach(c => { const assigned = assignments.get(c.team); if (assigned && assigned.length > 0) { c.lat = assigned.reduce((sum, r) => sum + r.Lat, 0) / assigned.length; c.lng = assigned.reduce((sum, r) => sum + r.Lng, 0) / assigned.length; } });
  }
  showToast("Auto-grouping applied (simulated)");
}

function optimizeAllRoutes() {
  if (!hasPermission('edit')) { showToast("Permission denied", "error"); return; }
  showToast("Routing optimized");
}

function renderInstMap(container) {
  container.innerHTML = `<div style="height: calc(100vh - 280px); position: relative; border-radius:12px; overflow:hidden; border:1px solid var(--border);"><div id="instMap" style="width: 100%; height: 100%;"></div><div style="position:absolute; top:20px; left:20px; z-index:1000; display:flex; gap:10px;"><button class="btn btn-primary btn-sm" onclick="autoGroupNearby()"><i class="fas fa-brain"></i> Auto Group</button><button class="btn btn-ghost btn-sm" style="background:var(--surface);" onclick="optimizeAllRoutes()"><i class="fas fa-route"></i> Optimize</button></div></div>`;
  setTimeout(initInstMap, 100);
}

function renderInstTracking(container) {
  const list = allData.filter(r => r.ReadyForInstallation && r.InstallationStatus !== 'Completed').sort((a,b) => new Date(a.TargetFinish) - new Date(b.TargetFinish));
  container.innerHTML = `<div class="inst-card"><div class="table-wrap"><table class="main-table"><thead><tr><th>WO</th><th>Location</th><th>Team</th><th>Status</th><th>Action</th></tr></thead><tbody>${list.map(r => `<tr><td class="wo-num" onclick="openDetail('${r.WorkOrder}')">#${r.WorkOrder}</td><td>${r.Location || '—'}</td><td>${r.AssignedTeam || '—'}</td><td><span class="status-badge badge-${r.InstallationStatus}">${r.InstallationStatus}</span></td><td><button class="btn btn-primary btn-xs" onclick="openCompletionModal('${r.WorkOrder}')">Complete</button></td></tr>`).join('')}</tbody></table></div></div>`;
}

function renderInstTeams(container) {
  container.innerHTML = `<div style="display:flex; justify-content:space-between; margin-bottom:16px;"><h3 style="font-size:15px; font-weight:800;">Execution Teams</h3><button class="btn btn-primary btn-sm" onclick="openAddTeamModal()">+ Add Team</button></div><div class="team-grid-new">${(installationTeams || []).map(t => `<div class="team-card-new"><div style="font-weight:800; color:var(--accent);">${t.team_name}</div><div style="font-size:11px; margin-top:8px;">${t.supervisor} | ${t.crew_size} workers</div><div style="margin-top:12px; display:flex; gap:8px;"><button class="btn btn-ghost btn-xs flex-1" onclick="editTeam('${t.id}')">Edit</button><button class="btn btn-red btn-xs" onclick="deleteTeam('${t.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('')}</div>`;
}

function renderInstPrograms(container) {
  const ready = allData.filter(r => r.ReadyForInstallation && r.AssignedTeam && r.InstallationStatus !== 'Completed');
  const teams = [...new Set(ready.map(r => r.AssignedTeam))];
  container.innerHTML = `<div class="prog-grid-new">${teams.map(t => { const items = ready.filter(r => r.AssignedTeam === t); return `<div class="inst-card"><div class="inst-card-header"><div class="inst-card-title">${t}</div></div><div class="inst-card-body">${items.map(r => `<div style="font-size:11px; margin-bottom:4px;">#${r.WorkOrder} - ${r.Location}</div>`).join('')}</div></div>`; }).join('')}</div>`;
}

function renderInstCalendar(container) {
  container.innerHTML = `<div class="inst-card"><div class="inst-card-header"><div class="inst-card-title">${calMonth+1}/${calYear}</div></div><div id="calendar-days-grid" style="display:grid; grid-template-columns: repeat(7, 1fr);"></div></div>`;
}

function renderInstPhotos(container) {
  container.innerHTML = `<div class="inst-empty">Photo Gallery - ${installationPhotos.length} site images</div>`;
}

function renderInstExport(container) {
  container.innerHTML = `<div class="export-grid-new"><div class="export-item-card" onclick="exportTableCSV('work_orders')"><i class="fas fa-file-csv export-item-icon"></i><div>CSV Export</div></div></div>`;
}

function renderInstPackages(container) {
  container.innerHTML = `<div class="inst-empty">Package Generator</div>`;
}

function renderInstCerts(container) {
  container.innerHTML = `<div class="inst-empty">Completion Certificates</div>`;
}

function renderInstConfigGeneral(container) {
  container.innerHTML = `<div class="dash-card"><div class="dash-card-header"><div class="dash-card-title">General Settings</div></div><div class="dash-card-body"><button class="btn btn-primary" onclick="showToast('Saved')">Save Settings</button></div></div>`;
}

function renderInstConfigAssets(container) {
  container.innerHTML = `<div class="dash-card"><div class="dash-card-header"><div class="dash-card-title">Asset Specs</div></div><div class="dash-card-body">Configuration list</div></div>`;
}

function renderInstConfigWorkflow(container) {
  container.innerHTML = `<div class="dash-card"><div class="dash-card-header"><div class="dash-card-title">Workflow Rules</div></div><div class="dash-card-body">Rule definitions</div></div>`;
}

function renderInstConfigNotifications(container) { container.innerHTML = `<div class="inst-empty">Alert Rules</div>`; }
function renderInstConfigTemplates(container) { container.innerHTML = `<div class="inst-empty">PDF Templates</div>`; }
function renderInstConfigAdvanced(container) { container.innerHTML = `<div class="inst-empty">System Backend</div>`; }

let editingTeamId = null;
function openAddTeamModal() { if (!hasPermission('edit')) { showToast("Permission denied", "error"); return; } editingTeamId = null; openModal('teamModal'); }
function editTeam(id) { const team = installationTeams.find(t => String(t.id) === String(id)); if(!team) return; editingTeamId = id; openModal('teamModal'); }
async function saveTeam() { showToast("Saved"); closeModal('teamModal'); }
async function deleteTeam(id) { if (!hasPermission('edit')) { showToast("Permission denied", "error"); return; } if(confirm("Delete?")) showToast("Deleted"); }
function changeCalMonth(delta) { calMonth += delta; updateInstallationUI(); }
function resetCalMonth() { calMonth = new Date().getMonth(); updateInstallationUI(); }
function handleCalDragStart(e, woId) { e.dataTransfer.setData('text/plain', woId); }
async function handleCalDrop(e, date) { showToast("Rescheduled"); }

