// Global variables
let map;
let projects = [];
let currentData = [];
let charts = {};
let contracts = [];
let boqData = [];
let inspectionData = [];
let costEstimationData = [];
let aiResults = [];
let notebooks = [];
let drawings = [];
let currentProject = {
    name: 'New Project',
    contracts: [],
    inspections: [],
    costEstimations: [],
    aiResults: [],
    notebooks: [],
    drawings: [],
    settings: {}
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load stored data
    loadProjects();
    loadSettings();
    loadAllData();
    
    // Initialize dashboard
    updateDashboardStats();
    initializeDashboardChart();
    
    // Set default dates
    setDefaultDates();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Show welcome message
    showMessage('Welcome to Engineering Project Platform - Comprehensive Edition', 'success');
}

function loadAllData() {
    // Load contracts
    const storedContracts = localStorage.getItem('engineeringContracts');
    if (storedContracts) {
        try {
            contracts = JSON.parse(storedContracts);
        } catch (e) {
            console.error('Error loading contracts:', e);
            contracts = [];
        }
    }

    // Load BOQ data
    const storedBOQ = localStorage.getItem('engineeringBOQ');
    if (storedBOQ) {
        try {
            boqData = JSON.parse(storedBOQ);
            populateBOQDropdown();
        } catch (e) {
            console.error('Error loading BOQ:', e);
            boqData = [];
        }
    }

    // Load inspection data
    const storedInspections = localStorage.getItem('engineeringInspections');
    if (storedInspections) {
        try {
            inspectionData = JSON.parse(storedInspections);
        } catch (e) {
            console.error('Error loading inspections:', e);
            inspectionData = [];
        }
    }

    // Load cost estimation data
    const storedCostEstimations = localStorage.getItem('engineeringCostEstimations');
    if (storedCostEstimations) {
        try {
            costEstimationData = JSON.parse(storedCostEstimations);
        } catch (e) {
            console.error('Error loading cost estimations:', e);
            costEstimationData = [];
        }
    }

    // Load AI results
    const storedAIResults = localStorage.getItem('engineeringAIResults');
    if (storedAIResults) {
        try {
            aiResults = JSON.parse(storedAIResults);
        } catch (e) {
            console.error('Error loading AI results:', e);
            aiResults = [];
        }
    }

    // Load notebooks
    const storedNotebooks = localStorage.getItem('engineeringNotebooks');
    if (storedNotebooks) {
        try {
            notebooks = JSON.parse(storedNotebooks);
        } catch (e) {
            console.error('Error loading notebooks:', e);
            notebooks = [];
        }
    }
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const inspectionDate = document.getElementById('inspection-date');
    if (inspectionDate) {
        inspectionDate.value = today;
    }
}

function setupEventListeners() {
    // Settings form
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }
    
    // Project form
    const projectForm = document.getElementById('create-project-form');
    if (projectForm) {
        projectForm.addEventListener('submit', handleProjectSubmit);
    }
    
    // Zoom level slider
    const zoomSlider = document.getElementById('zoom-level');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', function() {
            document.getElementById('zoom-display').textContent = this.value;
        });
    }
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct nav button
    const activeBtn = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Initialize page-specific functionality
    if (pageId === 'mapping-page') {
        initializeMap();
    } else if (pageId === 'reports-page') {
        initializeReportsCharts();
    } else if (pageId === 'projects-page') {
        renderProjectsTable();
    }
}

// Project Management
function loadProjects() {
    const stored = localStorage.getItem('engineeringProjects');
    if (stored) {
        try {
            projects = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading projects:', e);
            projects = [];
        }
    }
}

function saveProjects() {
    try {
        localStorage.setItem('engineeringProjects', JSON.stringify(projects));
    } catch (e) {
        console.error('Error saving projects:', e);
        showMessage('Error saving projects to local storage', 'error');
    }
}

function showCreateProjectModal() {
    const modal = document.getElementById('create-project-modal');
    modal.classList.add('active');
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

function handleProjectSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const project = {
        id: Date.now().toString(),
        name: document.getElementById('project-name').value,
        location: document.getElementById('project-location').value,
        description: document.getElementById('project-description').value,
        status: document.getElementById('project-status').value,
        createdDate: new Date().toISOString().split('T')[0],
        coordinates: null // Can be set when clicking on map
    };
    
    projects.push(project);
    saveProjects();
    updateDashboardStats();
    renderProjectsTable();
    
    // Reset form and close modal
    event.target.reset();
    hideModal('create-project-modal');
    
    showMessage('Project created successfully!', 'success');
}

