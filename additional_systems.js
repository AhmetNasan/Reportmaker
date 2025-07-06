javascript
// ===================================
// ADDITIONAL SYSTEMS FOR ENGINEERING PLATFORM
// ===================================

// Global variables for additional systems
let vehicleTracker = {
    active: false,
    vehicles: [],
    routes: [],
    geofences: []
};

let materialLogistics = {
    inventory: [],
    deliveries: [],
    usage: [],
    suppliers: []
};

let projectTimeline = {
    projects: [],
    milestones: [],
    tasks: []
};

let signFabrication = {
    catalog: [],
    orders: [],
    materials: [],
    pricing: []
};

let scrapManagement = {
    items: [],
    locations: [],
    reusableItems: []
};

// Initialize all additional systems
document.addEventListener('DOMContentLoaded', function() {
    initializeVehicleTracking();
    initializeMaterialLogistics();
    initializeProjectTimeline();
    initializeSignFabrication();
    initializeScrapManagement();
    loadAllAdditionalData();
});

// ===================================
// VEHICLE TRACKING SYSTEM
// ===================================

function initializeVehicleTracking() {
    loadVehicleData();
    setupVehicleTracking();
}

function startTracking() {
    if (!navigator.geolocation) {
        showMessage('Geolocation not supported', 'error');
        return;
    }

    vehicleTracker.active = true;
    updateTrackingStatus();
    
    // Start GPS tracking
    vehicleTracker.watchId = navigator.geolocation.watchPosition(
        updateVehiclePosition,
        handleTrackingError,
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );
    
    showMessage('Vehicle tracking started', 'success');
    logActivity('Tracking', 'Vehicle tracking started');
}

function stopTracking() {
    if (vehicleTracker.watchId) {
        navigator.geolocation.clearWatch(vehicleTracker.watchId);
        vehicleTracker.active = false;
        updateTrackingStatus();
        showMessage('Vehicle tracking stopped', 'success');
        logActivity('Tracking', 'Vehicle tracking stopped');
    }
}

function updateVehiclePosition(position) {
    const vehicleData = {
        id: currentUser?.id || 'unknown',
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        speed: position.coords.speed || 0,
        heading: position.coords.heading || 0,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
    };
    
    // Store position
    vehicleTracker.routes.push(vehicleData);
    
    // Keep only last 1000 positions
    if (vehicleTracker.routes.length > 1000) {
        vehicleTracker.routes.splice(0, vehicleTracker.routes.length - 1000);
    }
    
    // Update map if visible
    updateTrackingMap(vehicleData);
    
    // Save to storage
    saveVehicleData();
    
    // Check geofences
    checkGeofences(vehicleData);
}

function updateTrackingMap(vehicleData) {
    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer) return;
    
    // Initialize tracking map if needed
    if (!window.trackingMap) {
        initializeTrackingMap();
    }
    
    // Add vehicle marker
    if (window.trackingMap && typeof L !== 'undefined') {
        const marker = L.marker([vehicleData.lat, vehicleData.lng])
            .addTo(trackingMap)
            .bindPopup(`Vehicle: ${vehicleData.id}<br>Speed: ${Math.round(vehicleData.speed || 0)} km/h<br>Time: ${new Date(vehicleData.timestamp).toLocaleTimeString()}`);
        
        // Center map on vehicle
        trackingMap.setView([vehicleData.lat, vehicleData.lng], 15);
    }
}

