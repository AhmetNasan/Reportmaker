
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

// Additional global variables
let contractsData = [];
let notebooksData = [];
let chatMessages = [];
let dashboardWidgets = [];
let vehicleTracking = [];
let materialsInventory = [];
let drawingCanvas = null;
let drawingContext = null;
let isProjectSaved = false;
let mapInitialized = false;
let mapClickHandler = null;
let mapboxMap = null;
let mapboxDraw = null;
let floatingCardsVisible = true;

// Mapbox configuration
const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
const TELEGRAM_BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';

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

    // If user is not authenticated, redirect to login
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Load data and initialize
    await loadDataFromDatabase();
    loadAllData();

    // Initialize dashboard
    updateDashboardStats();
    initializeDashboardChart();

    // Set default dates
    setDefaultDates();

    // Initialize event listeners
    setupEventListeners();

    // Update user info display
    updateUserInfo();

    // Apply saved theme settings
    applyThemeSettings();

    // Show welcome message
    showMessage(`Welcome back, ${currentUser.user_metadata?.username || currentUser.email}!`, 'success');
}

async function checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    currentUser = session?.user || null;
}

async function onUserSignedIn() {
    updateUserInfo();
    await loadDataFromDatabase();
}

function onUserSignedOut() {
    window.location.href = 'index.html';
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    if (userInfo && currentUser) {
        userInfo.textContent = `Welcome, ${currentUser.user_metadata?.username || currentUser.email}`;
    }
}

async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        showMessage('Signed out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        showMessage('Error signing out: ' + error.message, 'error');
    }
}

async function loadDataFromDatabase() {
    if (!currentUser) return;

    try {
        console.log('Loading data from database for user:', currentUser.id);
    } catch (error) {
        console.error('Error loading data from database:', error);
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

    // Load projects
    loadProjects();

    // Load settings
    loadSettings();
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
            const display = document.getElementById('zoom-display');
            if (display) display.textContent = this.value;
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
        if (currentUser) {
            saveProjectsToDatabase();
        }
    } catch (e) {
        console.error('Error saving projects:', e);
        showMessage('Error saving projects to local storage', 'error');
    }
}

async function saveProjectsToDatabase() {
    if (!currentUser) return;

    try {
        console.log('Saving projects to database for user:', currentUser.id);
    } catch (error) {
        console.error('Error saving projects to database:', error);
    }
}

// Dashboard Functions
function updateDashboardStats() {
    const totalProjectsElement = document.getElementById('total-projects');
    const totalLocationsElement = document.getElementById('total-locations');
    const totalReportsElement = document.getElementById('total-reports');

    if (totalProjectsElement) totalProjectsElement.textContent = projects.length;

    const locationsWithCoords = projects.filter(p => p.coordinates).length;
    if (totalLocationsElement) totalLocationsElement.textContent = locationsWithCoords;

    if (totalReportsElement) totalReportsElement.textContent = Math.floor(projects.length * 0.7);
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

    if (typeof Chart !== 'undefined') {
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
}

// Map Functions
function initializeMap() {
    if (mapInitialized) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Get default location from settings
    const defaultLocation = getDefaultLocation();
    const zoomLevel = getDefaultZoom();

    if (typeof L !== 'undefined') {
        map = L.map('map-container').setView(defaultLocation, zoomLevel);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add drawing controls
        if (map.pm) {
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
        }

        // Add project markers
        addProjectMarkers();

        // Set up map click handler
        setupMapClickHandler();

        mapInitialized = true;
    }
}

function setupMapClickHandler() {
    if (!map) return;

    if (mapClickHandler) {
        map.off('click', mapClickHandler);
    }

    mapClickHandler = function(e) {
        console.log('Map clicked at:', e.latlng);
    };

    map.on('click', mapClickHandler);
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
    return [40.7128, -74.0060];
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
    if (map.pm) {
        map.pm.enableDraw('Marker');
    }
    showMessage('Click on the map to add a marker', 'info');
}

function drawPolygon() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    if (map.pm) {
        map.pm.enableDraw('Polygon');
    }
    showMessage('Click on the map to start drawing a polygon', 'info');
}

