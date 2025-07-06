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

// Supabase configuration
const supabaseUrl = 'https://cykjjrrexaqmsqwrgnzp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5a2pqcnJleGFxbXNxd3JnbnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MjUyMDksImV4cCI6MjA2NzIwMTIwOX0.Fx6f23TWCQQMCIkc5hcx8LqHyskVMm6WAhJl1UFZpMA';

// Initialize Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Current user state
let currentUser = null;
let isSignUpMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Check authentication state
    await checkAuthState();
    
    // Set up auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            await onUserSignedIn();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            onUserSignedOut();
        }
    });
    
    // If user is authenticated, load data
    if (currentUser) {
        await loadDataFromDatabase();
    } else {
        // Load fallback local data for demonstration
        loadProjects();
        loadSettings();
        loadAllData();
    }
    
    // Initialize dashboard
    updateDashboardStats();
    initializeDashboardChart();
    
    // Set default dates
    setDefaultDates();
    
    // Initialize event listeners
    setupEventListeners();
    setupAuthEventListeners();
    
    // Show welcome message
    if (currentUser) {
        showMessage(`Welcome back, ${currentUser.user_metadata?.username || currentUser.email}!`, 'success');
    } else {
        showMessage('Welcome to Engineering Project Platform - Sign in to sync your data', 'info');
    }
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

    // Enhanced settings event listeners
    setupEnhancedEventListeners();
}