function initializeTrackingMap() {
    const mapContainer = document.getElementById('tracking-map');
    if (!mapContainer || !window.L) return;
    
    window.trackingMap = L.map('tracking-map').setView([40.7128, -74.0060], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(trackingMap);
}

function setGeofence() {
    const lat = prompt('Enter geofence center latitude:');
    const lng = prompt('Enter geofence center longitude:');
    const radius = prompt('Enter radius in meters:');
    
    if (lat && lng && radius) {
        const geofence = {
            id: generateId(),
            center: [parseFloat(lat), parseFloat(lng)],
            radius: parseFloat(radius),
            name: prompt('Enter geofence name:') || 'Unnamed Geofence',
            created: new Date().toISOString()
        };
        
        vehicleTracker.geofences.push(geofence);
        saveVehicleData();
        showMessage(`Geofence "${geofence.name}" created`, 'success');
    }
}

function checkGeofences(vehicleData) {
    vehicleTracker.geofences.forEach(geofence => {
        const distance = calculateDistance(
            vehicleData.lat, vehicleData.lng,
            geofence.center[0], geofence.center[1]
        ) * 1000; // Convert to meters
        
        if (distance <= geofence.radius) {
            showNotification('Geofence Alert', `Vehicle entered ${geofence.name}`, 'info');
        }
    });
}

function updateTrackingStatus() {
    const statusElement = document.getElementById('tracking-status');
    if (statusElement) {
        statusElement.textContent = vehicleTracker.active ? 'Online' : 'Offline';
        statusElement.className = `status-indicator ${vehicleTracker.active ? 'online' : 'offline'}`;
    }
}

// ===================================
// MATERIAL LOGISTICS SYSTEM
// ===================================

function initializeMaterialLogistics() {
    loadMaterialData();
    setupMaterialManagement();
}

function addMaterialItem() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Material Item</h3>
            <form id="material-form">
                <div class="form-group">
                    <label>Material Name</label>
                    <input type="text" id="material-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="material-category" class="form-control" required>
                        <option value="concrete">Concrete</option>
                        <option value="steel">Steel</option>
                        <option value="asphalt">Asphalt</option>
                        <option value="aggregates">Aggregates</option>
                        <option value="paint">Paint</option>
                        <option value="signs">Signs</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="material-quantity" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" id="material-unit" class="form-control" placeholder="e.g., m³, tons, pieces" required>
                </div>
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" id="material-price" class="form-control" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Supplier</label>
                    <input type="text" id="material-supplier" class="form-control">
                </div>
                <div class="form-group">
                    <label>Location/Warehouse</label>
                    <input type="text" id="material-location" class="form-control">
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Add Material</button>
                    <button type="button" class="btn btn-secondary" onclick="closeMaterialModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('material-form').onsubmit = function(e) {
        e.preventDefault();
        saveMaterialItem();
    };
}

function saveMaterialItem() {
    const material = {
        id: generateId(),
        name: document.getElementById('material-name').value,
        category: document.getElementById('material-category').value,
        quantity: parseFloat(document.getElementById('material-quantity').value),
        unit: document.getElementById('material-unit').value,
        unitPrice: parseFloat(document.getElementById('material-price').value),
        supplier: document.getElementById('material-supplier').value,
        location: document.getElementById('material-location').value,
        totalValue: parseFloat(document.getElementById('material-quantity').value) * parseFloat(document.getElementById('material-price').value),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    materialLogistics.inventory.push(material);
    saveMaterialData();
    renderMaterialInventory();
    closeMaterialModal();
    showMessage('Material added successfully', 'success');
    logActivity('Material Management', `Added ${material.name} to inventory`);
}

function recordMaterialUsage(materialId, quantityUsed, projectId, notes = '') {
    const material = materialLogistics.inventory.find(m => m.id === materialId);
    if (!material) {
        showMessage('Material not found', 'error');
        return;
    }
    
    if (quantityUsed > material.quantity) {
        showMessage('Insufficient material quantity', 'error');
        return;
    }
    
    // Record usage
    const usage = {
        id: generateId(),
        materialId: materialId,
        materialName: material.name,
        quantityUsed: quantityUsed,
        projectId: projectId,
        notes: notes,
        usedBy: currentUser?.id || 'unknown',
        usedAt: new Date().toISOString(),
        unitPrice: material.unitPrice,
        totalCost: quantityUsed * material.unitPrice
    };
    
    materialLogistics.usage.push(usage);
    
    // Update inventory
    material.quantity -= quantityUsed;
    material.lastUpdated = new Date().toISOString();
    
    saveMaterialData();
    renderMaterialInventory();
    showMessage(`Recorded usage of ${quantityUsed} ${material.unit} of ${material.name}`, 'success');
}

function generateMaterialReport() {
    const report = {
        generated: new Date().toISOString(),
        totalItems: materialLogistics.inventory.length,
        totalValue: materialLogistics.inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        lowStockItems: materialLogistics.inventory.filter(item => item.quantity < 10),
        recentUsage: materialLogistics.usage.filter(usage => {
            const usageDate = new Date(usage.usedAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return usageDate >= weekAgo;
        }),
        categories: materialLogistics.inventory.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {})
    };
    
    return report;
}

// ===================================
// PROJECT TIMELINE MANAGEMENT
// ===================================

function initializeProjectTimeline() {
    loadTimelineData();
    setupTimelineInterface();
}

function createProjectTimeline() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content timeline-modal">
            <h3>Create Project Timeline</h3>
            <form id="timeline-form">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" id="timeline-project-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="timeline-start-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" id="timeline-end-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Project Manager</label>
                    <input type="text" id="timeline-manager" class="form-control">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="timeline-description" class="form-control" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Create Timeline</button>
                    <button type="button" class="btn btn-secondary" onclick="closeTimelineModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('timeline-form').onsubmit = function(e) {
        e.preventDefault();
        saveProjectTimeline();
    };
}