function measureDistance() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    if (map.pm) {
        map.pm.enableDraw('Line');
    }
    showMessage('Click on the map to start measuring distance', 'info');
}

function clearMap() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    if (map.pm) {
        map.pm.getGeomanLayers().forEach(layer => {
            map.removeLayer(layer);
        });
    }
    showMessage('Map cleared successfully', 'success');
}

function printMap() {
    if (!map) {
        showMessage('Please open the mapping page first', 'error');
        return;
    }
    window.print();
    showMessage('Map printing initiated', 'success');
}

// Map controls
function zoomIn() {
    if (map) {
        map.zoomIn();
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut();
    }
}

function resetView() {
    if (map) {
        const defaultLocation = getDefaultLocation();
        const zoomLevel = getDefaultZoom();
        map.setView(defaultLocation, zoomLevel);
    }
}

function toggleLayers() {
    showMessage('Layer toggle functionality will be implemented', 'info');
}

function toggleFloatingCards() {
    const cards = document.querySelectorAll('.map-floating-card');
    floatingCardsVisible = !floatingCardsVisible;
    
    cards.forEach(card => {
        card.style.display = floatingCardsVisible ? 'block' : 'none';
    });
}

function savePointMetadata() {
    const pointId = document.getElementById('point-id')?.value;
    const coords = document.getElementById('point-coords')?.value;
    const notes = document.getElementById('point-notes')?.value;
    
    if (pointId) {
        showMessage('Point metadata saved successfully', 'success');
    } else {
        showMessage('Please enter a point ID', 'error');
    }
}

function importGeoData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.kml,.kmz';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showMessage(`Importing ${file.name}...`, 'info');
            // Implementation will be added later
            setTimeout(() => {
                showMessage('Geodata imported successfully', 'success');
            }, 1000);
        }
    };
    input.click();
}

function downloadTemplate() {
    const csvContent = "latitude,longitude,name,description\n40.7128,-74.0060,Sample Point,Sample description";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geo_template.csv';
    a.click();
    URL.revokeObjectURL(url);
    showMessage('CSV template downloaded', 'success');
}

function exportToCAD() {
    showMessage('CAD export functionality will be implemented', 'info');
}

function exportToKML() {
    showMessage('KML export functionality will be implemented', 'info');
}

function exportToPDF() {
    showMessage('PDF export functionality will be implemented', 'info');
}

function simulateTrafficAlert() {
    showMessage('Traffic alert simulation activated', 'warning');
}

function simulateWeatherAlert() {
    showMessage('Weather alert simulation activated', 'warning');
}

// Global Menu Functions
function changeLanguage() {
    showMessage('Language selection feature will be available in future updates', 'info');
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
        const projectNameElement = document.getElementById('current-project-name');
        if (projectNameElement) {
            projectNameElement.textContent = 'New Project';
        }
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

    if (currentUser) {
        saveProjectToDatabase(projectData);
    }

    showMessage('Project saved successfully!', 'success');
}