function renderProjectsTable() {
    const tbody = document.getElementById('projects-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No projects found. Create your first project!</td></tr>';
        return;
    }
    
    projects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.name}</td>
            <td>${project.location}</td>
            <td><span class="status-badge status-${project.status}">${project.status}</span></td>
            <td>${project.createdDate}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProject('${project.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${project.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Fill form with project data
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-location').value = project.location;
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-status').value = project.status;
    
    // Show modal
    showCreateProjectModal();
    
    // Remove old project when form is submitted
    const form = document.getElementById('create-project-form');
    form.onsubmit = function(event) {
        event.preventDefault();
        
        // Remove old project
        projects = projects.filter(p => p.id !== projectId);
        
        // Add updated project
        const updatedProject = {
            id: projectId,
            name: document.getElementById('project-name').value,
            location: document.getElementById('project-location').value,
            description: document.getElementById('project-description').value,
            status: document.getElementById('project-status').value,
            createdDate: project.createdDate,
            coordinates: project.coordinates
        };
        
        projects.push(updatedProject);
        saveProjects();
        updateDashboardStats();
        renderProjectsTable();
        
        // Reset form and close modal
        event.target.reset();
        hideModal('create-project-modal');
        
        // Restore original form handler
        form.onsubmit = handleProjectSubmit;
        
        showMessage('Project updated successfully!', 'success');
    };
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== projectId);
        saveProjects();
        updateDashboardStats();
        renderProjectsTable();
        showMessage('Project deleted successfully!', 'success');
    }
}

// Dashboard Functions
function updateDashboardStats() {
    document.getElementById('total-projects').textContent = projects.length;
    
    const locationsWithCoords = projects.filter(p => p.coordinates).length;
    document.getElementById('total-locations').textContent = locationsWithCoords;
    
    // For now, reports count is based on projects
    document.getElementById('total-reports').textContent = Math.floor(projects.length * 0.7);
}

function initializeDashboardChart() {
    const ctx = document.getElementById('dashboard-chart');
    if (!ctx) return;
    
    // Count projects by status
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    
    if (charts.dashboard) {
        charts.dashboard.destroy();
    }
    
    charts.dashboard = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Projects by Status'
                }
            }
        }
    });
}

// Map Functions
function initializeMap() {
    if (map) return; // Map already initialized
    
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;
    
    // Get default location from settings
    const defaultLocation = getDefaultLocation();
    const zoomLevel = getDefaultZoom();
    
    map = L.map('map-container').setView(defaultLocation, zoomLevel);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add drawing controls
    map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawPolyline: true,
        drawRectangle: true,
        drawPolygon: true,
        editMode: true,
        dragMode: true,
        cutPolygon: true,
        removalMode: true,
    });
    
    // Add project markers
    addProjectMarkers();
    
    // Handle map clicks for adding new project locations
    map.on('click', function(e) {
        if (confirm('Add a new project at this location?')) {
            showCreateProjectModal();
            // Store coordinates for when project is created
            window.tempCoordinates = [e.latlng.lat, e.latlng.lng];
        }
    });
}

function addProjectMarkers() {
    if (!map) return;
    
    projects.forEach(project => {
        if (project.coordinates) {
            const marker = L.marker(project.coordinates).addTo(map);
            marker.bindPopup(`
                <strong>${project.name}</strong><br>
                Location: ${project.location}<br>
                Status: ${project.status}<br>
                <small>Created: ${project.createdDate}</small>
            `);
        }
    });
}

function getDefaultLocation() {
    const setting = localStorage.getItem('defaultLocation');
    if (setting) {
        const [lat, lng] = setting.split(',').map(s => parseFloat(s.trim()));
        return [lat, lng];
    }
    return [40.7128, -74.0060]; // Default to NYC
}

function getDefaultZoom() {
    const setting = localStorage.getItem('defaultZoom');
    return setting ? parseInt(setting) : 10;
}

// Map tool functions
function addMarker() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    map.pm.enableDraw('Marker');
}

function drawPolygon() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    map.pm.enableDraw('Polygon');
}

function measureDistance() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    map.pm.enableDraw('Line');
}

function clearMap() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    map.pm.getGeomanLayers().forEach(layer => {
        map.removeLayer(layer);
    });
}