function saveProjectTimeline() {
    const timeline = {
        id: generateId(),
        name: document.getElementById('timeline-project-name').value,
        startDate: document.getElementById('timeline-start-date').value,
        endDate: document.getElementById('timeline-end-date').value,
        manager: document.getElementById('timeline-manager').value,
        description: document.getElementById('timeline-description').value,
        status: 'planning',
        progress: 0,
        milestones: [],
        tasks: [],
        createdAt: new Date().toISOString()
    };
    
    projectTimeline.projects.push(timeline);
    saveTimelineData();
    renderTimelineList();
    closeTimelineModal();
    showMessage('Project timeline created successfully', 'success');
}

function addMilestone(projectId) {
    const milestone = {
        id: generateId(),
        projectId: projectId,
        name: prompt('Milestone name:'),
        description: prompt('Milestone description:'),
        targetDate: prompt('Target date (YYYY-MM-DD):'),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    if (milestone.name && milestone.targetDate) {
        projectTimeline.milestones.push(milestone);
        saveTimelineData();
        showMessage('Milestone added successfully', 'success');
    }
}

// ===================================
// SIGN FABRICATION SYSTEM
// ===================================

function initializeSignFabrication() {
    loadSignFabricationData();
    setupSignCatalog();
}

function createSignOrder() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>New Sign Order</h3>
            <form id="sign-order-form">
                <div class="form-group">
                    <label>Sign Type</label>
                    <select id="sign-type" class="form-control" required>
                        <option value="stop">Stop Sign</option>
                        <option value="speed">Speed Limit</option>
                        <option value="warning">Warning Sign</option>
                        <option value="directional">Directional Sign</option>
                        <option value="information">Information Sign</option>
                        <option value="custom">Custom Sign</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size (cm)</label>
                    <input type="text" id="sign-size" class="form-control" placeholder="e.g., 60x60" required>
                </div>
                <div class="form-group">
                    <label>Material</label>
                    <select id="sign-material" class="form-control" required>
                        <option value="aluminum">Aluminum</option>
                        <option value="steel">Steel</option>
                        <option value="plastic">Plastic</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Reflective Grade</label>
                    <select id="reflective-grade" class="form-control" required>
                        <option value="engineering">Engineering Grade</option>
                        <option value="high-intensity">High Intensity</option>
                        <option value="diamond">Diamond Grade</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="sign-quantity" class="form-control" min="1" required>
                </div>
                <div class="form-group">
                    <label>Custom Text (if applicable)</label>
                    <textarea id="sign-text" class="form-control" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>Project/Contract</label>
                    <input type="text" id="sign-project" class="form-control">
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Create Order</button>
                    <button type="button" class="btn btn-secondary" onclick="closeSignModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('sign-order-form').onsubmit = function(e) {
        e.preventDefault();
        saveSignOrder();
    };
}