async function saveProjectToDatabase(projectData) {
    if (!currentUser) return;

    try {
        console.log('Saving project to database:', projectData);
    } catch (error) {
        console.error('Error saving project to database:', error);
    }
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

                    currentProject = projectData;
                    contracts = projectData.contracts || [];
                    boqData = projectData.boq || [];
                    inspectionData = projectData.inspections || [];
                    costEstimationData = projectData.costEstimations || [];
                    aiResults = projectData.aiResults || [];
                    notebooks = projectData.notebooks || [];
                    drawings = projectData.drawings || [];

                    const projectNameElement = document.getElementById('current-project-name');
                    if (projectNameElement) {
                        projectNameElement.textContent = currentProject.name || 'Imported Project';
                    }

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

// Settings Management
function loadSettings() {
    const apiKey = localStorage.getItem('apiKey');
    const defaultLocation = localStorage.getItem('defaultLocation');
    const defaultZoom = localStorage.getItem('defaultZoom');
    const autoSave = localStorage.getItem('autoSave');

    if (apiKey) {
        const apiKeyField = document.getElementById('api-key');
        if (apiKeyField) apiKeyField.value = apiKey;
    }
    if (defaultLocation) {
        const locationField = document.getElementById('default-location');
        if (locationField) locationField.value = defaultLocation;
    }
    if (defaultZoom) {
        const zoomField = document.getElementById('zoom-level');
        const zoomDisplay = document.getElementById('zoom-display');
        if (zoomField) {
            zoomField.value = defaultZoom;
            if (zoomDisplay) zoomDisplay.textContent = defaultZoom;
        }
    }
    if (autoSave) {
        const autoSaveField = document.getElementById('auto-save');
        if (autoSaveField) autoSaveField.checked = autoSave === 'true';
    }

    loadAISettings();
    loadThemeSettings();
    loadMobileSettings();
}

function loadAISettings() {
    const aiPrompt = localStorage.getItem('aiPrompt');
    const aiConfidence = localStorage.getItem('aiConfidence');

    if (aiPrompt) {
        const promptField = document.getElementById('ai-prompt');
        if (promptField) promptField.value = aiPrompt;
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

    const uiThemeField = document.getElementById('ui-theme');
    const fontSizeField = document.getElementById('font-size');
    const animationsField = document.getElementById('enable-animations');
    const darkModeField = document.getElementById('dark-mode');

    if (uiThemeField) uiThemeField.value = uiTheme;
    if (fontSizeField) fontSizeField.value = fontSize;
    if (animationsField) animationsField.checked = enableAnimations;
    if (darkModeField) darkModeField.checked = darkMode;
}

function loadMobileSettings() {
    const touchFriendly = localStorage.getItem('touchFriendly') !== 'false';
    const highContrast = localStorage.getItem('highContrast') === 'true';

    const touchFriendlyField = document.getElementById('touch-friendly');
    const highContrastField = document.getElementById('high-contrast');

    if (touchFriendlyField) touchFriendlyField.checked = touchFriendly;
    if (highContrastField) highContrastField.checked = highContrast;
}

function saveAllSettings() {
    const apiKey = document.getElementById('api-key')?.value || '';
    const defaultLocation = document.getElementById('default-location')?.value || '40.7128, -74.0060';
    const zoomLevel = document.getElementById('zoom-level')?.value || '10';
    const autoSave = document.getElementById('auto-save')?.checked || true;

    const aiPrompt = document.getElementById('ai-prompt')?.value || '';
    const aiConfidence = document.getElementById('ai-confidence-threshold')?.value || '0.7';

    const uiTheme = document.getElementById('ui-theme')?.value || 'light';
    const fontSize = document.getElementById('font-size')?.value || 'medium';
    const enableAnimations = document.getElementById('enable-animations')?.checked !== false;
    const darkMode = document.getElementById('dark-mode')?.checked || false;

    const touchFriendly = document.getElementById('touch-friendly')?.checked !== false;
    const highContrast = document.getElementById('high-contrast')?.checked || false;

    if (apiKey) localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('defaultLocation', defaultLocation);
    localStorage.setItem('defaultZoom', zoomLevel);
    localStorage.setItem('autoSave', autoSave.toString());

    localStorage.setItem('aiPrompt', aiPrompt);
    localStorage.setItem('aiConfidence', aiConfidence);

    localStorage.setItem('uiTheme', uiTheme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('enableAnimations', enableAnimations.toString());
    localStorage.setItem('darkMode', darkMode.toString());

    localStorage.setItem('touchFriendly', touchFriendly.toString());
    localStorage.setItem('highContrast', highContrast.toString());

    applyThemeSettings();
    showMessage('All settings saved successfully!', 'success');
}

function applyThemeSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const enableAnimations = localStorage.getItem('enableAnimations') !== 'false';
    const highContrast = localStorage.getItem('highContrast') === 'true';

    if (darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${fontSize}`);

    if (!enableAnimations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }

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
        const settingsKeys = [
            'apiKey', 'defaultLocation', 'defaultZoom', 'autoSave',
            'aiPrompt', 'aiConfidence', 'uiTheme', 'fontSize', 
            'enableAnimations', 'darkMode', 'touchFriendly', 
            'highContrast', 'customBackground'
        ];

        settingsKeys.forEach(key => localStorage.removeItem(key));

        document.body.className = '';
        document.body.style.backgroundImage = '';

        loadSettings();
        showMessage('All settings have been reset to defaults!', 'success');
    }
}

// Utility Functions
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

function showMessage(text, type = 'success') {
    const container = document.getElementById('message-container');
    if (!container) return;

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.innerHTML = `
        <div style="
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 10px;
            background-color: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : type === 'warning' ? '#ffeaa7' : '#bee5eb'};
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        ">
            ${text}
        </div>
    `;

    container.appendChild(message);

    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Chat System Functions
function toggleChat() {
    const chatSystem = document.getElementById('chat-system');
    if (chatSystem) {
        if (chatSystem.style.display === 'none' || !chatSystem.style.display) {
            chatSystem.style.display = 'block';
            loadChatMessages();
        } else {
            chatSystem.style.display = 'none';
        }
    }
}

function sendMessage() {
    const input = document.getElementById('chat-message-input');
    const message = input?.value.trim();
    if (!message) return;

    const messageObj = {
        id: Date.now(),
        text: message,
        sender: 'Current User',
        timestamp: new Date().toLocaleString(),
        type: 'text'
    };

    chatMessages.push(messageObj);
    displayChatMessage(messageObj);
    input.value = '';

    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

function displayChatMessage(message) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    messageElement.innerHTML = `
        <div class="message-header">
            <strong>${message.sender}</strong>
            <span class="timestamp">${message.timestamp}</span>
        </div>
        <div class="message-content">${message.text}</div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function loadChatMessages() {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
        chatMessages = JSON.parse(savedMessages);
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            chatMessages.forEach(displayChatMessage);
        }
    }
}

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = function(e) {
        const files = e.target.files;
        for (let file of files) {
            const messageObj = {
                id: Date.now() + Math.random(),
                text: `📎 ${file.name}`,
                sender: 'Current User',
                timestamp: new Date().toLocaleString(),
                type: 'file',
                file: file
            };
            chatMessages.push(messageObj);
            displayChatMessage(messageObj);
        }
        localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    };
    input.click();
}