// Reports and Charts
function initializeReportsCharts() {
    initializeStatusChart();
    initializeProgressChart();
    initializeAnalyticsChart();
}

function initializeStatusChart() {
    const ctx = document.getElementById('status-chart');
    if (!ctx) return;
    
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    
    if (charts.status) {
        charts.status.destroy();
    }
    
    charts.status = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function initializeProgressChart() {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;
    
    // Generate monthly data based on project creation dates
    const monthlyData = generateMonthlyProgressData();
    
    if (charts.progress) {
        charts.progress.destroy();
    }
    
    charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Projects Created',
                data: monthlyData.data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializeAnalyticsChart() {
    const ctx = document.getElementById('analytics-chart');
    if (!ctx) return;
    
    // Create a comprehensive analytics chart
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    
    if (charts.analytics) {
        charts.analytics.destroy();
    }
    
    charts.analytics = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Number of Projects',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(243, 156, 18, 0.8)'
                ],
                borderColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateMonthlyProgressData() {
    const months = [];
    const data = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        
        // Count projects created in this month
        const count = projects.filter(project => {
            const projectDate = new Date(project.createdDate);
            return projectDate.getMonth() === date.getMonth() && 
                   projectDate.getFullYear() === date.getFullYear();
        }).length;
        
        data.push(count);
    }
    
    return { labels: months, data: data };
}

function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Engineering Project Platform Report', 20, 30);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Add summary statistics
    doc.setFontSize(16);
    doc.text('Summary Statistics', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Total Projects: ${projects.length}`, 20, 80);
    doc.text(`Mapped Locations: ${projects.filter(p => p.coordinates).length}`, 20, 95);
    
    // Add project status breakdown
    const statusCounts = projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
    }, {});
    
    doc.text('Project Status Breakdown:', 20, 115);
    let yPos = 130;
    Object.entries(statusCounts).forEach(([status, count]) => {
        doc.text(`${status}: ${count}`, 30, yPos);
        yPos += 15;
    });
    
    // Add projects table
    if (projects.length > 0) {
        doc.autoTable({
            startY: yPos + 10,
            head: [['Project Name', 'Location', 'Status', 'Created Date']],
            body: projects.map(p => [p.name, p.location, p.status, p.createdDate]),
            margin: { left: 20, right: 20 }
        });
    }
    
    // Save the PDF
    doc.save('engineering-project-report.pdf');
    showMessage('Report generated successfully!', 'success');
}

// Data Management
function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            currentData = results.data;
            renderDataTable(results.data, Object.keys(results.data[0] || {}));
            showMessage('CSV data imported successfully!', 'success');
        },
        error: function(error) {
            showMessage('Error parsing CSV: ' + error.message, 'error');
        }
    });
}

function renderDataTable(data, headers) {
    const headerRow = document.getElementById('data-table-header');
    const tbody = document.getElementById('data-table-body');
    
    if (!headerRow || !tbody) return;
    
    // Clear existing content
    headerRow.innerHTML = '';
    tbody.innerHTML = '';
    
    // Add headers
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    
    // Add data rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || '';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function exportCSV() {
    if (currentData.length === 0) {
        showMessage('No data to export. Please import CSV data first.', 'error');
        return;
    }
    
    const csv = Papa.unparse(currentData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported-data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('Data exported successfully!', 'success');
}

function exportData() {
    const data = {
        projects: projects,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'engineering-platform-data.json';
    link.click();
    window.URL.revokeObjectURL(url);
    
    showMessage('Platform data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data.projects && Array.isArray(data.projects)) {
                    projects = data.projects;
                    saveProjects();
                    updateDashboardStats();
                    renderProjectsTable();
                    showMessage('Platform data imported successfully!', 'success');
                } else {
                    showMessage('Invalid data format', 'error');
                }
            } catch (error) {
                showMessage('Error parsing file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Settings Management
function loadSettings() {
    const apiKey = localStorage.getItem('apiKey');
    const defaultLocation = localStorage.getItem('defaultLocation');
    const defaultZoom = localStorage.getItem('defaultZoom');
    const autoSave = localStorage.getItem('autoSave');
    
    if (apiKey) document.getElementById('api-key').value = apiKey;
    if (defaultLocation) document.getElementById('default-location').value = defaultLocation;
    if (defaultZoom) {
        document.getElementById('zoom-level').value = defaultZoom;
        document.getElementById('zoom-display').textContent = defaultZoom;
    }
    if (autoSave) document.getElementById('auto-save').checked = autoSave === 'true';
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    
    const apiKey = document.getElementById('api-key').value;
    const defaultLocation = document.getElementById('default-location').value;
    const zoomLevel = document.getElementById('zoom-level').value;
    const autoSave = document.getElementById('auto-save').checked;
    
    // Save settings to localStorage
    if (apiKey) localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('defaultLocation', defaultLocation);
    localStorage.setItem('defaultZoom', zoomLevel);
    localStorage.setItem('autoSave', autoSave.toString());
    
    showMessage('Settings saved successfully!', 'success');
}

// Utility Functions
function showMessage(text, type = 'success') {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    container.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Initialize charts when window loads
window.addEventListener('load', function() {
    // Initialize dashboard chart after a short delay to ensure DOM is ready
    setTimeout(() => {
        if (document.querySelector('.page.active')?.id === 'dashboard-page') {
            initializeDashboardChart();
        }
    }, 100);
});

// ===============================
// COMPREHENSIVE PLATFORM FUNCTIONS
// ===============================

// Global Menu Functions
function changeLanguage() {
    showMessage('Language selection feature will be implemented in future updates', 'info');
}

function newProject() {
    if (confirm('Are you sure you want to start a new project? All unsaved data will be lost.')) {
        currentProject = {
            name: 'New Project',
            contracts: [],
            inspections: [],
            costEstimations: [],
            aiResults: [],
            notebooks: [],
            drawings: [],
            settings: {}
        };
        document.getElementById('current-project-name').textContent = 'New Project';
        clearAllData();
        showMessage('New project created successfully!', 'success');
    }
}

function saveProject() {
    const projectData = {
        ...currentProject,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('currentEngineeringProject', JSON.stringify(projectData));
    showMessage('Project saved successfully!', 'success');
}

function exportJSON() {
    const projectData = {
        ...currentProject,
        contracts: contracts,
        boq: boqData,
        inspections: inspectionData,
        costEstimations: costEstimationData,
        aiResults: aiResults,
        notebooks: notebooks,
        drawings: drawings,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(projectData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${currentProject.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Project exported as JSON successfully!', 'success');
}

function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const projectData = JSON.parse(e.target.result);
                    
                    // Load project data
                    currentProject = projectData;
                    contracts = projectData.contracts || [];
                    boqData = projectData.boq || [];
                    inspectionData = projectData.inspections || [];
                    costEstimationData = projectData.costEstimations || [];
                    aiResults = projectData.aiResults || [];
                    notebooks = projectData.notebooks || [];
                    drawings = projectData.drawings || [];
                    
                    // Update UI
                    document.getElementById('current-project-name').textContent = currentProject.name || 'Imported Project';
                    
                    // Save to localStorage
                    saveAllData();
                    
                    showMessage('Project imported successfully!', 'success');
                } catch (error) {
                    showMessage('Error importing project: Invalid JSON file', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function importHTML() {
    showMessage('HTML import feature will be implemented in future updates', 'info');
}

function exportHTML() {
    showMessage('HTML export feature will be implemented in future updates', 'info');
}

// ===============================
// CONTRACTS & BOQ SYSTEM
// ===============================

function handleLogoUpload(event, previewId) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function handleBOQUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // For now, show a preview message
        showMessage('BOQ file uploaded. Excel parsing will be implemented in future updates.', 'info');
        document.getElementById('boq-preview').style.display = 'block';
        
        // Sample BOQ data for demonstration
        const sampleBOQ = [
            {ref: 'A001', asset: 'Road Surface', description: 'Asphalt overlay', unit: 'm²', rate: 45.50},
            {ref: 'A002', asset: 'Drainage', description: 'Storm drain installation', unit: 'm', rate: 125.00},
            {ref: 'A003', asset: 'Lighting', description: 'LED street light', unit: 'NR', rate: 850.00}
        ];
        
        populateBOQTable(sampleBOQ);
        boqData = sampleBOQ;
        populateBOQDropdown();
    }
}

function populateBOQTable(data) {
    const table = document.getElementById('boq-table');
    const header = document.getElementById('boq-table-header');
    const body = document.getElementById('boq-table-body');
    
    // Clear existing content
    header.innerHTML = '';
    body.innerHTML = '';
    
    if (data.length > 0) {
        // Create headers
        const headers = Object.keys(data[0]);
        const headerRow = header.insertRow();
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.toUpperCase();
            headerRow.appendChild(th);
        });
        
        // Populate data
        data.forEach(row => {
            const tr = body.insertRow();
            headers.forEach(header => {
                const td = tr.insertCell();
                td.textContent = row[header];
            });
        });
    }
}

function populateBOQDropdown() {
    const dropdown = document.getElementById('boq-reference');
    if (dropdown && boqData.length > 0) {
        dropdown.innerHTML = '<option value="">Select BOQ Reference</option>';
        boqData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.ref;
            option.textContent = `${item.ref} - ${item.description}`;
            option.dataset.asset = item.asset;
            option.dataset.unit = item.unit;
            option.dataset.rate = item.rate;
            option.dataset.description = item.description;
            dropdown.appendChild(option);
        });
    }
}

function autofillBOQData() {
    const dropdown = document.getElementById('boq-reference');
    const selectedOption = dropdown.options[dropdown.selectedIndex];
    
    if (selectedOption && selectedOption.value) {
        document.getElementById('boq-asset').value = selectedOption.dataset.asset || '';
        document.getElementById('boq-unit').value = selectedOption.dataset.unit || '';
        document.getElementById('boq-rate').value = selectedOption.dataset.rate || '';
        document.getElementById('boq-description').value = selectedOption.dataset.description || '';
    }
}

function saveContract() {
    const contract = {
        id: Date.now().toString(),
        title: document.getElementById('contract-title').value,
        number: document.getElementById('contract-number').value,
        value: document.getElementById('project-value').value,
        companyName: document.getElementById('company-name').value,
        clientName: document.getElementById('client-name').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        companyLogo: document.getElementById('company-logo-preview').src,
        clientLogo: document.getElementById('client-logo-preview').src,
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    contracts.push(contract);
    localStorage.setItem('engineeringContracts', JSON.stringify(contracts));
    
    showMessage('Contract saved successfully!', 'success');
    renderContractsList();
}

function renderContractsList() {
    const container = document.getElementById('contracts-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    contracts.forEach(contract => {
        const contractCard = document.createElement('div');
        contractCard.className = 'contract-card';
        contractCard.innerHTML = `
            <h6>${contract.title}</h6>
            <p><strong>Contract #:</strong> ${contract.number}</p>
            <p><strong>Value:</strong> $${parseFloat(contract.value || 0).toLocaleString()}</p>
            <p><strong>Client:</strong> ${contract.clientName}</p>
            <div class="mt-3">
                <button class="btn btn-sm btn-primary" onclick="editContract('${contract.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContract('${contract.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(contractCard);
    });
}