function saveSignOrder() {
    const order = {
        id: generateId(),
        type: document.getElementById('sign-type').value,
        size: document.getElementById('sign-size').value,
        material: document.getElementById('sign-material').value,
        reflectiveGrade: document.getElementById('reflective-grade').value,
        quantity: parseInt(document.getElementById('sign-quantity').value),
        customText: document.getElementById('sign-text').value,
        project: document.getElementById('sign-project').value,
        status: 'pending',
        orderDate: new Date().toISOString(),
        estimatedCost: calculateSignCost(),
        orderedBy: currentUser?.id || 'unknown'
    };
    
    signFabrication.orders.push(order);
    saveSignFabricationData();
    renderSignOrders();
    closeSignModal();
    showMessage('Sign order created successfully', 'success');
    logActivity('Sign Fabrication', `Created order for ${order.quantity}x ${order.type} signs`);
}

function calculateSignCost() {
    const type = document.getElementById('sign-type').value;
    const material = document.getElementById('sign-material').value;
    const grade = document.getElementById('reflective-grade').value;
    const quantity = parseInt(document.getElementById('sign-quantity').value);

    // Base pricing (mock calculation)
    let baseCost = 50; // Base cost per sign

    // Material multipliers
    const materialMultipliers = {
        aluminum: 1.0,
        steel: 1.2,
        plastic: 0.8
    };

    // Reflective grade multipliers
    const gradeMultipliers = {
        'engineering': 1.0,
        'high-intensity': 1.5,
        'diamond': 2.0
    };

    // Type multipliers
    const typeMultipliers = {
        stop: 1.0,
        speed: 1.1,
        warning: 1.2,
        directional: 1.5,
        information: 1.3,
        custom: 2.0
    };

    const unitCost = baseCost * 
        (materialMultipliers[material] || 1.0) * 
        (gradeMultipliers[grade] || 1.0) * 
        (typeMultipliers[type] || 1.0);

    return unitCost * quantity;
}

// Missing utility functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function showMessage(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Add actual UI notification here
}