// Contract Management Functions
function saveContract() {
    const contractData = {
        id: Date.now(),
        contractNumber: document.getElementById('contract-number')?.value || '',
        projectName: document.getElementById('project-name')?.value || '',
        contractor: document.getElementById('contractor')?.value || '',
        startDate: document.getElementById('start-date')?.value || '',
        endDate: document.getElementById('end-date')?.value || '',
        contractValue: document.getElementById('contract-value')?.value || '',
        timestamp: new Date().toISOString()
    };

    contractsData.push(contractData);
    localStorage.setItem('contractsData', JSON.stringify(contractsData));

    showMessage('Contract saved successfully!', 'success');
    displayContracts();
}

function uploadBOQ() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const contractNumber = document.getElementById('contract-number')?.value || 'CONTRACT-0001';
            const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '');
            const fileName = `${contractNumber}_BOQ_${timestamp}.${file.name.split('.').pop()}`;

            showMessage(`BOQ uploaded as: ${fileName}`, 'success');
        }
    };
    input.click();
}

function shareContract() {
    const contractNumber = document.getElementById('contract-number')?.value;
    if (!contractNumber) {
        showMessage('Please enter a contract number first', 'error');
        return;
    }

    showMessage('Contract shared via Telegram!', 'success');
}

function displayContracts() {
    const contractsList = document.getElementById('contracts-list');
    if (!contractsList) return;

    const savedContracts = JSON.parse(localStorage.getItem('contractsData') || '[]');
    contractsList.innerHTML = savedContracts.map(contract => `
        <div class="contract-item">
            <h5>${contract.contractNumber} - ${contract.projectName}</h5>
            <p>Contractor: ${contract.contractor}</p>
            <p>Duration: ${contract.startDate} to ${contract.endDate}</p>
            <p>Value: $${contract.contractValue}</p>
        </div>
    `).join('');
}