function downloadBOQTemplate() {
    const csvContent = "BOQ Ref.,Asset,Description,Unit,Rate\nA001,Road Surface,Asphalt overlay,m²,45.50\nA002,Drainage,Storm drain installation,m,125.00\nA003,Lighting,LED street light,NR,850.00";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'BOQ_Template.csv';
    link.click();
    showMessage('BOQ template downloaded successfully!', 'success');
}

// ===============================
// INSPECTION REPORTS SYSTEM
// ===============================

function switchLocationMode(mode) {
    // Hide all panels
    document.querySelectorAll('.location-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.location-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected panel and activate button
    document.getElementById(`location-panel-${mode}`).style.display = 'block';
    event.target.classList.add('active');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                document.getElementById('current-location-display').textContent = `Location: ${lat}, ${lng}`;
                document.getElementById('insert-location-btn').style.display = 'block';
                
                // Store coordinates for insertion
                window.currentCoordinates = {lat, lng};
            },
            error => {
                showMessage('Error getting location: ' + error.message, 'error');
            }
        );
    } else {
        showMessage('Geolocation is not supported by this browser', 'error');
    }
}

function insertLocationToTable() {
    if (window.currentCoordinates) {
        showMessage('Location will be added to the next table entry', 'success');
    }
}

function handlePhotoUpload(event) {
    const files = event.target.files;
    const previewContainer = document.getElementById('photo-previews');
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.onclick = () => openPhotoModal(e.target.result);
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function openCamera() {
    showMessage('Camera integration will be implemented in future updates', 'info');
}

function addInspectionEntry() {
    const entry = {
        id: Date.now().toString(),
        assetId: document.getElementById('asset-id').value,
        assetType: document.getElementById('asset-type').value,
        location: document.getElementById('asset-location').value,
        inspector: document.getElementById('inspector-name').value,
        inspectorId: document.getElementById('inspector-id').value,
        team: document.getElementById('inspection-team').value,
        photos: Array.from(document.getElementById('photo-previews').children).map(img => img.src),
        coordinates: window.currentCoordinates || null,
        date: new Date().toISOString().split('T')[0],
        notes: ''
    };
    
    inspectionData.push(entry);
    localStorage.setItem('engineeringInspections', JSON.stringify(inspectionData));
    
    renderInspectionTable();
    clearInspectionForm();
    showMessage('Inspection entry added successfully!', 'success');
}

function renderInspectionTable() {
    const tbody = document.getElementById('inspection-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    inspectionData.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.assetId}</td>
            <td>${entry.assetType}</td>
            <td>${entry.location}</td>
            <td>${entry.inspector}</td>
            <td>
                <div class="photo-wrapper">
                    ${entry.photos.map(photo => `<img src="${photo}" onclick="openPhotoModal('${photo}')" />`).join('')}
                </div>
            </td>
            <td>${entry.coordinates ? `${entry.coordinates.lat}, ${entry.coordinates.lng}` : 'Not recorded'}</td>
            <td contenteditable="true" onblur="updateInspectionNotes(${index}, this.textContent)">${entry.notes}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteInspectionEntry(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function clearInspectionForm() {
    document.getElementById('asset-id').value = '';
    document.getElementById('asset-type').value = '';
    document.getElementById('asset-location').value = '';
    document.getElementById('inspector-name').value = '';
    document.getElementById('inspector-id').value = '';
    document.getElementById('inspection-team').value = '';
    document.getElementById('photo-previews').innerHTML = '';
    window.currentCoordinates = null;
    document.getElementById('current-location-display').textContent = 'Location: Not detected';
    document.getElementById('insert-location-btn').style.display = 'none';
}

// ===============================
// COST ESTIMATION SYSTEM
// ===============================

function openCalculator() {
    // Simple calculator popup
    const dimensions = prompt('Enter dimensions (L x W x H) or quantity:');
    if (dimensions) {
        const quantity = calculateQuantity(dimensions);
        document.getElementById('boq-quantity').value = quantity;
        showMessage('Quantity calculated and entered', 'success');
    }
}

function calculateQuantity(input) {
    // Smart unit calculation
    const parts = input.split('x').map(p => parseFloat(p.trim()));
    
    if (parts.length === 1) {
        return parts[0]; // Single number (NR)
    } else if (parts.length === 2) {
        return parts[0] * parts[1]; // Area (m²)
    } else if (parts.length === 3) {
        return parts[0] * parts[1] * parts[2]; // Volume (m³)
    }
    
    return parseFloat(input) || 0;
}

function addCostEstimationEntry() {
    const quantity = parseFloat(document.getElementById('boq-quantity').value) || 0;
    const rate = parseFloat(document.getElementById('boq-rate').value) || 0;
    const amount = quantity * rate;
    
    const entry = {
        id: Date.now().toString(),
        boqRef: document.getElementById('boq-reference').value,
        description: document.getElementById('boq-description').value,
        asset: document.getElementById('boq-asset').value,
        unit: document.getElementById('boq-unit').value,
        quantity: quantity,
        rate: rate,
        amount: amount,
        date: new Date().toISOString().split('T')[0]
    };
    
    costEstimationData.push(entry);
    localStorage.setItem('engineeringCostEstimations', JSON.stringify(costEstimationData));
    
    renderCostEstimationTable();
    clearCostEstimationForm();
    showMessage('Cost estimation entry added successfully!', 'success');
}

function renderCostEstimationTable() {
    const tbody = document.getElementById('cost-estimation-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    let totalCost = 0;
    
    costEstimationData.forEach((entry, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.boqRef}</td>
            <td class="description-cell">${entry.description}</td>
            <td>${entry.asset}</td>
            <td>${entry.unit}</td>
            <td>${entry.quantity.toFixed(2)}</td>
            <td>${entry.rate.toFixed(2)}</td>
            <td>${entry.amount.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteCostEstimationEntry(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        totalCost += entry.amount;
    });
    
    // Update total
    document.getElementById('total-cost').textContent = totalCost.toFixed(2);
}

function clearCostEstimationForm() {
    document.getElementById('boq-reference').value = '';
    document.getElementById('boq-description').value = '';
    document.getElementById('boq-asset').value = '';
    document.getElementById('boq-unit').value = '';
    document.getElementById('boq-quantity').value = '';
    document.getElementById('boq-rate').value = '';
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

function saveAllData() {
    localStorage.setItem('engineeringContracts', JSON.stringify(contracts));
    localStorage.setItem('engineeringBOQ', JSON.stringify(boqData));
    localStorage.setItem('engineeringInspections', JSON.stringify(inspectionData));
    localStorage.setItem('engineeringCostEstimations', JSON.stringify(costEstimationData));
    localStorage.setItem('engineeringAIResults', JSON.stringify(aiResults));
    localStorage.setItem('engineeringNotebooks', JSON.stringify(notebooks));
}

function clearAllData() {
    contracts = [];
    boqData = [];
    inspectionData = [];
    costEstimationData = [];
    aiResults = [];
    notebooks = [];
    drawings = [];
    
    saveAllData();
}

// ===============================
// AI DETECTION FUNCTIONS
// ===============================

function handleAIImageUpload(event) {
    const files = event.target.files;
    showMessage('AI analysis will be implemented in future updates. Images uploaded for demo.', 'info');
    
    // Demo AI results
    Array.from(files).forEach(file => {
        const result = {
            id: Date.now().toString() + Math.random(),
            image: URL.createObjectURL(file),
            filename: file.name,
            coordinates: '25.2048° N, 55.2708° E',
            timestamp: new Date().toLocaleString(),
            defects: ['Surface cracking', 'Pothole'],
            severity: 'Medium',
            action: 'Schedule repair within 30 days'
        };
        
        aiResults.push(result);
    });
    
    renderAIResultsTable();
}

function renderAIResultsTable() {
    const tbody = document.getElementById('ai-results-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    aiResults.forEach(result => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><img src="${result.image}" style="max-width: 100px; max-height: 100px; object-fit: cover;" /></td>
            <td>${result.coordinates}</td>
            <td>${result.timestamp}</td>
            <td>${result.defects.join(', ')}</td>
            <td><span class="status-badge status-${result.severity.toLowerCase()}">${result.severity}</span></td>
            <td>${result.action}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAIResult('${result.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

// ===============================
// ADDITIONAL PLACEHOLDER FUNCTIONS
// ===============================

// Functions that will be implemented in future iterations
function printInspectionReport() { showMessage('Print functionality will be implemented', 'info'); }
function exportPhotos() { showMessage('Photo export will be implemented', 'info'); }
function exportKML() { showMessage('KML export will be implemented', 'info'); }
function exportInspectionCSV() { showMessage('CSV export will be implemented', 'info'); }
function newReport() { showMessage('New report functionality will be implemented', 'info'); }
function clearInspectionData() { inspectionData = []; renderInspectionTable(); showMessage('Inspection data cleared', 'success'); }
function printCostEstimation() { showMessage('Print functionality will be implemented', 'info'); }
function exportCostCSV() { showMessage('CSV export will be implemented', 'info'); }
function newCostEstimation() { showMessage('New estimation functionality will be implemented', 'info'); }
function clearCostData() { costEstimationData = []; renderCostEstimationTable(); showMessage('Cost data cleared', 'success'); }
function importMapData() { showMessage('Map import will be implemented', 'info'); }
function exportMapData() { showMessage('Map export will be implemented', 'info'); }
function printMap() { showMessage('Map print will be implemented', 'info'); }
function exportAIResults(format) { showMessage(`AI results export (${format}) will be implemented`, 'info'); }
function createNewNote() { showMessage('Note creation will be implemented', 'info'); }
function searchNotes() { showMessage('Note search will be implemented', 'info'); }
function filterNotesByTag() { showMessage('Note filtering will be implemented', 'info'); }
function selectDrawingTool(tool) { showMessage(`Drawing tool (${tool}) will be implemented`, 'info'); }
function loadBackgroundImage() { showMessage('Background image loading will be implemented', 'info'); }
function saveDrawing() { showMessage('Drawing save will be implemented', 'info'); }
function clearDrawing() { showMessage('Drawing clear will be implemented', 'info'); }
function selectTemplate(template) { showMessage(`Template (${template}) will be implemented`, 'info'); }
function generateCustomReport() { showMessage('Custom report generation will be implemented', 'info'); }