function logActivity(action, description) {
    const activity = {
        action: action,
        description: description,
        timestamp: new Date().toISOString()
    };

    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.unshift(activity);

    // Keep only last 100 activities
    if (activities.length > 100) {
        activities.splice(100);
    }

    localStorage.setItem('activities', JSON.stringify(activities));
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function handleTrackingError(error) {
    console.error('Tracking error:', error);
    showMessage('GPS tracking error: ' + error.message, 'error');
}

// Missing modal close functions
function closeMaterialModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeTimelineModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeSignModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

// Missing data loading functions
function loadAllAdditionalData() {
    loadVehicleData();
    loadMaterialData();
    loadTimelineData();
    loadSignFabricationData();
    loadScrapData();
}

function loadVehicleData() {
    const data = localStorage.getItem('vehicleTrackerData');
    if (data) {
        try {
            vehicleTracker = { ...vehicleTracker, ...JSON.parse(data) };
        } catch (error) {
            console.error('Error loading vehicle data:', error);
        }
    }
}

function saveVehicleData() {
    localStorage.setItem('vehicleTrackerData', JSON.stringify(vehicleTracker));
}

function loadMaterialData() {
    const data = localStorage.getItem('materialLogisticsData');
    if (data) {
        try {
            materialLogistics = { ...materialLogistics, ...JSON.parse(data) };
        } catch (error) {
            console.error('Error loading material data:', error);
        }
    }
}

function saveMaterialData() {
    localStorage.setItem('materialLogisticsData', JSON.stringify(materialLogistics));
}

function loadTimelineData() {
    const data = localStorage.getItem('projectTimelineData');
    if (data) {
        try {
            projectTimeline = { ...projectTimeline, ...JSON.parse(data) };
        } catch (error) {
            console.error('Error loading timeline data:', error);
        }
    }
}

function saveTimelineData() {
    localStorage.setItem('projectTimelineData', JSON.stringify(projectTimeline));
}

function loadSignFabricationData() {
    const data = localStorage.getItem('signFabricationData');
    if (data) {
        try {
            signFabrication = { ...signFabrication, ...JSON.parse(data) };
        } catch (error) {
            console.error('Error loading sign fabrication data:', error);
        }
    }
}

function saveSignFabricationData() {
    localStorage.setItem('signFabricationData', JSON.stringify(signFabrication));
}

function loadScrapData() {
    const data = localStorage.getItem('scrapManagementData');
    if (data) {
        try {
            scrapManagement = { ...scrapManagement, ...JSON.parse(data) };
        } catch (error) {
            console.error('Error loading scrap data:', error);
        }
    }
}

function saveScrapData() {
    localStorage.setItem('scrapManagementData', JSON.stringify(scrapManagement));
}

// Missing setup functions
function setupVehicleTracking() {
    // Setup vehicle tracking interface
}

function setupMaterialManagement() {
    // Setup material management interface
}

function setupTimelineInterface() {
    // Setup timeline interface
}

function setupSignCatalog() {
    // Setup sign catalog interface
}

function setupScrapManagement() {
    // Setup scrap management interface
}

// Missing render functions
function renderMaterialInventory() {
    // Render material inventory list
}

function renderTimelineList() {
    // Render project timeline list
}

function renderSignOrders() {
    // Render sign orders list
}

// ===================================
// SCRAP MANAGEMENT SYSTEM
// ===================================

function initializeScrapManagement() {
    loadScrapData();
    setupScrapManagement();
}

function addScrapItem() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Add Scrap Item</h3>
            <form id="scrap-form">
                <div class="form-group">
                    <label>Item Description</label>
                    <input type="text" id="scrap-description" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="scrap-type" class="form-control" required>
                        <option value="metal">Metal</option>
                        <option value="sign">Old Signs</option>
                        <option value="pole">Poles</option>
                        <option value="equipment">Equipment</option>
                        <option value="material">Construction Material</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Condition</label>
                    <select id="scrap-condition" class="form-control" required>
                        <option value="reusable">Reusable</option>
                        <option value="repairable">Repairable</option>
                        <option value="scrap">Scrap Only</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quantity/Weight</label>
                    <input type="number" id="scrap-quantity" class="form-control" step="0.1" required>
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <input type="text" id="scrap-unit" class="form-control" placeholder="pieces, kg, m" required>
                </div>
                <div class="form-group">
                    <label>Source Project</label>
                    <input type="text" id="scrap-source" class="form-control">
                </div>
                <div class="form-group">
                    <label>Storage Location</label>
                    <input type="text" id="scrap-location" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Estimated Value</label>
                    <input type="number" id="scrap-value" class="form-control" step="0.01">
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn btn-primary">Add Scrap Item</button>
                    <button type="button" class="btn btn-secondary" onclick="closeScrapModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('scrap-form').onsubmit = function(e) {
        e.preventDefault();
        saveScrapItem();
    };
}

function saveScrapItem() {
    const scrapItem = {
        id: generateId(),
        description: document.getElementById('scrap-description').value,
        type: document.getElementById('scrap-type').value,
        condition: document.getElementById('scrap-condition').value,
        quantity: parseFloat(document.getElementById('scrap-quantity').value),
        unit: document.getElementById('scrap-unit').value,
        source: document.getElementById('scrap-source').value,
        location: document.getElementById('scrap-location').value,
        estimatedValue: parseFloat(document.getElementById('scrap-value').value) || 0,
        dateAdded: new Date().toISOString(),
        addedBy: currentUser?.id || 'unknown',
        status: 'available'
    };
    
    scrapManagement.items.push(scrapItem);
    saveScrapData();
    renderScrapInventory();
    closeScrapModal();
    showMessage('Scrap item added successfully', 'success');
    logActivity('Scrap Management', `Added ${scrapItem.description} to scrap inventory`);
}