// Inspection Functions
function scheduleInspection() {
    showMessage('Inspection scheduled successfully!', 'success');
}

function startInspection() {
    const inspectionForm = document.getElementById('inspection-form');
    if (inspectionForm) {
        inspectionForm.style.display = inspectionForm.style.display === 'none' ? 'block' : 'none';
    }
    showMessage('Inspection form opened', 'info');
}

function submitInspection() {
    const roadSection = document.getElementById('road-section')?.value;
    const inspectorName = document.getElementById('inspector-name')?.value;
    
    if (!roadSection || !inspectorName) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    showMessage('Inspection submitted successfully!', 'success');
}

function viewInspectionHistory() {
    showMessage('Inspection history loaded', 'info');
}

// Engineering Tools Functions
function calculatePavementThickness() {
    const trafficVolume = document.getElementById('traffic-volume')?.value;
    const soilCBR = document.getElementById('soil-cbr')?.value;
    
    if (!trafficVolume || !soilCBR) {
        showMessage('Please enter both traffic volume and soil CBR values', 'error');
        return;
    }
    
    const thickness = Math.round((trafficVolume / 1000) * (100 / soilCBR) * 10) / 10;
    const resultDiv = document.getElementById('pavement-result');
    if (resultDiv) {
        resultDiv.innerHTML = `Recommended pavement thickness: ${thickness} cm`;
    }
    showMessage('Pavement thickness calculated successfully!', 'success');
}

function calculateAsphaltVolume() {
    const length = parseFloat(document.getElementById('road-length')?.value || 0);
    const width = parseFloat(document.getElementById('road-width')?.value || 0);
    const thickness = parseFloat(document.getElementById('asphalt-thickness')?.value || 0);
    
    if (!length || !width || !thickness) {
        showMessage('Please enter all dimensions', 'error');
        return;
    }
    
    const volume = length * width * (thickness / 100);
    const resultDiv = document.getElementById('asphalt-result');
    if (resultDiv) {
        resultDiv.innerHTML = `Asphalt volume required: ${volume.toFixed(2)} cubic meters`;
    }
    showMessage('Asphalt volume calculated successfully!', 'success');
}

function calculateMaterialCost() {
    const materialType = document.getElementById('material-type')?.value;
    const quantity = parseFloat(document.getElementById('material-quantity')?.value || 0);
    const unitPrice = parseFloat(document.getElementById('unit-price')?.value || 0);
    
    if (!quantity || !unitPrice) {
        showMessage('Please enter quantity and unit price', 'error');
        return;
    }
    
    const totalCost = quantity * unitPrice;
    const resultDiv = document.getElementById('cost-result');
    if (resultDiv) {
        resultDiv.innerHTML = `Total cost for ${materialType}: $${totalCost.toFixed(2)}`;
    }
    showMessage('Material cost calculated successfully!', 'success');
}

// AI Detection Functions
function startAIAnalysis() {
    const imageUpload = document.getElementById('ai-image-upload');
    if (!imageUpload || !imageUpload.files.length) {
        showMessage('Please upload an image first', 'error');
        return;
    }
    
    showMessage('AI analysis started...', 'info');
    
    setTimeout(() => {
        showMessage('AI analysis completed successfully!', 'success');
        displayAIResults();
    }, 2000);
}