function setupEnhancedEventListeners() {
    // AI Confidence slider
    const aiConfidenceSlider = document.getElementById('ai-confidence-threshold');
    if (aiConfidenceSlider) {
        aiConfidenceSlider.addEventListener('input', function() {
            const display = document.getElementById('confidence-display');
            if (display) display.textContent = this.value;
        });
    }

    // Theme changes
    const darkModeToggle = document.getElementById('dark-mode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            localStorage.setItem('darkMode', this.checked.toString());
            applyThemeSettings();
        });
    }

    const fontSizeSelect = document.getElementById('font-size');
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function() {
            localStorage.setItem('fontSize', this.value);
            applyThemeSettings();
        });
    }

    const enableAnimationsToggle = document.getElementById('enable-animations');
    if (enableAnimationsToggle) {
        enableAnimationsToggle.addEventListener('change', function() {
            localStorage.setItem('enableAnimations', this.checked.toString());
            applyThemeSettings();
        });
    }

    const highContrastToggle = document.getElementById('high-contrast');
    if (highContrastToggle) {
        highContrastToggle.addEventListener('change', function() {
            localStorage.setItem('highContrast', this.checked.toString());
            applyThemeSettings();
        });
    }

    // Custom background upload
    const customBackgroundInput = document.getElementById('custom-background');
    if (customBackgroundInput) {
        customBackgroundInput.addEventListener('change', handleCustomBackground);
    }

    // Touch-friendly toggle
    const touchFriendlyToggle = document.getElementById('touch-friendly');
    if (touchFriendlyToggle) {
        touchFriendlyToggle.addEventListener('change', function() {
            localStorage.setItem('touchFriendly', this.checked.toString());
            if (this.checked) {
                document.body.classList.add('touch-friendly');
            } else {
                document.body.classList.remove('touch-friendly');
            }
        });
    }

    // Apply touch-friendly settings immediately
    const touchFriendly = localStorage.getItem('touchFriendly') !== 'false';
    if (touchFriendly) {
        document.body.classList.add('touch-friendly');
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

// ===============================
// ENHANCED SETTINGS MANAGEMENT
// ===============================

function saveAllSettings() {
    // Basic settings
    const apiKey = document.getElementById('api-key').value;
    const defaultLocation = document.getElementById('default-location').value;
    const zoomLevel = document.getElementById('zoom-level').value;
    const autoSave = document.getElementById('auto-save').checked;

    // AI settings
    const aiPrompt = document.getElementById('ai-prompt').value;
    const aiConfidence = document.getElementById('ai-confidence-threshold').value;

    // Theme settings
    const uiTheme = document.getElementById('ui-theme').value;
    const fontSize = document.getElementById('font-size').value;
    const enableAnimations = document.getElementById('enable-animations').checked;
    const darkMode = document.getElementById('dark-mode').checked;

    // Mobile settings
    const mobileMenuStyle = document.getElementById('mobile-menu-style').value;
    const touchFriendly = document.getElementById('touch-friendly').checked;
    const highContrast = document.getElementById('high-contrast').checked;

    // Storage settings
    const localDownloadPath = document.getElementById('local-download-path').value;
    const fileNamingFormat = document.getElementById('file-naming-format').value;
    const autoBackupInterval = document.getElementById('auto-backup-interval').value;

    // Save to localStorage
    if (apiKey) localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('defaultLocation', defaultLocation);
    localStorage.setItem('defaultZoom', zoomLevel);
    localStorage.setItem('autoSave', autoSave.toString());
    
    // AI settings
    localStorage.setItem('aiPrompt', aiPrompt);
    localStorage.setItem('aiConfidence', aiConfidence);
    
    // Theme settings
    localStorage.setItem('uiTheme', uiTheme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('enableAnimations', enableAnimations.toString());
    localStorage.setItem('darkMode', darkMode.toString());
    
    // Mobile settings
    localStorage.setItem('mobileMenuStyle', mobileMenuStyle);
    localStorage.setItem('touchFriendly', touchFriendly.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    
    // Storage settings
    localStorage.setItem('localDownloadPath', localDownloadPath);
    localStorage.setItem('fileNamingFormat', fileNamingFormat);
    localStorage.setItem('autoBackupInterval', autoBackupInterval);

    // Apply theme changes immediately
    applyThemeSettings();
    
    showMessage('All settings saved successfully!', 'success');
}

function loadSettings() {
    // Basic settings
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

    // Load enhanced settings
    loadAISettings();
    loadThemeSettings();
    loadMobileSettings();
    loadStorageSettings();
    
    // Apply settings
    applyThemeSettings();
}

function loadAISettings() {
    const aiPrompt = localStorage.getItem('aiPrompt');
    const aiConfidence = localStorage.getItem('aiConfidence');
    
    if (aiPrompt && document.getElementById('ai-prompt')) {
        document.getElementById('ai-prompt').value = aiPrompt;
    }
    if (aiConfidence) {
        const slider = document.getElementById('ai-confidence-threshold');
        const display = document.getElementById('confidence-display');
        if (slider) {
            slider.value = aiConfidence;
            if (display) display.textContent = aiConfidence;
        }
    }
}

function loadThemeSettings() {
    const uiTheme = localStorage.getItem('uiTheme') || 'light';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const enableAnimations = localStorage.getItem('enableAnimations') !== 'false';
    const darkMode = localStorage.getItem('darkMode') === 'true';

    if (document.getElementById('ui-theme')) document.getElementById('ui-theme').value = uiTheme;
    if (document.getElementById('font-size')) document.getElementById('font-size').value = fontSize;
    if (document.getElementById('enable-animations')) document.getElementById('enable-animations').checked = enableAnimations;
    if (document.getElementById('dark-mode')) document.getElementById('dark-mode').checked = darkMode;
}

function loadMobileSettings() {
    const mobileMenuStyle = localStorage.getItem('mobileMenuStyle') || 'hamburger';
    const touchFriendly = localStorage.getItem('touchFriendly') !== 'false';
    const highContrast = localStorage.getItem('highContrast') === 'true';

    if (document.getElementById('mobile-menu-style')) document.getElementById('mobile-menu-style').value = mobileMenuStyle;
    if (document.getElementById('touch-friendly')) document.getElementById('touch-friendly').checked = touchFriendly;
    if (document.getElementById('high-contrast')) document.getElementById('high-contrast').checked = highContrast;
}

function loadStorageSettings() {
    const localDownloadPath = localStorage.getItem('localDownloadPath') || '/Downloads/EngineeringPlatform/';
    const fileNamingFormat = localStorage.getItem('fileNamingFormat') || 'contract-timestamp';
    const autoBackupInterval = localStorage.getItem('autoBackupInterval') || 'none';

    if (document.getElementById('local-download-path')) document.getElementById('local-download-path').value = localDownloadPath;
    if (document.getElementById('file-naming-format')) document.getElementById('file-naming-format').value = fileNamingFormat;
    if (document.getElementById('auto-backup-interval')) document.getElementById('auto-backup-interval').value = autoBackupInterval;
}

function applyThemeSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const enableAnimations = localStorage.getItem('enableAnimations') !== 'false';
    const highContrast = localStorage.getItem('highContrast') === 'true';

    // Apply dark mode
    if (darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Apply font size
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);

    // Apply animations
    if (!enableAnimations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }

    // Apply high contrast
    if (highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
}

function handleCustomBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            localStorage.setItem('customBackground', imageData);
            document.body.style.backgroundImage = `url(${imageData})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
            showMessage('Custom background applied successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
        // Clear all settings from localStorage
        const settingsKeys = [
            'apiKey', 'defaultLocation', 'defaultZoom', 'autoSave',
            'aiPrompt', 'aiConfidence', 'uiTheme', 'fontSize', 
            'enableAnimations', 'darkMode', 'mobileMenuStyle', 
            'touchFriendly', 'highContrast', 'localDownloadPath', 
            'fileNamingFormat', 'autoBackupInterval', 'customBackground'
        ];
        
        settingsKeys.forEach(key => localStorage.removeItem(key));
        
        // Reset UI to defaults
        document.body.className = '';
        document.body.style.backgroundImage = '';
        
        // Reload settings forms
        loadSettings();
        
        showMessage('All settings have been reset to defaults!', 'success');
    }
}

function getAIPrompt() {
    return localStorage.getItem('aiPrompt') || document.getElementById('ai-prompt')?.value || 
           'Analyze this civil engineering image for defects and provide severity ratings with recommended actions.';
}

function getFileNamingFormat() {
    const format = localStorage.getItem('fileNamingFormat') || 'contract-timestamp';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    
    switch (format) {
        case 'timestamp-contract':
            return `${timestamp}_CONTRACT-XXXX_Type`;
        case 'simple':
            return `Type_${timestamp}`;
        default:
            return `CONTRACT-XXXX_Type_${timestamp}`;
    }
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
    const aiPrompt = getAIPrompt();
    const confidenceThreshold = localStorage.getItem('aiConfidence') || 0.7;
    
    showMessage(`Processing ${files.length} image(s) with AI analysis...`, 'info');
    
    // Enhanced AI analysis simulation using custom prompt
    Array.from(files).forEach((file, index) => {
        // Simulate processing delay
        setTimeout(() => {
            const result = generateAIAnalysis(file, aiPrompt, confidenceThreshold);
            aiResults.push(result);
            renderAIResultsTable();
            
            if (index === files.length - 1) {
                showMessage(`AI analysis complete! Found ${result.defects.length} potential issues.`, 'success');
            }
        }, index * 1000);
    });
}

function generateAIAnalysis(file, prompt, confidenceThreshold) {
    // Extract defect types from custom prompt
    const defectPatterns = [
        'road surface cracks', 'potholes', 'structural damage', 
        'drainage issues', 'water damage', 'paint fading', 
        'corrosion', 'safety hazards', 'erosion', 'foundation issues'
    ];
    
    // Simulate AI detection based on confidence threshold
    const detectedDefects = defectPatterns.filter(() => Math.random() > (1 - parseFloat(confidenceThreshold)));
    
    // Generate severity based on number of defects
    let severity = 'Low';
    if (detectedDefects.length > 3) severity = 'High';
    else if (detectedDefects.length > 1) severity = 'Medium';
    
    // Generate GPS coordinates (simulated)
    const lat = (25.2048 + (Math.random() - 0.5) * 0.01).toFixed(6);
    const lng = (55.2708 + (Math.random() - 0.5) * 0.01).toFixed(6);
    
    // Generate action based on prompt analysis
    let recommendedAction = 'Monitor condition';
    if (severity === 'High') recommendedAction = 'Immediate repair required';
    else if (severity === 'Medium') recommendedAction = 'Schedule repair within 30 days';
    
    return {
        id: Date.now().toString() + Math.random(),
        image: URL.createObjectURL(file),
        filename: file.name,
        coordinates: `${lat}° N, ${lng}° E`,
        timestamp: new Date().toLocaleString(),
        defects: detectedDefects.length > 0 ? detectedDefects : ['No significant defects detected'],
        severity: severity,
        action: recommendedAction,
        confidence: confidenceThreshold,
        promptUsed: prompt.substring(0, 100) + '...',
        analysisDetails: {
            processingTime: Math.round(Math.random() * 3000 + 1000) + 'ms',
            resolution: '1920x1080',
            fileSize: Math.round(file.size / 1024) + 'KB'
        }
    };
}

// Mobile menu functionality
function toggleMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.classList.toggle('active');
        document.body.classList.toggle('hamburger-menu-active');
        sidebar.classList.toggle('show');
    }
}

// Enhanced AI functionality integration
function updateAISettings() {
    const aiPrompt = document.getElementById('ai-prompt').value;
    const aiConfidence = document.getElementById('ai-confidence-threshold').value;
    
    if (aiPrompt) {
        localStorage.setItem('aiPrompt', aiPrompt);
        showMessage('AI prompt updated successfully!', 'success');
    }
    
    if (aiConfidence) {
        localStorage.setItem('aiConfidence', aiConfidence);
        showMessage(`AI confidence threshold set to ${aiConfidence}`, 'success');
    }
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

// ===============================
// SUPABASE AUTHENTICATION & DATABASE
// ===============================

async function checkAuthState() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        currentUser = user;
        
        if (currentUser) {
            await ensureUserProfile();
            showUserProfile();
        } else {
            showAuthModal();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAuthModal();
    }
}

function setupAuthEventListeners() {
    // Auth form submission
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Toggle between sign in and sign up
    const authToggle = document.getElementById('auth-toggle');
    if (authToggle) {
        authToggle.addEventListener('click', toggleAuthMode);
    }
}

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleBtn = document.getElementById('auth-toggle');
    const usernameField = document.getElementById('username-field');
    const confirmPasswordField = document.getElementById('confirm-password-field');
    const companyField = document.getElementById('company-field');

    if (isSignUpMode) {
        title.textContent = 'Create Account';
        submitBtn.textContent = 'Sign Up';
        toggleBtn.textContent = 'Already have an account? Sign in';
        usernameField.style.display = 'block';
        confirmPasswordField.style.display = 'block';
        companyField.style.display = 'block';
    } else {
        title.textContent = 'Sign In to Engineering Platform';
        submitBtn.textContent = 'Sign In';
        toggleBtn.textContent = "Don't have an account? Sign up";
        usernameField.style.display = 'none';
        confirmPasswordField.style.display = 'none';
        companyField.style.display = 'none';
    }
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const username = document.getElementById('auth-username').value;
    const company = document.getElementById('auth-company').value;
    const confirmPassword = document.getElementById('auth-confirm-password').value;
    
    const errorDiv = document.getElementById('auth-error');
    errorDiv.style.display = 'none';

    try {
        if (isSignUpMode) {
            // Validate passwords match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Sign up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username || email.split('@')[0],
                        company: company || '',
                        full_name: username || ''
                    }
                }
            });

            if (error) throw error;

            showMessage('Account created! Please check your email to verify your account.', 'success');
            hideAuthModal();
            
        } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            showMessage('Signed in successfully!', 'success');
            hideAuthModal();
        }
    } catch (error) {
        console.error('Auth error:', error);
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'flex';
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

async function ensureUserProfile() {
    if (!currentUser) return;

    try {
        // Check if user profile exists
        const { data: existingUser, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        if (!existingUser) {
            // Create user profile
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: currentUser.id,
                    username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'user',
                    full_name: currentUser.user_metadata?.full_name || '',
                    company: currentUser.user_metadata?.company || '',
                    role: 'engineer'
                }]);

            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error('Error ensuring user profile:', error);
    }
}

function showUserProfile() {
    if (!currentUser) return;
    
    const userProfile = document.getElementById('user-profile');
    const userAvatar = document.getElementById('user-avatar');
    const userDisplayName = document.getElementById('user-display-name');
    const userCompany = document.getElementById('user-company');

    const username = currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'User';
    const company = currentUser.user_metadata?.company || 'Engineering Platform';

    userAvatar.textContent = username.charAt(0).toUpperCase();
    userDisplayName.textContent = username;
    userCompany.textContent = company;
    
    userProfile.style.display = 'block';
}

function hideUserProfile() {
    document.getElementById('user-profile').style.display = 'none';
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        showMessage('Signed out successfully!', 'success');
    } catch (error) {
        console.error('Sign out error:', error);
        showMessage('Error signing out: ' + error.message, 'error');
    }
}

async function onUserSignedIn() {
    await ensureUserProfile();
    showUserProfile();
    await loadDataFromDatabase();
    showMessage('Data synced from database!', 'success');
}

function onUserSignedOut() {
    hideUserProfile();
    // Clear data and show auth modal
    contracts = [];
    boqData = [];
    inspectionData = [];
    costEstimationData = [];
    aiResults = [];
    notebooks = [];
    
    // Reload from localStorage as fallback
    loadProjects();
    loadSettings();
    loadAllData();
    
    showAuthModal();
}

async function loadDataFromDatabase() {
    if (!currentUser) return;

    try {
        // Load all data from Supabase
        const [
            projectsData,
            contractsData,
            boqDataFromDB,
            inspectionsData,
            costEstimationsData,
            aiResultsData,
            notebooksData,
            settingsData
        ] = await Promise.all([
            supabase.from('projects').select('*').eq('user_id', currentUser.id),
            supabase.from('contracts').select('*').eq('user_id', currentUser.id),
            supabase.from('boq').select('*').eq('user_id', currentUser.id),
            supabase.from('inspections').select('*').eq('user_id', currentUser.id),
            supabase.from('cost_estimations').select('*').eq('user_id', currentUser.id),
            supabase.from('ai_results').select('*').eq('user_id', currentUser.id),
            supabase.from('notebooks').select('*').eq('user_id', currentUser.id),
            supabase.from('settings').select('*').eq('user_id', currentUser.id)
        ]);

        // Update global variables
        if (projectsData.data) projects = projectsData.data;
        if (contractsData.data) contracts = contractsData.data;
        if (boqDataFromDB.data) boqData = boqDataFromDB.data;
        if (inspectionsData.data) inspectionData = inspectionsData.data;
        if (costEstimationsData.data) costEstimationData = costEstimationsData.data;
        if (aiResultsData.data) aiResults = aiResultsData.data;
        if (notebooksData.data) notebooks = notebooksData.data;

        // Apply settings
        if (settingsData.data) {
            settingsData.data.forEach(setting => {
                localStorage.setItem(setting.key, setting.value);
            });
            loadSettings();
            applyThemeSettings();
        }

        // Update UI
        renderProjectsTable();
        renderContractsList();
        populateBOQDropdown();
        renderInspectionTable();
        renderCostEstimationTable();
        renderAIResultsTable();
        updateDashboardStats();

    } catch (error) {
        console.error('Error loading data from database:', error);
        showMessage('Error loading data from database. Using local data.', 'warning');
    }
}

async function syncToDatabase(tableName, data, additionalData = {}) {
    if (!currentUser) {
        // Fallback to localStorage if not authenticated
        localStorage.setItem(`engineering${tableName}`, JSON.stringify(data));
        return;
    }

    try {
        const dataToInsert = {
            ...additionalData,
            user_id: currentUser.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { data: result, error } = await supabase
            .from(tableName.toLowerCase())
            .insert([dataToInsert])
            .select()
            .single();

        if (error) throw error;
        return result;
    } catch (error) {
        console.error(`Error syncing to ${tableName}:`, error);
        showMessage(`Error saving to database: ${error.message}`, 'error');
        // Fallback to localStorage
        localStorage.setItem(`engineering${tableName}`, JSON.stringify(data));
        throw error;
    }
}

// Override existing save functions to use database
async function saveContract() {
    const contract = {
        contract_number: document.getElementById('contract-number').value,
        title: document.getElementById('contract-title').value,
        value: parseFloat(document.getElementById('project-value').value) || 0,
        company_name: document.getElementById('company-name').value,
        client_name: document.getElementById('client-name').value,
        start_date: document.getElementById('start-date').value,
        end_date: document.getElementById('end-date').value,
        company_logo: document.getElementById('company-logo-preview').src,
        client_logo: document.getElementById('client-logo-preview').src
    };

    try {
        const result = await syncToDatabase('contracts', contract, contract);
        contracts.push(result);
        showMessage('Contract saved successfully!', 'success');
        renderContractsList();
    } catch (error) {
        // Error already handled in syncToDatabase
    }
}

async function addInspectionEntry() {
    const entry = {
        asset_id: document.getElementById('asset-id').value,
        asset_type: document.getElementById('asset-type').value,
        location: document.getElementById('asset-location').value,
        inspector: document.getElementById('inspector-name').value,
        inspector_id: document.getElementById('inspector-id').value,
        team: document.getElementById('inspection-team').value,
        photos: Array.from(document.getElementById('photo-previews').children).map(img => img.src),
        coordinates: window.currentCoordinates ? `${window.currentCoordinates.lat},${window.currentCoordinates.lng}` : null,
        inspection_date: new Date().toISOString().split('T')[0],
        notes: ''
    };

    try {
        const result = await syncToDatabase('inspections', entry, entry);
        inspectionData.push(result);
        renderInspectionTable();
        clearInspectionForm();
        showMessage('Inspection entry added successfully!', 'success');
    } catch (error) {
        // Error already handled in syncToDatabase
    }
}

async function addCostEstimationEntry() {
    const quantity = parseFloat(document.getElementById('boq-quantity').value) || 0;
    const rate = parseFloat(document.getElementById('boq-rate').value) || 0;
    const amount = quantity * rate;
    
    const entry = {
        boq_ref: document.getElementById('boq-reference').value,
        description: document.getElementById('boq-description').value,
        asset: document.getElementById('boq-asset').value,
        unit: document.getElementById('boq-unit').value,
        quantity: quantity,
        rate: rate,
        amount: amount
    };

    try {
        const result = await syncToDatabase('cost_estimations', entry, entry);
        costEstimationData.push(result);
        renderCostEstimationTable();
        clearCostEstimationForm();
        showMessage('Cost estimation entry added successfully!', 'success');
    } catch (error) {
        // Error already handled in syncToDatabase
    }
}

// Enhanced settings with database sync
async function saveAllSettings() {
    // Basic settings
    const settings = {
        apiKey: document.getElementById('api-key').value,
        defaultLocation: document.getElementById('default-location').value,
        defaultZoom: document.getElementById('zoom-level').value,
        autoSave: document.getElementById('auto-save').checked,
        aiPrompt: document.getElementById('ai-prompt').value,
        aiConfidence: document.getElementById('ai-confidence-threshold').value,
        uiTheme: document.getElementById('ui-theme').value,
        fontSize: document.getElementById('font-size').value,
        enableAnimations: document.getElementById('enable-animations').checked,
        darkMode: document.getElementById('dark-mode').checked,
        mobileMenuStyle: document.getElementById('mobile-menu-style').value,
        touchFriendly: document.getElementById('touch-friendly').checked,
        highContrast: document.getElementById('high-contrast').checked,
        localDownloadPath: document.getElementById('local-download-path').value,
        fileNamingFormat: document.getElementById('file-naming-format').value,
        autoBackupInterval: document.getElementById('auto-backup-interval').value
    };

    // Save to localStorage for immediate use
    Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'boolean' ? value.toString() : value);
    });

    // Save to database if authenticated
    if (currentUser) {
        try {
            const promises = Object.entries(settings).map(([key, value]) => 
                supabase.from('settings').upsert({
                    user_id: currentUser.id,
                    key: key,
                    value: typeof value === 'boolean' ? value.toString() : value,
                    category: getSettingCategory(key)
                })
            );
            
            await Promise.all(promises);
            showMessage('Settings saved to database successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings to database:', error);
            showMessage('Settings saved locally. Database sync failed.', 'warning');
        }
    } else {
        showMessage('Settings saved locally. Sign in to sync across devices.', 'info');
    }

    // Apply theme changes immediately
    applyThemeSettings();
}

function getSettingCategory(key) {
    if (['aiPrompt', 'aiConfidence'].includes(key)) return 'ai';
    if (['uiTheme', 'fontSize', 'enableAnimations', 'darkMode'].includes(key)) return 'theme';
    if (['mobileMenuStyle', 'touchFriendly', 'highContrast'].includes(key)) return 'accessibility';
    if (['localDownloadPath', 'fileNamingFormat', 'autoBackupInterval'].includes(key)) return 'storage';
    return 'general';
}