// ===================================
// CUSTOM DASHBOARD BUILDER
// ===================================

function openCustomDashboard() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay dashboard-builder';
    modal.innerHTML = `
        <div class="modal-content dashboard-modal">
            <h3>Custom Dashboard Builder</h3>
            <div class="dashboard-builder-interface">
                <div class="widget-palette">
                    <h6>Available Widgets</h6>
                    <div class="widget-list">
                        <div class="widget-item" draggable="true" data-widget="chart">
                            <i class="fas fa-chart-bar"></i> Chart Widget
                        </div>
                        <div class="widget-item" draggable="true" data-widget="stats">
                            <i class="fas fa-tachometer-alt"></i> Stats Widget
                        </div>
                        <div class="widget-item" draggable="true" data-widget="map">
                            <i class="fas fa-map"></i> Map Widget
                        </div>
                        <div class="widget-item" draggable="true" data-widget="activity">
                            <i class="fas fa-list"></i> Activity Feed
                        </div>
                        <div class="widget-item" draggable="true" data-widget="weather">
                            <i class="fas fa-cloud"></i> Weather Widget
                        </div>
                        <div class="widget-item" draggable="true" data-widget="files">
                            <i class="fas fa-folder"></i> Files Widget
                        </div>
                    </div>
                </div>
                <div class="dashboard-canvas">
                    <h6>Dashboard Canvas</h6>
                    <div id="dashboard-drop-zone" class="drop-zone">
                        <p>Drag widgets here to build your dashboard</p>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="saveDashboard()">Save Dashboard</button>
                <button class="btn btn-secondary" onclick="closeDashboardBuilder()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupDashboardBuilder();
}

function setupDashboardBuilder() {
    const widgets = document.querySelectorAll('.widget-item');
    const dropZone = document.getElementById('dashboard-drop-zone');
    
    widgets.forEach(widget => {
        widget.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.dataset.widget);
        });
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData('text/plain');
        addWidgetToCanvas(widgetType);
    });
}

function addWidgetToCanvas(widgetType) {
    const dropZone = document.getElementById('dashboard-drop-zone');
    const widgetElement = document.createElement('div');
    widgetElement.className = `dashboard-widget ${widgetType}-widget`;
    widgetElement.innerHTML = createWidgetHTML(widgetType);
    
    dropZone.appendChild(widgetElement);
}

function createWidgetHTML(type) {
    const widgetTemplates = {
        chart: `<div class="widget-header">Chart Widget</div><div class="widget-content">📊 Chart will appear here</div>`,
        stats: `<div class="widget-header">Statistics</div><div class="widget-content">📈 Stats: 0 projects, 0 files</div>`,
        map: `<div class="widget-header">Map View</div><div class="widget-content">🗺️ Interactive map</div>`,
        activity: `<div class="widget-header">Recent Activity</div><div class="widget-content">📝 No recent activity</div>`,
        weather: `<div class="widget-header">Weather</div><div class="widget-content">🌤️ 22°C, Sunny</div>`,
        files: `<div class="widget-header">Recent Files</div><div class="widget-content">📁 No recent files</div>`
    };
    
    return widgetTemplates[type] || '<div>Unknown widget</div>';
}

// ===================================
// DATA PERSISTENCE FUNCTIONS
// ===================================

function loadAllAdditionalData() {
    loadVehicleData();
    loadMaterialData();
    loadTimelineData();
    loadSignFabricationData();
    loadScrapData();
}

function loadVehicleData() {
    const stored = localStorage.getItem('vehicleTracking');
    if (stored) {
        try {
            vehicleTracker = { ...vehicleTracker, ...JSON.parse(stored) };
        } catch (error) {
            console.error('Error loading vehicle data:', error);
        }
```javascript
    }
}