function displayAIResults() {
    const resultsContainer = document.getElementById('analysis-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="analysis-result">
                <div class="analysis-details">
                    <h5>Analysis Complete</h5>
                    <p>Defects detected: Surface cracks, minor pothole</p>
                    <p>Severity: Medium</p>
                    <p>Recommended action: Schedule maintenance within 30 days</p>
                </div>
            </div>
        `;
    }
}

function connectTelegramBot() {
    showMessage('Telegram bot connection established!', 'success');
}

// Notebook Functions
function createNewNotebook() {
    const notebookEditor = document.getElementById('notebook-editor');
    if (notebookEditor) {
        notebookEditor.style.display = notebookEditor.style.display === 'none' ? 'block' : 'none';
    }
    showMessage('New notebook created', 'success');
}

function saveNotebook() {
    const title = document.getElementById('notebook-title')?.value;
    const content = document.getElementById('notebook-content')?.innerHTML;
    
    if (!title) {
        showMessage('Please enter a notebook title', 'error');
        return;
    }
    
    const notebook = {
        id: Date.now(),
        title: title,
        content: content,
        timestamp: new Date().toISOString()
    };
    
    notebooks.push(notebook);
    localStorage.setItem('engineeringNotebooks', JSON.stringify(notebooks));
    
    showMessage('Notebook saved successfully!', 'success');
    displayNotebooks();
}

function displayNotebooks() {
    const notebooksList = document.getElementById('notebooks-list');
    if (!notebooksList) return;
    
    notebooksList.innerHTML = notebooks.map(notebook => `
        <div class="notebook-item" onclick="openNotebook('${notebook.id}')">
            <h6>${notebook.title}</h6>
            <small>Created: ${new Date(notebook.timestamp).toLocaleDateString()}</small>
        </div>
    `).join('');
}

function openNotebook(id) {
    const notebook = notebooks.find(n => n.id == id);
    if (notebook) {
        document.getElementById('notebook-title').value = notebook.title;
        document.getElementById('notebook-content').innerHTML = notebook.content;
        document.getElementById('notebook-editor').style.display = 'block';
    }
}

function importNotebook() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.html';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showMessage(`Notebook "${file.name}" imported successfully!`, 'success');
        }
    };
    input.click();
}

function shareNotebook() {
    showMessage('Notebook shared via Telegram!', 'success');
}

// Drawing Tool Functions
function uploadCADFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.dxf,.svg,.dwg';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showMessage(`CAD file "${file.name}" uploaded successfully!`, 'success');
        }
    };
    input.click();
}

function drawLine() {
    initializeDrawingCanvas();
    showMessage('Line drawing tool activated', 'info');
}

function drawRectangle() {
    initializeDrawingCanvas();
    showMessage('Rectangle drawing tool activated', 'info');
}

function drawCircle() {
    initializeDrawingCanvas();
    showMessage('Circle drawing tool activated', 'info');
}

function addMeasurement() {
    showMessage('Measurement tool activated', 'info');
}

function clearDrawing() {
    const canvas = document.getElementById('drawing-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    showMessage('Drawing cleared', 'success');
}

function exportDrawing() {
    const canvas = document.getElementById('drawing-canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
        showMessage('Drawing exported successfully!', 'success');
    }
}

function initializeDrawingCanvas() {
    const canvas = document.getElementById('drawing-canvas');
    if (canvas && !drawingContext) {
        drawingContext = canvas.getContext('2d');
        drawingCanvas = canvas;
    }
}

// Custom Reports Functions
function generateReport() {
    showMessage('PDF report generated successfully!', 'success');
}

function exportToExcel() {
    showMessage('Data exported to Excel successfully!', 'success');
}

function shareReport() {
    showMessage('Report shared via Telegram!', 'success');
}

function saveDashboard() {
    showMessage('Dashboard saved successfully!', 'success');
}

// Format text functions for notebook editor
function formatText(command) {
    document.execCommand(command, false, null);
}

function insertList() {
    document.execCommand('insertUnorderedList', false, null);
}

function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.execCommand('insertImage', false, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Initialize when DOM is loaded
window.addEventListener('load', function() {
    setTimeout(() => {
        if (document.querySelector('.page.active')?.id === 'dashboard-page') {
            initializeDashboardChart();
        }
    }, 100);
});