function saveVehicleData() {
    localStorage.setItem('vehicleTracking', JSON.stringify(vehicleTracker));
}

function loadMaterialData() {
    const stored = localStorage.getItem('materialLogistics');
    if (stored) {
        try {
            materialLogistics = { ...materialLogistics, ...JSON.parse(stored) };
        } catch (error) {
            console.error('Error loading material data:', error);
        }
    }
}

function saveMaterialData() {
    localStorage.setItem('materialLogistics', JSON.stringify(materialLogistics));
}

function loadTimelineData() {
    const stored = localStorage.getItem('projectTimeline');
    if (stored) {
        try {
            projectTimeline = { ...projectTimeline, ...JSON.parse(stored) };
        } catch (error) {
            console.error('Error loading timeline data:', error);
        }
    }
}

function saveTimelineData() {
    localStorage.setItem('projectTimeline', JSON.stringify(projectTimeline));
}

function loadSignFabricationData() {
    const stored = localStorage.getItem('signFabrication');
    if (stored) {
        try {
            signFabrication = { ...signFabrication, ...JSON.parse(stored) };
        } catch (error) {
            console.error('Error loading sign fabrication data:', error);
        }
    }
}

function saveSignFabricationData() {
    localStorage.setItem('signFabrication', JSON.stringify(signFabrication));
}

function loadScrapData() {
    const stored = localStorage.getItem('scrapManagement');
    if (stored) {
        try {
            scrapManagement = { ...scrapManagement, ...JSON.parse(stored) };
        } catch (error) {
            console.error('Error loading scrap data:', error);
        }
    }
}

function saveScrapData() {
    localStorage.setItem('scrapManagement', JSON.stringify(scrapManagement));
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

function closeMaterialModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeTimelineModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeSignModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeScrapModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function closeDashboardBuilder() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function handleTrackingError(error) {
    console.error('Tracking error:', error);
    showMessage('GPS tracking error: ' + error.message, 'error');
}

function viewHistory() {
    showMessage('Vehicle history feature will be implemented', 'info');
}

function generatePlatformReport() {
    // Comprehensive platform report
    const report = {
        projects: JSON.parse(localStorage.getItem('engineeringProjects') || '[]').length,
        files: JSON.parse(localStorage.getItem('engineeringFiles') || '[]').length,
        materials: materialLogistics.inventory.length,
        vehicles: vehicleTracker.vehicles.length,
        signOrders: signFabrication.orders.length,
        scrapItems: scrapManagement.items.length
    };
    
    showMessage(`Platform Report: ${report.projects} projects, ${report.files} files, ${report.materials} materials tracked`, 'success');
}

// ===================================
// RENDER FUNCTIONS (PLACEHOLDERS)
// ===================================

function renderMaterialInventory() {
    console.log('Material inventory updated');
}

function renderTimelineList() {
    console.log('Timeline list updated');
}

function renderSignOrders() {
    console.log('Sign orders updated');
}

function renderScrapInventory() {
    console.log('Scrap inventory updated');
}

function setupMaterialManagement() {
    console.log('Material management interface setup');
}

function setupTimelineInterface() {
    console.log('Timeline interface setup');
}

function setupSignCatalog() {
    console.log('Sign catalog setup');
}

function setupScrapManagement() {
    console.log('Scrap management interface setup');
}

function setupVehicleTracking() {
    console.log('Vehicle tracking interface setup');
}

function saveDashboard() {
    showMessage('Dashboard saved successfully', 'success');
    closeDashboardBuilder();
}

// Export functions for global use
window.additionalSystems = {
    startTracking,
    stopTracking,
    addMaterialItem,
    createProjectTimeline,
    createSignOrder,
    addScrapItem,
    openCustomDashboard,
    generatePlatformReport
};